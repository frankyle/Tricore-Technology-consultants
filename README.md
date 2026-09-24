# Tricore Technology Solutions + Technician Marketplace

## Setup
1. Supabase Dashboard -> SQL Editor -> paste and run `supabase/schema.sql` (once).
2. Copy `.env.example` to `.env` and fill in your Supabase URL and anon key.
3. `yarn install` then `yarn start`.
4. Deploy on Vercel (`vercel.json` handles page refreshes on /technicians etc.).
   Add the same two variables in Vercel -> Settings -> Environment Variables.

## Pages
/technicians, /technicians/:id, /companies, /jobs, /login, /dashboard

## Turning on paid registration later
`profiles.plan` and `profiles.paid_until` already exist. Set them from a payment
webhook (service role) and gate features on them.
Mark verified technicians/companies from the Supabase table editor.
