<?php

namespace Database\Seeders;

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class LeaveRequestSeeder extends Seeder
{
    public function run(): void
    {
        $employee = User::where('role', 'Employee')->first();
        if (!$employee) {
            return;
        }

        LeaveRequest::firstOrCreate(
            ['user_id' => $employee->id, 'leave_type' => 'Personal Leave', 'start_date' => now()->addDays(7)->toDateString()],
            [
                'end_date' => now()->addDays(7)->toDateString(),
                'reason' => 'Personal appointment',
                'status' => 'Pending',
            ]
        );
    }
}
