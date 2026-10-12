import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get the most recent scan for this shop
  const lastScan = await prisma.scan.findFirst({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });

  return { lastScan };
};

export default function Index() {
  const { lastScan } = useLoaderData<typeof loader>();

  return (
    <s-page heading="CrownIQ - Inventory Health Monitor">
      <s-button slot="primary-action" href="/app/scan">
        Run scan
      </s-button>

      <s-section heading="Welcome to CrownIQ">
        <s-paragraph>
          CrownIQ helps you monitor your inventory health and catch issues before
          they become problems. Our scan checks for:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>Duplicate SKUs</s-list-item>
          <s-list-item>Blank SKUs</s-list-item>
          <s-list-item>Inventory tracking turned off</s-list-item>
          <s-list-item>Selling when out of stock</s-list-item>
          <s-list-item>Negative stock levels</s-list-item>
          <s-list-item>Low stock warnings</s-list-item>
        </s-unordered-list>
      </s-section>

      {lastScan ? (
        <s-section heading="Your Last Scan">
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background={lastScan.riskScore === 0 ? "success" : lastScan.riskScore > 50 ? "critical" : "warning"}
          >
            <s-text variant="headingLg" as="p">
              {lastScan.riskScore}/100
            </s-text>
            <s-text as="p">
              {lastScan.riskScore === 0
                ? "No issues found! Your inventory is healthy."
                : lastScan.riskScore > 50
                ? "High risk: Multiple critical issues need attention."
                : "Moderate risk: Some issues found that should be addressed."}
            </s-text>
          </s-box>
          <s-paragraph>
            Scanned {lastScan.variantCount} variants and found {lastScan.findingCount} issues on{" "}
            {new Date(lastScan.createdAt).toLocaleString()}.
          </s-paragraph>
          <s-button href="/app/scan">View details</s-button>
        </s-section>
      ) : (
        <s-section heading="Get Started">
          <s-paragraph>
            Run your first inventory scan to identify potential issues with your
            products and variants.
          </s-paragraph>
          <s-button href="/app/scan">Run first scan</s-button>
        </s-section>
      )}

      <s-section slot="aside" heading="Quick Actions">
        <s-stack direction="block" gap="base">
          <s-button href="/app/scan" fullWidth>
            Run inventory scan
          </s-button>
          <s-button href="/app/scan" variant="tertiary" fullWidth>
            View scan history
          </s-button>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Need Help?">
        <s-paragraph>
          Questions or feedback? Contact us at{" "}
          <s-link href="mailto:hello@tallytick.com">
            hello@tallytick.com
          </s-link>
        </s-paragraph>
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

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
