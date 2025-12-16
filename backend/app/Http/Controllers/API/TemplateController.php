<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    /**
     * Display a listing of templates.
     */
    public function index()
    {
        // Return empty array for now - templates feature not implemented
        return response()->json([]);
    }

    /**
     * Display the specified template.
     */
    public function show($id)
    {
        return response()->json(['message' => 'Template not found'], 404);
    }

    /**
     * Apply template to an event.
     */
    public function applyToEvent(Request $request, $id)
    {
        return response()->json(['message' => 'Template not found'], 404);
    }
}
