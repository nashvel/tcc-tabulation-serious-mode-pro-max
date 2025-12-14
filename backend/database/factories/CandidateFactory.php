<?php

namespace Database\Factories;

use App\Models\Candidate;
use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

class CandidateFactory extends Factory
{
    protected $model = Candidate::class;

    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'number' => $this->faker->unique()->numberBetween(1, 100),
            'name' => $this->faker->name(),
            'gender' => $this->faker->randomElement(['Male', 'Female']),
            'department' => $this->faker->randomElement(['BSIT', 'BSBA', 'BSED', 'BEED']),
            'participant_type' => 'solo',
            'order' => $this->faker->numberBetween(1, 50),
        ];
    }
}
