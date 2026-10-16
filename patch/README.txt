ServiSIS Employee Management + Attendance spacing/profile fix

Files to copy into the Laravel project, preserving these paths:
- resources/js/Pages/Employees/Index.jsx
- resources/css/employee-list.css
- resources/js/Pages/Attendance/Manage.jsx
- resources/css/attendance-management.css
- app/Http/Controllers/EmployeeController.php

Before copying, make a backup or Git commit.

After copying, from the project root run:
  npm run build
  php artisan storage:link

The storage:link command is normally needed only once. It makes uploaded public-disk images accessible at /storage/....
Then start/restart the local server if needed:
  php artisan serve

Test employee create with a JPG/PNG profile picture, verify it appears in the employee table, then edit the employee with another picture and verify it persists after refresh. Test employee fields and search. Test Attendance List spacing, search, pagination, and empty results.

Do not overwrite routes, migrations, models, AppLayout, or package.json with this patch.
