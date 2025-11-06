# Cloudflare Pages Deployment Guide
## Longenix Health - TCM Clinical Decision Support System

This application uses **Cloudflare Pages** with **D1 Database** for a fully serverless architecture.

## Prerequisites
- Cloudflare account
- Wrangler CLI installed: `npm install -g wrangler`
- GitHub repository connected to Cloudflare Pages

## Setup Instructions

### 1. Create D1 Database

```bash
# Login to Cloudflare
wrangler login

# Create the D1 database
wrangler d1 create tcmcdss-db
```

This will output a database ID. Copy it and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "tcmcdss-db"
database_id = "YOUR-DATABASE-ID-HERE"  # Replace with actual ID
```

### 2. Initialize Database Schema

```bash
# Apply the schema to your D1 database
wrangler d1 execute tcmcdss-db --file=./functions/schema.sql
```

### 3. Deploy to Cloudflare Pages

#### Option A: Automatic Deployment (Recommended)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages**
3. Click **Create a project**
4. Connect your GitHub repository: `TCMCDSS`
5. Configure build settings:
   - **Build command**: (leave empty)
   - **Build output directory**: `frontend`
6. Add environment binding:
   - Go to **Settings** → **Functions**
   - Add **D1 Database Binding**:
     - Variable name: `DB`
     - D1 database: Select `tcmcdss-db`
7. Click **Save and Deploy**

#### Option B: Manual Deployment
```bash
# Deploy with wrangler
wrangler pages deploy frontend --project-name=tcmcdss
```

### 4. Verify Deployment

After deployment, test the following endpoints:

```bash
# Replace YOUR-DOMAIN with your actual Cloudflare Pages URL
curl https://YOUR-DOMAIN.pages.dev/api/patients

# Should return: {"patients":[]}
```

## Database Management

### View database contents
```bash
# List all patients
wrangler d1 execute tcmcdss-db --command="SELECT * FROM patients"

# List all visits
wrangler d1 execute tcmcdss-db --command="SELECT * FROM visits"
```

### Backup database
```bash
# Export database to SQL file
wrangler d1 export tcmcdss-db --output=backup.sql
```

### Reset database (⚠️ Caution: Deletes all data)
```bash
# Drop all tables and recreate
wrangler d1 execute tcmcdss-db --file=./functions/schema.sql
```

## Architecture

```
┌─────────────────────────────────────────┐
│     Cloudflare Pages (Frontend)         │
│   - HTML, CSS, JavaScript                │
│   - Hosted on Cloudflare CDN            │
└────────────┬────────────────────────────┘
             │
             ├─ /api/patients            → functions/api/patients.js
             ├─ /api/patients/[id]       → functions/api/patients/[id].js
             ├─ /api/observations/...    → functions/api/observations/...
             ├─ /api/interrogations/...  → functions/api/interrogations/...
             ├─ /api/patterns/...        → functions/api/patterns/...
             └─ /api/reasoning/...       → functions/api/reasoning/...
                        │
                        ▼
            ┌────────────────────────┐
            │   Cloudflare D1        │
            │   (SQLite Database)    │
            └────────────────────────┘
```

## Troubleshooting

### "Binding DB not found"
- Make sure you've added the D1 binding in Cloudflare Pages Settings → Functions
- Verify the binding name is exactly `DB`

### "Table does not exist"
- Run the schema file: `wrangler d1 execute tcmcdss-db --file=./functions/schema.sql`

### API returns 500 errors
- Check Cloudflare Pages Functions logs in the dashboard
- Verify D1 database is properly bound
- Test queries directly: `wrangler d1 execute tcmcdss-db --command="SELECT 1"`

### Data not persisting
- Ensure you're using the production D1 database, not a local one
- Check if writes are succeeding: View D1 database in Cloudflare dashboard

## Development

### Local Testing
```bash
# Install dependencies
npm install -D wrangler

# Run local development server with D1
wrangler pages dev frontend --d1 DB=tcmcdss-db
```

This will start a local server at `http://localhost:8788` with full D1 database access.

## Production URL

Once deployed, your application will be available at:
- `https://tcmcdss.pages.dev` (default)
- Or your custom domain if configured

## Support

For issues related to:
- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **D1 Database**: https://developers.cloudflare.com/d1
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler
