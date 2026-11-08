<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $leaveRequests = LeaveRequest::with(['user', 'approver'])
            ->when($user->role !== 'admin', fn ($q) => $q->where('user_id', $user->id))
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return Inertia::render('leave/index', [
            'leaveRequests' => $leaveRequests,
            'leaveBalance' => (int) ($user->leave_balance ?? 12),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:sick,annual,permission'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        LeaveRequest::create([
            'user_id' => $request->user()->id,
            ...$validated,
            'status' => 'pending',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Pengajuan izin/cuti berhasil dikirim.')]);
        return to_route('leave.index');
    }

    public function approve(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $leaveRequest->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => Carbon::now(),
        ]);

        if ($leaveRequest->type === 'annual') {
            $days = Carbon::parse($leaveRequest->start_date)->diffInDays(Carbon::parse($leaveRequest->end_date)) + 1;
            User::where('id', $leaveRequest->user_id)->decrement('leave_balance', $days);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Izin/cuti disetujui.')]);
        return to_route('leave.index');
    }

    public function reject(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $leaveRequest->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => Carbon::now(),
        ]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Izin/cuti ditolak.')]);
        return to_route('leave.index');
    }
}