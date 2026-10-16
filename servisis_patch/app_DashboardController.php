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
        $isManager = $user->role === 'Manager' || $user->hasRole('Manager');

        $todayAttendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)->first();

        $recentAttendanceQuery = Attendance::with('user')
            ->when(!$isManager, fn ($query) => $query->where('user_id', $user->id))
            ->orderByDesc('date')->orderByDesc('attendance_id')->limit(5);

        $attendanceSummaryQuery = Attendance::query()
            ->when(!$isManager, fn ($query) => $query->where('user_id', $user->id));

        $attendanceSummary = (clone $attendanceSummaryQuery)
            ->selectRaw("COUNT(*) as total, SUM(status = 'Present') as present, SUM(status = 'Late') as late, SUM(status = 'Day Off') as day_off")
            ->first();

        $recentLeaves = LeaveRequest::with('user')
            ->when(!$isManager, fn ($query) => $query->where('user_id', $user->id))
            ->latest('applied_at')->limit(5)->get();

        if ($isManager) {
            $stats = [
                ['label' => 'Total Employees', 'value' => User::where('role', 'Employee')->count(), 'icon' => 'bi-people-fill', 'tone' => 'blue'],
                ['label' => 'Present Today', 'value' => Attendance::whereDate('date', $today)->where('status', 'Present')->whereHas('user', fn ($q) => $q->where('role', 'Employee'))->count(), 'icon' => 'bi-person-check-fill', 'tone' => 'green'],
                ['label' => 'Late Today', 'value' => Attendance::whereDate('date', $today)->where('status', 'Late')->whereHas('user', fn ($q) => $q->where('role', 'Employee'))->count(), 'icon' => 'bi-clock-history', 'tone' => 'orange'],
                ['label' => 'Pending Leaves', 'value' => LeaveRequest::where('status', 'Pending')->whereHas('user', fn ($q) => $q->where('role', 'Employee'))->count(), 'icon' => 'bi-calendar2-check', 'tone' => 'purple'],
            ];
        } else {
            $stats = [
                ['label' => 'Days Present', 'value' => (clone $attendanceSummaryQuery)->where('status', 'Present')->count(), 'icon' => 'bi-calendar-check', 'tone' => 'blue'],
                ['label' => 'Late This Month', 'value' => Attendance::where('user_id', $user->id)->where('status', 'Late')->whereMonth('date', now('Asia/Manila')->month)->whereYear('date', now('Asia/Manila')->year)->count(), 'icon' => 'bi-clock-history', 'tone' => 'orange'],
                ['label' => 'Pending Leaves', 'value' => LeaveRequest::where('user_id', $user->id)->where('status', 'Pending')->count(), 'icon' => 'bi-calendar2-check', 'tone' => 'purple'],
                ['label' => 'Approved Leaves', 'value' => LeaveRequest::where('user_id', $user->id)->where('status', 'Approved')->count(), 'icon' => 'bi-check-circle', 'tone' => 'green'],
            ];
        }

        return Inertia::render('Dashboard', [
            'isManager' => $isManager,
            'stats' => $stats,
            'today' => now('Asia/Manila')->format('F d, Y'),
            'todayAttendance' => $todayAttendance,
            'recentAttendance' => $recentAttendanceQuery->get(),
            'recentLeaves' => $recentLeaves,
            'attendanceSummary' => [
                'total' => (int) ($attendanceSummary->total ?? 0),
                'present' => (int) ($attendanceSummary->present ?? 0),
                'late' => (int) ($attendanceSummary->late ?? 0),
                'dayOff' => (int) ($attendanceSummary->day_off ?? 0),
            ],
        ]);
    }
}
