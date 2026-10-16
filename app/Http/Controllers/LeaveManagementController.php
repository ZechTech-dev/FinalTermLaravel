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
            'requests' => LeaveRequest::with(['user', 'approver'])->latest('applied_at')->paginate(15)->withQueryString(),
        ]);
    }

    public function update(Request $request, LeaveRequest $leaveRequest)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['Approved', 'Rejected'])],
            'decision_reason' => ['nullable', 'string', 'max:2000', Rule::requiredIf($request->input('status') === 'Rejected')],
        ]);

        if ($leaveRequest->status === $data['status']) {
            return back()->with('error', 'This request is already ' . strtolower($data['status']) . '.');
        }

        $leaveRequest->update([
            'status' => $data['status'],
            'decision_reason' => $data['status'] === 'Rejected' ? ($data['decision_reason'] ?? null) : null,
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Leave request updated.');
    }
}
