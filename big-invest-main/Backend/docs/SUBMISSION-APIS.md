# Submission APIs — implemented 2026-10-13

Frontend files and routes are unchanged. EnquiryForm/enquiryState fields: name, email, optional phone, company, type, message, consent. URL type selects the enquiry type; topic resolves local service/industry/region content into message text, not a separate field. Submission still uses a prototype timer. Newsletter fields: email and consent; submission still validates locally without sending a request.

## Endpoints

- POST /api/enquiries returns 201: {"success":true,"message":"Your enquiry has been received.","data":{"id":1,"status":"new"}}. No public listing/detail routes exist.
- POST /api/newsletter/subscribe returns 200: {"success":true,"message":"Your newsletter subscription request has been received.","data":{"status":"subscribed"}}. Same response for new/repeated submissions; email is lowercased/trimmed. Unique index plus createOrFirst handles concurrent repeats; original consent timestamp remains unchanged.
- Invalid input: 422 with success=false, message and errors keyed by field. Each endpoint allows 5 attempts per minute per IP, including invalid attempts, independently; further requests return 429 and Retry-After. Existing JSON exception handling remains in place.

## Validation and storage

Enquiry: name/company required strings 2-255 trimmed characters; email required RFC-valid string max 254; phone nullable string max 50, permitted +/parentheses/digits/whitespace/hyphens and 7-15 digits; message required 20-1000 trimmed characters; type required and one of general, partnership, services, import-export, sourcing, logistics, investment, industry, other; consent required/accepted. Newsletter: email required/RFC-valid/max 254 and consent required/accepted. Laravel middleware trims text and converts empty strings to null. Server email validation is stricter than the frontend regex. Unvalidated fields are not persisted; status and consent timestamps are server-owned.

- enquiries: id bigint primary key; name varchar(255); email varchar(254); nullable phone varchar(50); company varchar(255); type varchar(30); message text; consented_at timestamp; indexed status varchar(20) default new; created_at/updated_at timestamps.
- newsletter_subscriptions: id bigint primary key; unique email varchar(254); consented_at timestamp; created_at/updated_at timestamps. All subscriptions are active in this initial scope; unsubscribe is not implemented.

Accepted consent is stored as a server-generated timestamp. No admin interface, email delivery or authentication module was added.

## Verification

Normal additive php artisan migrate --no-interaction applied both migrations in batch 2 in big_invest_db. Existing migrations/tables remain intact. Table columns were inspected in MySQL. No fresh/reset/refresh commands ran.

php artisan test: 17 tests passed, 93 assertions. Tests cover all enquiry types, valid/invalid data, bounds/phone, consent, protected status, response privacy, email normalization, duplicates, both rate limits/Retry-After, blocked public enquiry reads and CORS. Tests use isolated SQLite memory storage, creating only the new tables.

php scripts/verify-submissions.php: real MySQL API-kernel checks passed for 201 enquiry persistence, 422 validation, 200 newsletter persistence, normalized duplicate with one row and both 429 limits. Verification writes were rolled back; existing data retained. A process-local array cache prevents consuming production throttle limits. Auto-increment counters may advance on rolled-back probes. No credentials are printed.

route:list lists three API routes including health; migrate:status confirms both new migrations. Changed PHP files were formatted with Pint.

## React integration (implemented)

The sibling React forms now use a shared native-fetch client and VITE_API_BASE_URL. Existing UI/routes and validation are retained. They handle field errors, pending locks, rate-limit cooldowns and network/server errors; editable data is cleared only after successful responses. CORS exposes Retry-After for browser access. See Frontend/README.md for test commands/results. The following originally planned integration behavior is now in place; email delivery and unsubscribe remain future work.

Set a Vite API base URL for http://127.0.0.1:8000/api. Replace the enquiry timer with POST /enquiries using existing values, and newsletter prototype submission with POST /newsletter/subscribe using {email, consent}. Send JSON with Accept: application/json; display success after an HTTP success, map 422 errors to fields, handle network/server failures and Retry-After on 429. Keep the existing design/routes. A successful response means stored, not emailed. Add an unsubscribe flow and configure the email provider before sending campaigns.
