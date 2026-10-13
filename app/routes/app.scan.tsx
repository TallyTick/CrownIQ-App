import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { fetchVariants } from "../services/fetch-variants.server";
import { runChecks, riskScore } from "../services/checks";
import { compareScans } from "../services/compare-scans.server";
import type { Finding, Variant } from "../services/types";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Fetch last 5 scans for this shop
  const scans = await prisma.scan.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch the most recent scan with findings
  const lastScan = await prisma.scan.findFirst({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    include: { findings: true },
  });

  // Auto-run scan if no recent scan exists or it's been a while
  let autoScan = null;
  if (!lastScan || new Date(lastScan.createdAt).getTime() < Date.now() - 3600000) {
    // Run automatic scan
    const variants = await fetchVariants(admin);
    const findings = runChecks(variants);
    const score = riskScore(findings, variants.length);

    const scan = await prisma.scan.create({
      data: {
        shop: session.shop,
        riskScore: score,
        variantCount: variants.length,
        findingCount: findings.length,
        variants: {
          create: variants.map((v) => ({
            shop: session.shop,
            variantId: v.variantId,
            productId: v.productId,
            productTitle: v.productTitle,
            variantTitle: v.variantTitle,
            sku: v.sku,
            tracked: v.tracked,
            sellWhenEmpty: v.sellWhenEmpty,
            available: v.available,
            soldLast30Days: v.soldLast30Days,
          })),
        },
        findings: {
          create: findings.map((f) => ({
            shop: session.shop,
            type: f.type,
            severity: f.severity,
            variantId: f.variantId,
            message: f.message,
            fix: f.fix,
          })),
        },
      },
    });

    autoScan = {
      variantCount: variants.length,
      findings,
      score,
      variants,
      scanCreatedAt: scan.createdAt,
    };
  }

  return { scans, lastScan, autoScan };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Manual scan (scan again button)
  const variants = await fetchVariants(admin);
  const findings = runChecks(variants);
  const score = riskScore(findings, variants.length);

  const previousScan = await prisma.scan.findFirst({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    include: { findings: true },
  });

  let comparison = null;
  if (previousScan) {
    const previousFindings = previousScan.findings.map((f) => ({
      type: f.type,
      variantId: f.variantId,
    }));
    const currentFindings = findings.map((f) => ({
      type: f.type,
      variantId: f.variantId,
    }));
    comparison = compareScans(previousFindings, currentFindings);
  }

  const scan = await prisma.scan.create({
    data: {
      shop: session.shop,
      riskScore: score,
      variantCount: variants.length,
      findingCount: findings.length,
      variants: {
        create: variants.map((v) => ({
          shop: session.shop,
          variantId: v.variantId,
          productId: v.productId,
          productTitle: v.productTitle,
          variantTitle: v.variantTitle,
          sku: v.sku,
          tracked: v.tracked,
          sellWhenEmpty: v.sellWhenEmpty,
          available: v.available,
          soldLast30Days: v.soldLast30Days,
        })),
      },
      findings: {
        create: findings.map((f) => ({
          shop: session.shop,
          type: f.type,
          severity: f.severity,
          variantId: f.variantId,
          message: f.message,
          fix: f.fix,
        })),
      },
    },
  });

  return {
    variantCount: variants.length,
    findings,
    score,
    variants,
    scanCreatedAt: scan.createdAt,
    comparison,
  };
};

