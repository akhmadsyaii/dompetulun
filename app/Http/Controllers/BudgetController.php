<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BudgetController extends Controller
{
    public function index()
    {
        $now = now();
        $budgets = Budget::where('user_id', Auth::id())
            ->where('year', $now->year)
            ->where('month', $now->month)
            ->get()
            ->map(function ($b) {
                $b->append(['spent', 'remaining', 'progress']);
                return $b;
            });

        return response()->json($budgets);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'period' => 'required|in:monthly,yearly',
        ]);

        $data['user_id'] = Auth::id();
        $data['month'] = now()->month;
        $data['year'] = now()->year;

        $budget = Budget::create($data);
        $budget->append(['spent', 'remaining', 'progress']);

        return response()->json(['message' => 'Anggaran dibuat', 'budget' => $budget]);
    }

    public function update(Request $request, Budget $budget)
    {
        if ($budget->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'category' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'period' => 'required|in:monthly,yearly',
        ]);

        $budget->update($data);
        $budget->append(['spent', 'remaining', 'progress']);

        return response()->json(['message' => 'Anggaran diperbarui', 'budget' => $budget]);
    }

    public function destroy(Budget $budget)
    {
        if ($budget->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $budget->delete();

        return response()->json(['message' => 'Anggaran dihapus']);
    }

    public function report()
    {
        $userId = Auth::id();
        $startDate = now()->subMonths(5)->startOfMonth()->format('Y-m-d');
        $endDate = now()->endOfMonth()->format('Y-m-d');

        $budgets = Budget::where('user_id', $userId)
            ->whereBetween('year', [now()->subMonths(5)->year, now()->year])
            ->get();

        $spentByCategory = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('date', [$startDate, $endDate])
            ->get()
            ->groupBy(fn ($t) => $t->date->format('Y-m') . '_' . $t->category)
            ->map(fn ($group) => $group->sum('amount'));

        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $key = $date->format('Y-m');

            $monthBudgets = $budgets->filter(fn ($b) => $b->year === (int) $date->format('Y') && $b->month === (int) $date->format('n'));
            $totalBudget = $monthBudgets->sum('amount');

            $totalSpent = 0;
            $categoryData = $monthBudgets->map(function ($b) use ($spentByCategory, $key, &$totalSpent) {
                $spent = (float) ($spentByCategory->get($key . '_' . $b->category, 0));
                $totalSpent += $spent;
                return [
                    'category' => $b->category,
                    'budget' => (float) $b->amount,
                    'spent' => $spent,
                    'progress' => $b->amount > 0 ? round(($spent / $b->amount) * 100, 1) : 0,
                    'status' => $spent <= $b->amount ? 'on_track' : 'over',
                ];
            });

            $months[] = [
                'month' => (int) $date->format('n'),
                'year' => (int) $date->format('Y'),
                'label' => $date->locale('id')->isoFormat('MMM YYYY'),
                'total_budget' => (float) $totalBudget,
                'total_spent' => (float) $totalSpent,
                'remaining' => (float) max(0, $totalBudget - $totalSpent),
                'progress' => $totalBudget > 0 ? round(($totalSpent / $totalBudget) * 100, 1) : 0,
                'categories' => $categoryData,
            ];
        }

        return response()->json($months);
    }
}
