<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class WalletFactory extends Factory
{
    protected $model = \App\Models\Wallet::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(['Bank BCA', 'Bank Mandiri', 'GoPay', 'Tunai']),
            'type' => fake()->randomElement(['cash', 'bank', 'ewallet', 'other']),
            'initial_balance' => fake()->numberBetween(0, 5000000),
            'is_default' => false,
        ];
    }
}
