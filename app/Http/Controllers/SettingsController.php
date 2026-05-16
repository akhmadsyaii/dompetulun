<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings', [
            'user' => auth()->user(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'currency' => 'required|string|max:10',
        ]);

        auth()->user()->update($data);

        return redirect()->back();
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);

        auth()->user()->update([
            'password' => Hash::make($data['password']),
        ]);

        return redirect()->back();
    }

    public function resetData(Request $request)
    {
        $user = auth()->user();
        $user->transactions()->delete();
        $user->debts()->delete();

        return redirect()->back();
    }

    public function toggleDarkMode(Request $request)
    {
        $user = auth()->user();
        $user->update(['dark_mode' => !$user->dark_mode]);

        return redirect()->back();
    }
}
