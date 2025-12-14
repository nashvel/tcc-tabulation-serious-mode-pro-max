<?php

/**
 * TCC SOLO SINGING CONTEST 2025 Event Setup Script
 * Tests: Solo participants (1 member each)
 * 
 * Usage: php setup_singing_contest.php
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
    echo " Setting up TCC SOLO SINGING CONTEST 2025...\n\n";
    
    DB::beginTransaction();

    // Create the Solo Singing Contest event
    $event = Event::create([
        'unique_id' => 'evt_singing_solo_' . time(),
        'title' => 'TCC Solo Singing Contest 2025',
        'year' => 2025,
        'event_date' => now()->addDays(45)->format('Y-m-d'),
        'description' => 'Annual solo singing competition - The Voice of TCC',
        'event_type' => 'competition',
        'number_of_judges' => 4,
        'status' => 'active'
    ]);

    echo " Event created: {$event->title} (ID: {$event->id})\n";

    // Create Event Day
    $eventDay = EventDay::create([
        'event_id' => $event->id,
        'day_number' => 1,
        'title' => 'Solo Singing Finals',
        'event_type' => 'competition',
        'participant_type' => 'solo'
    ]);

    echo " Event Day created: {$eventDay->title}\n";

    // Create solo singers as candidates (no gender separation - all compete together)
    $singers = [
        ['number' => 1, 'name' => 'Maria Santos', 'department' => 'BSBA'],
        ['number' => 2, 'name' => 'John Cruz', 'department' => 'BSIT'],
        ['number' => 3, 'name' => 'Angela Reyes', 'department' => 'BSED'],
        ['number' => 4, 'name' => 'Mark Villanueva', 'department' => 'BSCS'],
        ['number' => 5, 'name' => 'Patricia Lim', 'department' => 'BSHM'],
        ['number' => 6, 'name' => 'Carlos Garcia', 'department' => 'BSCRIM'],
        ['number' => 7, 'name' => 'Sofia Mendoza', 'department' => 'BSN'],
        ['number' => 8, 'name' => 'Miguel Torres', 'department' => 'BSBA'],
    ];

    foreach ($singers as $singer) {
        Candidate::create([
            'event_id' => $event->id,
            'number' => $singer['number'],
            'name' => $singer['name'],
            'gender' => 'solo',  // No gender separation - all compete together
            'department' => $singer['department'],
            'participant_type' => 'solo',
            'order' => $singer['number'],
        ]);
    }

    echo " Created 8 solo singers (competing together, no gender separation)\n";

    // Create Rounds with Criteria
    $roundsData = [
        [
            'spot' => 1,
            'name' => 'Elimination Round',
            'description' => 'Sing any song of choice',
            'criteria' => [
                ['name' => 'Voice Quality', 'points' => 30],
                ['name' => 'Pitch & Tone', 'points' => 25],
                ['name' => 'Stage Presence', 'points' => 20],
                ['name' => 'Song Interpretation', 'points' => 25],
            ]
        ],
        [
            'spot' => 2,
            'name' => 'Semi-Finals',
            'description' => 'OPM song required',
            'criteria' => [
                ['name' => 'Voice Quality', 'points' => 30],
                ['name' => 'Pitch & Tone', 'points' => 25],
                ['name' => 'Stage Presence', 'points' => 20],
                ['name' => 'Song Interpretation', 'points' => 25],
            ]
        ],
        [
            'spot' => 3,
            'name' => 'Grand Finals',
            'description' => 'Free choice - show your best',
            'criteria' => [
                ['name' => 'Voice Quality', 'points' => 30],
                ['name' => 'Pitch & Tone', 'points' => 25],
                ['name' => 'Stage Presence', 'points' => 20],
                ['name' => 'Song Interpretation', 'points' => 25],
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

        echo " Round {$roundData['spot']}: {$roundData['name']} (4 criteria)\n";
    }

    // Create Judges
    $judgesData = [
        ['name' => 'Voice Coach Sarah', 'chair_number' => 1],
        ['name' => 'Music Producer Mike', 'chair_number' => 2],
        ['name' => 'Singer-Songwriter Ana', 'chair_number' => 3],
        ['name' => 'Vocal Trainer James', 'chair_number' => 4],
    ];

    foreach ($judgesData as $judgeData) {
        Judge::create([
            'event_id' => $event->id,
            'name' => $judgeData['name'],
            'chair_number' => $judgeData['chair_number'],
            'status' => 'active'
        ]);
    }

    echo " Created 4 judges\n";

    // Create Voting State
    VotingState::create([
        'event_id' => $event->id,
        'is_active' => false,
        'is_locked' => false,
        'active_round_id' => null,
    ]);

    DB::commit();

    echo "\n";
    echo " SUCCESS! TCC SOLO SINGING CONTEST 2025 setup complete!\n\n";
    echo " Summary:\n";
    echo "   - Event ID: {$event->id}\n";
    echo "   - Title: {$event->title}\n";
    echo "   - Participants: 8 solo singers (no gender separation)\n";
    echo "   - Judges: 4\n";
    echo "   - Rounds: 3\n";
    echo "   - Criteria per round: 4 (totaling 100 points)\n\n";
    echo " Access at: /admin?event_id={$event->id}\n\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\n ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
