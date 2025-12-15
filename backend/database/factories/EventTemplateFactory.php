<?php

namespace Database\Factories;

use App\Models\EventTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class EventTemplateFactory extends Factory
{
    protected $model = EventTemplate::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(3, true);
        
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(),
            'event_type' => $this->faker->randomElement(['pageant', 'competition', 'talent', 'singing', 'dance']),
            'default_judges' => $this->faker->numberBetween(3, 10),
            'default_theme_id' => null,
            'header_image' => null,
            'lock_screen_image' => null,
            'is_system' => false,
            'is_active' => true,
        ];
    }

    /**
     * Configure the template with visual settings.
     */
    public function withVisualSettings(?string $headerImage = null, ?string $lockScreenImage = null): static
    {
        return $this->state(fn (array $attributes) => [
            'header_image' => $headerImage ?? '/assets/header-' . $this->faker->uuid() . '.png',
            'lock_screen_image' => $lockScreenImage ?? '/assets/lock-' . $this->faker->uuid() . '.gif',
        ]);
    }

    /**
     * Configure the template with only header image.
     */
    public function withHeaderImage(?string $headerImage = null): static
    {
        return $this->state(fn (array $attributes) => [
            'header_image' => $headerImage ?? '/assets/header-' . $this->faker->uuid() . '.png',
        ]);
    }

    /**
     * Configure the template with only lock screen image.
     */
    public function withLockScreenImage(?string $lockScreenImage = null): static
    {
        return $this->state(fn (array $attributes) => [
            'lock_screen_image' => $lockScreenImage ?? '/assets/lock-' . $this->faker->uuid() . '.gif',
        ]);
    }

    /**
     * Configure as a system template.
     */
    public function system(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system' => true,
        ]);
    }
}
