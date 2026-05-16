<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoalFundingRule extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'goal_id',
        'type',
        'value',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }
}
