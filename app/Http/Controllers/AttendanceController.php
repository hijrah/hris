<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    // Office geofence (demo coordinates)
    private const OFFICE_LAT = -6.2088;
    private const OFFICE_LNG = 106.8456;
    private const GEOFENCE_METERS = 500;

    public function index(Request $request): Response
    {
        $user = $request->user();

        $attendances = Attendance::with('user')
            ->when($user->role !== 'admin', fn ($q) => $q->where('user_id', $user->id))
            ->orderByDesc('date')
            ->limit(50)
            ->get();

        $leaveRequests = LeaveRequest::with(['user', 'approver'])
            ->when($user->role !== 'admin', fn ($q) => $q->where('user_id', $user->id))
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $today = Attendance::where('user_id', $user->id)->whereDate('date', Carbon::today())->first();

        $monthStart = Carbon::now()->startOfMonth();
        $monthly = Attendance::where('user_id', $user->id)
            ->whereBetween('date', [$monthStart, Carbon::now()])
            ->get();

        $metrics = [
            'present' => $monthly->whereIn('status', ['present', 'late'])->count(),
            'late' => $monthly->where('status', 'late')->count(),
            'leave' => LeaveRequest::where('user_id', $user->id)->where('status', 'approved')->count(),
            'work_hours' => round($monthly->sum('work_minutes') / 60, 1),
        ];

        return Inertia::render('attendance/index', [
            'attendances' => $attendances,
            'leaveRequests' => $leaveRequests,
            'today' => $today,
            'metrics' => $metrics,
            'office' => [
                'lat' => self::OFFICE_LAT,
                'lng' => self::OFFICE_LNG,
                'radius' => self::GEOFENCE_METERS,
            ],
        ]);
    }

    public function clockIn(Request $request): RedirectResponse
    {
        $user = $request->user();
        $today = Carbon::today();

        $existing = Attendance::where('user_id', $user->id)->whereDate('date', $today)->first();
        if ($existing && $existing->clock_in) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Anda sudah absen masuk hari ini.')]);
            return to_route('attendance.index');
        }

        $lat = $request->input('latitude');
        $lng = $request->input('longitude');

        if ($lat !== null && $lng !== null) {
            $distance = $this->distanceMeters((float) $lat, (float) $lng, self::OFFICE_LAT, self::OFFICE_LNG);
            if ($distance > self::GEOFENCE_METERS) {
                Inertia::flash('toast', ['type' => 'error', 'message' => __('Anda berada di luar area kantor.')]);
                return to_route('attendance.index');
            }
        }

        $status = Carbon::now()->format('H:i') > '09:00' ? 'late' : 'present';

        Attendance::updateOrCreate(
            ['user_id' => $user->id, 'date' => $today],
            [
                'clock_in' => Carbon::now(),
                'clock_in_latitude' => $lat,
                'clock_in_longitude' => $lng,
                'status' => $status,
            ]
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Absen masuk berhasil.')]);
        return to_route('attendance.index');
    }

    public function clockOut(Request $request): RedirectResponse
    {
        $user = $request->user();
        $today = Carbon::today();

        $attendance = Attendance::where('user_id', $user->id)->whereDate('date', $today)->first();
        if (! $attendance || ! $attendance->clock_in) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Anda belum absen masuk hari ini.')]);
            return to_route('attendance.index');
        }
        if ($attendance->clock_out) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Anda sudah absen pulang hari ini.')]);
            return to_route('attendance.index');
        }

        $lat = $request->input('latitude');
        $lng = $request->input('longitude');

        $clockOut = Carbon::now();
        $workMinutes = $attendance->clock_in->diffInMinutes($clockOut);

        $attendance->update([
            'clock_out' => $clockOut,
            'clock_out_latitude' => $lat,
            'clock_out_longitude' => $lng,
            'work_minutes' => $workMinutes,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Absen pulang berhasil.')]);
        return to_route('attendance.index');
    }

    public function storeLeave(Request $request): RedirectResponse
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
        return to_route('attendance.index');
    }

    public function approveLeave(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $leaveRequest->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => Carbon::now(),
        ]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Izin/cuti disetujui.')]);
        return to_route('attendance.index');
    }

    public function rejectLeave(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $leaveRequest->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => Carbon::now(),
        ]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Izin/cuti ditolak.')]);
        return to_route('attendance.index');
    }

    private function distanceMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earth = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earth * $c;
    }
}