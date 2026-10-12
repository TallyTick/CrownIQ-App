export default function TermsOfService() {
  return (
    <s-page heading="Terms of Service">
      <s-section heading="Acceptance of Terms">
        <s-paragraph>
          By installing and using CrownIQ, you agree to these Terms of Service.
          If you do not agree to these terms, please do not use the app.
        </s-paragraph>
      </s-section>

      <s-section heading="Service Description">
        <s-paragraph>
          CrownIQ is an inventory monitoring app for Shopify stores. It scans your
          products and variants to identify potential inventory issues such as
          duplicate SKUs, missing tracking, low stock, and overselling risks.
        </s-paragraph>
      </s-section>

      <s-section heading="User Responsibilities">
        <s-paragraph>
          As a user of CrownIQ, you agree to:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>Provide accurate information about your store</s-list-item>
          <s-list-item>Use the app in accordance with Shopify's terms of service</s-list-item>
          <s-list-item>Not attempt to circumvent security measures</s-list-item>
          <s-list-item>Report any bugs or security issues to hello@tallytick.com</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Limitation of Liability">
        <s-paragraph>
          CrownIQ is provided "as is" without warranties of any kind. We are not
          liable for any damages arising from the use of this app, including but not
          limited to lost profits, data loss, or business interruption.
        </s-paragraph>
        <s-paragraph>
          CrownIQ provides recommendations based on inventory data, but you are
          responsible for making final decisions about your inventory management.
        </s-paragraph>
      </s-section>

      <s-section heading="Data Accuracy">
        <s-paragraph>
          While we strive for accuracy, CrownIQ relies on data provided by Shopify's
          API. We cannot guarantee that all information is always up-to-date or
          error-free. Please verify critical inventory decisions independently.
        </s-paragraph>
      </s-section>

      <s-section heading="Account Termination">
        <s-paragraph>
          We reserve the right to suspend or terminate access to CrownIQ for:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>Violation of these terms</s-list-item>
          <s-list-item>Suspicious activity or security concerns</s-list-item>
          <s-list-item>Extended periods of inactivity</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Modifications to Terms">
        <s-paragraph>
          We may update these terms from time to time. Continued use of the app
          after changes constitutes acceptance of the new terms.
        </s-paragraph>
      </s-section>

      <s-section heading="Governing Law">
        <s-paragraph>
          These terms are governed by the laws of the jurisdiction in which the
          service provider operates. Any disputes will be resolved in accordance
          with applicable laws.
        </s-paragraph>
      </s-section>

      <s-section heading="Contact">
        <s-paragraph>
          For questions about these terms, contact us at{" "}
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
