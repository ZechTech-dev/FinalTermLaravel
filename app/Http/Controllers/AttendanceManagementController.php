<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceManagementController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $attendance = Attendance::with('user')
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('employee_id', 'like', "%{$search}%")
                        ->orWhere('employee_name', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('date')
            ->orderBy('user_id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Attendance/Manage', [
            'attendance' => $attendance,
            'filters' => ['search' => $search],
        ]);
    }
}
