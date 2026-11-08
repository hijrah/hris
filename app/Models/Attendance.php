<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $date
 * @property \Illuminate\Support\Carbon|null $clock_in
 * @property \Illuminate\Support\Carbon|null $clock_out
 * @property float|null $clock_in_latitude
 * @property float|null $clock_in_longitude
 * @property float|null $clock_out_latitude
 * @property float|null $clock_out_longitude
 * @property string $status
 * @property int $work_minutes
 * @property string|null $notes
 */
#[Fillable(['user_id', 'date', 'clock_in', 'clock_out', 'clock_in_latitude', 'clock_in_longitude', 'clock_out_latitude', 'clock_out_longitude', 'status', 'work_minutes', 'notes'])]
class Attendance extends Model
{
    /** @use HasFactory<\Database\Factories\AttendanceFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'clock_in' => 'datetime',
            'clock_out' => 'datetime',
            'clock_in_latitude' => 'float',
            'clock_in_longitude' => 'float',
            'clock_out_latitude' => 'float',
            'clock_out_longitude' => 'float',
            'work_minutes' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}