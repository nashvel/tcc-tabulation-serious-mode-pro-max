<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        return [
            'unique_id' => 'evt_' . $this->faker->unique()->uuid(),
            'title' => $this->faker->sentence(3),
            'year' => $this->faker->year(),
            'event_date' => $this->faker->date(),
            'description' => $this->faker->paragraph(),
            'event_type' => $this->faker->randomElement(['pageant', 'competition', 'talent']),
            'number_of_judges' => $this->faker->numberBetween(3, 10),
            'status' => $this->faker->randomElement(['active', 'completed', 'archived']),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }
}
