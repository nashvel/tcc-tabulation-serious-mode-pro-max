<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Judge;
use Illuminate\Database\Eloquent\Factories\Factory;

class JudgeFactory extends Factory
{
    protected $model = Judge::class;

    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'chair_number' => $this->faker->numberBetween(1, 10),
            'laptop_ip' => $this->faker->ipv4(),
            'status' => 'active',
            'metadata' => null,
        ];
    }
}
