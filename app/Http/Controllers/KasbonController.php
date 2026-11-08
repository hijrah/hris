<?php

namespace App\Http\Controllers;

use App\Models\KasbonRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class KasbonController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $requests = KasbonRequest::with(['user', 'approver'])
            ->when($user->role !== 'admin', fn ($q) => $q->where('user_id', $user->id))
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $used = KasbonRequest::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');

        $limit = (float) ($user->kasbon_limit ?? 5000000);

        return Inertia::render('kasbon/index', [
            'requests' => $requests,
            'limit' => $limit,
            'used' => (float) $used,
            'remaining' => max(0, $limit - (float) $used),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'reason' => ['required', 'string', 'max:1000'],
            'installments' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $used = KasbonRequest::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');

        $limit = (float) ($user->kasbon_limit ?? 5000000);
        $remaining = $limit - (float) $used;
        if ((float) $validated['amount'] > $remaining) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Jumlah melebihi sisa limit kasbon.')]);
            return to_route('kasbon.index');
        }

        KasbonRequest::create([
            'user_id' => $user->id,
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'installments' => $validated['installments'],
            'status' => 'pending',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Pengajuan kasbon berhasil dikirim.')]);
        return to_route('kasbon.index');
    }

    public function approve(Request $request, KasbonRequest $kasbonRequest): RedirectResponse
    {
        $kasbonRequest->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => Carbon::now(),
        ]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Kasbon disetujui.')]);
        return to_route('kasbon.index');
    }

    public function reject(Request $request, KasbonRequest $kasbonRequest): RedirectResponse
    {
        $kasbonRequest->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => Carbon::now(),
        ]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Kasbon ditolak.')]);
        return to_route('kasbon.index');
    }
}