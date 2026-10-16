ServiSIS dashboard restoration patch

Purpose:
Restore the dashboard structure and visual style based on the original dpz-eims project while using the current Laravel + Inertia data models.

Files in this patch:
1. app_DashboardController.php -> replace app/Http/Controllers/DashboardController.php
2. resources/js/Pages/Dashboard.jsx -> replace the current Dashboard.jsx
3. resources/css/dashboard.css -> add this file to resources/css/dashboard.css

The Dashboard.jsx imports dashboard.css directly, so no app.css change is needed.

Before applying:
1. Make a Git checkpoint in your actual project folder:
   git add -A
   git commit -m "Checkpoint before dashboard restoration"
2. Copy the three files to the paths above. Rename app_DashboardController.php to DashboardController.php.
3. Run:
   npm run build
   php artisan view:clear
4. Restart php artisan serve and refresh with Ctrl+F5.

Important scope note:
The original dpz-eims dashboard includes employee documents. The current Laravel project ZIP does not contain document/document-type migrations, models, controllers, or routes, so this patch does not fabricate document data or pretend that feature is migrated. It uses the attendance and leave tables that are present. Document management and reports still need their data schema and feature ports to be completed separately.
