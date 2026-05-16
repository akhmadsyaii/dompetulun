<?php

namespace Database\Factories;

use App\Models\Goal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GoalFundingRuleFactory extends Factory
{
    protected $model = \App\Models\GoalFundingRule::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'goal_id' => Goal::factory(),
            'type' => fake()->randomElement(['percentage', 'roundup', 'fixed']),
            'value' => fake()->randomFloat(2, 5, 50),
            'active' => true,
        ];
    }
}
