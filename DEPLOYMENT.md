# CrownIQ Deployment Guide

## Prerequisites
- Shopify Partner account with app created
- Neon PostgreSQL database (free tier)
- Railway account (free trial)

## Step 1: Set up Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project called "crowniq-db"
3. Copy the connection string (format: `postgresql://user:password@ep-xyz.aws.neon.tech/neondb?sslmode=require`)

## Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub repository
4. Railway will detect it's a Node.js project

## Step 3: Configure Environment Variables in Railway

Add these environment variables in Railway:

```
SHOPIFY_API_KEY=your_api_key_from_partner_dashboard
SHOPIFY_API_SECRET=your_api_secret_from_partner_dashboard
SHOPIFY_APP_URL=https://your-app-name.railway.app
SCOPES=write_products,write_metaobjects,write_metaobject_definitions,read_products,read_inventory,read_locations,read_orders
DATABASE_URL=your_neon_connection_string
```

To get SHOPIFY_API_KEY and SHOPIFY_API_SECRET:
1. Go to Shopify Partner Dashboard
2. Select your app
3. Click "App setup" → "API credentials"

## Step 4: Deploy

1. Click "Deploy" in Railway
2. Wait for the build to complete
3. Railway will give you a URL like `https://crowniq-production.up.railway.app`

## Step 5: Update Shopify App Configuration

1. Go to Shopify Partner Dashboard
2. Select your app
3. Click "App setup"
4. Update the URLs:
   - App URL: `https://your-railway-url.railway.app`
   - Allowed redirection URL(s): `https://your-railway-url.railway.app/auth/callback`
5. Save changes

## Step 6: Run Database Migrations

Railway will automatically run `npm run setup` which includes:
```bash
prisma generate
prisma migrate deploy
```

## Step 7: Test the App

1. Install the app on a test store
2. Run a scan to verify everything works
3. Check the database tables are created correctly

## Step 8: Submit to Shopify App Store

When ready to go public:

1. Update app listing in Partner Dashboard (see APP_STORE_LISTING.md for details):
   - App name: CrownIQ
   - Description: Use the text from APP_STORE_LISTING.md
   - Support email: hello@tallytick.com
   - Categories: Inventory Management
   - Pricing: Free (start free, add paid tiers later)
   - Screenshots: Create 5 screenshots (1280x800px) showing key features
2. Configure data deletion endpoint in Partner Dashboard:
   - Data deletion request URL: `https://your-railway-url.railway.app/api/data-deletion`
3. Add privacy policy URL: `https://your-railway-url.railway.app/app/privacy`
4. Submit for review
5. Shopify will review (typically 1-3 business days)

**Important:** The app includes:
- Privacy policy at `/app/privacy`
- Terms of service at `/app/terms`
- Data deletion endpoint at `/api/data-deletion`
- Automatic data deletion on uninstall via webhook

## Monitoring

- Check Railway logs for any errors
- Monitor Neon database usage (free tier: 1GB storage, 100 compute hours/month)
- Railway trial credits: $5 for 30 days (enough for initial testing)

## Cost Breakdown (Free Tier)

- **Railway**: $5 trial credits (30 days) → after that, ~$5/month for small apps
- **Neon**: Free tier (1GB storage, 100 compute hours/month) - sufficient for early users
- **Shopify**: 20% commission on app revenue

## Support

For issues: hello@tallytick.com
