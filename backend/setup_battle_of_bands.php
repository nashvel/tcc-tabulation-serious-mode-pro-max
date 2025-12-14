<?php

/**
 * TCC BATTLE OF THE BANDS 2025 Event Setup Script
 * Run this file to create the complete event with all data
 * 
 * Usage: php setup_battle_of_bands.php
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
    echo " Setting up TCC BATTLE OF THE BANDS 2025...\n\n";

    // Find next available ID
    $maxId = Event::max('id') ?? 0;
    $newId = $maxId + 1;
    
    DB::beginTransaction();

    // Create the Battle of the Bands event
    $event = Event::create([
        'unique_id' => 'evt_battle_bands_' . time(),
        'title' => 'TCC Battle of the Bands 2025',
        'year' => 2025,
        'event_date' => now()->addDays(30)->format('Y-m-d'),
        'description' => 'Annual inter-department band competition showcasing musical talent',
        'event_type' => 'competition',
        'number_of_judges' => 5,
        'status' => 'active'
    ]);

    echo " Event created: {$event->title} (ID: {$event->id})\n";

    // Create Event Day
    $eventDay = EventDay::create([
        'event_id' => $event->id,
        'day_number' => 1,
        'title' => 'Battle of the Bands Finals',
        'event_type' => 'competition',
        'participant_type' => 'group'
    ]);

    echo " Event Day created: {$eventDay->title}\n";

    // Create bands as candidates
    $bands = [
        ['number' => 1, 'name' => 'The Syntax Errors', 'department' => 'BSIT'],
        ['number' => 2, 'name' => 'Null Pointer Exception', 'department' => 'BSCS'],
        ['number' => 3, 'name' => 'The Accountants', 'department' => 'BSBA'],
        ['number' => 4, 'name' => 'Education Nation', 'department' => 'BSED'],
        ['number' => 5, 'name' => 'Hospitality Rockers', 'department' => 'BSHM'],
        ['number' => 6, 'name' => 'Criminal Minds', 'department' => 'BSCRIM'],
    ];

    foreach ($bands as $band) {
        Candidate::create([
            'event_id' => $event->id,
            'number' => $band['number'],
            'name' => $band['name'] . ' (5 members)',
            'gender' => 'Group',
            'department' => $band['department'],
            'participant_type' => 'group',
            'order' => $band['number'],
        ]);
    }

    echo " Created 6 bands\n";

    // Create Rounds with Criteria
    $roundsData = [
        [
            'spot' => 1,
            'name' => 'Original Composition',
            'description' => 'Perform an original song written by the band',
            'criteria' => [
                ['name' => 'Musicality', 'points' => 25],
                ['name' => 'Stage Presence', 'points' => 20],
                ['name' => 'Creativity/Originality', 'points' => 20],
                ['name' => 'Technical Skill', 'points' => 20],
                ['name' => 'Audience Impact', 'points' => 15],
            ]
        ],
        [
            'spot' => 2,
            'name' => 'Cover Song',
            'description' => 'Perform a cover of a popular song',
            'criteria' => [
                ['name' => 'Musicality', 'points' => 25],
                ['name' => 'Stage Presence', 'points' => 20],
                ['name' => 'Creativity/Originality', 'points' => 20],
                ['name' => 'Technical Skill', 'points' => 20],
                ['name' => 'Audience Impact', 'points' => 15],
            ]
        ],
        [
            'spot' => 3,
            'name' => 'Final Performance',
            'description' => 'Final showcase performance',
            'criteria' => [
                ['name' => 'Musicality', 'points' => 25],
                ['name' => 'Stage Presence', 'points' => 20],
                ['name' => 'Creativity/Originality', 'points' => 20],
                ['name' => 'Technical Skill', 'points' => 20],
                ['name' => 'Audience Impact', 'points' => 15],
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

        // Create Event Sequence
        EventSequence::create([
            'event_id' => $event->id,
            'round_id' => $round->id,
            'order' => $roundData['spot']
        ]);

        echo " Round {$roundData['spot']}: {$roundData['name']} (5 criteria)\n";
    }

    // Create Judges
    $judgesData = [
        ['name' => 'Prof. Music Director', 'chair_number' => 1],
        ['name' => 'Local Band Manager', 'chair_number' => 2],
        ['name' => 'Radio DJ', 'chair_number' => 3],
        ['name' => 'Recording Artist', 'chair_number' => 4],
        ['name' => 'Music Teacher', 'chair_number' => 5],
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

    echo " Voting state initialized\n";

    DB::commit();

    echo "\n";
    echo " SUCCESS! TCC BATTLE OF THE BANDS 2025 setup complete!\n\n";
    echo " Summary:\n";
    echo "   - Event ID: {$event->id}\n";
    echo "   - Unique ID: {$event->unique_id}\n";
    echo "   - Title: {$event->title}\n";
    echo "   - Event Date: {$event->event_date}\n";
    echo "   - Event Type: {$event->event_type}\n";
    echo "   - Bands: 6 (each with 5 members)\n";
    echo "   - Judges: 5\n";
    echo "   - Rounds: 3\n";
    echo "   - Criteria per round: 5 (totaling 100 points)\n";
    echo "   - Status: {$event->status}\n\n";
    echo " Access at: /setup (select from existing events)\n";
    echo " Or directly: /admin?event_id={$event->id}\n\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\n ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}


    // Create bands as candidates
    $bands = [
        [
            'number' => 1,
            'name' => 'The Syntax Errors',
            'department' => 'BSIT',
            'members' => 'John (Lead Vocals), Mike (Guitar), Sarah (Bass), Tom (Drums), Lisa (Keyboard)',
        ],
        [
            'number' => 2,
            'name' => 'Null Pointer Exception',
            'department' => 'BSCS',
            'members' => 'Alex (Lead Vocals), Chris (Guitar), Pat (Bass), Jordan (Drums), Sam (Keyboard)',
        ],
        [
            'number' => 3,
            'name' => 'The Accountants',
            'department' => 'BSBA',
            'members' => 'Maria (Lead Vocals), Jose (Guitar), Ana (Bass), Pedro (Drums), Rosa (Keyboard)',
        ],
        [
            'number' => 4,
            'name' => 'Education Nation',
            'department' => 'BSED',
            'members' => 'Teacher A (Lead Vocals), Teacher B (Guitar), Teacher C (Bass), Teacher D (Drums), Teacher E (Keyboard)',
        ],
        [
            'number' => 5,
            'name' => 'Hospitality Rockers',
            'department' => 'BSHM',
            'members' => 'Chef (Lead Vocals), Barista (Guitar), Concierge (Bass), Bellhop (Drums), Manager (Keyboard)',
        ],
        [
            'number' => 6,
            'name' => 'Criminal Minds',
            'department' => 'BSCRIM',
            'members' => 'Detective (Lead Vocals), Officer (Guitar), Forensic (Bass), Investigator (Drums), Analyst (Keyboard)',
        ],
    ];

    foreach ($bands as $band) {
        Candidate::create([
            'event_id' => $event->id,
            'number' => $band['number'],
            'name' => $band['name'] . ' (5 members)',
            'gender' => 'Group',
            'department' => $band['department'],
            'participant_type' => 'group',
            'order' => $band['number'],
        ]);
    }

    echo " Created 6 bands\n";

    // Create Rounds with Criteria
    
    // Round 1: Original Composition
    $round1 = Round::create([
        'event_id' => $event->id,
        'spot' => 1,
        'name' => 'Original Composition',
        'description' => 'Perform an original song written by the band'
    ]);

    $criteria1 = [
        ['name' => 'Musicality', 'points' => 25],
        ['name' => 'Stage Presence', 'points' => 20],
        ['name' => 'Creativity/Originality', 'points' => 20],
        ['name' => 'Technical Skill', 'points' => 20],
        ['name' => 'Audience Impact', 'points' => 15],
    ];

    foreach ($criteria1 as $crit) {
        Criteria::create([
            'event_id' => $event->id,
            'round_id' => $round1->id,
            'name' => $crit['name'],
            'points' => $crit['points']
        ]);
    }

    echo " Round 1: Original Composition (5 criteria)\n";

    // Round 2: Cover Song
    $round2 = Round::create([
        'event_id' => $event->id,
        'spot' => 2,
        'name' => 'Cover Song',
        'description' => 'Perform a cover of a popular song'
    ]);

    $criteria2 = [
        ['name' => 'Musicality', 'points' => 25],
        ['name' => 'Stage Presence', 'points' => 20],
        ['name' => 'Creativity/Originality', 'points' => 20],
        ['name' => 'Technical Skill', 'points' => 20],
        ['name' => 'Audience Impact', 'points' => 15],
    ];

    foreach ($criteria2 as $crit) {
        Criteria::create([
            'event_id' => $event->id,
            'round_id' => $round2->id,
            'name' => $crit['name'],
            'points' => $crit['points']
        ]);
    }

    echo " Round 2: Cover Song (5 criteria)\n";

    // Round 3: Final Performance
    $round3 = Round::create([
        'event_id' => $event->id,
        'spot' => 3,
        'name' => 'Final Performance',
        'description' => 'Final showcase performance'
    ]);

    $criteria3 = [
        ['name' => 'Musicality', 'points' => 25],
        ['name' => 'Stage Presence', 'points' => 20],
        ['name' => 'Creativity/Originality', 'points' => 20],
        ['name' => 'Technical Skill', 'points' => 20],
        ['name' => 'Audience Impact', 'points' => 15],
    ];

    foreach ($criteria3 as $crit) {
        Criteria::create([
            'event_id' => $event->id,
            'round_id' => $round3->id,
            'name' => $crit['name'],
            'points' => $crit['points']
        ]);
    }

    echo " Round 3: Final Performance (5 criteria)\n";


    // Create Event Sequence (order of rounds)
    EventSequence::create([
        'event_id' => $event->id,
        'round_id' => $round1->id,
        'order' => 1
    ]);

    EventSequence::create([
        'event_id' => $event->id,
        'round_id' => $round2->id,
        'order' => 2
    ]);

    EventSequence::create([
        'event_id' => $event->id,
        'round_id' => $round3->id,
        'order' => 3
    ]);

    echo " Event Sequence: 3 rounds ordered\n";

    // Create Judges
    $judgesData = [
        ['name' => 'Prof. Music Director', 'chair_number' => 1],
        ['name' => 'Local Band Manager', 'chair_number' => 2],
        ['name' => 'Radio DJ', 'chair_number' => 3],
        ['name' => 'Recording Artist', 'chair_number' => 4],
        ['name' => 'Music Teacher', 'chair_number' => 5],
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

    echo " Voting state initialized\n";

    DB::commit();

    echo "\n";
    echo " SUCCESS! TCC BATTLE OF THE BANDS 2025 setup complete!\n\n";
    echo " Summary:\n";
    echo "   - Event ID: {$event->id}\n";
    echo "   - Unique ID: {$event->unique_id}\n";
    echo "   - Title: {$event->title}\n";
    echo "   - Event Date: {$event->event_date}\n";
    echo "   - Description: {$event->description}\n";
    echo "   - Event Type: {$event->event_type}\n";
    echo "   - Number of Judges: {$event->number_of_judges}\n";
    echo "   - Event Days: 1 (Battle of the Bands Finals - Group Competition)\n";
    echo "   - Bands: 6 (each with 5 members)\n";
    echo "   - Judges: 5\n";
    echo "   - Rounds: 3 (Original, Cover, Final)\n";
    echo "   - Criteria per round: 5 (totaling 100 points)\n";
    echo "   - Status: {$event->status}\n\n";
    echo " Access at: /admin?event_id={$event->id}\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\n ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
