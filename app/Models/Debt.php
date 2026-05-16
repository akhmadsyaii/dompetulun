<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Debt extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'creditor_name',
        'total_amount',
        'remaining_amount',
        'description',
        'due_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
            'due_date' => 'date',
            'status' => 'string',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function debtPayments(): HasMany
    {
        return $this->hasMany(DebtPayment::class);
    }
}
