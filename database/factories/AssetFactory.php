<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetFactory extends Factory
{
    protected $model = \App\Models\Asset::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->word(),
            'type' => fake()->randomElement(['property', 'savings', 'investment', 'vehicle', 'other']),
            'value' => fake()->numberBetween(1000000, 100000000),
        ];
    }
}
