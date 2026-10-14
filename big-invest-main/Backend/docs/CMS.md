# BIG INVEST CMS implementation

Implemented locally on 13 October 2026, using Laravel 13.35.0 and the existing React/Vite application. Existing authentication, private enquiry management and newsletter functionality are retained. No separate admin application was created.

## Architecture audit

The live public application uses `Frontend/src/pages`, `components/common/Content.jsx`, `components/prototypeMarkup.js`, `components/network/WorldMap.jsx` and `components/layout/HeaderMarkup.jsx`. The original managed collections were in `src/data/prototype.js`; Home/About copy and section images were JSX literals. The reference HTML and older conversion files are development/reference artifacts, not competing runtime CMS sources.

The audit found eight services, seven industries, seven explicitly labelled sample articles, five article categories, eight illustrative network regions, four generic partner types, and two pages. The partner area is on `/global-network`; these are partner **types**, not verified named company relationships. No partner logos or new company facts were invented.

Services carry their existing enquiry preset, navigation description, card points, included services and benefit pairs. Industries carry short labels, group, tagline, opportunity pairs, related service slugs and regulatory notes. Insights belong to categories. Network entries retain original map coordinates, path and disclaimers. Home has 56 structured fields and About has 154, covering original text, CTA destinations and images.

The existing protected admin uses Laravel sessions, `web` middleware, CSRF, `auth`, `RequireAdmin`, and the existing rate limiters. Its sidebar already had planned CMS routes and reusable card/table/filter/notification styles. Those CMS screens now contain working managers. Schedule, Admin Users, Security and Settings remain unrelated planned screens; they were not part of this CMS request.

## Database and preservation

Migration `2026_10_13_075831_create_cms_tables.php` ran successfully against MySQL `big_invest_db` in batch 4. It adds three tables and does not alter existing application tables:

| Table | Columns / purpose |
|---|---|
| `cms_entries` | `id`, `kind`, `slug`, `title`, `summary`, `description`, `image`, `media_id`, `category_id`, `icon`, `display_order`, `status`, `seo_title`, `seo_description`, `author`, `published_at`, JSON `payload`, timestamps. Unique `(kind, slug)`; publication/order index. |
| `cms_media` | `id`, `name`, unique generated storage `path`, `mime`, `size`, `alt`, timestamps. |
| `cms_entry_media` | Composite primary key `cms_entry_id`, `cms_media_id`; tracks image URLs in structured page fields and legacy image fields. |

The nullable featured-media FK and category FK restrict deletion of referenced records. The pivot restricts referenced media deletion and cascades when its owning entry is deleted. Article categories are CMS entries of kind `categories`; module-specific properties are validated JSON payloads, not unrestricted data or HTML.

The audited import files are `database/seeders/content/initial-content.json` and `page-schema.json`. `php artisan cms:import` inserted 41 original records; repeating it inserted zero. The import is insert-only by kind/slug and does not overwrite existing CMS edits. `--only=services` supports staged imports. `--fill-navigation` is an explicit optional backfill of missing original navigation descriptions. Do not use destructive reset commands. Re-running the import after deliberately deleting an original record will reinsert that missing original; it is a setup command, not a routine synchronization job.

## Admin interface and endpoints

Sign in with an existing authorized administrator at `http://127.0.0.1:5173/admin`. Existing account provisioning remains `php artisan admin:create` (see `ADMIN-DASHBOARD.md`); no credentials or public registration were added.

Management routes are `/admin/services`, `/admin/industries`, `/admin/insights`, `/admin/categories`, `/admin/network`, `/admin/partners`, `/admin/media`, and `/admin/content` (Home/About).

For `kind` in `services`, `industries`, `insights`, `network`, `partners`, `categories`, `pages`:

