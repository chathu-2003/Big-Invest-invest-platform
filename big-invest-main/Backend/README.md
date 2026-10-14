# BIG INVEST API

Laravel 13.35.0 API. The sibling React frontend is unchanged. Health, enquiry submissions and newsletter subscriptions are implemented. See [submission APIs](docs/SUBMISSION-APIS.md) for current schemas, routes and validation results. Initial setup documents below retain historical context; MySQL connectivity to big_invest_db is now verified and both submission migrations have run.

## Structure

- app/Http/Controllers/Api/HealthController.php: JSON liveness response
- bootstrap/app.php: API routing and JSON exception handling
- config/cors.php: environment-driven React origins
- config/database.php: MySQL configuration, credentials from environment
- routes/api.php: GET /api/health
- database/migrations: stock Laravel migrations, not executed
- tests/Feature/ApiSetupTest.php: health, errors, validation and CORS checks
- scripts/check-database.php: credential-safe real PDO connection probe
- docs/FRONTEND-AUDIT.md: source-based routes, forms and content audit
- docs/ARCHITECTURE.md: incremental module/table/API proposal
- docs/VERIFICATION.md: observed validation results

## Local setup (PowerShell, from Backend)

PHP 8.3.33 and its extensions are installed. Composer was absent from PATH; a verified Composer 2.10.3 PHAR was installed locally at ../.tools/composer.phar without changing PHP, PATH or system configuration. Keep that ignored local tool, or install Composer from https://getcomposer.org/download/ selecting the existing PHP executable and then use `composer` in place of `php ../.tools/composer.phar`.

```powershell
php ../.tools/composer.phar install
# Only if .env does not already exist:
Copy-Item .env.example .env
php artisan key:generate
```

Edit .env with the provisioned MySQL database name, username and password. Current `big_invest` database/user names are placeholders; no database or user has been created. Do not commit .env. CORS_ALLOWED_ORIGINS lists exact origins, separated by commas; update it if Vite selects a different port. Credentials are disabled because no authenticated SPA flow exists.

```powershell
php artisan config:clear
php scripts/check-database.php
php artisan route:list --path=api
php artisan test
php artisan serve --host=127.0.0.1 --port=8000 --no-reload
```

GET http://127.0.0.1:8000/api/health returns:

```json
{"success":true,"message":"API is healthy.","data":{"status":"ok"}}
```

Health does not probe MySQL. APP_DEBUG defaults to false. Errors use success/message/errors and preserve validation field errors while hiding internal server details. Public submissions persist in MySQL; email delivery and content APIs are not implemented. MAIL_MAILER=log remains scaffolding only.

Do not run the stock Composer `setup` script for this API: it runs migrations and installs/builds Laravel frontend assets. Use the explicit commands above. Execute migrations only after database access is established and the next persistence module is implemented. No frontend build is required for this backend.
