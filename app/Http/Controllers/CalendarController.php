<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index()
    {
        return Inertia::render('Calendar');
    }

    public function data(Request $request)
    {
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);

        $transactions = Transaction::where('user_id', Auth::id())
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->with('wallet', 'labels')
            ->orderBy('date', 'desc')
            ->get();

        $daysInMonth = now()->setYear((int) $year)->setMonth((int) $month)->daysInMonth;

        $dailyBreakdown = [];
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $dateStr = sprintf('%s-%02d-%02d', $year, $month, $day);
            $dayTx = $transactions->filter(fn ($t) => $t->date->format('Y-m-d') === $dateStr);

            $income = $dayTx->where('type', 'income')->sum('amount');
            $expense = $dayTx->where('type', 'expense')->sum('amount');

            $dailyBreakdown[] = [
                'day' => $day,
                'date' => $dateStr,
                'income' => (float) $income,
                'expense' => (float) $expense,
                'net' => (float) $income - (float) $expense,
                'transactions' => $dayTx->values(),
                'has_transactions' => $dayTx->isNotEmpty(),
            ];
        }

        $summary = [
            'total_income' => (float) $transactions->where('type', 'income')->sum('amount'),
            'total_expense' => (float) $transactions->where('type', 'expense')->sum('amount'),
            'net' => (float) $transactions->where('type', 'income')->sum('amount') - (float) $transactions->where('type', 'expense')->sum('amount'),
            'transaction_count' => $transactions->count(),
        ];

        return response()->json([
            'daily' => $dailyBreakdown,
            'summary' => $summary,
            'month' => (int) $month,
            'year' => (int) $year,
        ]);
    }
}
