<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'pin' => 'required|string|min:4|max:6',
        ]);

        $admin = Admin::first();

        if (!$admin || !Hash::check($request->pin, $admin->pin)) {
            return response()->json([
                'message' => 'Invalid PIN'
            ], 401);
        }

        // Generate simple token (in production, use Laravel Sanctum)
        $token = base64_encode(Str::random(40));

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
            ]
        ]);
    }

    public function changePin(Request $request)
    {
        $request->validate([
            'old_pin' => 'required|string',
            'new_pin' => 'required|string|min:4|max:6|confirmed',
        ]);

        $admin = Admin::first();

        if (!Hash::check($request->old_pin, $admin->pin)) {
            return response()->json([
                'message' => 'Invalid current PIN'
            ], 401);
        }

        $admin->update([
            'pin' => Hash::make($request->new_pin)
        ]);

        return response()->json([
            'message' => 'PIN changed successfully'
        ]);
    }
}
