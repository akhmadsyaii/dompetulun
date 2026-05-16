<?php

namespace App\Http\Controllers;

use App\Models\GoalFundingRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FundingRuleController extends Controller
{
    public function index()
    {
        $rules = GoalFundingRule::where('user_id', Auth::id())
            ->with('goal')
            ->latest()
            ->get()
            ->map(function ($r) {
                $r->goal_name = $r->goal?->name;
                return $r;
            });

        return response()->json($rules);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'goal_id' => 'required|exists:goals,id',
            'type' => 'required|in:percentage,roundup,fixed',
            'value' => 'required|numeric|min:0',
        ]);

        $data['user_id'] = Auth::id();

        if ($data['type'] === 'percentage' && $data['value'] > 100) {
            return response()->json(['message' => 'Persentase tidak boleh lebih dari 100%'], 422);
        }

        GoalFundingRule::create($data);

        return response()->json(['message' => 'Aturan funding berhasil ditambahkan']);
    }

    public function update(Request $request, GoalFundingRule $rule)
    {
        if ($rule->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'goal_id' => 'required|exists:goals,id',
            'type' => 'required|in:percentage,roundup,fixed',
            'value' => 'required|numeric|min:0',
            'active' => 'boolean',
        ]);

        if ($data['type'] === 'percentage' && $data['value'] > 100) {
            return response()->json(['message' => 'Persentase tidak boleh lebih dari 100%'], 422);
        }

        $rule->update($data);

        return response()->json(['message' => 'Aturan funding berhasil diperbarui']);
    }

    public function destroy(GoalFundingRule $rule)
    {
        if ($rule->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $rule->delete();

        return response()->json(['message' => 'Aturan funding berhasil dihapus']);
    }
}
