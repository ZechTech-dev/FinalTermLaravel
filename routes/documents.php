<?php

use App\Http\Controllers\DocumentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:Employee'])->prefix('documents')->name('documents.')->group(function () {
    Route::get('/', [DocumentController::class, 'index'])->name('index');
    Route::post('/', [DocumentController::class, 'store'])->name('store');
    Route::get('/{document}/view', [DocumentController::class, 'show'])->name('show');
    Route::get('/{document}/download', [DocumentController::class, 'download'])->name('download');
});

Route::middleware(['auth', 'role:Manager'])->prefix('document-management')->name('document-management.')->group(function () {
    Route::get('/', [DocumentController::class, 'manage'])->name('index');
    Route::get('/{document}/view', [DocumentController::class, 'show'])->name('show');
    Route::get('/{document}/download', [DocumentController::class, 'download'])->name('download');
});
