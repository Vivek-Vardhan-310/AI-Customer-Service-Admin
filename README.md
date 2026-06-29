<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# AI Customer Service — Admin Panel

Enterprise admin dashboard for managing customer support tickets, products, warranty claims, and feedback. Connected to Supabase for live data.

## Run Locally

**Prerequisites:** Node.js, a Supabase project

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set your Supabase credentials:
   ```
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   ```
3. Run the app:
   `npm run dev`

## Supabase Setup

1. **Run the main schema** (`supabase_schema.sql` from the customer frontend project) in the Supabase SQL Editor.
2. **Run the admin migration** (`supabase_admin_migration.sql` from this project) in the Supabase SQL Editor.
3. **Set your admin user's role**:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
   ```
4. Sign up a test user in the customer frontend, seed demo data, then log into the admin panel with your admin credentials.

## Architecture

- **Supabase Auth** — Admin login verifies `profiles.role = 'admin'`
- **Live data** — Tickets, customers, products, feedback, and SLA rules all fetched from Supabase
- **Fallback** — When Supabase env vars aren't set, the app runs with hardcoded mock data
- **Optimistic updates** — Status changes appear instantly, then sync to the database

## Deferred / Future Features

The following features are documented for future implementation:

| Feature | Reason | Priority |
|---------|--------|----------|
| **Analytics tab (live data)** | Currently uses generated/hardcoded chart data. Needs a real analytics pipeline (e.g., Supabase views or aggregation functions). | Medium |
| **AI Monitoring tab (live data)** | Uses mock AI conversation sessions. Needs real AI session logging infrastructure. | Low |
| **Real-time updates** | Supabase Realtime subscriptions for live ticket/feedback updates without page refresh. | High |
| **Admin product catalog** | Admin products are enterprise-level aggregates (model series). Currently aggregates from user products. Could use a separate admin products table. | Medium |
| **File attachments (Supabase Storage)** | Ticket file uploads need Supabase Storage bucket configuration and signed URL generation. | Medium |
| **Email notifications** | SLA breach notifications need Supabase Edge Functions or webhook integration. | Low |
| **Customer plan management** | Customer plan (Premium/Standard/Free) not in DB yet. Needs a `plan` column or separate subscriptions table. | Low |
| **Customer location tracking** | Location/industry fields not in profiles. Could add columns if needed. | Low |
| **Ticket priority field** | Currently inferred from category/status. Could add a `priority` column to tickets table. | Medium |
| **Ticket department assignment** | Currently inferred from category. Could add `department` and `assigned_to` columns. | Medium |

