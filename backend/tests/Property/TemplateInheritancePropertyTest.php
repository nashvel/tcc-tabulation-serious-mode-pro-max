<?php

namespace Tests\Property;

use App\Models\Event;
use App\Models\EventTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Property-based tests for template inheritance functionality.
 */
class TemplateInheritancePropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * **Feature: template-customization, Property 4: Template inheritance preserves visual settings**
     * **Validates: Requirements 4.1, 4.2**
     * 
     * For any event created from a template, if the template has `header_image` 
     * or `lock_screen_image` set, the created event should have the same values 
     * for those fields.
     */
    public function test_template_inheritance_preserves_visual_settings_property(): void
    {
        // Run 100 iterations as specified in the design document
        for ($i = 0; $i < 100; $i++) {
            // Generate random visual settings scenarios
            $scenario = fake()->numberBetween(1, 4);
            
            $headerImage = null;
            $lockScreenImage = null;
            
            switch ($scenario) {
                case 1:
                    // Both visual settings set
                    $headerImage = '/assets/header-' . fake()->uuid() . '.png';
                    $lockScreenImage = '/assets/lock-' . fake()->uuid() . '.gif';
                    break;
                case 2:
                    // Only header image set
                    $headerImage = '/assets/header-' . fake()->uuid() . '.png';
                    break;
                case 3:
                    // Only lock screen image set
                    $lockScreenImage = '/assets/lock-' . fake()->uuid() . '.gif';
                    break;
                case 4:
                    // Neither set (null values)
                    break;
            }
            
            // Create a template with the generated visual settings
            $template = EventTemplate::factory()->create([
                'header_image' => $headerImage,
                'lock_screen_image' => $lockScreenImage,
                'default_judges' => fake()->numberBetween(3, 10),
            ]);
            
            // Create event from template via API
            $eventData = [
                'title' => fake()->sentence(3),
                'event_date' => fake()->date(),
                'description' => fake()->paragraph(),
            ];
            
            $response = $this->postJson("/api/event-templates/{$template->id}/create-event", $eventData);
            
            $response->assertStatus(201);
            
            $createdEvent = $response->json();
            
            // Property: If template has header_image, event should inherit it
            if ($headerImage !== null) {
                $this->assertEquals(
                    $headerImage,
                    $createdEvent['header_image'],
                    "Event should inherit header_image from template. " .
                    "Template: '{$headerImage}', Event: '{$createdEvent['header_image']}'"
                );
            } else {
                $this->assertNull(
                    $createdEvent['header_image'],
                    "Event header_image should be null when template has no header_image"
                );
            }
            
            // Property: If template has lock_screen_image, event should inherit it
            if ($lockScreenImage !== null) {
                $this->assertEquals(
                    $lockScreenImage,
                    $createdEvent['lock_screen_image'],
                    "Event should inherit lock_screen_image from template. " .
                    "Template: '{$lockScreenImage}', Event: '{$createdEvent['lock_screen_image']}'"
                );
            } else {
                $this->assertNull(
                    $createdEvent['lock_screen_image'],
                    "Event lock_screen_image should be null when template has no lock_screen_image"
                );
            }
            
            // Verify the event was actually created in the database
            $eventFromDb = Event::find($createdEvent['id']);
            $this->assertNotNull($eventFromDb, "Event should exist in database");
            $this->assertEquals($headerImage, $eventFromDb->header_image);
            $this->assertEquals($lockScreenImage, $eventFromDb->lock_screen_image);
            
            // Clean up for next iteration
            $eventFromDb->delete();
            $template->delete();
        }
    }
}
