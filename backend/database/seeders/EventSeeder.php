<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventDay;
use App\Models\EventResult;
use App\Models\EventOverallWinner;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        // Create Intramurals 2024 Event
        $event2024 = Event::create([
            'title' => 'Intramurals 2024 - Unity in Diversity',
            'year' => 2024,
            'status' => 'archived',
            'start_date' => '2024-10-15',
            'end_date' => '2024-10-20',
        ]);

        // Create event days
        $days = [
            ['day_number' => 1, 'title' => 'Battle of the Bands'],
            ['day_number' => 2, 'title' => 'Best in Swimsuit'],
            ['day_number' => 3, 'title' => 'Best in Evening Gown'],
            ['day_number' => 4, 'title' => 'Best in Talent'],
            ['day_number' => 5, 'title' => 'Final Question & Answer'],
        ];

        foreach ($days as $day) {
            EventDay::create([
                'event_id' => $event2024->id,
                'day_number' => $day['day_number'],
                'title' => $day['title'],
            ]);
        }

        // Get day IDs
        $bandsDay = $event2024->days()->where('title', 'Battle of the Bands')->first();
        $swimsuitDay = $event2024->days()->where('title', 'Best in Swimsuit')->first();
        $gownDay = $event2024->days()->where('title', 'Best in Evening Gown')->first();
        $talentDay = $event2024->days()->where('title', 'Best in Talent')->first();
        $qaDay = $event2024->days()->where('title', 'Final Question & Answer')->first();

        // Create results for Battle of the Bands
        $bandsParticipants = [
            ['name' => 'The Rockstars', 'college' => 'BSIT', 'rank' => 1, 'score' => 98.5],
            ['name' => 'Harmony Crew', 'college' => 'BSED', 'rank' => 2, 'score' => 96.2],
            ['name' => 'Beat Masters', 'college' => 'HM', 'rank' => 3, 'score' => 94.8],
            ['name' => 'Sound Wave', 'college' => 'CHM', 'rank' => 4, 'score' => 92.5],
            ['name' => 'Echo Band', 'college' => 'HED', 'rank' => 5, 'score' => 90.3],
        ];

        foreach ($bandsParticipants as $participant) {
            EventResult::create([
                'event_id' => $event2024->id,
                'event_day_id' => $bandsDay->id,
                'category' => 'Battle of the Bands',
                'rank' => $participant['rank'],
                'participant_name' => $participant['name'],
                'college' => $participant['college'],
                'score' => $participant['score'],
            ]);
        }

        // Create results for Best in Swimsuit
        $swimsuitParticipants = [
            ['name' => 'Maria Santos', 'college' => 'BSIT', 'rank' => 1, 'score' => 96.5],
            ['name' => 'Anna Cruz', 'college' => 'BSED', 'rank' => 2, 'score' => 93.2],
            ['name' => 'Lea Garcia', 'college' => 'HM', 'rank' => 3, 'score' => 91.8],
            ['name' => 'Sofia Reyes', 'college' => 'CHM', 'rank' => 4, 'score' => 89.5],
            ['name' => 'Isabella Torres', 'college' => 'HED', 'rank' => 5, 'score' => 87.3],
            ['name' => 'Camila Flores', 'college' => 'BSET', 'rank' => 6, 'score' => 85.1],
        ];

        foreach ($swimsuitParticipants as $participant) {
            EventResult::create([
                'event_id' => $event2024->id,
                'event_day_id' => $swimsuitDay->id,
                'category' => 'Best in Swimsuit',
                'rank' => $participant['rank'],
                'participant_name' => $participant['name'],
                'college' => $participant['college'],
                'score' => $participant['score'],
            ]);
        }

        // Create results for Best in Evening Gown
        $gownParticipants = [
            ['name' => 'Sarah Johnson', 'college' => 'HED', 'rank' => 1, 'score' => 94.3],
            ['name' => 'Emma Wilson', 'college' => 'CHM', 'rank' => 2, 'score' => 92.1],
            ['name' => 'Olivia Brown', 'college' => 'BSET', 'rank' => 3, 'score' => 90.7],
            ['name' => 'Mia Davis', 'college' => 'BSIT', 'rank' => 4, 'score' => 88.9],
            ['name' => 'Ava Martinez', 'college' => 'BSED', 'rank' => 5, 'score' => 86.4],
        ];

        foreach ($gownParticipants as $participant) {
            EventResult::create([
                'event_id' => $event2024->id,
                'event_day_id' => $gownDay->id,
                'category' => 'Best in Evening Gown',
                'rank' => $participant['rank'],
                'participant_name' => $participant['name'],
                'college' => $participant['college'],
                'score' => $participant['score'],
            ]);
        }

        // Create results for Best in Talent
        $talentParticipants = [
            ['name' => 'Jessica Lee', 'college' => 'BSED', 'rank' => 1, 'score' => 97.8],
            ['name' => 'Rachel Kim', 'college' => 'BSIT', 'rank' => 2, 'score' => 95.4],
            ['name' => 'Sophie Chen', 'college' => 'VDC', 'rank' => 3, 'score' => 93.5],
            ['name' => 'Lily Anderson', 'college' => 'HM', 'rank' => 4, 'score' => 91.2],
            ['name' => 'Grace Taylor', 'college' => 'CHM', 'rank' => 5, 'score' => 89.7],
            ['name' => 'Chloe White', 'college' => 'HED', 'rank' => 6, 'score' => 87.5],
            ['name' => 'Zoe Harris', 'college' => 'BSET', 'rank' => 7, 'score' => 85.3],
        ];

        foreach ($talentParticipants as $participant) {
            EventResult::create([
                'event_id' => $event2024->id,
                'event_day_id' => $talentDay->id,
                'category' => 'Best in Talent',
                'rank' => $participant['rank'],
                'participant_name' => $participant['name'],
                'college' => $participant['college'],
                'score' => $participant['score'],
            ]);
        }

        // Create results for Final Q&A
        $qaParticipants = [
            ['name' => 'Maria Santos', 'college' => 'BSIT', 'rank' => 1, 'score' => 98.2],
            ['name' => 'Jessica Lee', 'college' => 'BSED', 'rank' => 2, 'score' => 96.8],
            ['name' => 'Sarah Johnson', 'college' => 'HED', 'rank' => 3, 'score' => 95.1],
            ['name' => 'Emma Wilson', 'college' => 'CHM', 'rank' => 4, 'score' => 93.5],
        ];

        foreach ($qaParticipants as $participant) {
            EventResult::create([
                'event_id' => $event2024->id,
                'event_day_id' => $qaDay->id,
                'category' => 'Final Question & Answer',
                'rank' => $participant['rank'],
                'participant_name' => $participant['name'],
                'college' => $participant['college'],
                'score' => $participant['score'],
            ]);
        }

        // Create overall winner
        EventOverallWinner::create([
            'event_id' => $event2024->id,
            'title' => 'Overall Winner',
            'winner_name' => 'Maria Santos',
            'college' => 'BSIT',
            'year_level' => '2nd Year',
        ]);

        // Create Intramurals 2023 Event
        $event2023 = Event::create([
            'title' => 'Intramurals 2023 - Stronger Together',
            'year' => 2023,
            'status' => 'archived',
            'start_date' => '2023-10-10',
            'end_date' => '2023-10-15',
        ]);

        // Create event days for 2023
        $days2023 = [
            ['day_number' => 1, 'title' => 'Opening Ceremony'],
            ['day_number' => 2, 'title' => 'Talent Competition'],
            ['day_number' => 3, 'title' => 'Evening Gown'],
            ['day_number' => 4, 'title' => 'Finals Night'],
        ];

        foreach ($days2023 as $day) {
            EventDay::create([
                'event_id' => $event2023->id,
                'day_number' => $day['day_number'],
                'title' => $day['title'],
            ]);
        }

        $talentDay2023 = $event2023->days()->where('title', 'Talent Competition')->first();

        // Add some results for 2023
        EventResult::create([
            'event_id' => $event2023->id,
            'event_day_id' => $talentDay2023->id,
            'category' => 'Best in Talent',
            'rank' => 1,
            'participant_name' => 'John Doe',
            'college' => 'BSIT',
            'score' => 95.5,
        ]);

        EventResult::create([
            'event_id' => $event2023->id,
            'event_day_id' => $talentDay2023->id,
            'category' => 'Best in Talent',
            'rank' => 2,
            'participant_name' => 'Jane Smith',
            'college' => 'BSED',
            'score' => 93.0,
        ]);

        EventOverallWinner::create([
            'event_id' => $event2023->id,
            'title' => 'Overall Winner',
            'winner_name' => 'John Doe',
            'college' => 'BSIT',
            'year_level' => '3rd Year',
        ]);

        // Create an active event (Intramurals 2025)
        $event2025 = Event::create([
            'title' => 'Intramurals 2025',
            'year' => 2025,
            'status' => 'active',
        ]);

        $days2025 = [
            ['day_number' => 1, 'title' => 'Battle of the Bands'],
            ['day_number' => 2, 'title' => 'Ms. Gay'],
            ['day_number' => 3, 'title' => 'Mr. and Miss TCC'],
            ['day_number' => 4, 'title' => 'Dance Competition'],
            ['day_number' => 5, 'title' => 'Other Events'],
        ];

        foreach ($days2025 as $day) {
            EventDay::create([
                'event_id' => $event2025->id,
                'day_number' => $day['day_number'],
                'title' => $day['title'],
            ]);
        }

        $this->command->info('✅ Event seeder completed successfully!');
        $this->command->info('📊 Created 3 events (2 archived, 1 active)');
        $this->command->info('🏆 Created sample results and winners');
    }
}
