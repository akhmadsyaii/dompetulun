<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'name',
        'type',
        'initial_balance',
        'icon',
        'color',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'initial_balance' => 'decimal:2',
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function getBalanceAttribute(): float
    {
        $income = Transaction::where('wallet_id', $this->id)
            ->where('type', 'income')
            ->sum('amount');

        $expense = Transaction::where('wallet_id', $this->id)
            ->where('type', 'expense')
            ->sum('amount');

        return (float) ($this->initial_balance + $income - $expense);
    }
}
