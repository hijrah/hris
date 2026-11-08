<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\KasbonController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('attendance/clock-in', [AttendanceController::class, 'clockIn'])->name('attendance.clock-in');
    Route::post('attendance/clock-out', [AttendanceController::class, 'clockOut'])->name('attendance.clock-out');
    Route::post('attendance/leave', [AttendanceController::class, 'storeLeave'])->name('attendance.leave.store');
    Route::post('attendance/leave/{leaveRequest}/approve', [AttendanceController::class, 'approveLeave'])->name('attendance.leave.approve');
    Route::post('attendance/leave/{leaveRequest}/reject', [AttendanceController::class, 'rejectLeave'])->name('attendance.leave.reject');

    Route::get('leave', [LeaveController::class, 'index'])->name('leave.index');
    Route::post('leave', [LeaveController::class, 'store'])->name('leave.store');
    Route::post('leave/{leaveRequest}/approve', [LeaveController::class, 'approve'])->name('leave.approve');
    Route::post('leave/{leaveRequest}/reject', [LeaveController::class, 'reject'])->name('leave.reject');

    Route::get('kasbon', [KasbonController::class, 'index'])->name('kasbon.index');
    Route::post('kasbon', [KasbonController::class, 'store'])->name('kasbon.store');
    Route::post('kasbon/{kasbonRequest}/approve', [KasbonController::class, 'approve'])->name('kasbon.approve');
    Route::post('kasbon/{kasbonRequest}/reject', [KasbonController::class, 'reject'])->name('kasbon.reject');
});

require __DIR__.'/settings.php';