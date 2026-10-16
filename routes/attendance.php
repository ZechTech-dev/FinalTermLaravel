<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceManagementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:Employee|Manager'])->prefix('attendance')->name('attendance.')->group(function () {
    Route::get('/', [AttendanceController::class, 'index'])->name('index');
    Route::post('/time-in', [AttendanceController::class, 'timeIn'])->name('time-in');
    Route::post('/break-in', [AttendanceController::class, 'breakIn'])->name('break-in');
    Route::post('/break-out', [AttendanceController::class, 'breakOut'])->name('break-out');
    Route::post('/time-out', [AttendanceController::class, 'timeOut'])->name('time-out');
});

Route::middleware(['auth', 'role:Employee|Manager'])->get('/attendance-management', [AttendanceManagementController::class, 'index'])->name('attendance.manage');
