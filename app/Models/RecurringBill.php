<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecurringBill extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'name',
        'amount',
        'category',
        'frequency',
        'due_day',
        'notes',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'due_day' => 'integer',
            'active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(BillPayment::class, 'bill_id');
    }

    public function getPaidThisMonthAttribute(): bool
    {
        $now = now();
        return $this->payments()
            ->whereMonth('paid_at', $now->month)
            ->whereYear('paid_at', $now->year)
            ->exists();
    }

    public function getNextDueDateAttribute(): string
    {
        $now = now();
        $dueDate = now()->setDay($this->due_day);

        if ($dueDate->isPast()) {
            $dueDate->addMonth();
        }

        return $dueDate->format('Y-m-d');
    }
}
