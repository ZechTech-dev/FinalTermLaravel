<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Inertia\Inertia;

class AttendanceManagementController extends Controller
{
    public function index()
    {
        return Inertia::render('Attendance/Manage', [
            'attendance' => Attendance::with('user')->latest('date')->paginate(20),
        ]);
    }
}
