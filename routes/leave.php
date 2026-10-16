<?php

use App\Http\Controllers\LeaveManagementController;
use App\Http\Controllers\LeaveRequestController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:Employee'])->prefix('leave')->name('leave.')->group(function () {
    Route::get('/', [LeaveRequestController::class, 'index'])->name('index');
    Route::post('/', [LeaveRequestController::class, 'store'])->name('store');
});

Route::middleware(['auth', 'role:Manager'])->prefix('leave-management')->name('leave-management.')->group(function () {
    Route::get('/', [LeaveManagementController::class, 'index'])->name('index');
    Route::patch('/{leaveRequest}', [LeaveManagementController::class, 'update'])->name('update');
});
