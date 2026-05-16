<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class LabelFactory extends Factory
{
    protected $model = \App\Models\Label::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->word(),
            'color' => fake()->hexColor(),
        ];
    }
}
