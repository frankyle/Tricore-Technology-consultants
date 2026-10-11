# Tricore Technology Solutions + Technician Marketplace

## Setup
1. Supabase Dashboard -> SQL Editor -> paste and run `supabase/schema.sql` (once),
   then `supabase/02_technician_verification.sql` (once). The second file adds
   certifications, 5 projects with 4 images each, the admin approval flow and a
   private `certificates` storage bucket.
   Then make yourself admin: sign up on the site, and run in the SQL Editor
   `update public.profiles set is_admin = true where id = (select id from auth.users where email = 'YOUR EMAIL');`
2. Copy `.env.example` to `.env` and fill in your Supabase URL and anon key.
3. `yarn install` then `yarn start`.
4. Deploy on Vercel (`vercel.json` handles page refreshes on /technicians etc.).
   Add the same two variables in Vercel -> Settings -> Environment Variables.

## Pages
/technicians, /technicians/:id, /companies, /jobs, /login, /dashboard, /admin (admins only)

## Turning on paid registration later
`profiles.plan` and `profiles.paid_until` already exist. Set them from a payment
webhook (service role) and gate features on them.
Technicians are approved from the /admin page (Approve / Request changes).
Companies are still marked verified from the Supabase table editor.

## Google sign-in

1. Supabase Dashboard -> SQL Editor -> run `supabase/03_google_signup.sql` (once).
2. Google Cloud Console (console.cloud.google.com) -> APIs & Services -> Credentials
   -> Create Credentials -> OAuth client ID -> Web application.
   - Authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
     (Supabase Dashboard -> Authentication -> Providers -> Google shows this exact URL).
3. Supabase Dashboard -> Authentication -> Providers -> Google -> paste the Client ID
   and Client Secret from step 2, toggle it on.
4. Supabase Dashboard -> Authentication -> URL Configuration -> add your site's
   `/dashboard` URL (and `http://localhost:3000/dashboard` while developing) under
   Redirect URLs, and set Site URL to your real domain.
5. That's it — the "Continue with Google" button on /login now works. A technician,
   company or client who signs up this way is asked once, right after their first
   login, whether they're a technician / company / client, since Google doesn't
   carry that choice the way the sign-up form does.

Apple sign-in works the same way (Supabase supports it as a provider too), but
needs a paid Apple Developer account ($99/yr) and more setup on Apple's side — ask
if you want that added once you have the Apple account.

## Branded welcome email

Sent automatically on every sign-up (Google or email/password) via
`supabase/functions/welcome-email`.

1. Create a free account at resend.com (or any transactional email provider — only
   the "RESEND" block in the function needs to change if you pick another one),
   add and verify your own sending domain (e.g. `tricore.co.tz`) there so the email
   comes from `hello@tricore.co.tz` instead of a generic address, and copy the API key.
2. `supabase functions deploy welcome-email`
3. `supabase secrets set RESEND_API_KEY=your-resend-key FROM_EMAIL="Tricore Technology Solutions <hello@yourdomain.com>" WEBHOOK_SECRET=some-long-random-string APP_URL=https://yourdomain.com`
   (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are already provided automatically
   to every Edge Function — no need to set those two yourself.)
4. Supabase Dashboard -> Database -> Webhooks -> Create a new webhook:
   Table `public.profiles`, Event `Insert`, Type `HTTP Request`, URL = the function's
   URL (shown after `functions deploy`), header `x-webhook-secret: <same random string
   from step 3>`.
5. Optional: Supabase Dashboard -> Authentication -> Email Templates -> "Confirm
   signup" also controls the confirmation email people get when they sign up with
   email/password (not used for Google sign-ins, since Google already verified
   their address) — you can restyle that one with Tricore's colors too if you want
   both emails to look the same.
