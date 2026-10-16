<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $department = Department::first();

        $manager = User::firstOrCreate(
            ['employee_id' => '24-0001'],
            [
                'name' => 'System Manager',
                'employee_name' => 'System Manager',
                'email' => 'manager@example.test',
                'password' => Hash::make('password'),
                'role' => 'Manager',
                'department_id' => $department?->department_id,
                'status' => 'Active',
                'hire_date' => '2024-01-01',
                'profile_picture' => 'default-picture.jpg',
            ]
        );
        $manager->syncRoles(['Manager']);

        foreach ([
            ['24-0787', 'Alex Santos', 'alex@example.test'],
            ['24-0788', 'Jamie Reyes', 'jamie@example.test'],
            ['24-0789', 'Taylor Cruz', 'taylor@example.test'],
        ] as [$id, $name, $email]) {
            $user = User::firstOrCreate(
                ['employee_id' => $id],
                [
                    'name' => $name,
                    'employee_name' => $name,
                    'email' => $email,
                    'password' => Hash::make('password'),
                    'role' => 'Employee',
                    'department_id' => $department?->department_id,
                    'status' => 'Active',
                    'hire_date' => '2025-01-01',
                    'profile_picture' => 'default-picture.jpg',
                ]
            );
            $user->syncRoles(['Employee']);
        }
    }
}
