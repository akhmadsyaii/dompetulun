<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BudgetFactory extends Factory
{
    protected $model = \App\Models\Budget::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category' => fake()->randomElement(['makan', 'transport', 'belanja', 'tagihan']),
            'amount' => fake()->numberBetween(500000, 5000000),
            'period' => 'monthly',
            'month' => now()->month,
            'year' => now()->year,
        ];
    }
}
