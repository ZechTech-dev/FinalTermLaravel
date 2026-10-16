<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $table = 'attendance';
    protected $primaryKey = 'attendance_id';

    protected $fillable = [
        'user_id', 'date', 'time_in', 'break_in', 'break_out', 'time_out',
        'late_minutes', 'status', 'break_hours', 'total_hours', 'overtime_hours'
    ];

    protected function casts(): array
    {
        return ['date' => 'date:Y-m-d', 'break_hours' => 'decimal:2', 'total_hours' => 'decimal:2', 'overtime_hours' => 'decimal:2'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
