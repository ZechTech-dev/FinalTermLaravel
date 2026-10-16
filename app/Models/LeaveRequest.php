<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    protected $primaryKey = 'request_id';

    protected $fillable = [
        'user_id', 'leave_type', 'start_date', 'end_date', 'reason',
        'status', 'decision_reason', 'approved_by', 'applied_at'
    ];

    protected function casts(): array
    {
        return ['start_date' => 'date:Y-m-d', 'end_date' => 'date:Y-m-d', 'applied_at' => 'datetime:Y-m-d H:i'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
