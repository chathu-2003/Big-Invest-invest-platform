# BIG INVEST admin dashboard

Implemented locally on 2026-10-13. The supplied attachment contained only the request text; no reference screenshot was supplied. The design follows the written requirements. No pixel-perfect comparison is claimed.

## Open the dashboard

In Backend, run `php artisan admin:create` to provision a permanent administrator. It prompts for name/email and a hidden, confirmed password of at least 12 characters with mixed case, number and symbol. No hardcoded accounts or public registration exist. Existing users default to non-admin. No permanent admin was created during development.

```powershell
# From Backend
php artisan serve --host=127.0.0.1 --port=8000 --no-reload
# From Frontend, in another terminal
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open http://127.0.0.1:5173/admin (or /admin/login) and sign in. The additive is_admin migration already ran in batch 3 on big_invest_db. Existing tables/records were retained.

## Security and deployment

Admin routes use native Laravel session authentication with the web middleware group, Laravel 13 request-forgery protection, and explicit is_admin authorization. Session IDs rotate on login; logout invalidates the session. Private responses use no-store. Login allows 5 attempts/minute/IP and normalized-email/IP; protected APIs allow 120/minute/admin; exports allow 5/minute/admin. Public submissions remain unchanged.

The browser uses same-origin /api/admin requests; Vite proxies them to 127.0.0.1:8000 during development. The client fetches a CSRF token before mutations and sends X-CSRF-TOKEN. Tokens are memory-only; no credentials/tokens are placed in localStorage. Session cookies default to HttpOnly/SameSite=Lax.

Production must serve React and /api/admin on the same HTTPS origin with a reverse proxy to Laravel's public directory. Vite proxying is development-only. Set APP_ENV=production, APP_DEBUG=false, SESSION_SECURE_COOKIE=true, SESSION_HTTP_ONLY=true, SESSION_SAME_SITE=lax and APP_URL privately in .env. Do not use the development PHP server for deployment or cache private responses/CSV exports. Separate-origin admin hosting is not configured; do not relax CORS as a workaround.

## Backend API routes

All paths below begin with /api/admin. Only csrf and login are available before authentication; csrf reveals no private data.

| Method | Path | Function |
| --- | --- | --- |
| GET | /csrf | Bootstrap session CSRF token |
| POST | /login | Rate-limited admin login |
| GET | /me | Current admin id/name/email |
| POST | /logout | Invalidate session |
| GET | /dashboard | Counts, status/type breakdown, submission timeline, attention queue, recent updates and subscriber growth |
| GET | /enquiries | Search, status/type/date/attention filters, pagination |
| GET | /enquiries/{id} | Private details |
| PATCH | /enquiries/{id} | Status only: new, in_progress, resolved, closed |
| GET | /enquiries/export | Authorized filtered CSV |
| GET | /subscribers | Email search, date filters, pagination |
| GET | /subscribers/export | Authorized filtered CSV |

Filters are validated: q max 200; from/to dates in YYYY-MM-DD with ordered bounds; known status/type; attention boolean; positive page; per_page max 50. CSV exports stream rows and escape formula-leading values. is_admin is not mass assignable. Contact Requests shares existing enquiries; no duplicate table/module exists.

## Frontend routes

Functional: /admin, /admin/queue, /admin/enquiries, /admin/contacts, /admin/subscribers, /admin/analytics, /admin/enquiry-reports, /admin/newsletter-reports, /admin/help. Enquiries have search/filter/pagination/detail/status editing; subscribers have search/pagination/dates/CSV; analytics and reports use actual MySQL aggregates/date ranges. Unknown totals show a dash while loading or unavailable, not invented values.

Explicitly Planned: /admin/schedule, /admin/services, /admin/industries, /admin/network, /admin/partners, /admin/insights, /admin/categories, /admin/media, /admin/content, /admin/users, /admin/security, /admin/settings. These contain no fake CRUD.

## Design and changed files

The design uses a 260px light sidebar, grouped icon navigation, collapse/mobile drawer, a minimal topbar with breadcrumbs/enquiry search/real notification count/profile/logout, three metric cards, horizontal charts, a real activity timeline, tables, navy/yellow accents and soft borders/shadows. All admin CSS is scoped to .bi-admin and lazy loaded. Public pages/components/styles/images/fonts were not edited. Only the route file adds a separate admin route.

Frontend added: src/admin/AdminApp.jsx, src/admin/api.js, src/admin/admin.css, scripts/test-admin.mjs. Modified: src/routes/AppRoutes.jsx, vite.config.js and README.md.

Backend added: routes/admin.php; app/Http/Controllers/Admin/AuthController.php and ManagementController.php; app/Http/Middleware/RequireAdmin.php; app/Http/Requests/AdminFilterRequest.php; app/Console/Commands/CreateAdmin.php; admin-permission migration; tests/Feature/AdminApiTest.php; scripts/admin-browser-fixture.php. Modified: User boolean cast, AppServiceProvider limiters, bootstrap admin-route registration, production secure-cookie default in config/session.php and SubmissionApiTest migration selection. Submission tests still create only their own tables in isolated memory storage.

## Verification

Frontend build passed with separate lazy-loaded admin JS/CSS. Laravel tests passed: 24 tests / 157 assertions, including authentication, permission denial, throttling, real dashboard metrics, filters, pagination, status editing, subscriber search and authorized/formula-safe exports.

Real Chrome/HTTP tests passed: login without CSRF/origin returned 419; guest metrics returned 401; cookie login worked; dashboard numbers matched MySQL; enquiry details/status updates persisted; subscriber search/export worked; date filtering worked; Planned screen, sidebar collapse, mobile navigation/no overflow, logout then /me 401, and public Home outside the admin layout were verified. No browser exceptions were recorded.

Screenshots: Frontend/.qa/admin-desktop.png (1440x1000) and admin-mobile.png (375x812). Captures use actual existing submissions after QA submissions were removed; the visible admin identity is the temporary QA account. Frontend/.qa/admin-verification.json records results. The reference screenshot remains unavailable, so these captures verify rendering rather than reference similarity.

The test script creates a randomly provisioned QA administrator and unique submissions, passes credentials via stdin, and removes only those records/account in cleanup. No permanent credentials, destructive migration commands, Git operations or deployment were performed. Run `php artisan test` in Backend; run `node Frontend/scripts/test-admin.mjs` at the project root with both servers running for browser verification.

## Remaining work

Supply the reference screenshot for comparison/refinement; provision your permanent admin account. Content CRUD, campaign sending, admin-user management, MFA, password-recovery UI and immutable audit history remain unimplemented. The activity timeline displays actual submissions and does not fabricate historical status-change events.
