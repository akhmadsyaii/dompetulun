<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasFactory;

    private ?float $cachedBalance = null;

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
        if ($this->cachedBalance !== null) return $this->cachedBalance;
        $net = Transaction::where('wallet_id', $this->id)
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' THEN amount WHEN type = 'expense' THEN -amount ELSE 0 END), 0) as net")
            ->value('net');
        $this->cachedBalance = (float) ($this->initial_balance + $net);
        return $this->cachedBalance;
    }
}
