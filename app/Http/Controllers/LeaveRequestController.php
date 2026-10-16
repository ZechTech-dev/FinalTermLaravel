<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    public function index(Request $request)
    {
        $requests = auth()->user()->leaveRequests()
            ->when($request->status && $request->status !== 'All Status', fn ($q) => $q->where('status', $request->status))
            ->when($request->year, fn ($q) => $q->whereYear('applied_at', $request->year))
            ->latest('applied_at')->paginate(15)->withQueryString();

        return Inertia::render('Leave/Index', [
            'requests' => $requests,
            'filters' => $request->only('status', 'year'),
            'stats' => [
                'total' => auth()->user()->leaveRequests()->count(),
                'pending' => auth()->user()->leaveRequests()->where('status', 'Pending')->count(),
                'approved' => auth()->user()->leaveRequests()->where('status', 'Approved')->count(),
                'rejected' => auth()->user()->leaveRequests()->where('status', 'Rejected')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'leave_type' => ['required', 'string', 'max:100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string', 'max:2000'],
        ]);

        $data['user_id'] = auth()->id();
        LeaveRequest::create($data);

        return back()->with('success', 'Leave request submitted.');
    }
}
