<?php

/**
 * TCC TRIO DANCE COMPETITION 2025 Event Setup Script
 * Tests: 3-member groups (trios)
 * 
 * Usage: php setup_trio_dance.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Event;
use App\Models\EventDay;
use App\Models\Candidate;
use App\Models\Round;
use App\Models\Criteria;
use App\Models\EventSequence;
use App\Models\Judge;
use App\Models\VotingState;
use Illuminate\Support\Facades\DB;

try {
    echo " Setting up TCC TRIO DANCE COMPETITION 2025...\n\n";
    
    DB::beginTransaction();

    // Create the Trio Dance Competition event
    $event = Event::create([
        'unique_id' => 'evt_trio_dance_' . time(),
        'title' => 'TCC Trio Dance Competition 2025',
        'year' => 2025,
        'event_date' => now()->addDays(60)->format('Y-m-d'),
        'description' => 'Inter-department trio dance showdown - 3 dancers per team',
        'event_type' => 'competition',
        'number_of_judges' => 5,
        'status' => 'active'
    ]);

    echo " Event created: {$event->title} (ID: {$event->id})\n";

    // Create Event Day
    $eventDay = EventDay::create([
        'event_id' => $event->id,
        'day_number' => 1,
        'title' => 'Trio Dance Showdown',
        'event_type' => 'competition',
        'participant_type' => 'group'
    ]);

    echo " Event Day created: {$eventDay->title}\n";

    // Create trio dance groups as candidates
    $trios = [
        ['number' => 1, 'name' => 'Triple Threat', 'department' => 'BSIT', 'members' => 'Ana, Bea, Cara'],
        ['number' => 2, 'name' => 'Dance Dynasty', 'department' => 'BSBA', 'members' => 'Dan, Eli, Faye'],
        ['number' => 3, 'name' => 'Rhythm Rebels', 'department' => 'BSED', 'members' => 'Gab, Hana, Ian'],
        ['number' => 4, 'name' => 'Motion Masters', 'department' => 'BSHM', 'members' => 'Jay, Kim, Leo'],
        ['number' => 5, 'name' => 'Groove Guardians', 'department' => 'BSCRIM', 'members' => 'Mia, Nico, Olive'],
        ['number' => 6, 'name' => 'Step Squad', 'department' => 'BSN', 'members' => 'Paul, Quinn, Rose'],
        ['number' => 7, 'name' => 'Beat Breakers', 'department' => 'BSCS', 'members' => 'Sam, Tina, Uma'],
        ['number' => 8, 'name' => 'Flow Force', 'department' => 'BSMT', 'members' => 'Vic, Wendy, Xander'],
    ];

    foreach ($trios as $trio) {
        Candidate::create([
            'event_id' => $event->id,
            'number' => $trio['number'],
            'name' => $trio['name'] . ' (3 members: ' . $trio['members'] . ')',
            'gender' => 'Group',
            'department' => $trio['department'],
            'participant_type' => 'group',
            'order' => $trio['number'],
        ]);
    }

    echo " Created 8 trio dance groups (3 members each)\n";

    // Create Rounds with Criteria
    $roundsData = [
        [
            'spot' => 1,
            'name' => 'Hip-Hop Round',
            'description' => 'Perform a hip-hop routine',
            'criteria' => [
                ['name' => 'Synchronization', 'points' => 25],
                ['name' => 'Choreography', 'points' => 25],
                ['name' => 'Execution', 'points' => 20],
                ['name' => 'Showmanship', 'points' => 15],
                ['name' => 'Costume & Presentation', 'points' => 15],
            ]
        ],
        [
            'spot' => 2,
            'name' => 'Contemporary Round',
            'description' => 'Perform a contemporary dance piece',
            'criteria' => [
                ['name' => 'Synchronization', 'points' => 25],
                ['name' => 'Choreography', 'points' => 25],
                ['name' => 'Execution', 'points' => 20],
                ['name' => 'Showmanship', 'points' => 15],
                ['name' => 'Costume & Presentation', 'points' => 15],
            ]
        ],
        [
            'spot' => 3,
            'name' => 'Freestyle Finals',
            'description' => 'Any dance style - show your best',
            'criteria' => [
                ['name' => 'Synchronization', 'points' => 25],
                ['name' => 'Choreography', 'points' => 25],
                ['name' => 'Execution', 'points' => 20],
                ['name' => 'Showmanship', 'points' => 15],
                ['name' => 'Costume & Presentation', 'points' => 15],
            ]
        ],
    ];

    foreach ($roundsData as $roundData) {
        $round = Round::create([
            'event_id' => $event->id,
            'spot' => $roundData['spot'],
            'name' => $roundData['name'],
            'description' => $roundData['description']
        ]);

        foreach ($roundData['criteria'] as $crit) {
            Criteria::create([
                'round_id' => $round->id,
                'name' => $crit['name'],
                'points' => $crit['points']
            ]);
        }

        EventSequence::create([
            'event_id' => $event->id,
            'round_id' => $round->id,
            'order' => $roundData['spot']
        ]);

        echo " Round {$roundData['spot']}: {$roundData['name']} (5 criteria)\n";
    }

    // Create Judges
    $judgesData = [
        ['name' => 'Choreographer Lea', 'chair_number' => 1],
        ['name' => 'Dance Instructor Marco', 'chair_number' => 2],
        ['name' => 'Professional Dancer Nina', 'chair_number' => 3],
        ['name' => 'Hip-Hop Artist Oscar', 'chair_number' => 4],
        ['name' => 'Ballet Master Petra', 'chair_number' => 5],
    ];

    foreach ($judgesData as $judgeData) {
        Judge::create([
            'event_id' => $event->id,
            'name' => $judgeData['name'],
            'chair_number' => $judgeData['chair_number'],
            'status' => 'active'
        ]);
    }

    echo " Created 5 judges\n";

    // Create Voting State
    VotingState::create([
        'event_id' => $event->id,
        'is_active' => false,
        'is_locked' => false,
        'active_round_id' => null,
    ]);

    DB::commit();

    echo "\n";
    echo " SUCCESS! TCC TRIO DANCE COMPETITION 2025 setup complete!\n\n";
    echo " Summary:\n";
    echo "   - Event ID: {$event->id}\n";
    echo "   - Title: {$event->title}\n";
    echo "   - Participants: 8 trio groups (3 members each = 24 dancers total)\n";
    echo "   - Judges: 5\n";
    echo "   - Rounds: 3\n";
    echo "   - Criteria per round: 5 (totaling 100 points)\n\n";
    echo " Access at: /admin?event_id={$event->id}\n\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\n ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
