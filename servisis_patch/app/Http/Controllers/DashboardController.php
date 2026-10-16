<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $today = now('Asia/Manila')->toDateString();
        $isManager = $user->hasRole('Manager') || (($user->role ?? null) === 'Manager');

        if (!$isManager) {
            $todayAttendance = $user->attendances()->whereDate('date', $today)->first();
            $attendance = $user->attendances()->latest('date')->take(2)->get();
            $total = $user->attendances()->count();
            $present = $user->attendances()->where('status', 'Present')->count();

            return Inertia::render('Dashboard', [
                'dashboardRole' => 'Employee',
                'employeeName' => $user->employee_name ?: $user->name,
                'todayAttendance' => $todayAttendance,
                'stats' => [
                    'pendingLeaves' => $user->leaveRequests()->where('status', 'Pending')->count(),
                    'lateCount' => $user->attendances()->where('status', 'Late')->whereMonth('date', now()->month)->whereYear('date', now()->year)->count(),
                ],
                'attendanceSummary' => [
                    'present' => $present,
                    'late' => $user->attendances()->where('status', 'Late')->count(),
                    'dayOff' => $user->attendances()->where('status', 'Day Off')->count(),
                    'presentPercent' => $total ? (int) round(($present / $total) * 100) : 0,
                ],
                'recentAttendance' => $attendance,
                'recentDocuments' => [],
                'documentsAvailable' => Schema::hasTable('documents'),
            ]);
        }

        $employees = User::where(function ($q) {
            $q->where('role', 'Employee')->orWhereHas('roles', fn ($r) => $r->where('name', 'Employee'));
        });
        $employeeIds = (clone $employees)->pluck('id');
        $totalEmployees = $employeeIds->count();
        $activeEmployees = (clone $employees)->where('status', 'Active')->count();

        $todayAttendance = Attendance::whereDate('date', $today)->whereIn('user_id', $employeeIds);
        $presentToday = (clone $todayAttendance)->where('status', 'Present')->count();
        $lateToday = (clone $todayAttendance)->where('status', 'Late')->count();

        $leaveQuery = LeaveRequest::with('user')->where('status', 'Pending')->whereIn('user_id', $employeeIds);
        $pendingLeaves = (clone $leaveQuery)->count();

        $attendanceQuery = Attendance::with('user')->whereIn('user_id', $employeeIds);
        $present = (clone $attendanceQuery)->where('status', 'Present')->count();
        $late = (clone $attendanceQuery)->where('status', 'Late')->count();
        $dayOff = (clone $attendanceQuery)->where('status', 'Day Off')->count();
        $totalAttendance = $present + $late + $dayOff;

        $recentAttendance = Attendance::with('user')->whereIn('user_id', $employeeIds)->latest('date')->latest('attendance_id')->take(3)->get();
        $recentDocuments = [];
        $documentsAvailable = Schema::hasTable('documents');
        if ($documentsAvailable && Schema::hasColumn('documents', 'user_id')) {
            $recentDocuments = DB::table('documents')->leftJoin('users', 'documents.user_id', '=', 'users.id')
                ->select('documents.*', 'users.employee_name', 'users.name as user_name')
                ->orderByDesc('documents.created_at')->limit(3)->get();
        } elseif ($documentsAvailable && Schema::hasColumn('documents', 'employee_id')) {
            $recentDocuments = DB::table('documents')->leftJoin('users', 'documents.employee_id', '=', 'users.employee_id')
                ->select('documents.*', 'users.employee_name', 'users.name as user_name')
                ->orderByDesc('documents.created_at')->limit(3)->get();
        }

        $totalDocuments = is_countable($recentDocuments) ? (Schema::hasTable('documents') ? DB::table('documents')->count() : 0) : 0;

        return Inertia::render('Dashboard', [
            'dashboardRole' => 'Manager',
            'employeeName' => $user->employee_name ?: $user->name,
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'activeEmployees' => $activeEmployees,
                'presentToday' => $presentToday,
                'lateToday' => $lateToday,
                'pendingLeaves' => $pendingLeaves,
                'totalDocuments' => $totalDocuments,
            ],
            'attendanceSummary' => [
                'present' => $present,
                'late' => $late,
                'dayOff' => $dayOff,
                'presentPercent' => $totalAttendance ? (int) round(($present / $totalAttendance) * 100) : 0,
            ],
            'recentAttendance' => $recentAttendance,
            'recentLeaves' => $leaveQuery->latest('applied_at')->take(3)->get(),
            'recentDocuments' => $recentDocuments,
            'documentsAvailable' => $documentsAvailable,
        ]);
    }
}
