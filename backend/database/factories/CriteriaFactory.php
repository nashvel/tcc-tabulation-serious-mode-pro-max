<?php

namespace Database\Factories;

use App\Models\Criteria;
use App\Models\Round;
use Illuminate\Database\Eloquent\Factories\Factory;

class CriteriaFactory extends Factory
{
    protected $model = Criteria::class;

    public function definition(): array
    {
        return [
            'round_id' => Round::factory(),
            'name' => $this->faker->randomElement([
                'Poise and Bearing',
                'Stage Presence',
                'Beauty of Face',
                'Beauty of Figure',
                'Audience Impact',
                'Confidence',
            ]),
            'points' => $this->faker->randomElement([10, 15, 20, 25, 30]),
        ];
    }
}
