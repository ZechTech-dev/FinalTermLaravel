<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $today = now('Asia/Manila')->toDateString();
        $isManager = $user->hasRole('Manager') || strtolower((string) $user->role) === 'manager';
        $employeeQuery = User::query()->where('role', 'Employee');
        $totalEmployees = (clone $employeeQuery)->count();
        $activeEmployees = (clone $employeeQuery)->where('status', 'Active')->count();
        $scope = fn ($q) => $isManager ? $q : $q->where('user_id', $user->id);
        $todayAttendance = Attendance::whereDate('date', $today);
        $presentToday = (clone $todayAttendance)->where('status', 'Present')->count();
        $lateToday = (clone $todayAttendance)->where('status', 'Late')->count();
        $pendingLeaves = $scope(LeaveRequest::where('status', 'Pending'))->count();

        $recentAttendance = $scope(Attendance::with('user'))->orderByDesc('date')->orderByDesc('time_in')->limit(5)->get()->map(fn ($a) => [
            'name' => $a->user?->employee_name ?? $a->user?->name ?? '—',
            'date' => $a->date?->format('F j, Y') ?? '—',
            'time_in' => $a->time_in ? date('h:i A', strtotime($a->time_in)) : '—',
            'time_out' => $a->time_out ? date('h:i A', strtotime($a->time_out)) : '—',
            'status' => $a->status ?? '—',
        ]);
        $summary = $scope(Attendance::query())->selectRaw("SUM(status = 'Present') as present_count, SUM(status = 'Late') as late_count, SUM(status = 'Day Off') as dayoff_count, COUNT(*) as total_count")->first();
        $presentCount = (int) ($summary->present_count ?? 0);
        $lateCount = (int) ($summary->late_count ?? 0);
        $dayOffCount = (int) ($summary->dayoff_count ?? 0);
        $totalAttendance = (int) ($summary->total_count ?? 0);

        // Documents are optional in this Laravel migration; don't query a table that doesn't exist.
        $documents = collect();
        $totalDocuments = 0;
        if (Schema::hasTable('documents')) {
            $documents = \DB::table('documents')
                ->leftJoin('users', 'documents.user_id', '=', 'users.id')
                ->orderByDesc('documents.created_at')->limit(3)
                ->get()->map(fn ($d) => [
                    'employee' => $d->employee_name ?? $d->name ?? '—',
                    'document' => $d->document_name ?? $d->file_name ?? 'Document',
                    'category' => $d->document_type_name ?? $d->category ?? '—',
                    'uploaded' => isset($d->uploaded_at) ? date('F j, Y', strtotime($d->uploaded_at)) : (isset($d->created_at) ? date('F j, Y', strtotime($d->created_at)) : '—'),
                ]);
            $totalDocuments = Schema::hasColumn('documents', 'id') ? \DB::table('documents')->count() : count($documents);
        }

        return Inertia::render('Dashboard', [
            'isManager' => $isManager,
            'name' => $user->employee_name ?: $user->name,
            'today' => now('Asia/Manila')->format('F d, Y'),
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'activeEmployees' => $activeEmployees,
                'presentToday' => $presentToday,
                'lateToday' => $lateToday,
                'pendingLeaves' => $pendingLeaves,
                'daysPresent' => $user->attendances()->whereIn('status', ['Present', 'Late'])->count(),
            ],
            'attendanceSummary' => [
                'present' => $presentCount,
                'late' => $lateCount,
                'dayOff' => $dayOffCount,
                'percent' => $totalAttendance ? (int) round($presentCount / $totalAttendance * 100) : 0,
            ],
            'recentAttendance' => $recentAttendance,
            'documents' => $documents,
            'totalDocuments' => $totalDocuments,
            'timeIn' => $user->attendances()->whereDate('date', $today)->value('time_in'),
        ]);
    }
}
