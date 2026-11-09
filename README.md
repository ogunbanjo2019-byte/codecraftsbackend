# CodeCraft Tech Backend

A Next.js App Router API backed by Firebase Admin SDK, Cloud Firestore, Firebase Authentication session-cookie verification, and Zod. API routes live under `app/api`; private Firebase credentials are used only on the server. Firestore client rules deny direct client access.

## Project layout

- `app/api/` — HTTP route handlers, grouped by API resource.
- `lib/firebase/` — Firebase Admin initialization and Firestore/Auth access.
- `lib/http/` — shared response, content-query, and public-form handling.
- `lib/auth/` — admin session and permission helpers.
- `lib/validation/` — Zod schemas for incoming forms.
- `lib/rate-limit/` — in-memory best-effort request throttling.
- `tests/` — automated validation tests.
- `render.yaml` — Render Web Service Blueprint.

## Local development

1. Create a Firebase project and a service account with the minimum Firestore access this API needs.
2. Copy `.env.example` to `.env.local` and set the Firebase values. Never commit `.env.local`, service-account files, or credentials. For `FIREBASE_PRIVATE_KEY`, use the full PEM private key; literal `\\n` sequences are normalized by the application.
3. Install and verify:

   ```sh
   npm ci
   npm test
   npm run build
   npm start
   ```

   For development, use `npm run dev`.
4. Deploy `firestore.rules` with the Firebase CLI when applicable.

## Deploy to Render

The included `render.yaml` creates a Node Web Service. Push this folder to a Git repository, then create a Render Blueprint from that repository and apply the Blueprint. Render runs `npm ci`, `npm test`, and `npm run build`, followed by `npm start`; Next.js listens on Render's provided `PORT`.

Set these environment variables in Render's service settings before or immediately after applying the Blueprint:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` — paste the complete service-account PEM private key; multiline PEM values and escaped `\\n` are supported.
- `FRONTEND_URL` — the frontend's origin, with no trailing slash.
- `NEXT_PUBLIC_SITE_URL` — the frontend's public origin, with no trailing slash.
- `CONTACT_NOTIFICATION_EMAIL` is optional; notifications are not currently sent by these routes.

The health check is `GET /api/services`, which queries Firestore. It will return unhealthy until Firebase credentials and Firestore permissions are configured. A successful local build does not prove live Firebase connectivity; that requires valid credentials and a deployed Firestore project.

## API routes

- `GET /api/services[/:id]`, `/api/solutions[/:id]`
- `GET /api/portfolio?page=&limit=&category=` and `/api/portfolio/:id`
- `GET /api/insights?page=&limit=&category=` and `/api/insights/:id`
- `GET /api/testimonials`, `/api/team`, `/api/careers[/:id]`
- `GET /api/settings`, `GET /api/academy-content`
- `POST /api/projects`, `/api/contact`, `/api/newsletter`

Public list/detail routes expose only published/active/visible content as configured in `lib/http/content.js`. List endpoints return `{ success: true, data: { items, pagination, categories? }, message }`. Form fields use snake_case. Project responses include `data.reference_no`; duplicate newsletter subscriptions are idempotent.

Admin APIs, sign-in/session issuance, dashboard/CRUD/audit routes, file uploads, and analytics are not implemented. In-memory rate limiting is process-local and best-effort; use a shared limiter before scaling or relying on it as an abuse-prevention boundary. Configure Firebase/Google Cloud billing and quotas separately. Rich-text sanitization is a frontend responsibility; content should be stored as safe HTML or plain text, not Markdown unless the frontend is updated.
