<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        foreach (User::where('role', 'Employee')->get() as $user) {
            Attendance::firstOrCreate(
                ['user_id' => $user->id, 'date' => now('Asia/Manila')->subDay()->toDateString()],
                [
                    'time_in' => '08:00:00',
                    'break_in' => '12:00:00',
                    'break_out' => '13:00:00',
                    'time_out' => '17:00:00',
                    'late_minutes' => 0,
                    'status' => 'Present',
                    'break_hours' => 1,
                    'total_hours' => 8,
                    'overtime_hours' => 0,
                ]
            );
        }
    }
}
