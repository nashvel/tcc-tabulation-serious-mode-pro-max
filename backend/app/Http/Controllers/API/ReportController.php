<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Point;
use App\Models\Judge;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /**
     * Get all scores for printing - grouped by candidate with each judge's weighted score.
     * 
     * GET /api/reports/judge-scores?event_id=xxx&round_id=xxx
     * 
     * If judge_id is provided, returns scores for that specific judge only (legacy behavior).
     * If round_id is provided without judge_id, returns all judges' scores for that round.
     */
    public function getJudgeScores(Request $request): JsonResponse
    {
        $request->validate([
            'event_id' => 'required|integer|exists:events,id',
            'judge_id' => 'nullable|integer|exists:judges,id',
            'round_id' => 'nullable|integer|exists:rounds,id',
        ]);

        // If round_id is provided without judge_id, return printing format
        if ($request->has('round_id') && !$request->has('judge_id')) {
            return $this->getPrintingScores($request);
        }

        $eventId = $request->input('event_id');
        $judgeId = $request->input('judge_id');

        // Get the judge info
        $judge = Judge::where('id', $judgeId)
            ->where('event_id', $eventId)
            ->first();

        if (!$judge) {
            return response()->json([
                'error' => 'Judge not found for this event'
            ], 404);
        }

        // Get the event info
        $event = Event::find($eventId);

        // Get all scores by this judge for this event, grouped by round and candidate
        $scores = Point::with(['candidate', 'round', 'criteria'])
            ->where('judge_id', $judgeId)
            ->whereHas('candidate', function ($query) use ($eventId) {
                $query->where('event_id', $eventId);
            })
            ->get();

        // Group scores by round, then by candidate
        $groupedScores = [];
        
        foreach ($scores as $score) {
            $roundId = $score->round_id;
            $candidateId = $score->candidate_id;
            
            if (!isset($groupedScores[$roundId])) {
                $groupedScores[$roundId] = [
                    'round_id' => $roundId,
                    'round_name' => $score->round?->name ?? 'Unknown Round',
                    'candidates' => [],
                ];
            }
            
            if (!isset($groupedScores[$roundId]['candidates'][$candidateId])) {
                $groupedScores[$roundId]['candidates'][$candidateId] = [
                    'candidate_id' => $candidateId,
                    'candidate_name' => $score->candidate?->name ?? 'Unknown',
                    'candidate_number' => $score->candidate?->number ?? 0,
                    'scores' => [],
                    'total' => 0,
                ];
            }
            
            $groupedScores[$roundId]['candidates'][$candidateId]['scores'][] = [
                'criteria_id' => $score->criteria_id,
                'criteria_name' => $score->criteria?->name ?? 'Unknown',
                'max_points' => $score->criteria?->points ?? 0,
                'points' => $score->points,
            ];
            
            $groupedScores[$roundId]['candidates'][$candidateId]['total'] += $score->points;
        }

        // Convert candidates from associative array to indexed array and sort
        $result = [];
        foreach ($groupedScores as $roundId => $roundData) {
            $candidates = array_values($roundData['candidates']);
            // Sort candidates by number
            usort($candidates, fn($a, $b) => $a['candidate_number'] <=> $b['candidate_number']);
            
            $result[] = [
                'round_id' => $roundData['round_id'],
                'round_name' => $roundData['round_name'],
                'candidates' => $candidates,
            ];
        }

        // Sort rounds by round_id
        usort($result, fn($a, $b) => $a['round_id'] <=> $b['round_id']);

        return response()->json([
            'event' => [
                'id' => $event->id,
                'name' => $event->title,
                'date' => $event->event_date?->format('Y-m-d') ?? $event->created_at->format('Y-m-d'),
            ],
            'judge' => [
                'id' => $judge->id,
                'name' => $judge->name,
                'chair_number' => $judge->chair_number,
            ],
            'rounds' => $result,
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get scores for printing - all judges' weighted scores per candidate for a round.
     */
    private function getPrintingScores(Request $request): JsonResponse
    {
        $eventId = $request->input('event_id');
        $roundId = $request->input('round_id');

        // Get all points for this event and round
        $points = Point::with(['candidate', 'criteria'])
            ->where('round_id', $roundId)
            ->whereHas('candidate', function ($query) use ($eventId) {
                $query->where('event_id', $eventId);
            })
            ->get();

        // Group by candidate and judge, calculate weighted scores
        $candidateScores = [];
        
        foreach ($points as $point) {
            $candidateId = $point->candidate_id;
            $judgeId = $point->judge_id;
            
            if (!isset($candidateScores[$candidateId])) {
                $candidateScores[$candidateId] = [
                    'judges' => [],
                ];
            }
            
            if (!isset($candidateScores[$candidateId]['judges'][$judgeId])) {
                $candidateScores[$candidateId]['judges'][$judgeId] = 0;
            }
            
            // Add points (weighted by criteria percentage if applicable)
            $candidateScores[$candidateId]['judges'][$judgeId] += $point->points;
        }

        // Build scores array for frontend
        $scores = [];
        foreach ($candidateScores as $candidateId => $data) {
            foreach ($data['judges'] as $judgeId => $totalPoints) {
                $scores[] = [
                    'candidate_id' => $candidateId,
                    'judge_id' => $judgeId,
                    'weighted_score' => $totalPoints,
                ];
            }
        }

        return response()->json([
            'scores' => $scores,
        ]);
    }
}
