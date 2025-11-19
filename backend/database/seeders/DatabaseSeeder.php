<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\Round;
use App\Models\Criteria;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Candidates
        $candidates = [
            ['number' => 5, 'name' => 'BSBA', 'gender' => 'Female'],
            ['number' => 6, 'name' => 'HM', 'gender' => 'Female'],
            ['number' => 7, 'name' => 'IT', 'gender' => 'Female'],
        ];

        foreach ($candidates as $candidate) {
            Candidate::create($candidate);
        }

        // Create Rounds
        $round1 = Round::create(['spot' => 1, 'name' => 'Round One']);
        $round2 = Round::create(['spot' => 2, 'name' => 'Round Two']);

        // Create Criteria for Round One
        Criteria::create([
            'round_id' => $round1->id,
            'name' => 'Appreciation of Fashion Trends',
            'points' => 25
        ]);

        Criteria::create([
            'round_id' => $round1->id,
            'name' => 'Stage Presence',
            'points' => 25
        ]);

        Criteria::create([
            'round_id' => $round1->id,
            'name' => 'Overall Impact',
            'points' => 25
        ]);

        // Create Criteria for Round Two
        Criteria::create([
            'round_id' => $round2->id,
            'name' => 'Communication Skills',
            'points' => 30
        ]);

        Criteria::create([
            'round_id' => $round2->id,
            'name' => 'Intelligence',
            'points' => 30
        ]);

        Criteria::create([
            'round_id' => $round2->id,
            'name' => 'Wit and Humor',
            'points' => 20
        ]);

        $this->command->info('Sample data seeded successfully!');
        
        // Seed events
        $this->call(EventSeeder::class);
    }
}
