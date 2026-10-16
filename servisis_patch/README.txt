ServiSIS Laravel dashboard restoration patch

This patch replaces the current simplified dashboard with the original DPZ-EIMS-style Manager dashboard and a responsive Employee dashboard. It uses the current Laravel User, Attendance, and LeaveRequest models. Document records are shown only if a compatible documents table exists; no sample documents are fabricated.

FILES TO COPY INTO C:\XAMPP\htdocs\FinalTermLaravel:
1. app\Http\Controllers\DashboardController.php
2. resources\js\Pages\Dashboard.jsx
3. resources\css\dashboard.css
4. resources\css\app.css

Before copying, make a Git checkpoint:
  git add -A
  git commit -m "Checkpoint before dashboard restoration"

After copying, run in PowerShell from the project folder:
  npm run build
  php artisan view:clear
  php artisan route:list
  php artisan serve

Then open http://127.0.0.1:8000 and sign in. If npm run build reports an error, do not continue; save the full error output.

IMPORTANT NOTES:
- The current ZIP has no Document model or documents migration, so the dashboard cannot display real document rows until that feature is migrated. It shows an empty state instead of invented records.
- The app currently gates management pages with the Spatie Manager role. If all existing accounts are Admin, do not change roles blindly or run migrate:fresh. We should inspect the actual users/roles and create or promote a designated Manager account safely in the next step.
- This patch does not yet migrate the original PHP document upload/download workflow.
