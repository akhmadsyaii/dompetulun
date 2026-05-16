<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Debt;
use App\Services\FinancialSummaryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports');
    }

    public function data(Request $request)
    {
        $user = auth()->user();
        $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->format('Y-m-d'));

        $service = new FinancialSummaryService();
        $summary = $service->getSummary($user->id, $startDate, $endDate);
        $expenseByCategory = $service->getExpenseByCategory($user->id, $startDate, $endDate);
        $transactions = Transaction::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->with('wallet', 'labels')
            ->latest()
            ->paginate(20);

        return response()->json([
            'summary' => $summary,
            'expense_by_category' => $expenseByCategory,
            'transactions' => $transactions,
        ]);
    }
}
