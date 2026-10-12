import type { Variant, Finding } from "./types";

export function checkDuplicateSkus(variants: Variant[]): Finding[] {
  const findings: Finding[] = [];
  const skuMap = new Map<string | null, Variant[]>();

  // Group variants by SKU
  for (const variant of variants) {
    if (!skuMap.has(variant.sku)) {
      skuMap.set(variant.sku, []);
    }
    skuMap.get(variant.sku)!.push(variant);
  }

  // Find SKUs that appear more than once
  for (const [sku, variantList] of skuMap.entries()) {
    if (sku !== null && variantList.length > 1) {
      for (const variant of variantList) {
        findings.push({
          type: "duplicate-sku",
          severity: "high",
          variantId: variant.variantId,
          message: `SKU "${sku}" is used by multiple products. This can cause confusion in inventory tracking.`,
          fix: `Assign a unique SKU to each variant. Check "${variant.productTitle} - ${variant.variantTitle}" and the other ${variantList.length - 1} product(s) sharing this SKU.`,
        });
      }
    }
  }

  return findings;
}

export function checkBlankSkus(variants: Variant[]): Finding[] {
  const findings: Finding[] = [];

  for (const variant of variants) {
    if (variant.sku === null) {
      findings.push({
        type: "blank-sku",
        severity: "medium",
        variantId: variant.variantId,
        message: `This variant has no SKU assigned. SKUs help track inventory accurately.`,
        fix: `Add a unique SKU to "${variant.productTitle} - ${variant.variantTitle}". This makes it easier to track stock and identify products.`,
      });
    }
  }

  return findings;
}

export function checkTrackingOff(variants: Variant[]): Finding[] {
  const findings: Finding[] = [];

  for (const variant of variants) {
    if (!variant.tracked) {
      findings.push({
        type: "tracking-off",
        severity: "high",
        variantId: variant.variantId,
        message: `Inventory tracking is turned off for "${variant.productTitle}". You won't know when this runs out. If this is on purpose (for example pre-orders or made-to-order items), you can ignore this.`,
        fix: `Turn on inventory tracking for "${variant.productTitle} - ${variant.variantTitle}" so Shopify can track stock levels accurately.`,
      });
    }
  }

  return findings;
}

export function checkSellWhenEmpty(variants: Variant[]): Finding[] {
  const findings: Finding[] = [];

  for (const variant of variants) {
    if (variant.sellWhenEmpty && variant.available <= 0) {
      findings.push({
        type: "sell-when-empty",
        severity: "high",
        variantId: variant.variantId,
        message: `"${variant.productTitle}" is set to continue selling when out of stock. This can lead to overselling. If this is on purpose (for example pre-orders or made-to-order items), you can ignore this.`,
        fix: `Turn off "continue selling when out of stock" for "${variant.productTitle} - ${variant.variantTitle}" to prevent accepting orders you can't fulfill.`,
      });
    }
  }

  return findings;
}

export function checkNegativeStock(variants: Variant[]): Finding[] {
  const findings: Finding[] = [];

  for (const variant of variants) {
    if (variant.available < 0) {
      findings.push({
        type: "negative-stock",
        severity: "high",
        variantId: variant.variantId,
        message: `"${variant.productTitle}" has negative stock (${variant.available}). This may have been oversold or miscounted.`,
        fix: `Reconcile inventory for "${variant.productTitle} - ${variant.variantTitle}" to correct the stock level. This may require canceling unfulfilled orders.`,
      });
    }
  }

  return findings;
}

export function checkLowStock(variants: Variant[]): Finding[] {
  const findings: Finding[] = [];

  for (const variant of variants) {
    // Calculate days of stock remaining at current sales pace (if sales data is available)
    if (variant.soldLast30Days > 0) {
      const dailySalesRate = variant.soldLast30Days / 30;
      const daysRemaining = variant.available / dailySalesRate;

      // Flag if stock would run out in under 7 days
      if (daysRemaining < 7 && variant.available > 0) {
        findings.push({
          type: "low-stock",
          severity: daysRemaining < 3 ? "high" : "medium",
          variantId: variant.variantId,
          message: `"${variant.productTitle}" will run out in about ${Math.round(daysRemaining)} days at the current sales pace (${variant.soldLast30Days} sold in the last 30 days).`,
          fix: `Reorder "${variant.productTitle} - ${variant.variantTitle}" soon. At current sales speed, you have less than a week of stock remaining.`,
        });
      }
    } else {
      // Simple check: flag variants with 5 or fewer units available (when no sales data)
      if (variant.available > 0 && variant.available <= 5) {
        findings.push({
          type: "low-stock",
          severity: "medium",
          variantId: variant.variantId,
          message: `"${variant.productTitle}" has low stock (${variant.available} units available).`,
          fix: `Reorder "${variant.productTitle} - ${variant.variantTitle}" soon to avoid running out.`,
        });
      }
    }
  }

  return findings;
}

export function runChecks(variants: Variant[]): Finding[] {
  const findings: Finding[] = [];

  findings.push(...checkDuplicateSkus(variants));
  findings.push(...checkBlankSkus(variants));
  findings.push(...checkTrackingOff(variants));
  findings.push(...checkSellWhenEmpty(variants));
  findings.push(...checkNegativeStock(variants));
  findings.push(...checkLowStock(variants));

  return findings;
}

export function riskScore(findings: Finding[], variantCount: number): number {
  if (findings.length === 0) {
    return 0;
  }

  // Weight findings by severity and divide by variant count to get a relative score
  // Formula: (high findings × 1 + medium × 0.5 + low × 0.25 - blank-sku medium × 0.3) ÷ variants × 100
  // Blank SKUs count less (0.2 instead of 0.5 for medium) because they're housekeeping, not oversell risk
  let weightedCount = 0;

  for (const finding of findings) {
    switch (finding.severity) {
      case "high":
        weightedCount += 1;
        break;
      case "medium":
        // Blank SKUs are medium severity but count much less in risk score
        if (finding.type === "blank-sku") {
          weightedCount += 0.2;
        } else {
          weightedCount += 0.5;
        }
        break;
      case "low":
        weightedCount += 0.25;
        break;
    }
  }

  const score = (weightedCount / variantCount) * 100;

  // Cap at 100
  return Math.min(Math.round(score), 100);
}
