<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EventTheme;
use App\Models\EventTemplate;
use App\Models\TemplateParticipant;
use App\Models\TemplateRound;
use App\Models\TemplateCriteria;

class ThemesAndTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        // Create Default Themes
        $themes = [
            [
                'name' => 'Default',
                'slug' => 'default',
                'description' => 'Clean and professional default theme',
                'primary_color' => '#4f46e5',
                'secondary_color' => '#818cf8',
                'accent_color' => '#c7d2fe',
                'background_type' => 'solid',
                'background_value' => '#ffffff',
                'font_family' => 'Inter',
                'header_style' => 'default',
                'is_system' => true,
            ],
            [
                'name' => 'Christmas',
                'slug' => 'christmas',
                'description' => 'Festive red and green Christmas theme',
                'primary_color' => '#dc2626',
                'secondary_color' => '#16a34a',
                'accent_color' => '#fef3c7',
                'background_type' => 'gradient',
                'background_value' => 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
                'font_family' => 'Inter',
                'header_style' => 'festive',
                'is_system' => true,
            ],
            [
                'name' => 'Halloween',
                'slug' => 'halloween',
                'description' => 'Spooky orange and purple Halloween theme',
                'primary_color' => '#f97316',
                'secondary_color' => '#7c3aed',
                'accent_color' => '#1f2937',
                'background_type' => 'gradient',
                'background_value' => 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                'font_family' => 'Inter',
                'header_style' => 'festive',
                'is_system' => true,
            ],

            [
                'name' => 'Elegant Gold',
                'slug' => 'elegant-gold',
                'description' => 'Sophisticated gold and black theme for formal events',
                'primary_color' => '#d4af37',
                'secondary_color' => '#b8860b',
                'accent_color' => '#fef3c7',
                'background_type' => 'gradient',
                'background_value' => 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                'font_family' => 'Playfair Display',
                'header_style' => 'minimal',
                'is_system' => true,
            ],
            [
                'name' => 'Ocean Blue',
                'slug' => 'ocean-blue',
                'description' => 'Calm blue ocean-inspired theme',
                'primary_color' => '#0ea5e9',
                'secondary_color' => '#06b6d4',
                'accent_color' => '#e0f2fe',
                'background_type' => 'gradient',
                'background_value' => 'linear-gradient(135deg, #0c4a6e 0%, #164e63 100%)',
                'font_family' => 'Inter',
                'header_style' => 'default',
                'is_system' => true,
            ],
            [
                'name' => 'Rose Pink',
                'slug' => 'rose-pink',
                'description' => 'Elegant pink theme perfect for pageants',
                'primary_color' => '#ec4899',
                'secondary_color' => '#f472b6',
                'accent_color' => '#fce7f3',
                'background_type' => 'gradient',
                'background_value' => 'linear-gradient(135deg, #831843 0%, #9d174d 100%)',
                'font_family' => 'Inter',
                'header_style' => 'default',
                'is_system' => true,
            ],
        ];

        foreach ($themes as $theme) {
            EventTheme::updateOrCreate(['slug' => $theme['slug']], $theme);
        }

        $defaultTheme = EventTheme::where('slug', 'default')->first();

        // Create Default Templates
        
        // 1. Mr. & Ms. Pageant Template
        $pageantTemplate = EventTemplate::updateOrCreate(
            ['slug' => 'mr-ms-pageant'],
            [
                'name' => 'Mr. & Ms. Pageant',
                'description' => 'Standard pageant with male and female candidates, multiple rounds',
                'event_type' => 'pageant',
                'default_judges' => 5,
                'default_theme_id' => $defaultTheme?->id,
                'is_system' => true,
            ]
        );

        // Pageant participants (10 male, 10 female)
        $pageantTemplate->participants()->delete();
        for ($i = 1; $i <= 10; $i++) {
            TemplateParticipant::create([
                'template_id' => $pageantTemplate->id,
                'number' => $i,
                'name' => "Candidate $i",
                'gender' => 'Female',
                'participant_type' => 'solo',
                'order' => $i,
            ]);
        }
        for ($i = 1; $i <= 10; $i++) {
            TemplateParticipant::create([
                'template_id' => $pageantTemplate->id,
                'number' => $i,
                'name' => "Candidate $i",
                'gender' => 'Male',
                'participant_type' => 'solo',
                'order' => $i + 10,
            ]);
        }

        // Pageant rounds
        $pageantTemplate->rounds()->delete();
        $pageantRounds = [
            ['spot' => 1, 'name' => 'Production Number', 'criteria' => [
                ['name' => 'Stage Presence', 'points' => 30],
                ['name' => 'Poise & Bearing', 'points' => 30],
                ['name' => 'Audience Impact', 'points' => 40],
            ]],
            ['spot' => 2, 'name' => 'Casual Wear', 'criteria' => [
                ['name' => 'Appropriateness', 'points' => 25],
                ['name' => 'Confidence', 'points' => 25],
                ['name' => 'Overall Appeal', 'points' => 50],
            ]],
            ['spot' => 3, 'name' => 'Formal Wear', 'criteria' => [
                ['name' => 'Elegance', 'points' => 30],
                ['name' => 'Poise & Bearing', 'points' => 30],
                ['name' => 'Overall Impact', 'points' => 40],
            ]],
            ['spot' => 4, 'name' => 'Question & Answer', 'criteria' => [
                ['name' => 'Content & Substance', 'points' => 40],
                ['name' => 'Delivery', 'points' => 30],
                ['name' => 'Wit & Spontaneity', 'points' => 30],
            ]],
        ];

        foreach ($pageantRounds as $roundData) {
            $round = TemplateRound::create([
                'template_id' => $pageantTemplate->id,
                'spot' => $roundData['spot'],
                'name' => $roundData['name'],
            ]);
            foreach ($roundData['criteria'] as $crit) {
                TemplateCriteria::create([
                    'template_round_id' => $round->id,
                    'name' => $crit['name'],
                    'points' => $crit['points'],
                ]);
            }
        }

        // 2. Solo Singing Contest Template
        $singingTemplate = EventTemplate::updateOrCreate(
            ['slug' => 'solo-singing-contest'],
            [
                'name' => 'Solo Singing Contest',
                'description' => 'Individual singing competition with elimination rounds',
                'event_type' => 'solo_contest',
                'default_judges' => 4,
                'default_theme_id' => $defaultTheme?->id,
                'is_system' => true,
            ]
        );

        $singingTemplate->participants()->delete();
        for ($i = 1; $i <= 12; $i++) {
            TemplateParticipant::create([
                'template_id' => $singingTemplate->id,
                'number' => $i,
                'name' => "Singer $i",
                'gender' => 'Solo',
                'participant_type' => 'solo',
                'order' => $i,
            ]);
        }

        $singingTemplate->rounds()->delete();
        $singingRounds = [
            ['spot' => 1, 'name' => 'Elimination Round', 'criteria' => [
                ['name' => 'Voice Quality', 'points' => 30],
                ['name' => 'Pitch & Tone', 'points' => 25],
                ['name' => 'Stage Presence', 'points' => 20],
                ['name' => 'Song Interpretation', 'points' => 25],
            ]],
            ['spot' => 2, 'name' => 'Semi-Finals', 'criteria' => [
                ['name' => 'Voice Quality', 'points' => 30],
                ['name' => 'Pitch & Tone', 'points' => 25],
                ['name' => 'Stage Presence', 'points' => 20],
                ['name' => 'Song Interpretation', 'points' => 25],
            ]],
            ['spot' => 3, 'name' => 'Grand Finals', 'criteria' => [
                ['name' => 'Voice Quality', 'points' => 30],
                ['name' => 'Pitch & Tone', 'points' => 25],
                ['name' => 'Stage Presence', 'points' => 20],
                ['name' => 'Song Interpretation', 'points' => 25],
            ]],
        ];

        foreach ($singingRounds as $roundData) {
            $round = TemplateRound::create([
                'template_id' => $singingTemplate->id,
                'spot' => $roundData['spot'],
                'name' => $roundData['name'],
            ]);
            foreach ($roundData['criteria'] as $crit) {
                TemplateCriteria::create([
                    'template_round_id' => $round->id,
                    'name' => $crit['name'],
                    'points' => $crit['points'],
                ]);
            }
        }

        // 3. Battle of the Bands Template
        $bandsTemplate = EventTemplate::updateOrCreate(
            ['slug' => 'battle-of-bands'],
            [
                'name' => 'Battle of the Bands',
                'description' => 'Group/band competition with performance rounds',
                'event_type' => 'group_contest',
                'default_judges' => 5,
                'default_theme_id' => $defaultTheme?->id,
                'is_system' => true,
            ]
        );

        $bandsTemplate->participants()->delete();
        for ($i = 1; $i <= 8; $i++) {
            TemplateParticipant::create([
                'template_id' => $bandsTemplate->id,
                'number' => $i,
                'name' => "Band $i",
                'gender' => 'Group',
                'participant_type' => 'group',
                'order' => $i,
            ]);
        }

        $bandsTemplate->rounds()->delete();
        $bandsRounds = [
            ['spot' => 1, 'name' => 'Elimination Round', 'criteria' => [
                ['name' => 'Musicality', 'points' => 30],
                ['name' => 'Stage Presence', 'points' => 25],
                ['name' => 'Audience Impact', 'points' => 25],
                ['name' => 'Originality', 'points' => 20],
            ]],
            ['spot' => 2, 'name' => 'Finals', 'criteria' => [
                ['name' => 'Musicality', 'points' => 30],
                ['name' => 'Stage Presence', 'points' => 25],
                ['name' => 'Audience Impact', 'points' => 25],
                ['name' => 'Originality', 'points' => 20],
            ]],
        ];

        foreach ($bandsRounds as $roundData) {
            $round = TemplateRound::create([
                'template_id' => $bandsTemplate->id,
                'spot' => $roundData['spot'],
                'name' => $roundData['name'],
            ]);
            foreach ($roundData['criteria'] as $crit) {
                TemplateCriteria::create([
                    'template_round_id' => $round->id,
                    'name' => $crit['name'],
                    'points' => $crit['points'],
                ]);
            }
        }

        // 4. Dance Competition Template
        $danceTemplate = EventTemplate::updateOrCreate(
            ['slug' => 'dance-competition'],
            [
                'name' => 'Dance Competition',
                'description' => 'Solo or group dance competition',
                'event_type' => 'competition',
                'default_judges' => 5,
                'default_theme_id' => $defaultTheme?->id,
                'is_system' => true,
            ]
        );

        $danceTemplate->participants()->delete();
        for ($i = 1; $i <= 10; $i++) {
            TemplateParticipant::create([
                'template_id' => $danceTemplate->id,
                'number' => $i,
                'name' => "Performer $i",
                'gender' => 'Solo',
                'participant_type' => 'solo',
                'order' => $i,
            ]);
        }

        $danceTemplate->rounds()->delete();
        $danceRound = TemplateRound::create([
            'template_id' => $danceTemplate->id,
            'spot' => 1,
            'name' => 'Performance',
        ]);
        foreach ([
            ['name' => 'Choreography', 'points' => 25],
            ['name' => 'Technique', 'points' => 25],
            ['name' => 'Musicality', 'points' => 20],
            ['name' => 'Stage Presence', 'points' => 15],
            ['name' => 'Costume & Presentation', 'points' => 15],
        ] as $crit) {
            TemplateCriteria::create([
                'template_round_id' => $danceRound->id,
                'name' => $crit['name'],
                'points' => $crit['points'],
            ]);
        }
    }
}
