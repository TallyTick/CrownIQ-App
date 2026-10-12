export default function PrivacyPolicy() {
  return (
    <s-page heading="Privacy Policy">
      <s-section heading="Data Collection">
        <s-paragraph>
          CrownIQ collects the following data to provide inventory monitoring services:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>Product and variant information (titles, SKUs, inventory levels)</s-list-item>
          <s-list-item>Order data (variant quantities sold in the last 30 days)</s-list-item>
          <s-list-item>Shop domain for authentication and data organization</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Data Usage">
        <s-paragraph>
          We use your data to:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>Scan and analyze your inventory for potential issues</s-list-item>
          <s-list-item>Calculate low-stock warnings based on sales velocity</s-list-item>
          <s-list-item>Store scan history for comparison and trend analysis</s-list-item>
          <s-list-item>Improve our service performance and accuracy</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Data Storage">
        <s-paragraph>
          Your data is stored securely in PostgreSQL databases hosted on Neon.
          All data is isolated by shop domain - we never share data between shops.
        </s-paragraph>
      </s-section>

      <s-section heading="Data Retention">
        <s-paragraph>
          We retain scan history for up to 12 months. After this period, older scans
          are automatically deleted. You can request immediate deletion of all your
          data at any time by contacting hello@tallytick.com.
        </s-paragraph>
      </s-section>

      <s-section heading="Data Deletion">
        <s-paragraph>
          If you uninstall CrownIQ from your Shopify store, we automatically delete
          all your data within 30 days. You can also request immediate deletion by
          contacting hello@tallytick.com with your shop domain.
        </s-paragraph>
      </s-section>

      <s-section heading="Data Security">
        <s-paragraph>
          We implement industry-standard security measures:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>Encryption in transit (HTTPS/TLS)</s-list-item>
          <s-list-item>Secure database connections</s-list-item>
          <s-list-item>Regular security updates</s-list-item>
          <s-list-item>Access controls and authentication</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Third-Party Services">
        <s-paragraph>
          We use the following third-party services:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>
            <s-link href="https://neon.tech" target="_blank">
              Neon
            </s-link>
            {" "} - PostgreSQL database hosting
          </s-list-item>
          <s-list-item>
            <s-link href="https://railway.app" target="_blank">
              Railway
            </s-link>
            {" "} - Application hosting
          </s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Contact">
        <s-paragraph>
          For privacy questions or data requests, contact us at{" "}
          <s-link href="mailto:hello@tallytick.com">
            hello@tallytick.com
          </s-link>
        </s-paragraph>
      </s-section>

      <s-section heading="Last Updated">
        <s-paragraph>January 2025</s-paragraph>
      </s-section>
    </s-page>
  );
}
