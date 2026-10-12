# CrownIQ - Shopify App Store Listing

## Basic Information

**App Name:** CrownIQ

**Short Description (30 chars):** Inventory health monitor

**Long Description (250 chars):** Monitor your inventory health and catch issues before they become problems. CrownIQ scans for duplicate SKUs, missing tracking, low stock, and overselling risks.

**Detailed Description:**

CrownIQ is your intelligent inventory health monitor for Shopify stores. Stop guessing about your inventory status and let CrownIQ identify potential issues before they cost you sales or customer trust.

**Key Features:**

🔍 **Comprehensive Inventory Scans**
- Scan all products and variants in seconds
- Identify duplicate SKUs that cause confusion
- Find blank SKUs that need attention
- Detect variants with inventory tracking turned off

⚠️ **Overselling Prevention**
- Flag products set to "continue selling when out of stock"
- Alert you to negative stock levels immediately
- Prevent accepting orders you can't fulfill

📊 **Smart Low-Stock Warnings**
- Calculate days of stock remaining based on real sales data
- Simple 5-unit threshold when sales data isn't available
- Prioritize which products need reordering first

📈 **Scan History & Comparison**
- Track your inventory health over time
- See what changed between scans
- Identify trends and recurring issues

**How It Works:**

1. Click "Run Scan" to analyze your entire inventory
2. Get a risk score (0-100) showing overall health
3. Review findings grouped by issue type
4. See detailed explanations and fix recommendations
5. Track improvements over time with scan history

**Perfect For:**
- Growing stores managing hundreds of SKUs
- Dropshippers tracking inventory across locations
- Businesses preventing overselling during peak seasons
- Anyone who wants proactive inventory management

**Data Privacy:**
- Your data is stored securely and isolated by shop
- We only collect inventory data needed for scans
- Automatic data deletion when you uninstall
- Full transparency in our privacy policy

**Support:**
Questions? Email us at hello@tallytick.com

---

## App Categories

Select: **Inventory Management**

## Pricing

**Model:** Free (for now - add paid tiers later with email alerts and scheduled scans)

## Screenshots Needed

You'll need 5 screenshots (1280x800px or 640x400px):

1. **Home page** - showing risk score and last scan results
2. **Scan in progress** - loading state during scan
3. **Findings page** - grouped findings with severity indicators
4. **Scan history** - showing comparison between scans
5. **Low stock detail** - showing days remaining calculation

**Screenshot Tips:**
- Use a real Shopify store with actual products
- Show realistic data (don't use demo data)
- Highlight key features in each screenshot
- Ensure text is readable
- Use consistent branding

## App URL (After Deployment)

`https://your-app-name.railway.app`

## Redirect URLs

```
https://your-app-name.railway.app/auth/callback
```

## Webhooks

Required webhooks are already configured in shopify.app.toml:
- app/uninstalled
- app/scopes_update

## Required Scopes

Already configured in shopify.app.toml:
- write_products
- write_metaobjects
- write_metaobject_definitions
- read_products
- read_inventory
- read_locations
- read_orders

## Support Contact

**Email:** hello@tallytick.com
**Response Time:** Within 24 hours

## Review Checklist Before Submitting:

- [ ] App deployed and working on Railway
- [ ] Neon PostgreSQL database connected
- [ ] Privacy policy page accessible at /app/privacy
- [ ] Terms of service page accessible at /app/terms
- [ ] Data deletion endpoint working at /api/data-deletion
- [ ] App uninstall webhook deletes all data
- [ ] App URL configured in Partner Dashboard
- [ ] Screenshots created and uploaded
- [ ] App description written
- [ ] Categories selected
- [ ] Support email confirmed
- [ ] Scopes approved (read_orders may need special approval)

## Order Data Note

The app uses `read_orders` scope to fetch sales data from the last 30 days for low-stock calculations. This works out of the box. For historical data beyond 60 days, you'll need to request `read_all_orders` approval from Shopify - this is optional for MVP launch.

## Testing Instructions for Shopify Review:

1. Install the app on a test store
2. Run a scan to verify it works
3. Check that privacy policy and terms are accessible
4. Uninstall the app and verify data is deleted
5. Reinstall and verify it works correctly
