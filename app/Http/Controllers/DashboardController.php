<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\KasbonRequest;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $today = Attendance::where('user_id', $user->id)->whereDate('date', Carbon::today())->first();

        $monthStart = Carbon::now()->startOfMonth();
        $monthly = Attendance::where('user_id', $user->id)
            ->whereBetween('date', [$monthStart, Carbon::now()])
            ->get();

        $metrics = [
            'present' => $monthly->whereIn('status', ['present', 'late'])->count(),
            'late' => $monthly->where('status', 'late')->count(),
            'work_hours' => round($monthly->sum('work_minutes') / 60, 1),
        ];

        $pendingLeaves = LeaveRequest::where('status', 'pending')->count();
        $pendingKasbon = KasbonRequest::where('status', 'pending')->count();

        $used = KasbonRequest::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');

        return Inertia::render('dashboard', [
            'today' => $today,
            'metrics' => $metrics,
            'pendingLeaves' => $pendingLeaves,
            'pendingKasbon' => $pendingKasbon,
            'kasbon' => [
                'limit' => (float) ($user->kasbon_limit ?? 5000000),
                'used' => (float) $used,
                'remaining' => max(0, (float) $user->kasbon_limit - (float) $used),
            ],
            'recentAttendances' => Attendance::where('user_id', $user->id)->orderByDesc('date')->limit(5)->get(),
            'recentKasbon' => KasbonRequest::where('user_id', $user->id)->orderByDesc('created_at')->limit(5)->get(),
        ]);
    }
}