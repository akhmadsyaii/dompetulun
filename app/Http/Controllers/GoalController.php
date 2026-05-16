<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GoalController extends Controller
{
    public function index()
    {
        $goals = Goal::where('user_id', Auth::id())
            ->orderByRaw('(current_amount / target_amount) ASC')
            ->get()
            ->map(function ($g) {
                $g->append(['progress', 'remaining']);
                return $g;
            });

        return response()->json($goals);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'current_amount' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $data['user_id'] = Auth::id();
        $data['current_amount'] = $data['current_amount'] ?? 0;

        $goal = Goal::create($data);
        $goal->append(['progress', 'remaining']);

        return response()->json(['message' => 'Target dibuat', 'goal' => $goal]);
    }

    public function update(Request $request, Goal $goal)
    {
        if ($goal->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'current_amount' => 'required|numeric|min:0',
            'deadline' => 'nullable|date',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $goal->update($data);
        $goal->append(['progress', 'remaining']);

        return response()->json(['message' => 'Target diperbarui', 'goal' => $goal]);
    }

    public function destroy(Goal $goal)
    {
        if ($goal->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $goal->delete();

        return response()->json(['message' => 'Target dihapus']);
    }
}
