<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CandidateTemplateController extends Controller
{
    /**
     * Display a listing of candidate templates.
     */
    public function index()
    {
        // Return empty array for now - candidate templates feature not implemented
        return response()->json([]);
    }

    /**
     * Display the specified candidate template.
     */
    public function show($id)
    {
        return response()->json(['message' => 'Candidate template not found'], 404);
    }
}
