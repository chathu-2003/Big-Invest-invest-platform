# Proposed architecture (not implemented)

Historical initial proposal. Enquiry and newsletter persistence are now implemented; see SUBMISSION-APIS.md for the actual contract (newsletter uses /api/newsletter/subscribe). Optional content modules below remain proposals.

## First persistence modules

| Table / model | Proposed columns | HTTP layer |
| --- | --- | --- |
| enquiries / Enquiry | id, name, email, nullable phone, company, type, message, consented_at, timestamps | POST /api/enquiries; EnquiryController::store; StoreEnquiryRequest; EnquiryResource returning only an acknowledgement/id |
| newsletter_subscriptions / NewsletterSubscription | id, unique email, consented_at, nullable unsubscribed_at, timestamps | POST /api/newsletter-subscriptions; NewsletterSubscriptionController::store; StoreNewsletterSubscriptionRequest; acknowledgement resource |

Enquiry validation should trim text, enforce the nine actual type values, mirror existing field rules, and add documented maximum lengths for names/company/email/phone. Consent must be accepted, not merely present. Return 201 after successful enquiry persistence; validation errors use 422 with field messages. Do not expose public enquiry listing/detail endpoints. Add rate limits to both public write routes. Keep duplicate subscription responses neutral; define re-subscription and unsubscribe behavior before newsletter delivery. No topic foreign key is necessary for the current payload, which only carries the message preset.

Use EnquiryService only when persistence plus notification orchestration warrants it, and NewsletterSubscriptionService for idempotent subscription handling. Configure notification recipients/provider using environment variables; success means persisted, not confirmed email delivery. Add queued mail/jobs and their migrations when delivery is implemented. Do not send mail using the scaffold's example sender.

## Optional content storage when dynamic publishing is needed

| Tables / models | Shape and relationships | Proposed read routes / controllers |
| --- | --- | --- |
| services / Service | unique slug preserving current id, title, icon, image key/path, enquiry_type, summary, overview; JSON points/included/outcomes; sort_order | GET /api/services and /api/services/{slug}; ServiceController index/show; ServiceResource |
| industry_groups / IndustryGroup; industries / Industry; industry_service pivot | group slug/label; industry slug/title/short/tagline/icon/image/overview/note and JSON opportunities; many-to-many services | GET /api/industries and /api/industries/{slug}; IndustryController; IndustryResource |
| article_categories / ArticleCategory; articles / Article | category slug/label; article slug/title/excerpt/body/image/read time and category FK; explicit featured order | GET /api/articles?category=&q= and /api/articles/{slug}; ArticleController; ArticleResource; ArticleIndexRequest for bounded filters/pagination |
| network_regions / NetworkRegion | slug/name/description; JSON items; SVG x/y/path display metadata and sort order | GET /api/network-regions; NetworkRegionController; NetworkRegionResource |

Create one migration per entity plus the pivot if this content moves to MySQL. Preserve frontend slugs and distinguish synthetic all filters from real category/group rows. Inspect and safely render/sanitize the article body format before importing rich content. Store images as paths/keys; do not introduce a media library without an upload requirement. Keep static hub coordinates, process steps, marketing statistics and placeholder site information in frontend/config until editing requirements exist. Do not seed illustrative network data as verified offices or confirmed partners.

## Authentication

No login, user dashboard, admin UI or authenticated frontend API call was found. Public read endpoints and public validated/rate-limited submission endpoints need no login. Do not implement authentication now. If an admin content/enquiry workflow is later approved, use Laravel Sanctum with authorization policies; for a first-party SPA use cookie sessions/CSRF and explicitly configured credentialed origins. Revisit CORS at that point. Laravel's stock User model and users/cache/jobs migrations remain unexecuted scaffold files, not implemented business modules.

## Response contract

Success: {"success":true,"message":"...","data":{...}}; collections may add meta/links for pagination. Errors: {"success":false,"message":"...","errors":{"field":["..."]}}. API errors render JSON even without an Accept header; server errors expose a generic message while Laravel retains logging. Use 200 for reads, 201 for new submissions, 422 for validation, 404 for missing resources and 429 for rate limiting. Health is liveness only and does not claim database readiness.
