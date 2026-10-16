<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn() => auth()->check()
    ? redirect()->route('dashboard')
    : redirect()->route('login'));

Route::middleware('auth')->get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

require __DIR__ . '/employees.php';
require __DIR__ . '/attendance.php';
require __DIR__ . '/leave.php';
