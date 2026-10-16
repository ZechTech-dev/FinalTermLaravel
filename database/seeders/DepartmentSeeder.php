<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Administration', 'Health Services', 'Records', 'Finance', 'Maintenance'] as $name) {
            Department::firstOrCreate(['department_name' => $name]);
        }
    }
}
