<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\RecurringBill;
use App\Models\Transaction;
use App\Services\FinancialSummaryService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(FinancialSummaryService $summaryService)
    {
        $user = auth()->user();
        $year = now()->year;
        $startDate = now()->startOfYear()->format('Y-m-d');
        $endDate = now()->endOfYear()->format('Y-m-d');

        $recentTransactions = Transaction::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $todaySummary = [
            'income' => Transaction::where('user_id', $user->id)
                ->where('type', 'income')
                ->whereDate('date', now())
                ->sum('amount'),
            'expense' => Transaction::where('user_id', $user->id)
                ->where('type', 'expense')
                ->whereDate('date', now())
                ->sum('amount'),
        ];

        $lastMonthStart = now()->subMonth()->startOfMonth()->format('Y-m-d');
        $lastMonthEnd = now()->subMonth()->endOfMonth()->format('Y-m-d');
        $lastMonthIncome = Transaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->whereBetween('date', [$lastMonthStart, $lastMonthEnd])
            ->sum('amount');
        $lastMonthExpense = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->whereBetween('date', [$lastMonthStart, $lastMonthEnd])
            ->sum('amount');

        $thisMonthIncome = Transaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->sum('amount');
        $thisMonthExpense = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->sum('amount');

        $momIncomeChange = $lastMonthIncome > 0 ? round((($thisMonthIncome - $lastMonthIncome) / $lastMonthIncome) * 100, 1) : 0;
        $momExpenseChange = $lastMonthExpense > 0 ? round((($thisMonthExpense - $lastMonthExpense) / $lastMonthExpense) * 100, 1) : 0;

        $unpaidBills = RecurringBill::where('user_id', $user->id)
            ->where('active', true)
            ->get()
            ->filter(fn ($b) => !$b->paid_this_month)
            ->count();

        $budgets = Budget::where('user_id', $user->id)
            ->where('year', now()->year)
            ->where('month', now()->month)
            ->get();
        $budgetsNearLimit = 0;
        foreach ($budgets as $b) {
            $spent = $b->spent;
            $ratio = $b->amount > 0 ? ($spent / $b->amount) * 100 : 0;
            if ($ratio >= 80) $budgetsNearLimit++;
        }

        return Inertia::render('Dashboard', [
            'summary' => $summaryService->getSummary($user->id, $startDate, $endDate),
            'incomeByCategory' => $summaryService->getIncomeByCategory($user->id, $startDate, $endDate),
            'expenseByCategory' => $summaryService->getExpenseByCategory($user->id, $startDate, $endDate),
            'monthlyTrend' => $summaryService->getMonthlyTrend($user->id, $year),
            'recentTransactions' => $recentTransactions,
            'todaySummary' => $todaySummary,
            'momIncomeChange' => $momIncomeChange,
            'momExpenseChange' => $momExpenseChange,
            'thisMonthIncome' => $thisMonthIncome,
            'thisMonthExpense' => $thisMonthExpense,
            'lastMonthIncome' => $lastMonthIncome,
            'lastMonthExpense' => $lastMonthExpense,
            'unpaidBills' => $unpaidBills,
            'budgetsNearLimit' => $budgetsNearLimit,
        ]);
    }
}
