<?php

use App\Http\Controllers\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:Manager'])->group(function () {
    Route::resource('employees', EmployeeController::class)->except(['create', 'edit', 'show']);
});
