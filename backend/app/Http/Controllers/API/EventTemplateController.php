<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\EventTemplate;
use App\Models\Event;
use App\Models\Candidate;
use App\Models\Round;
use App\Models\Criteria;
use App\Models\Judge;
use Illuminate\Http\Request;

class EventTemplateController extends Controller
{
    public function index()
    {
        $templates = EventTemplate::with(['defaultTheme', 'participants', 'rounds.criteria'])
            ->where('is_active', true)
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get();

        return response()->json($templates);
    }

    public function show($id)
    {
        $template = EventTemplate::with(['defaultTheme', 'participants', 'rounds.criteria'])
            ->findOrFail($id);

        return response()->json($template);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string',
            'event_type' => 'required|string|max:50',
            'default_judges' => 'integer|min:1|max:20',
            'default_theme_id' => 'nullable|exists:event_themes,id',
        ]);

        $validated['slug'] = \Str::slug($validated['name']);
        $validated['is_system'] = false;

        $template = EventTemplate::create($validated);

        return response()->json($template, 201);
    }

    public function update(Request $request, $id)
    {
        $template = EventTemplate::findOrFail($id);

        if ($template->is_system) {
            return response()->json(['message' => 'Cannot modify system templates'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:150',
            'description' => 'nullable|string',
            'event_type' => 'string|max:50',
            'default_judges' => 'integer|min:1|max:20',
            'default_theme_id' => 'nullable|exists:event_themes,id',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return response()->json($template);
    }


    public function destroy($id)
    {
        $template = EventTemplate::findOrFail($id);

        if ($template->is_system) {
            return response()->json(['message' => 'Cannot delete system templates'], 403);
        }

        $template->delete();

        return response()->json(['message' => 'Template deleted']);
    }

    /**
     * Create a new event from a template
     */
    public function createFromTemplate(Request $request, $id)
    {
        $template = EventTemplate::with(['defaultTheme', 'participants', 'rounds.criteria'])
            ->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'event_date' => 'required|date',
            'description' => 'nullable|string',
            'theme_id' => 'nullable|exists:event_themes,id',
        ]);

        // Create the event
        $event = Event::create([
            'title' => $validated['title'],
            'event_date' => $validated['event_date'],
            'description' => $validated['description'] ?? $template->description,
            'event_type' => $template->event_type,
            'number_of_judges' => $template->default_judges,
            'year' => date('Y', strtotime($validated['event_date'])),
            'status' => 'active',
            'theme_id' => $validated['theme_id'] ?? $template->default_theme_id,
            'template_id' => $template->id,
        ]);

        // Create participants from template
        foreach ($template->participants as $tp) {
            Candidate::create([
                'event_id' => $event->id,
                'number' => $tp->number,
                'name' => $tp->name,
                'gender' => $tp->gender,
                'department' => $tp->department,
                'participant_type' => $tp->participant_type,
                'order' => $tp->order,
            ]);
        }

        // Create rounds and criteria from template
        foreach ($template->rounds as $tr) {
            $round = Round::create([
                'event_id' => $event->id,
                'name' => $tr->name,
                'spot' => $tr->spot,
                'description' => $tr->description,
            ]);

            foreach ($tr->criteria as $tc) {
                Criteria::create([
                    'round_id' => $round->id,
                    'name' => $tc->name,
                    'points' => $tc->points,
                ]);
            }
        }

        // Create judges
        for ($i = 1; $i <= $template->default_judges; $i++) {
            Judge::create([
                'event_id' => $event->id,
                'name' => "Judge $i",
                'chair_number' => $i,
                'status' => 'active',
            ]);
        }

        // Load relationships for response
        $event->load(['candidates', 'rounds.criteria', 'judges', 'theme']);

        return response()->json($event, 201);
    }
}
