<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $today = now('Asia/Manila')->toDateString();

        if ($user->hasRole('Manager')) {
            $stats = [
                'Total Employees' => User::where('status', 'Active')->count(),
                'Present Today' => Attendance::whereDate('date', $today)->count(),
                'Pending Leave Requests' => LeaveRequest::where('status', 'Pending')->count(),
            ];
        } else {
            $stats = [
                'My Pending Leaves' => $user->leaveRequests()->where('status', 'Pending')->count(),
                'My Approved Leaves' => $user->leaveRequests()->where('status', 'Approved')->count(),
                'Days Present' => $user->attendances()->count(),
            ];
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'timeIn' => $user->attendances()->whereDate('date', $today)->value('time_in'),
        ]);
    }
}
