<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Round;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoundFactory extends Factory
{
    protected $model = Round::class;

    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'spot' => $this->faker->numberBetween(1, 10),
            'name' => $this->faker->randomElement([
                'Preliminary Round',
                'Swimwear',
                'Formal Wear',
                'Talent',
                'Q&A',
                'Final Round',
            ]),
        ];
    }
}
