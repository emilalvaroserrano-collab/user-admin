# Manage Tech Services — Admin Portal

Next.js 16 / React 19 / shadcn Base UI. Derived from the supplied Studio Admin template (MIT license retained). Zendesk is the single source of truth; no separate business database, Resend, or mock records.

## Local development

Use Node.js 22.x (current patch) and npm. Run:

    npm ci
    cp .env.example .env.local
    openssl rand -hex 32
    npm run dev

Set the session secret and Zendesk OAuth secret in .env.local. Open http://localhost:3000. Register http://localhost:3000/api/zendesk/oauth/callback in the existing confidential Zendesk OAuth client.

Optionally set ZENDESK_AUTH_MODE=client_credentials in .env.local to use the local Connect button. This requires the Zendesk client credentials grant to succeed for an active administrator. The dev server binds 127.0.0.1. Never expose this mode through a tunnel or LAN. It is disabled outside development and on Vercel. On expiry reconnect; there is no automatic refresh-token persistence.

Set ZENDESK_OWNER_EMAIL privately in .env.local if the local client_credentials session must match a specific administrator. When configured, the portal compares it to the email returned by Zendesk users/me, in addition to checking the active admin role. This does not change production OAuth or implement API-token authentication.

## Vercel

1. Import this repository via https://vercel.com/new.
2. Select Next.js, root directory '.', Node.js 22.x. The committed vercel.json specifies HUSKY=0 npm ci (skip Git hooks on Vercel) and npm run build.
3. In project Settings > Environment Variables configure the following for Production (and separately for an authorized Preview if required).

| Variable | Value |
| --- | --- |
| ZENDESK_SUBDOMAIN | managetechservices-16737 |
| ZENDESK_OWNER_EMAIL | Optional expected local administrator email; not needed for production OAuth |
| ZENDESK_CLIENT_ID | managetech |
| ZENDESK_CLIENT_SECRET | Rotated confidential OAuth secret; sensitive |
| ZENDESK_SCOPE | read write |
| APP_ORIGIN | Exact HTTPS domain assigned to this deployment, no trailing slash |
| SESSION_SECRET | Fresh 64-character hex string (openssl rand -hex 32); sensitive |
| ZENDESK_AUTH_MODE | authorization_code |
| ZENDESK_ORDER_OBJECT_KEY | Verified custom object key, optional |
| ZENDESK_PRODUCT_OBJECT_KEY | Verified custom object key, optional |

Use a different SESSION_SECRET for each environment. Do not put actual secrets in Git or NEXT_PUBLIC_ variables. Configure the exact APP_ORIGIN + /api/zendesk/oauth/callback in Zendesk Admin Center > Apps and integrations > APIs > OAuth clients > managetech. Keep the localhost URI if needed. Use a stable preview alias and separate settings if testing OAuth in Preview.

Production requires an individual Zendesk staff account. Use ZENDESK_AUTH_MODE=authorization_code. Set APP_ORIGIN to the exact stable deployment origin; OAuth started from a different Vercel domain redirects to that origin before creating the state cookie. Rotate previously shared secrets before deployment. If Zendesk shows end-user login, sign into the native Agent Workspace first. The portal validates users/me, rejects suspended or end-user identities, and stores the encrypted session in a Secure HTTP-only cookie. No shared administrator token is enabled in production. Sessions expire based on Zendesk token expiry (maximum eight hours); sign in again when required.

## Implemented modules

Responsive dashboard shell, themes and layout controls; indexed ticket counts; ticket list, detail, first page of comments, status changes and replies/internal notes with optimistic concurrency protection; read-only customers, organizations, views, staff, groups, fields, forms and triggers; custom object discovery and configurable order/product lists; manual refresh and 30-second polling. Native Zendesk role permissions apply. No inbound webhook testing, full CRUD for all resources, or guaranteed metadata parity yet. Use native Zendesk triggers for email.

## Validation

Run npm run typecheck, npm run lint and npm run build with network access. The source import and Vercel configuration are prepared, but package installation and a full build were blocked in the preparation environment by DNS failure; live OAuth, browser and CRUD tests remain pending. Test writes only with designated test records.

## References

- https://developer.zendesk.com/api-reference/
- https://developer.zendesk.com/documentation/authentication/api-tokens-to-oauth/
- https://vercel.com/docs/frameworks/full-stack/nextjs
