<?php

namespace Database\Factories;

use App\Models\Candidate;
use App\Models\Criteria;
use App\Models\Judge;
use App\Models\Point;
use App\Models\Round;
use Illuminate\Database\Eloquent\Factories\Factory;

class PointFactory extends Factory
{
    protected $model = Point::class;

    public function definition(): array
    {
        return [
            'candidate_id' => Candidate::factory(),
            'round_id' => Round::factory(),
            'criteria_id' => Criteria::factory(),
            'judge_id' => Judge::factory(),
            'points' => $this->faker->numberBetween(70, 100),
        ];
    }
}
