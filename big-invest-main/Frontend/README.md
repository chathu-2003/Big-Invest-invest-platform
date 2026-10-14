# BIG INVEST React website

React, Vite and React Router implementation of the supplied `big-invest-website_2.html`. Original CSS, text, SVG artwork, images and responsive layouts are preserved.

The protected admin workspace is available at `/admin`. See [admin setup and verification](../Backend/docs/ADMIN-DASHBOARD.md) for provisioning, private API routes, proxy requirements and screenshots. Public pages remain unchanged.

```powershell
npm install
npm run dev
npm run build
npm run preview
```

Pages: Home, About, Services, Industries, Global Network, Insights and Contact; eight service details, seven industry details and seven articles. Category, newsletter, network section and enquiry preset links are supported. Old `#/` bookmarks redirect to clean React routes. Production hosting must rewrite unknown paths to `index.html`.

The active entry is `src/main.jsx`; routing lives in `src/routes/AppRoutes.jsx`. Main pages are in `src/pages`, shared UI and forms in `src/components`, and original content in `src/data`. `src/styles/reference.css` is the unchanged prototype stylesheet. Seventeen original images are stored in `public/images/reference`. Trusted detail/map markup is isolated in `src/components/prototypeMarkup.js`.

Implemented interactions include navigation dropdowns, mobile menus, industry/category filters, insight search, world map selection, enquiry validation and presets, newsletter validation, legal dialogs, social feedback, scrolling and browser history.

Contact and newsletter forms now submit to Laravel using the existing fields and design. Original placeholder claims, social destinations and legal copy elsewhere remain for the owner to confirm. Google Fonts retains the original online dependency.

## API integration

Development uses `.env.development`: `VITE_API_BASE_URL=http://127.0.0.1:8000/api`. `.env.example` provides the same template. For deployment, set `VITE_API_BASE_URL` to the deployed API before running the production build; there is no hardcoded production fallback. Vite variables are public and must never contain credentials. Restart Vite after changing environment variables.

Start Laravel from Backend with `php artisan serve --host=127.0.0.1 --port=8000 --no-reload`, and Vite with `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`. Laravel CORS permits localhost/127.0.0.1 on port 5173; if your development port differs, add its exact origin to Backend's CORS_ALLOWED_ORIGINS and clear Laravel's config cache. Retry-After is exposed through CORS.

The native-fetch client in `src/api/client.js` sends JSON with Accept/Content-Type headers and checks both HTTP status and the success envelope. No dependency was added. Enquiry requests POST to `/enquiries` with name/email/phone/company/type/message/consent; newsletter requests POST to `/newsletter/subscribe` with email/consent. Existing client validation and enquiry URL presets remain. Successful enquiries retain a receipt for the existing confirmation panel while clearing editable values. Newsletter success and repeated subscription success clear its fields. Failures retain input.

Shared submission logic locks requests synchronously, aborts abandoned requests, maps 422 field errors, disables submitting during pending requests and 429 cooldowns, and handles server/network failures with existing notice styles. Retry-After supports seconds and HTTP dates, with a conservative 60-second fallback. No automatic retries occur. Success confirms database storage, not email delivery.

## Integration verification

```powershell
node --test scripts/test-api-client.mjs
node scripts/test-form-integration.mjs
npm run lint
npm run build
```

The integration browser script requires the local servers above, installed Windows Chrome, PHP, and the configured big_invest_db connection. It posts uniquely marked records, checks actual MySQL persistence using Backend/scripts/check-integration-records.php, and deletes only its own test rows in cleanup. Browser 422/429/500/network cases are simulated; real Laravel validation and rate limiting are additionally covered by Backend's automated tests. If running repeatedly within a minute, wait for the real backend submission rate limits to expire. Report: `.qa/form-integration.json`.

Step 4 results: five client tests passed; browser checks passed for exact enquiry payload/presets, enquiry and newsletter MySQL persistence, duplicate newsletter storage, both forms' pending duplicate prevention, 422 field errors/input retention, 429 cooldowns, 500/network failures, and 16 route cases. Frontend lint/build passed. Backend tests passed: 17 tests/93 assertions. CORS for the actual 127.0.0.1:5173 origin and exposed Retry-After was confirmed over HTTP. Test records were removed and zero remaining marked rows verified. The focused About/shared-layout comparison passed at 1896px and 1440px but reproducibly stopped at 1280px with a 17.125px original-prototype layout mismatch; see `.qa/integration-visual.json` and `.qa/integration-visual-recheck.json`. About/shared styles/components were unchanged, as verified by hashes. This does not certify full-site pixel identity, and no unrelated styling was altered to address the mismatch.

## Verification

```powershell
node scripts/verify-react.mjs --visual-only --path=/about
```

The original browser suite uses locally installed Windows Chrome. Its visual mode compares pages against the original at eight widths from 320 to 1896 pixels and saves full-page paired screenshots and a JSON report in `.qa`. Its historical interaction mode expects prototype-only form success, so use the integration script above for live forms. Both versions wait for fonts and image decoding and use a 1028px viewport height and device scale factor of 1. Animation and transitions are disabled for reproducible comparisons. `reference/AUDIT.md` records the source inventory.

For a focused visual recheck after a correction, run `node scripts/verify-react.mjs --visual-only --path=/insights`. This writes `.qa/visual-recheck.json` without replacing the full-suite report. Pixel comparisons count pixels whose largest RGB-channel difference exceeds 20; they do not prove byte-identical rendering. `scripts/inspect-pixels.mjs` locates differences between two PNG captures.

The original reference remains in `reference/big-invest-website_2.html`. To regenerate extracted content:

```powershell
node scripts/migrate-react.mjs 'C:\path\to\big-invest-website_2.html'
```
