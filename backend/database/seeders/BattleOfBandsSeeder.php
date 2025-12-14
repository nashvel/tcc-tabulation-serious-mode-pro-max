<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\Criteria;
use App\Models\Event;
use App\Models\EventDay;
use App\Models\Judge;
use App\Models\Round;
use App\Models\VotingState;
use Illuminate\Database\Seeder;

class BattleOfBandsSeeder extends Seeder
{
    /**
     * Seed a Battle of the Bands event to test system flexibility.
     * 
     * This tests:
     * - Team-based participants (bands with 5 members)
     * - Different event type (competition vs pageant)
     * - Music-specific judging criteria
     */
    public function run(): void
    {
        // Create the Battle of the Bands event
        $event = Event::create([
            'unique_id' => 'evt_battle_bands_' . time(),
            'title' => 'TCC Battle of the Bands 2025',
            'year' => 2025,
            'event_date' => now()->addDays(30),
            'description' => 'Annual inter-department band competition showcasing musical talent',
            'event_type' => 'competition',
            'number_of_judges' => 5,
            'status' => 'active',
        ]);

        $this->command->info("Created event: {$event->title}");

        // Create event day
        $eventDay = EventDay::create([
            'event_id' => $event->id,
            'day_number' => 1,
            'title' => 'Battle of the Bands Finals',
            'event_type' => 'competition',
            'participant_type' => 'group',
        ]);

        // Create bands as candidates
        // Each band is a single candidate entry with team_name containing member info
        $bands = [
            [
                'number' => 1,
                'name' => 'The Syntax Errors',
                'department' => 'BSIT',
                'members' => ['John (Lead Vocals)', 'Mike (Guitar)', 'Sarah (Bass)', 'Tom (Drums)', 'Lisa (Keyboard)'],
            ],
            [
                'number' => 2,
                'name' => 'Null Pointer Exception',
                'department' => 'BSCS',
                'members' => ['Alex (Lead Vocals)', 'Chris (Guitar)', 'Pat (Bass)', 'Jordan (Drums)', 'Sam (Keyboard)'],
            ],
            [
                'number' => 3,
                'name' => 'The Accountants',
                'department' => 'BSBA',
                'members' => ['Maria (Lead Vocals)', 'Jose (Guitar)', 'Ana (Bass)', 'Pedro (Drums)', 'Rosa (Keyboard)'],
            ],
            [
                'number' => 4,
                'name' => 'Education Nation',
                'department' => 'BSED',
                'members' => ['Teacher A (Lead Vocals)', 'Teacher B (Guitar)', 'Teacher C (Bass)', 'Teacher D (Drums)', 'Teacher E (Keyboard)'],
            ],
            [
                'number' => 5,
                'name' => 'Hospitality Rockers',
                'department' => 'BSHM',
                'members' => ['Chef (Lead Vocals)', 'Barista (Guitar)', 'Concierge (Bass)', 'Bellhop (Drums)', 'Manager (Keyboard)'],
            ],
            [
                'number' => 6,
                'name' => 'Criminal Minds',
                'department' => 'BSCRIM',
                'members' => ['Detective (Lead Vocals)', 'Officer (Guitar)', 'Forensic (Bass)', 'Investigator (Drums)', 'Analyst (Keyboard)'],
            ],
        ];

        foreach ($bands as $band) {
            // Store band name with member count in the name field
            // Members can be stored in partner fields or a separate table if needed
            Candidate::create([
                'event_id' => $event->id,
                'number' => $band['number'],
                'name' => $band['name'] . ' (5 members)',
                'gender' => 'Group', // Use gender field to indicate group type
                'department' => $band['department'],
                'participant_type' => 'group',
                'order' => $band['number'],
            ]);
        }

        $this->command->info("Created {$event->candidates()->count()} bands");

        // Create rounds for Battle of the Bands
        $rounds = [
            ['spot' => 1, 'name' => 'Original Composition'],
            ['spot' => 2, 'name' => 'Cover Song'],
            ['spot' => 3, 'name' => 'Final Performance'],
        ];

        foreach ($rounds as $roundData) {
            $round = Round::create([
                'event_id' => $event->id,
                'spot' => $roundData['spot'],
                'name' => $roundData['name'],
            ]);

            // Create criteria for each round
            $criteria = [
                ['name' => 'Musicality', 'points' => 25],
                ['name' => 'Stage Presence', 'points' => 20],
                ['name' => 'Creativity/Originality', 'points' => 20],
                ['name' => 'Technical Skill', 'points' => 20],
                ['name' => 'Audience Impact', 'points' => 15],
            ];

            foreach ($criteria as $criteriaData) {
                Criteria::create([
                    'round_id' => $round->id,
                    'name' => $criteriaData['name'],
                    'points' => $criteriaData['points'],
                ]);
            }
        }

        $this->command->info("Created {$event->rounds()->count()} rounds with criteria");

        // Create judges
        $judges = [
            ['name' => 'Prof. Music Director', 'chair_number' => 1],
            ['name' => 'Local Band Manager', 'chair_number' => 2],
            ['name' => 'Radio DJ', 'chair_number' => 3],
            ['name' => 'Recording Artist', 'chair_number' => 4],
            ['name' => 'Music Teacher', 'chair_number' => 5],
        ];

        foreach ($judges as $judgeData) {
            Judge::create([
                'event_id' => $event->id,
                'name' => $judgeData['name'],
                'chair_number' => $judgeData['chair_number'],
                'status' => 'active',
            ]);
        }

        $this->command->info("Created {$event->judges()->count()} judges");

        // Create voting state
        VotingState::create([
            'event_id' => $event->id,
            'is_active' => false,
            'is_locked' => false,
            'active_round_id' => null,
        ]);

        $this->command->info('');
        $this->command->info('=== Battle of the Bands Event Created Successfully ===');
        $this->command->info("Event ID: {$event->id}");
        $this->command->info("Bands: 6 (each with 5 members)");
        $this->command->info("Rounds: 3 (Original, Cover, Final)");
        $this->command->info("Criteria per round: 5 (totaling 100 points)");
        $this->command->info("Judges: 5");
        $this->command->info('');
        $this->command->info("Access at: /admin?event_id={$event->id}");
    }
}
