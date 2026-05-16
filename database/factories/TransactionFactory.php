<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = \App\Models\Transaction::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['income', 'expense']),
            'category' => fake()->randomElement(['gaji', 'makan', 'transport', 'belanja', 'tagihan']),
            'amount' => fake()->numberBetween(10000, 5000000),
            'description' => fake()->sentence(),
            'date' => fake()->date(),
        ];
    }
}
