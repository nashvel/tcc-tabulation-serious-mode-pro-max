<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\EventTheme;
use Illuminate\Http\Request;

class EventThemeController extends Controller
{
    public function index()
    {
        $themes = EventTheme::where('is_active', true)
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get();

        return response()->json($themes);
    }

    public function show($id)
    {
        $theme = EventTheme::findOrFail($id);
        return response()->json($theme);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'primary_color' => 'string|max:20',
            'secondary_color' => 'string|max:20',
            'accent_color' => 'string|max:20',
            'background_type' => 'string|max:20',
            'background_value' => 'nullable|string',
            'font_family' => 'string|max:100',
            'header_style' => 'string|max:20',
            'custom_css' => 'nullable|array',
        ]);

        $validated['slug'] = \Str::slug($validated['name']);
        $validated['is_system'] = false;

        $theme = EventTheme::create($validated);

        return response()->json($theme, 201);
    }

    public function update(Request $request, $id)
    {
        $theme = EventTheme::findOrFail($id);

        if ($theme->is_system) {
            return response()->json(['message' => 'Cannot modify system themes'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:100',
            'description' => 'nullable|string',
            'primary_color' => 'string|max:20',
            'secondary_color' => 'string|max:20',
            'accent_color' => 'string|max:20',
            'background_type' => 'string|max:20',
            'background_value' => 'nullable|string',
            'font_family' => 'string|max:100',
            'header_style' => 'string|max:20',
            'custom_css' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $theme->update($validated);

        return response()->json($theme);
    }

    public function destroy($id)
    {
        $theme = EventTheme::findOrFail($id);

        if ($theme->is_system) {
            return response()->json(['message' => 'Cannot delete system themes'], 403);
        }

        $theme->delete();

        return response()->json(['message' => 'Theme deleted']);
    }
}
