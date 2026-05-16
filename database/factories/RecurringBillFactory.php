<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RecurringBillFactory extends Factory
{
    protected $model = \App\Models\RecurringBill::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->word(),
            'amount' => fake()->numberBetween(50000, 500000),
            'category' => fake()->randomElement(['tagihan', 'makan', 'transport']),
            'frequency' => 'monthly',
            'due_day' => fake()->numberBetween(1, 28),
            'active' => true,
        ];
    }
}
