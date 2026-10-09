# Carkila Supabase backend

The SQL migration in `migrations/` is a PostgreSQL/Supabase baseline derived from the Laravel migrations in `database/migrations/`.

## Apply to a Supabase project

1. Install or run the Supabase CLI.
2. Authenticate and link the project: `npx supabase login` then `npx supabase link --project-ref <project-ref>`.
3. Apply the schema: `npx supabase db push`.
4. Copy `.env.example` to `.env` and fill in the Project URL and publishable key from the Supabase Connect panel.
5. Generate precise TypeScript types after linking:
   `npx supabase gen types typescript --linked > src/types/database.generated.ts`.

## Production requirements

- Apply every migration through `20260830020000_production_hardening.sql` before releasing the matching client.
- Never put the database password or service-role key in Expo environment variables. Only the project URL, publishable key, and public app URL belong in the client build.
- Add the production web URL and `carkila://auth/callback` to Supabase Auth redirect URLs.
- Credit purchases must be confirmed by a trusted payment webhook/Edge Function. The client intentionally cannot mutate balances or payment state.
- Run `npm test`, then validate signup, email confirmation, password recovery, photo upload, publish/renew credit consumption, RLS isolation, and realtime messaging with separate buyer/vendor test accounts.

Laravel-only session, password-reset, cache, queue, failed-job, and personal-access-token tables were intentionally excluded. Supabase Auth replaces user credentials and sessions; `public.profiles` stores application profile data and references `auth.users(id)`.
