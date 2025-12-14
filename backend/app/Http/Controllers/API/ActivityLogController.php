<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $eventId = $request->query('event_id');
        
        if (!$eventId) {
            return response()->json(['error' => 'event_id is required'], 400);
        }

        $query = ActivityLog::with(['judge'])
            ->where('event_id', $eventId)
            ->orderBy('created_at', 'desc');

        // Filter by judge
        if ($request->has('judge_id')) {
            $query->where('judge_id', $request->query('judge_id'));
        }

        // Filter by action type
        if ($request->has('action')) {
            $query->where('action', $request->query('action'));
        }

        // Limit results (default 100)
        $limit = min($request->query('limit', 100), 500);
        
        $logs = $query->limit($limit)->get();

        // Add description to each log
        $logs = $logs->map(function ($log) {
            return [
                'id' => $log->id,
                'event_id' => $log->event_id,
                'judge_id' => $log->judge_id,
                'judge_name' => $log->judge?->name ?? 'System',
                'judge_number' => $log->judge?->chair_number,
                'action' => $log->action,
                'description' => $log->description,
                'details' => $log->details,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at->toIso8601String(),
                'time_ago' => $log->created_at->diffForHumans(),
            ];
        });

        return response()->json($logs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'judge_id' => 'nullable|exists:judges,id',
            'action' => 'required|string|max:50',
            'entity_type' => 'nullable|string|max:50',
            'entity_id' => 'nullable|integer',
            'details' => 'nullable|array',
        ]);

        $log = ActivityLog::log(
            $validated['event_id'],
            $validated['action'],
            array_merge($validated['details'] ?? [], [
                'entity_type' => $validated['entity_type'] ?? null,
                'entity_id' => $validated['entity_id'] ?? null,
            ]),
            $validated['judge_id'] ?? null,
            $request
        );

        return response()->json($log, 201);
    }

    public function getStats(Request $request)
    {
        $eventId = $request->query('event_id');
        
        if (!$eventId) {
            return response()->json(['error' => 'event_id is required'], 400);
        }

        $stats = [
            'total_logs' => ActivityLog::where('event_id', $eventId)->count(),
            'scores_entered' => ActivityLog::where('event_id', $eventId)
                ->where('action', ActivityLog::ACTION_SCORE_ENTERED)->count(),
            'scores_updated' => ActivityLog::where('event_id', $eventId)
                ->where('action', ActivityLog::ACTION_SCORE_UPDATED)->count(),
            'judge_logins' => ActivityLog::where('event_id', $eventId)
                ->where('action', ActivityLog::ACTION_JUDGE_LOGIN)->count(),
            'by_judge' => ActivityLog::where('event_id', $eventId)
                ->whereNotNull('judge_id')
                ->selectRaw('judge_id, count(*) as count')
                ->groupBy('judge_id')
                ->get()
                ->pluck('count', 'judge_id'),
        ];

        return response()->json($stats);
    }

    public function clear(Request $request)
    {
        $eventId = $request->input('event_id');
        
        if (!$eventId) {
            return response()->json(['error' => 'event_id is required'], 400);
        }

        ActivityLog::where('event_id', $eventId)->delete();

        return response()->json(['message' => 'Activity logs cleared']);
    }
}