| Method | Endpoint | Behavior |
|---|---|---|
| GET | `/api/admin/cms/{kind}` | Search `q`, status, sorting by `display_order`/`title`/`updated_at`, direction, page and bounded per-page size. |
| POST | `/api/admin/cms/{kind}` | Create a validated draft or published entry. |
| GET / PUT / DELETE | `/api/admin/cms/{kind}/{id}` | View, update or delete a scoped entry. UI deletion requires confirmation. |
| PATCH | `/api/admin/cms/{kind}/{id}/publication` | Publish/unpublish via `status`. |
| POST | `/api/admin/cms/{kind}/reorder` | Reorder distinct same-kind IDs; preserves relative placement of entries outside the submitted set. |
| GET | `/api/admin/cms-schema` | Allowed Home/About fields, labels, types and original defaults. |
| GET / POST | `/api/admin/media` | Search/paginate or upload multipart `file` and optional `alt`. |
| GET | `/api/admin/media/{id}/preview` | Authenticated image preview. |
| POST | `/api/admin/media/{id}/replace` | Validated multipart replacement retaining the media ID. |
| DELETE | `/api/admin/media/{id}` | Remove unused media only; references in drafts also block deletion. |

All admin routes reuse authentication, authorization, CSRF and rate limiting. Mutations return JSON `success`/`data`, validation failures use Laravel 422 errors, referenced deletes return 409, and protected responses use `no-store`. Lists, editors, media selection, Markdown preview, publication, order controls and confirmation dialogs use the existing scoped admin design.

## Public integration and security

Read-only published list/detail APIs exist at `/api/services`, `/api/industries`, `/api/insights`, `/api/global-network`, `/api/partners`, `/api/categories` and `/api/pages`, with `/{slug}` detail routes. `/api/pages/home` and `/api/pages/about` return structured content. List APIs support bounded pagination and title search; articles also support category-slug filtering. `/api/content` supplies the public React bootstrap collections. `/api/media/{id}` serves only images referenced by currently public entries.

Public resources omit admin status, timestamps, physical media paths and private submission/user information. Drafts and future-dated publication are hidden. Articles whose category is unpublished are hidden too; publish the category before expecting its articles on the website. Referenced categories cannot be deleted until articles are reassigned.

The public `ContentProvider` fetches the configured API at route navigation, window focus and every 30 seconds while visible. Published edits appear without rebuilding. Failed initial fetches show a retry state; refresh errors retain the last successful content with feedback. Managed collections and Home/About fields have no hardcoded runtime fallback. Original static process steps, layout labels, illustrative statistics, social links and map hub are retained outside the requested CMS scope. Original enquiry presets remain intact.

Server responses cache for 60 seconds under a version token changed after committed CMS mutations. Browser bootstrap requests bypass HTTP caches. Scheduled content becomes visible within the cache window and subsequent refresh. Replacement images receive a URL version derived from the new stored path. API responses use public-safe resource fields; Markdown is converted to escaped text/blocks, never raw administrator HTML. Structured page fields cannot inject HTML or scripts. URLs allow local paths and HTTP(S), with unsafe schemes, protocol-relative URLs and markup rejected.

Media accepts content-validated JPEG/PNG/WebP, at most 5 MB and 6000 by 6000 pixels. SVG/PHP and fake image content are rejected. Laravel generates filenames and uses `Storage::disk('public')` under `cms/`; user input never determines filesystem paths. Images are delivered through checked controller routes, so a storage symlink is not required. Do not expose the entire CMS storage directory through an unrestricted web-server alias if draft-media privacy is required. Maintain backups before deleting content or replacing image files.

## Local setup

From `Backend`, for another checkout:

```powershell
php ..\.tools\composer.phar install
php artisan migrate --no-interaction
php artisan cms:import --no-interaction
php artisan serve --host=127.0.0.1 --port=8000
```

Existing private `.env` database settings remain in place. The frontend uses the existing `VITE_API_BASE_URL=http://127.0.0.1:8000/api`; no production URL or credentials were hardcoded. Vite proxies same-origin `/api/admin` requests to Laravel for cookie/CSRF authentication. Deployments need equivalent same-origin routing and SPA fallback, plus writable Laravel storage/cache directories. Retain allowed development origins in the existing CORS configuration.

The installed PHP default upload cap is 2 MB, below the CMS's 5 MB validation limit. Set `upload_max_filesize` to at least 5M and `post_max_size` higher, or use this temporary development server command from `Backend/public` instead of starting another server on the same port:

```powershell
php -d upload_max_filesize=6M -d post_max_size=8M -S 127.0.0.1:8000 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
```

