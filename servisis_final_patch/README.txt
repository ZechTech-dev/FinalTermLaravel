SERVISIS TARGETED FIX PATCH

BACK UP your current project before replacing files.
Copy the five files in this patch into the same relative paths inside:
C:\XAMPP\htdocs\FinalTermLaravel

This patch includes:
- Employee list header styled as the navy feature banner used by Attendance List.
- Employee edit/add submission keeps multipart uploads and shows validation errors in the modal.
- Hire date is normalized to YYYY-MM-DD before submission.
- Employee controller saves uploaded pictures to Laravel's public disk and removes the replaced picture on edit.
- Attendance list banner has a visible 18px gap before the table.

Then run from the project directory:
  php artisan storage:link
  npm run build
  php artisan serve

If storage:link reports the link already exists, that is okay.
Test editing an employee with no new picture first, then test uploading a JPG/PNG under 5 MB.
The uploaded picture URL requires public/storage to link to storage/app/public. If saving still fails, read the validation error shown inside the edit modal; do not silently ignore it.
