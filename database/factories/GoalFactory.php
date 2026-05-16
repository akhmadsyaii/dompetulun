<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GoalFactory extends Factory
{
    protected $model = \App\Models\Goal::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->word(),
            'target_amount' => fake()->numberBetween(1000000, 10000000),
            'current_amount' => 0,
        ];
    }
}
