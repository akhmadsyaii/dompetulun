<?php

namespace App\Services;

use App\Models\Debt;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class FinancialSummaryService
{
    public function getSummary($userId, $startDate = null, $endDate = null): array
    {
        $incomeQuery = Transaction::where('user_id', $userId)->where('type', 'income');
        $expenseQuery = Transaction::where('user_id', $userId)->where('type', 'expense');

        if ($startDate) {
            $incomeQuery->where('date', '>=', $startDate);
            $expenseQuery->where('date', '>=', $startDate);
        }
        if ($endDate) {
            $incomeQuery->where('date', '<=', $endDate);
            $expenseQuery->where('date', '<=', $endDate);
        }

        $totalIncome = $incomeQuery->sum('amount');
        $totalExpense = $expenseQuery->sum('amount');

        return [
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'net_balance' => $totalIncome - $totalExpense,
            'total_debt' => Debt::where('user_id', $userId)->where('status', 'unpaid')->sum('remaining_amount'),
        ];
    }

    public function getIncomeByCategory($userId, $startDate = null, $endDate = null)
    {
        $query = Transaction::where('user_id', $userId)->where('type', 'income');

        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }

        return $query->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->get();
    }

    public function getExpenseByCategory($userId, $startDate = null, $endDate = null)
    {
        $query = Transaction::where('user_id', $userId)->where('type', 'expense');

        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }

        return $query->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->get();
    }

    public function getMonthlyTrend($userId, $year)
    {
        $transactions = Transaction::where('user_id', $userId)
            ->whereYear('date', $year)
            ->select('date', 'type', 'amount')
            ->get();

        $months = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthTransactions = $transactions->filter(fn ($t) => (int) $t->date->format('m') === $i);
            $months[] = [
                'month' => $i,
                'income' => (float) $monthTransactions->where('type', 'income')->sum('amount'),
                'expense' => (float) $monthTransactions->where('type', 'expense')->sum('amount'),
            ];
        }

        return $months;
    }
}
