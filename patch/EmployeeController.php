<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employees = User::with('department')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('employee_id', 'like', "%{$search}%")
                        ->orWhere('employee_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('employee_name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'departments' => Department::orderBy('department_name')->get(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => ['required', 'string', 'max:30', 'unique:users,employee_id'],
            'employee_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in(['Manager', 'Employee'])],
            'department_id' => ['required', 'exists:departments,department_id'],
            'status' => ['required', Rule::in(['Active', 'Inactive'])],
            'hire_date' => ['required', 'date'],
            'password' => ['required', 'string', 'min:8'],
            'profile_picture' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        $data['name'] = $data['employee_name'];
        $data['password'] = Hash::make($data['password']);
        if ($request->hasFile('profile_picture')) {
            $data['profile_picture'] = $request->file('profile_picture')->store('profiles', 'public');
        } else {
            $data['profile_picture'] = 'default-picture.jpg';
        }

        $user = User::create($data);
        $user->assignRole($data['role']);

        return back()->with('success', 'Employee added successfully.');
    }

    public function update(Request $request, User $employee)
    {
        $data = $request->validate([
            'employee_id' => ['required', 'string', 'max:30', Rule::unique('users', 'employee_id')->ignore($employee->id)],
            'employee_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($employee->id)],
            'role' => ['required', Rule::in(['Manager', 'Employee'])],
            'department_id' => ['required', 'exists:departments,department_id'],
            'status' => ['required', Rule::in(['Active', 'Inactive'])],
            'hire_date' => ['required', 'date'],
            'password' => ['nullable', 'string', 'min:8'],
            'profile_picture' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        $data['name'] = $data['employee_name'];
        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }
        if ($request->hasFile('profile_picture')) {
            $oldPicture = $employee->profile_picture;
            $data['profile_picture'] = $request->file('profile_picture')->store('profiles', 'public');
            if ($oldPicture && $oldPicture !== 'default-picture.jpg' && !str_starts_with($oldPicture, 'http')) {
                Storage::disk('public')->delete($oldPicture);
            }
        } else {
            unset($data['profile_picture']);
        }

        $employee->update($data);
        if (!$employee->hasRole($data['role'])) {
            $employee->syncRoles([$data['role']]);
        }

        return back()->with('success', 'Employee updated successfully.');
    }

    public function destroy(User $employee)
    {
        if ($employee->id === auth()->id()) {
            return back()->withErrors(['employee' => 'You cannot delete your own account.']);
        }

        $employee->delete();
        return back()->with('success', 'Employee deleted successfully.');
    }
}
