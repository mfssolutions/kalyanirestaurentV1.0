# Supabase Auth Configuration — Kalyani Kitchen

Apply these settings in the Supabase Dashboard for production OTP authentication.

## Authentication → Providers → Email

| Setting | Value |
|---------|-------|
| Enable Email provider | **ON** |
| Confirm email | **ON** (required for signup OTP) |
| Secure email change | **ON** |
| Double confirm email changes | Optional |

## Authentication → Email Templates

Replace magic-link URLs with OTP tokens in **all** templates used by this app.

### Confirm signup (required for registration)

```html
<h2>Verify your Kalyani Kitchen account</h2>
<p>Your verification code is:</p>
<p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">{{ .Token }}</p>
<p>This code expires in 10 minutes. Do not share it with anyone.</p>
```

### Magic Link (used for password-reset OTP via signInWithOtp)

```html
<h2>Reset your Kalyani Kitchen password</h2>
<p>Your verification code is:</p>
<p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">{{ .Token }}</p>
<p>This code expires in 10 minutes. Do not share it with anyone.</p>
```

**Do NOT include** `{{ .ConfirmationURL }}` in these templates.

## Authentication → Rate Limits

| Setting | Recommended value |
|---------|---------------------|
| Email OTP expiration | **600 seconds** (10 minutes) |
| OTP request interval | **60 seconds** |

These align with application constants and the `auth_otp_guards` table.

## Authentication → URL Configuration

Add your production and development URLs to **Redirect URLs** (required even without magic links):

- `http://localhost:3000/**`
- `https://your-amplify-domain.amplifyapp.com/**`

## SMTP (Resend)

Already configured per project requirements. Verify in **Project Settings → Authentication → SMTP Settings**:

- Sender email matches your Resend verified domain
- SMTP host: `smtp.resend.com`
- Port: `465` or `587`

## Creating ADMIN / RIDER accounts (backend only)

Never create ADMIN or RIDER from the frontend. Use Supabase Dashboard or service-role script:

```sql
-- Example: create rider via Admin API, then set role in app_metadata before trigger fires
-- OR update existing user after manual auth.users creation:
UPDATE public.users SET role = 'RIDER', vehicle = 'KA-01-AB-1234'
WHERE email = 'rider@example.com';
```

The `handle_new_user` trigger assigns `USER` by default. Only `raw_app_meta_data.role` of `ADMIN` or `RIDER` (set via service role) overrides this.

## Database migration

Run the SQL in:

```
supabase/migrations/20250613000000_auth_otp_system.sql
```

via Supabase SQL Editor or `supabase db push`.

## Security checklist

- [ ] Email templates use `{{ .Token }}` only (no magic links)
- [ ] Confirm email enabled
- [ ] OTP expiration = 600s
- [ ] Migration applied (OTP guards + triggers + RLS)
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in Amplify env vars
- [ ] ADMIN/RIDER accounts created only via backend
