<?php

namespace Database\Factories;

use App\Models\RecurringBill;
use Illuminate\Database\Eloquent\Factories\Factory;

class BillPaymentFactory extends Factory
{
    protected $model = \App\Models\BillPayment::class;

    public function definition(): array
    {
        return [
            'bill_id' => RecurringBill::factory(),
            'amount' => fake()->numberBetween(50000, 500000),
            'paid_at' => now(),
        ];
    }
}
