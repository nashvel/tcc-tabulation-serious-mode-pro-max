<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Simple API endpoint tests that verify routes are accessible
 * and return expected response structures.
 * These tests don't modify the database.
 */
class ApiEndpointTest extends TestCase
{
    public function test_events_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/events');
        
        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json');
    }

    public function test_candidates_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/candidates');
        
        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json');
    }

    public function test_rounds_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/rounds');
        
        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json');
    }

    public function test_criteria_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/criteria');
        
        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json');
    }

    public function test_points_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/points');
        
        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json');
    }

    public function test_judges_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/judges?event_id=1');
        
        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json');
    }

    public function test_scoreboard_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/scoreboard');
        
        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json');
    }

    public function test_voting_state_endpoint_works(): void
    {
        $response = $this->getJson('/api/voting/state?event_id=1');
        
        // Can be 200 (state found) or 404 (no state for event)
        $this->assertTrue(in_array($response->status(), [200, 404]));
    }

    public function test_event_sequence_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/event-sequence');
        
        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json');
    }

    public function test_active_event_endpoint_works(): void
    {
        $response = $this->getJson('/api/events/active');
        
        // Can be 200 (event found) or 404 (no active event)
        $this->assertTrue(in_array($response->status(), [200, 404]));
    }

    public function test_admin_login_requires_pin(): void
    {
        $response = $this->postJson('/api/admin/login', []);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pin']);
    }

    public function test_admin_login_rejects_short_pin(): void
    {
        $response = $this->postJson('/api/admin/login', ['pin' => '123']);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pin']);
    }

    public function test_points_submission_requires_all_fields(): void
    {
        $response = $this->postJson('/api/points', [
            'candidate_id' => 1,
        ]);
        
        $response->assertStatus(422);
    }

    public function test_batch_points_requires_scores(): void
    {
        $response = $this->postJson('/api/points/batch', [
            'judge_id' => 1,
            'event_id' => 1,
            'scores' => [],
        ]);
        
        $response->assertStatus(400);
    }

    public function test_nonexistent_event_returns_404(): void
    {
        $response = $this->getJson('/api/events/999999');
        
        $response->assertStatus(404);
    }
}
