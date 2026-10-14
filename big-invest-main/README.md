# BIG INVEST

BIG INVEST is a React website with a Laravel REST API and a protected administration workspace. It includes contact enquiries, newsletter subscriptions, reporting, and a database-backed content management system. Published CMS changes appear on the public website without a new frontend build.

## Technology stack

- React 19, React Router, Vite 8, native fetch and Axios
- Laravel 13, PHP 8.3+, Composer 2
- MySQL 8+
- Session authentication, CSRF protection and administrator authorization
- PHPUnit feature tests and browser verification scripts

## Project structure

```text
big-invest/
├── Frontend/              React application, public assets and browser tests
├── Backend/               Laravel API, migrations, tests and documentation
├── README.md
└── .gitignore
```

## Prerequisites

Install PHP 8.3 or newer with Laravel's required extensions, including PDO MySQL, mbstring, OpenSSL, XML, ctype, fileinfo and tokenizer. PDO SQLite is also required for the isolated test suite. Install Composer 2, Node.js 22.12 or newer, npm, and MySQL 8 or newer.

Chrome on Windows is required for the included browser verification scripts. Their paths and local port assumptions are documented in the scripts; they are optional for normal application startup.

## Backend installation

From the repository root:

```powershell
cd Backend
composer install
Copy-Item .env.example .env
php artisan key:generate
```

On macOS/Linux, use `cp .env.example .env`. Copy an example only during first-time setup; preserve an existing private `.env`.

Create the database using an authorized MySQL account:

```sql
CREATE DATABASE big_invest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update `Backend/.env` with your own local connection settings. The following is an example with placeholders:

```dotenv
APP_ENV=local
APP_DEBUG=false
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=big_invest_db
DB_USERNAME=your_mysql_user
DB_PASSWORD=
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Set `DB_PASSWORD` privately as needed. `php artisan key:generate` supplies the private application key. Never commit `.env`, application keys, credentials, uploads, or database dumps.

Run the non-destructive migrations and initial content import:

```powershell
php artisan migrate --no-interaction
php artisan cms:import --no-interaction
php artisan admin:create
php artisan serve --host=127.0.0.1 --port=8000
```

`admin:create` prompts for account details and a password without putting them in source code. There is no default administrator password or public admin registration. The content import inserts missing original records by kind and slug; it does not overwrite existing edits. Run it for initial setup, not as routine synchronization: deliberately deleted original entries would be reinserted.

The CMS validates images up to 5 MB. PHP's `upload_max_filesize` must be at least 5M and `post_max_size` must be higher. For a temporary development server with suitable limits, run the following from `Backend/public` instead of starting another server on port 8000:

```powershell
php -d upload_max_filesize=6M -d post_max_size=8M -S 127.0.0.1:8000 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
```

Laravel storage and bootstrap cache directories must be writable. Media is served through controlled API routes; the CMS does not require a public storage symlink.

## Frontend installation

In a second terminal, from the repository root:

```powershell
cd Frontend
npm ci
Copy-Item .env.example .env
npm run dev -- --host 127.0.0.1
```

The example contains the local public API setting:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Open `http://127.0.0.1:5173` for the website and `/admin` for administration. Vite proxies `/api/admin` to Laravel so the existing session and CSRF authentication use the same browser origin. Keep the Vite port at 5173 for the provided integration tests. Configure the public API URL, allowed origins and equivalent same-origin admin routing for another environment; no production endpoint is embedded in this repository.

Build the frontend with:

```powershell
npm run build
```

## CMS and APIs

The dashboard manages Services, Industries, Insights/Articles, Categories, Global Network, Partners, Media, and structured Home/About content. Entries support drafts, publication, search, sorting, pagination, ordering, SEO fields and confirmed deletion. Articles use a safe Markdown editor; arbitrary administrator HTML is not executed. Images use content/type/size validation and generated storage names. Referenced images and categories cannot be deleted while in use.

Protected CRUD endpoints live under `/api/admin/cms/{kind}` and media management under `/api/admin/media`. Public read-only APIs include `/api/services`, `/api/industries`, `/api/insights`, `/api/global-network`, `/api/partners`, `/api/categories`, `/api/pages/{slug}` and `/api/content`. Enquiry and newsletter submissions use `POST /api/enquiries` and `POST /api/newsletter/subscribe`.

Public pages refresh content on navigation, focus and every 30 seconds while visible. Server caching is invalidated after committed CMS changes. The initial content preserves the existing prototype's sample-article labels, illustrative network disclaimers and generic partner types; it does not assert new company relationships.

Schedule, Admin Users, Security and Settings remain explicitly planned screens outside the implemented CMS scope.

## Testing

Backend, from `Backend`:

```powershell
php artisan test --compact
php artisan route:list --path=api --except-vendor
```

The PHPUnit configuration uses SQLite in memory, fake media storage and isolated test data. Do not point automated feature tests at a shared MySQL database.

Frontend, from `Frontend`:

```powershell
node scripts/test-api-client.mjs
npm run build
```

With Laravel on port 8000, Vite on port 5173, and Chrome available, optional real-browser checks are:

```powershell
node scripts/test-admin.mjs
node scripts/test-cms.mjs
node scripts/test-form-integration.mjs
```

These browser scripts use the local `big_invest_db`, create identifiable temporary test records and clean up their own records. Run them only against a dedicated local development database. QA reports and screenshots are excluded from Git.

## Documentation

- [Architecture](Backend/docs/ARCHITECTURE.md)
- [Submission APIs](Backend/docs/SUBMISSION-APIS.md)
- [Admin dashboard](Backend/docs/ADMIN-DASHBOARD.md)
- [CMS architecture, endpoints, setup and verification](Backend/docs/CMS.md)
- [Frontend audit](Backend/docs/FRONTEND-AUDIT.md)

Dependencies, generated builds, runtime caches, private configuration and uploaded data are intentionally excluded from the repository. Install dependencies and configure each environment separately. Uploading this repository does not deploy the application.
