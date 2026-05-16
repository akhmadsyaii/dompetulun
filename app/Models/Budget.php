<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Budget extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'category',
        'amount',
        'period',
        'month',
        'year',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getSpentAttribute()
    {
        return Transaction::where('user_id', $this->user_id)
            ->where('category', $this->category)
            ->where('type', 'expense')
            ->whereYear('date', $this->year)
            ->whereMonth('date', $this->month)
            ->sum('amount');
    }

    public function getRemainingAttribute()
    {
        return max(0, $this->amount - $this->spent);
    }

    public function getProgressAttribute()
    {
        if ($this->amount <= 0) return 0;
        return min(100, round(($this->spent / $this->amount) * 100, 1));
    }
}
