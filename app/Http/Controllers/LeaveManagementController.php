<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LeaveManagementController extends Controller
{
    public function index()
    {
        return Inertia::render('Leave/Manage', [
            'requests' => LeaveRequest::with(['user', 'approver'])->latest('applied_at')->paginate(15),
        ]);
    }

    public function update(Request $request, LeaveRequest $leaveRequest)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['Approved', 'Rejected'])],
            'decision_reason' => ['nullable', 'string', 'max:2000', Rule::requiredIf($request->input('status') === 'Rejected')],
        ]);

        abort_if($leaveRequest->status !== 'Pending', 422, 'Only pending requests can be decided.');

        $leaveRequest->update([
            'status' => $data['status'],
            'decision_reason' => $data['decision_reason'] ?? null,
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Leave request updated.');
    }
}
