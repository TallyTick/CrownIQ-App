# CrownIQ Launch Checklist

## ✅ Completed Features

### Core Functionality
- [x] Inventory scanning (all products and variants)
- [x] Check for duplicate SKUs
- [x] Check for blank SKUs
- [x] Check for inventory tracking turned off
- [x] Check for "sell when out of stock" with zero/negative stock
- [x] Check for negative stock levels
- [x] Low stock warnings (5 units or sales-based)
- [x] Risk score calculation (0-100)
- [x] Findings grouped by type with expandable lists
- [x] Scan history (last 5 scans)
- [x] Comparison between scans (new/fixed issues)
- [x] Sales data integration (last 30 days orders)
- [x] Database storage (PostgreSQL with Prisma)

### Required for App Store
- [x] Privacy policy page (/app/privacy)
- [x] Terms of service page (/app/terms)
- [x] Data deletion endpoint (/api/data-deletion)
- [x] Automatic data deletion on uninstall webhook
- [x] App Store listing content prepared

### Technical Setup
- [x] PostgreSQL schema (Neon-ready)
- [x] Railway deployment configuration
- [x] Environment variables template
- [x] Latest Shopify API version (January 2027)
- [x] Proper scopes configured

## 🚀 Next Steps to Launch

### 1. Get Neon Database Connection String
- Go to neon.tech, sign up, create project
- Copy connection string (format: `postgresql://user:password@ep-xyz.aws.neon.tech/neondb?sslmode=require`)

### 2. Push Code to GitHub
- Create repository if not exists
- Push all code to GitHub
- Make sure `.env` is in `.gitignore`

### 3. Deploy to Railway
- Go to railway.app, sign up
- Create project from GitHub repo
- Add environment variables (see DEPLOYMENT.md)
- Deploy and get URL

### 4. Update Shopify Partner Dashboard
- Update app URL to Railway URL
- Add data deletion endpoint URL
- Add privacy policy URL
- Update app listing with content from APP_STORE_LISTING.md
- Upload 5 screenshots (1280x800px)

### 5. Test Everything
- Install on test store
- Run scan and verify it works
- Check privacy policy and terms pages
- Uninstall and verify data deletion
- Reinstall and verify it works again

### 6. Submit for Review
- Submit app in Partner Dashboard
- Wait for Shopify review (1-3 business days)
- Address any feedback from Shopify

## 📋 Files to Review

- `DEPLOYMENT.md` - Complete deployment guide
- `APP_STORE_LISTING.md` - App Store listing content
- `.env.example` - Environment variables template
- `railway.toml` - Railway configuration

## 🔑 Required Credentials

Get these from Shopify Partner Dashboard:
- SHOPIFY_API_KEY
- SHOPIFY_API_SECRET

Get these from service providers:
- DATABASE_URL (from Neon)
- RAILWAY_URL (after deployment)

## ⚠️ Important Notes

### Order Data Scope
- Current: `read_orders` (60-day limit) - works for MVP
- Optional: Request `read_all_orders` approval for historical data
- Decision: Launch with 60-day limit, add full history later if needed

### Pricing
- Current: Free tier
- Future: Add paid tiers for email alerts and scheduled scans
- Decision: Launch free, monetize after user feedback

### Database
- Current: Neon PostgreSQL (free tier)
- Limits: 1GB storage, 100 compute hours/month
- Monitoring: Check usage in Neon dashboard
- Scale: Upgrade when needed

### Hosting
- Current: Railway (trial credits $5 for 30 days)
- After trial: ~$5/month for small apps
- Monitoring: Check Railway logs regularly

## 📞 Support

For deployment issues: hello@tallytick.com

## 🎯 Success Metrics

Track after launch:
- Number of installs
- Scan frequency per store
- Common findings (what issues are most prevalent)
- User feedback and support requests
