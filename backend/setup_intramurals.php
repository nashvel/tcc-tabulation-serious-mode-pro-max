<?php

/**
 * TCC INTRAMURALS 2025 Event Setup Script
 * Run this file to create the complete event with all data
 * 
 * Usage: php setup_intramurals_2025.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Event;
use App\Models\EventDay;
use App\Models\EventImportantPerson;
use App\Models\Candidate;
use App\Models\CandidatePartnership;
use App\Models\Round;
use App\Models\Criteria;
use App\Models\EventSequence;
use App\Models\Judge;
use Illuminate\Support\Facades\DB;

try {
    echo " Setting up TCC INTRAMURALS 2025...\n\n";

    // Delete existing event with id = 1 if exists
    Event::where('id', 1)->delete();
    DB::statement('ALTER TABLE events AUTO_INCREMENT = 1');
    
    DB::beginTransaction();

    // Create the main event
    $event = Event::create([
        'id' => 1,
        'unique_id' => 'evt_tcc_intramurals_2025',
        'title' => 'TCC INTRAMURALS 2025',
        'year' => 2025,
        'event_date' => '2025-03-15', // Set your actual event date
        'description' => 'TCC Intramurals 2025 - Mr and Miss Competition',
        'event_type' => 'pageant',
        'number_of_judges' => 5,
        'status' => 'active'
    ]);

    echo " Event created: {$event->title} (ID: {$event->id})\n";

    // Create Event Day
    $eventDay = EventDay::create([
        'event_id' => $event->id,
        'day_number' => 1,
        'title' => 'MR AND MISS',
        'event_type' => 'pageant',
        'participant_type' => 'duo'
    ]);

    echo " Event Day created: {$eventDay->title}\n";

    // Add Important Person
    EventImportantPerson::create([
        'event_id' => $event->id,
        'position' => 'Director',
        'name' => 'Reche Osma-Tan'
    ]);

    echo " Important Person added: Director - Reche Osma-Tan\n";

    // Create Candidates (Pairs)
    // Note: Partner data is now stored in candidate_partnerships table (normalized)
    $candidatesData = [
        // Pair 1
        [
            'event_id' => $event->id,
            'number' => 1,
            'name' => 'ZUSMITHA SHEN ITUM',
            'gender' => 'Female',
            'department' => 'College of Criminal Justice and Public Safety',
            'order' => 1
        ],
        [
            'event_id' => $event->id,
            'number' => 1,
            'name' => 'GLENT TOMONGLAY',
            'gender' => 'Male',
            'department' => 'College of Criminal Justice and Public Safety',
            'order' => 2
        ],
        
        // Pair 2
        [
            'event_id' => $event->id,
            'number' => 2,
            'name' => 'RAINE MARSHA NICE CABĒLTES',
            'gender' => 'Female',
            'department' => 'College of Midwifery',
            'order' => 3
        ],
        [
            'event_id' => $event->id,
            'number' => 2,
            'name' => 'JOHN VINCENT CANPALAN',
            'gender' => 'Male',
            'department' => 'College of Midwifery',
            'order' => 4
        ],
        
        // Pair 3
        [
            'event_id' => $event->id,
            'number' => 3,
            'name' => 'JEAN CLIAR COLETA',
            'gender' => 'Female',
            'department' => 'College of Library Information Science',
            'order' => 5
        ],
        [
            'event_id' => $event->id,
            'number' => 3,
            'name' => 'KHEM HARVEY BRIGOLE',
            'gender' => 'Male',
            'department' => 'College of Library Information Science',
            'order' => 6
        ],
        
        // Pair 4
        [
            'event_id' => $event->id,
            'number' => 4,
            'name' => 'JEAN MARIE ALFEREZ',
            'gender' => 'Female',
            'department' => 'College of Hospitality Management and Tourism',
            'order' => 7
        ],
        [
            'event_id' => $event->id,
            'number' => 4,
            'name' => 'RALPH SHEM BARAGUIR',
            'gender' => 'Male',
            'department' => 'College of Hospitality Management and Tourism',
            'order' => 8
        ],
        
        // Pair 5
        [
            'event_id' => $event->id,
            'number' => 5,
            'name' => 'ANGELICA JEAN MAGNO',
            'gender' => 'Female',
            'department' => 'College of Business Administration',
            'order' => 9
        ],
        [
            'event_id' => $event->id,
            'number' => 5,
            'name' => 'MARK ZEDRICK MAGHANOY',
            'gender' => 'Male',
            'department' => 'College of Business Administration',
            'order' => 10
        ],
        
        // Pair 6
        [
            'event_id' => $event->id,
            'number' => 6,
            'name' => 'RIENA KHATELEEN GONZAGA',
            'gender' => 'Female',
            'department' => 'College of Information Technology',
            'order' => 11
        ],
        [
            'event_id' => $event->id,
            'number' => 6,
            'name' => 'MARC LESTER BONGALING',
            'gender' => 'Male',
            'department' => 'College of Information Technology',
            'order' => 12
        ],
        
        // Pair 7
        [
            'event_id' => $event->id,
            'number' => 7,
            'name' => 'KRIZZA MAE PATENIO',
            'gender' => 'Female',
            'department' => 'College of Teacher Education',
            'order' => 13
        ],
        [
            'event_id' => $event->id,
            'number' => 7,
            'name' => 'VINCENT NOAH CAINGLET',
            'gender' => 'Male',
            'department' => 'College of Teacher Education',
            'order' => 14
        ],
        
        // Pair 8
        [
            'event_id' => $event->id,
            'number' => 8,
            'name' => 'JOHN NICOLE BASARTE',
            'gender' => 'Female',
            'department' => 'College of Arts and Sciences',
            'order' => 15
        ],
        [
            'event_id' => $event->id,
            'number' => 8,
            'name' => 'JERVIE PAUL SINAG',
            'gender' => 'Male',
            'department' => 'College of Arts and Sciences',
            'order' => 16
        ],
    ];

    // Store candidates with their IDs for partnership creation
    $candidates = [];
    foreach ($candidatesData as $candidateData) {
        $candidates[] = Candidate::create($candidateData);
    }

    echo " Created 16 candidates (8 pairs)\n";

    // Create partnerships (normalized data)
    // Pair 1
    CandidatePartnership::create([
        'candidate_id' => $candidates[0]->id, // ZUSMITHA SHEN ITUM
        'partner_number' => 1,
        'partner_name' => 'GLENT TOMONGLAY',
        'partner_gender' => 'Male',
    ]);
    CandidatePartnership::create([
        'candidate_id' => $candidates[1]->id, // GLENT TOMONGLAY
        'partner_number' => 1,
        'partner_name' => 'ZUSMITHA SHEN ITUM',
        'partner_gender' => 'Female',
    ]);

    // Pair 2
    CandidatePartnership::create([
        'candidate_id' => $candidates[2]->id, // RAINE MARSHA NICE CABĒLTES
        'partner_number' => 2,
        'partner_name' => 'JOHN VINCENT CANPALAN',
        'partner_gender' => 'Male',
    ]);
    CandidatePartnership::create([
        'candidate_id' => $candidates[3]->id, // JOHN VINCENT CANPALAN
        'partner_number' => 2,
        'partner_name' => 'RAINE MARSHA NICE CABĒLTES',
        'partner_gender' => 'Female',
    ]);

    // Pair 3
    CandidatePartnership::create([
        'candidate_id' => $candidates[4]->id, // JEAN CLIAR COLETA
        'partner_number' => 3,
        'partner_name' => 'KHEM HARVEY BRIGOLE',
        'partner_gender' => 'Male',
    ]);
    CandidatePartnership::create([
        'candidate_id' => $candidates[5]->id, // KHEM HARVEY BRIGOLE
        'partner_number' => 3,
        'partner_name' => 'JEAN CLIAR COLETA',
        'partner_gender' => 'Female',
    ]);

    // Pair 4
    CandidatePartnership::create([
        'candidate_id' => $candidates[6]->id, // JEAN MARIE ALFEREZ
        'partner_number' => 4,
        'partner_name' => 'RALPH SHEM BARAGUIR',
        'partner_gender' => 'Male',
    ]);
    CandidatePartnership::create([
        'candidate_id' => $candidates[7]->id, // RALPH SHEM BARAGUIR
        'partner_number' => 4,
        'partner_name' => 'JEAN MARIE ALFEREZ',
        'partner_gender' => 'Female',
    ]);

    // Pair 5
    CandidatePartnership::create([
        'candidate_id' => $candidates[8]->id, // ANGELICA JEAN MAGNO
        'partner_number' => 5,
        'partner_name' => 'MARK ZEDRICK MAGHANOY',
        'partner_gender' => 'Male',
    ]);
    CandidatePartnership::create([
        'candidate_id' => $candidates[9]->id, // MARK ZEDRICK MAGHANOY
        'partner_number' => 5,
        'partner_name' => 'ANGELICA JEAN MAGNO',
        'partner_gender' => 'Female',
    ]);

    // Pair 6
    CandidatePartnership::create([
        'candidate_id' => $candidates[10]->id, // RIENA KHATELEEN GONZAGA
        'partner_number' => 6,
        'partner_name' => 'MARC LESTER BONGALING',
        'partner_gender' => 'Male',
    ]);
    CandidatePartnership::create([
        'candidate_id' => $candidates[11]->id, // MARC LESTER BONGALING
        'partner_number' => 6,
        'partner_name' => 'RIENA KHATELEEN GONZAGA',
        'partner_gender' => 'Female',
    ]);

    // Pair 7
    CandidatePartnership::create([
        'candidate_id' => $candidates[12]->id, // KRIZZA MAE PATENIO
        'partner_number' => 7,
        'partner_name' => 'VINCENT NOAH CAINGLET',
        'partner_gender' => 'Male',
    ]);
    CandidatePartnership::create([
        'candidate_id' => $candidates[13]->id, // VINCENT NOAH CAINGLET
        'partner_number' => 7,
        'partner_name' => 'KRIZZA MAE PATENIO',
        'partner_gender' => 'Female',
    ]);

    // Pair 8
    CandidatePartnership::create([
        'candidate_id' => $candidates[14]->id, // JOHN NICOLE BASARTE
        'partner_number' => 8,
        'partner_name' => 'JERVIE PAUL SINAG',
        'partner_gender' => 'Male',
    ]);
    CandidatePartnership::create([
        'candidate_id' => $candidates[15]->id, // JERVIE PAUL SINAG
        'partner_number' => 8,
        'partner_name' => 'JOHN NICOLE BASARTE',
        'partner_gender' => 'Female',
    ]);

    echo " Created 16 candidate partnerships (8 pairs)\n";

    // Create Rounds with Criteria
    
    // Round 1: Closed-Door Panel Interview
    $round1 = Round::create([
        'event_id' => $event->id,
        'spot' => 1,
        'name' => 'Closed-Door Panel Interview',
        'description' => 'Private interview with panel of judges'
    ]);

    $criteria1 = [
        ['name' => 'Substance of the Answer', 'points' => 35],
        ['name' => 'Spontaneous and Confidence in Speaking', 'points' => 20],
        ['name' => 'Poise and Bearing', 'points' => 15],
        ['name' => 'Beauty', 'points' => 30],
    ];

    foreach ($criteria1 as $crit) {
        Criteria::create([
            'event_id' => $event->id,
            'round_id' => $round1->id,
            'name' => $crit['name'],
            'points' => $crit['points']
        ]);
    }

    echo " Round 1: Closed-Door Panel Interview (4 criteria)\n";

    // Round 2: Sports Attire
    $round2 = Round::create([
        'event_id' => $event->id,
        'spot' => 2,
        'name' => 'Sports Attire',
        'description' => 'Active wear presentation'
    ]);

    $criteria2 = [
        ['name' => 'Attire and Carriage, Personality', 'points' => 35],
        ['name' => 'Poise and Bearing', 'points' => 20],
        ['name' => 'Mastery', 'points' => 20],
        ['name' => 'Beauty of Face', 'points' => 25],
    ];

    foreach ($criteria2 as $crit) {
        Criteria::create([
            'event_id' => $event->id,
            'round_id' => $round2->id,
            'name' => $crit['name'],
            'points' => $crit['points']
        ]);
    }

    echo " Round 2: Sports Attire (4 criteria)\n";

    // Round 3: Swim Wear
    $round3 = Round::create([
        'event_id' => $event->id,
        'spot' => 3,
        'name' => 'Swim Wear',
        'description' => 'Swimsuit competition'
    ]);

    $criteria3 = [
        ['name' => 'Confidence', 'points' => 25],
        ['name' => 'Stage Presence', 'points' => 20],
        ['name' => 'Physical Presence', 'points' => 30],
        ['name' => 'Beauty', 'points' => 25],
    ];

    foreach ($criteria3 as $crit) {
        Criteria::create([
            'event_id' => $event->id,
            'round_id' => $round3->id,
            'name' => $crit['name'],
            'points' => $crit['points']
        ]);
    }

    echo " Round 3: Swim Wear (4 criteria)\n";

    // Round 4: Gown and Formal Attire
    $round4 = Round::create([
        'event_id' => $event->id,
        'spot' => 4,
        'name' => 'Gown and Formal Attire',
        'description' => 'Evening gown presentation'
    ]);

    $criteria4 = [
        ['name' => 'Poise and Bearing', 'points' => 30],
        ['name' => 'Design and Fitting', 'points' => 25],
        ['name' => 'Stage Deportment', 'points' => 15],
        ['name' => 'Facial Appearance', 'points' => 20],
    ];

    foreach ($criteria4 as $crit) {
        Criteria::create([
            'event_id' => $event->id,
            'round_id' => $round4->id,
            'name' => $crit['name'],
            'points' => $crit['points']
        ]);
    }

    echo " Round 4: Gown and Formal Attire (4 criteria)\n";

    // Round 5: Final Round (Q&A)
    $round5 = Round::create([
        'event_id' => $event->id,
        'spot' => 5,
        'name' => 'Final Round',
        'description' => 'Final question and answer'
    ]);

    $criteria5 = [
        ['name' => 'Substance of the Answer', 'points' => 35],
        ['name' => 'Confidence in Answering', 'points' => 20],
        ['name' => 'Beauty and Personality', 'points' => 35],
        ['name' => 'Poise and Bearing', 'points' => 10],
    ];

    foreach ($criteria5 as $crit) {
        Criteria::create([
            'event_id' => $event->id,
            'round_id' => $round5->id,
            'name' => $crit['name'],
            'points' => $crit['points']
        ]);
    }

    echo " Round 5: Final Round (4 criteria)\n";

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

    EventSequence::create([
        'event_id' => $event->id,
        'round_id' => $round4->id,
        'order' => 4
    ]);

    EventSequence::create([
        'event_id' => $event->id,
        'round_id' => $round5->id,
        'order' => 5
    ]);

    echo " Event Sequence: 5 rounds ordered\n";

    // Create Judges
    $judgesData = [
        ['name' => 'Judge 1', 'chair_number' => 1],
        ['name' => 'Judge 2', 'chair_number' => 2],
        ['name' => 'Judge 3', 'chair_number' => 3],
        ['name' => 'Judge 4', 'chair_number' => 4],
        ['name' => 'Judge 5', 'chair_number' => 5],
        ['name' => 'Judge 6', 'chair_number' => 6],
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

    DB::commit();

    echo "\n";
    echo " SUCCESS! TCC INTRAMURALS 2025 setup complete!\n\n";
    echo " Summary:\n";
    echo "   - Event ID: {$event->id}\n";
    echo "   - Unique ID: {$event->unique_id}\n";
    echo "   - Title: {$event->title}\n";
    echo "   - Event Date: {$event->event_date}\n";
    echo "   - Description: {$event->description}\n";
    echo "   - Event Type: {$event->event_type}\n";
    echo "   - Number of Judges: {$event->number_of_judges}\n";
    echo "   - Event Days: 1 (MR AND MISS - Duo Pageant)\n";
    echo "   - Candidates: 16 (8 pairs)\n";
    echo "   - Judges: 5\n";
    echo "   - Rounds: 5\n";
    echo "   - Total Criteria: 20\n";
    echo "   - Important People: 1\n";
    echo "   - Status: {$event->status}\n\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\n ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