export default function ScanPage() {
  const fetcher = useFetcher<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  const runScan = () => fetcher.submit({}, { method: "POST" });

  // Use autoScan from loader if available, otherwise use fetcher data
  const autoScan = loaderData?.autoScan;
  const data = autoScan || fetcher.data;
  const findings: Finding[] = data?.findings || [];
  const variants: Variant[] = data?.variants || [];
  const score = data?.score || 0;
  const variantCount = data?.variantCount || 0;
  const scanCreatedAt = data?.scanCreatedAt || loaderData?.lastScan?.createdAt;
  const comparison = data?.comparison;
  const scans = loaderData?.scans || [];

  // Check if sales data is available (all soldLast30Days are 0 means no sales data)
  const hasSalesData = variants.some((v) => v.soldLast30Days > 0);

  // Calculate relative time for last scan
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Group findings by type
  const findingsByType = new Map<string, Finding[]>();
  for (const finding of findings) {
    if (!findingsByType.has(finding.type)) {
      findingsByType.set(finding.type, []);
    }
    findingsByType.get(finding.type)!.push(finding);
  }

  // Sort types by severity (high first, then medium, then low)
  const typeGroups = Array.from(findingsByType.entries()).sort(
    ([, a], [, b]) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      const maxSeverityA = Math.min(...a.map((f) => severityOrder[f.severity]));
      const maxSeverityB = Math.min(...b.map((f) => severityOrder[f.severity]));
      return maxSeverityA - maxSeverityB;
    }
  );

  // Get type info for display
  const getTypeInfo = (type: string) => {
    const firstFinding = findingsByType.get(type)![0];
    return {
      title: getTypeTitle(type),
      severity: firstFinding.severity,
      count: findingsByType.get(type)!.length,
      message: getTypeMessage(type),
      fix: getTypeFix(type),
    };
  };

  const getTypeMessage = (type: string): string => {
    const messages: Record<string, string> = {
      "duplicate-sku": "Multiple products share the same SKU, which can cause confusion in inventory tracking.",
      "blank-sku": "Some variants have no SKU assigned. SKUs help track inventory accurately.",
      "tracking-off": "Inventory tracking is turned off for some variants. You won't know when these run out.",
      "sell-when-empty": "Some variants are set to continue selling when out of stock. This can lead to overselling.",
      "negative-stock": "Some variants have negative stock levels. This may indicate overselling or miscounting.",
      "low-stock": "Some variants have low stock (5 or fewer units, or will run out soon based on sales pace).",
    };
    return messages[type] || "Issue detected.";
  };

  const getTypeFix = (type: string): string => {
    const fixes: Record<string, string> = {
      "duplicate-sku": "Assign a unique SKU to each variant to avoid confusion.",
      "blank-sku": "Add unique SKUs to make it easier to track stock and identify products.",
      "tracking-off": "Turn on inventory tracking so Shopify can track stock levels accurately.",
      "sell-when-empty": "Turn off 'continue selling when out of stock' to prevent accepting orders you can't fulfill.",
      "negative-stock": "Reconcile inventory to correct stock levels. This may require canceling unfulfilled orders.",
      "low-stock": "Reorder soon. Low stock is flagged at 5 or fewer units, or based on sales pace if data is available.",
    };
    return fixes[type] || "Review and fix the affected variants.";
  };

  const getTypeTitle = (type: string): string => {
    const titles: Record<string, string> = {
      "duplicate-sku": "Duplicate SKUs",
      "blank-sku": "Blank SKUs",
      "tracking-off": "Inventory Tracking Off",
      "sell-when-empty": "Selling When Out of Stock",
      "negative-stock": "Negative Stock",
      "low-stock": "Low Stock",
    };
    return titles[type] || type;
  };

  const toggleExpand = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  const getVariantName = (variantId: string): string => {
    const variant = variants.find((v) => v.variantId === variantId);
    if (!variant) return "Unknown";
    return `${variant.productTitle} - ${variant.variantTitle}`;
  };

  // Show loading skeleton while auto-scanning
  if (autoScan || (isLoading && !data)) {
    return (
      <s-page heading="Inventory Scan">
        <s-button slot="primary-action" onClick={runScan}>
          Scan again
        </s-button>

        <s-section heading="Scanning your inventory...">
          <s-paragraph>We're checking all your products for potential issues.</s-paragraph>
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="base">
              <s-skeleton-display-text size="small" />
              <s-skeleton-display-text size="small" />
              <s-skeleton-display-text size="small" />
            </s-stack>
          </s-box>
        </s-section>
      </s-page>
    );
  }

  return (
    <s-page heading="Inventory Scan">
      <s-button slot="primary-action" onClick={runScan}>
        Scan again
      </s-button>

      {scanCreatedAt && (
        <s-paragraph>
          Last scanned {getRelativeTime(new Date(scanCreatedAt))}
        </s-paragraph>
      )}

      {data && (
        <>
          <s-section heading="Risk Score">
            <s-box
              padding="base"
              borderWidth="base"
              borderRadius="base"
              background={score === 0 ? "success" : score > 50 ? "critical" : "warning"}
            >
              <s-text variant="headingLg" as="p">
                {score}/100
              </s-text>
              <s-text as="p">
                {score === 0
                  ? "No issues found! Your inventory is healthy."
                  : score > 50
                  ? "High risk: Multiple critical issues need attention."
                  : "Moderate risk: Some issues found that should be addressed."}
              </s-text>
            </s-box>
            <s-paragraph>
              Scanned {variantCount} variants and found {findings.length} issues.
            </s-paragraph>
            {!hasSalesData && (
              <s-box
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <s-text as="p">
                  Sales data is not available yet, so low-stock warnings are limited.
                </s-text>
              </s-box>
            )}
          </s-section>

          {comparison && (
            <s-section heading="What Changed Since Last Scan">
              <s-paragraph>
                {comparison.added.length} new issues since your last scan, {comparison.resolved.length} fixed.
              </s-paragraph>
              {comparison.added.length > 0 && (
                <s-box
                  padding="base"
                  borderWidth="base"
                  borderRadius="base"
                  background="warning"
                  marginBottom="base"
                >
                  <s-text variant="headingSm" as="h4">
                    New issues ({comparison.added.length}):
                  </s-text>
                  <s-unordered-list>
                    {comparison.added.map((f, index) => {
                      const variant = variants.find((v) => v.variantId === f.variantId);
                      const variantName = variant
                        ? `${variant.productTitle} - ${variant.variantTitle}`
                        : "Unknown";
                      return (
                        <s-list-item key={index}>
                          {variantName} - {f.type}
                        </s-list-item>
                      );
                    })}
                  </s-unordered-list>
                </s-box>
              )}
            </s-section>
          )}

          {scans.length > 0 && (
            <s-section heading="Scan History">
              <s-unordered-list>
                {scans.map((scan) => (
                  <s-list-item key={scan.id}>
                    {new Date(scan.createdAt).toLocaleString()} - Score: {scan.riskScore}/100, {scan.findingCount} findings
                  </s-list-item>
                ))}
              </s-unordered-list>
            </s-section>
          )}

          {findings.length > 0 && (
            <s-section heading="Findings">
              {typeGroups.map(([type, typeFindings]) => {
                const info = getTypeInfo(type);
                const isExpanded = expandedTypes.has(type);
                const background =
                  info.severity === "high"
                    ? "critical"
                    : info.severity === "medium"
                    ? "warning"
                    : "subdued";

                return (
                  <s-box
                    key={type}
                    padding="base"
                    borderWidth="base"
                    borderRadius="base"
                    background={background}
                    marginBottom="base"
                  >
                    <s-stack direction="block" gap="base">
                      <s-stack direction="inline" gap="base" align="space-between">
                        <s-text variant="headingMd" as="h3">
                          {info.title} ({info.count})
                        </s-text>
                        <s-button onClick={() => toggleExpand(type)} variant="tertiary">
                          {isExpanded ? "Collapse" : "Expand"}
                        </s-button>
                      </s-stack>
                      <s-text as="p">{info.message}</s-text>
                      <s-text as="p">{info.fix}</s-text>
                      {isExpanded && (
                        <s-box
                          padding="base"
                          borderWidth="base"
                          borderRadius="base"
                          background="subdued"
                        >
                          <s-text variant="headingSm" as="h4">
                            Affected products ({typeFindings.length}):
                          </s-text>
                          <s-unordered-list>
                            {typeFindings.map((finding, index) => (
                              <s-list-item key={index}>
                                {getVariantName(finding.variantId)}
                              </s-list-item>
                            ))}
                          </s-unordered-list>
                        </s-box>
                      )}
                    </s-stack>
                  </s-box>
                );
              })}
            </s-section>
          )}
        </>
      )}

      <s-section slot="aside" heading="About this scan">
        <s-paragraph>
          This scan checks your inventory for common issues:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>Duplicate SKUs</s-list-item>
          <s-list-item>Blank SKUs</s-list-item>
          <s-list-item>Inventory tracking turned off</s-list-item>
          <s-list-item>Selling when out of stock</s-list-item>
          <s-list-item>Negative stock levels</s-list-item>
          <s-list-item>Low stock (5 or fewer units, or based on sales pace)</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Legal">
        <s-stack direction="block" gap="base">
          <s-link href="/app/privacy">Privacy Policy</s-link>
          <s-link href="/app/terms">Terms of Service</s-link>
        </s-stack>
      </s-section>
    </s-page>
  );
}
