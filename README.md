# PS Wallet Ledger

PlayStation spending calculator with client-side transaction parsing and persistent cookie-consent evidence.

- Calculator transaction history stays in the browser.
- Cookie preference is stored locally.
- Consent choices are posted to `/api/consent` for persistent storage in Supabase.
- Privacy and cookie policy pages are included.

Before commercial/public launch, replace the controller/contact placeholders in the policy pages and configure Vercel environment variables `SUPABASE_URL` and `SUPABASE_SECRET_KEY`.