From `Frontend`, use `npm run dev -- --host 127.0.0.1` and `npm run build`. Laravel Boost was installed as a development dependency as required by the existing project instructions; Composer metadata and generated backend guidance were updated. It is not required in production.

## Files

New backend files: `app/Models/{CmsEntry,CmsMedia}.php`; `app/Http/Controllers/Admin/{CmsController,MediaController}.php`; `app/Http/Controllers/Api/ContentController.php`; `app/Http/Requests/CmsEntryRequest.php`; `app/Http/Resources/CmsEntryResource.php`; `app/Console/Commands/ImportWebsiteContent.php`; `database/factories/{CmsEntryFactory,CmsMediaFactory}.php`; the CMS migration; `database/seeders/content/{initial-content,page-schema}.json`; `tests/Feature/CmsApiTest.php`; this document and generated `boost.json` configuration.

Modified backend files: `routes/admin.php`, `routes/api.php`, `scripts/admin-browser-fixture.php`, `composer.json`, `composer.lock`, `AGENTS.md`, `CLAUDE.md`.

New frontend files: `src/admin/CmsManager.jsx`, `src/cms/{ContentProvider.jsx,markdown.js}`, `scripts/test-cms.mjs`.

Modified frontend files: `src/admin/{AdminApp.jsx,api.js,admin.css}`, `src/layouts/MainLayout.jsx`, `src/components/common/{Content.jsx,ScrollBehavior.jsx}`, `src/components/layout/HeaderMarkup.jsx`, `src/components/network/WorldMap.jsx`, `src/components/prototypeMarkup.js`, `src/pages/{Home,About,Industries,Insights,GlobalNetwork,ServiceDetail,IndustryDetail,ArticleDetail}.jsx`, `scripts/test-admin.mjs`. Existing public routes, public stylesheets, contact form and newsletter form were not redesigned or replaced.

## Verification

`php artisan test --compact`: 34 tests passed, 352 assertions. CMS tests use isolated SQLite in memory and fake storage; the suite includes the existing enquiries/newsletter and admin tests. Coverage includes CRUD, authorization, validation, publication/category/future-date filtering, safe URLs, unique slugs, ordering/pagination, import preservation, media upload/replace/delete/reference protection and structured pages. Explicit changed-file Pint formatting passed; `--dirty` is unavailable because this workspace is not a Git repository.

`npm run build`: passed. Existing API-client tests: five passed. Real browser verification passed all 21 CMS check groups: Services/Industries/Insights create-publish-edit-unpublish-delete, safe article rendering, original public pages/disclaimers, all Home/About structured fields, media upload/preview/selection/replacement and confirmed deletion. Existing admin regression passed all 21 routes, login/logout, protected access, live MySQL metrics, enquiry updates, exports, date filtering and six responsive widths. Existing public form regression passed real enquiry/newsletter persistence, repeated subscriptions, pending-request locks, 422, 429 cooldown, 500, network failures and 16 public route patterns. Final browser reports are in `Frontend/.qa`. Temporary browser administrators, submissions, CMS entries and uploaded test images are scoped to each run and removed in `finally`; existing records are not reset.

Services reference comparison: exact text at all five audited widths, with no overflow, broken images or console errors; pixel-identical at 1640px and 1920px. At 1440px, the strict historical HTML comparison found 0.33% pixel difference confined to the pre-existing header overrides in the unchanged public stylesheet. This is not reported as an all-width pixel-perfect pass, and those existing styles were preserved. At 1024px and 375px the historical reference has different page dimensions/layout measurements; the audit records these rather than asserting pixel equality. Hash comparison confirms the public stylesheet and route file were unchanged.

All requested CMS modules are implemented. No required CMS module remains a planned placeholder. Deployment and final editorial approval of the imported prototype/sample content are outside this local implementation.

Final supplementary browser check: eight checks passed with no console errors, including publishing a temporary network region with selected media and an edited disclaimer, viewing both publicly, then removing the region and unused media. `cms-verification.json`, `cms-network-verification.json`, `admin-verification.json`, the existing form-integration report and `cms-services-audit.json` under `Frontend/.qa` record the browser results. The final production build passed after this integration.
