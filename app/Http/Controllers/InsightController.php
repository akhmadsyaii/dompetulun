<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Debt;
use App\Models\RecurringBill;
use App\Models\Transaction;
use App\Models\Goal;
use App\Models\Asset;
use App\Services\FinancialSummaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InsightController extends Controller
{
    public function index()
    {
        return Inertia::render('Insights');
    }

    public function data()
    {
        $user = Auth::user();
        $userId = $user->id;
        $now = now();
        $startThis = $now->copy()->startOfMonth()->format('Y-m-d');
        $endThis = $now->format('Y-m-d');
        $startLast = $now->copy()->subMonth()->startOfMonth()->format('Y-m-d');
        $endLast = $now->copy()->subMonth()->endOfMonth()->format('Y-m-d');

        $service = new FinancialSummaryService();
        $thisMonth = $service->getSummary($userId, $startThis, $endThis);
        $lastMonth = $service->getSummary($userId, $startLast, $endLast);

        $expenseByCatThis = $service->getExpenseByCategory($userId, $startThis, $endThis);
        $expenseByCatLast = $service->getExpenseByCategory($userId, $startLast, $endLast);

        $trends = $service->getMonthlyTrend($userId, $now->year);

        $healthScore = $this->calculateHealthScore($userId, $thisMonth);

        $tips = $this->generateTips($userId, $thisMonth, $lastMonth, $expenseByCatThis, $expenseByCatLast);

        $categoryChanges = $this->getCategoryChanges($expenseByCatThis, $expenseByCatLast);

        return response()->json([
            'this_month' => $thisMonth,
            'last_month' => $lastMonth,
            'expense_by_category' => $expenseByCatThis,
            'category_changes' => $categoryChanges,
            'trends' => array_slice($trends, -6),
            'health_score' => $healthScore,
            'tips' => $tips,
        ]);
    }

    private function calculateHealthScore($userId, $thisMonth): array
    {
        $score = 0;
        $details = [];

        $income = $thisMonth['total_income'];
        $expense = $thisMonth['total_expense'];
        $savingsRate = $income > 0 ? (($income - $expense) / $income) * 100 : 0;
        $savingsScore = min(100, ($savingsRate / 20) * 100);
        $score += $savingsScore * 0.35;
        $details[] = ['label' => 'Rasio Tabungan', 'score' => round($savingsScore), 'weight' => '35%', 'value' => number_format($savingsRate, 1) . '%'];

        $totalDebt = Debt::where('user_id', $userId)->where('status', 'unpaid')->sum('remaining_amount');
        $annualIncome = max(1, $income * 12);
        $debtRatio = ($totalDebt / $annualIncome) * 100;
        $debtScore = max(0, 100 - ($debtRatio / 30) * 100);
        $score += $debtScore * 0.25;
        $details[] = ['label' => 'Beban Utang', 'score' => round($debtScore), 'weight' => '25%', 'value' => number_format($debtRatio, 1) . '%'];

        $budgets = Budget::where('user_id', $userId)->get();
        $budgetOk = 0;
        foreach ($budgets as $b) {
            $spent = $b->spent;
            if ($spent <= $b->amount) $budgetOk++;
        }
        $budgetScore = $budgets->count() > 0 ? ($budgetOk / $budgets->count()) * 100 : 100;
        $score += $budgetScore * 0.25;
        $details[] = ['label' => 'Kepatuhan Anggaran', 'score' => round($budgetScore), 'weight' => '25%', 'value' => $budgets->count() > 0 ? "$budgetOk/{$budgets->count()}" : 'N/A'];

        $hasGoals = Goal::where('user_id', $userId)->exists();
        $hasAssets = Asset::where('user_id', $userId)->exists();
        $planScore = ($hasGoals ? 50 : 0) + ($hasAssets ? 50 : 0);
        $score += $planScore * 0.15;
        $details[] = ['label' => 'Perencanaan', 'score' => round($planScore), 'weight' => '15%', 'value' => $hasGoals && $hasAssets ? 'Lengkap' : ($hasGoals || $hasAssets ? 'Sebagian' : 'Minim')];

        $finalScore = round(min(100, max(0, $score)));

        return ['score' => $finalScore, 'details' => $details, 'savings_rate' => round($savingsRate, 1)];
    }

    private function generateTips($userId, $thisMonth, $lastMonth, $expenseByCatThis, $expenseByCatLast): array
    {
        $tips = [];

        $income = $thisMonth['total_income'];
        $expense = $thisMonth['total_expense'];
        $savings = $income - $expense;

        if ($income > 0) {
            $savingsRate = ($savings / $income) * 100;
            if ($savingsRate < 10) {
                $tips[] = ['type' => 'warning', 'icon' => 'AlertTriangle', 'title' => 'Tingkatkan Tabungan', 'message' => "Rasio tabungan Anda {$savingsRate}%. Targetkan minimal 20% dari pemasukan."];
            } elseif ($savingsRate >= 20) {
                $tips[] = ['type' => 'success', 'icon' => 'TrendingUp', 'title' => 'Tabungan Sehat', 'message' => "Rasio tabungan {$savingsRate}%! Pertahankan kebiasaan baik ini."];
            }
        }

        if ($lastMonth['total_expense'] > 0) {
            $change = (($expense - $lastMonth['total_expense']) / $lastMonth['total_expense']) * 100;
            if ($change > 20) {
                $tips[] = ['type' => 'danger', 'icon' => 'TrendingUp', 'title' => 'Pengeluaran Meningkat', 'message' => 'Pengeluaran bulan ini naik ' . round($change) . '% dibanding bulan lalu. Evaluasi kembali!'];
            } elseif ($change < -10) {
                $tips[] = ['type' => 'success', 'icon' => 'TrendingDown', 'title' => 'Pengeluaran Turun', 'message' => 'Pengeluaran turun ' . round(abs($change)) . '%. Kerja bagus!'];
            }
        }

        $topCat = $expenseByCatThis->sortByDesc('total')->first();
        if ($topCat) {
            $tips[] = ['type' => 'info', 'icon' => 'Info', 'title' => 'Top Kategori', 'message' => "Pengeluaran terbesar: {$topCat->category} (Rp " . number_format($topCat->total, 0, ',', '.') . ')'];

            $lastTop = $expenseByCatLast->firstWhere('category', $topCat->category);
            if ($lastTop && $lastTop->total > 0) {
                $catChange = (($topCat->total - $lastTop->total) / $lastTop->total) * 100;
                if (abs($catChange) > 10) {
                    $dir = $catChange > 0 ? 'naik' : 'turun';
                    $tips[] = ['type' => $catChange > 0 ? 'warning' : 'success', 'icon' => $catChange > 0 ? 'ArrowUp' : 'ArrowDown', 'title' => "Kategori {$topCat->category}", 'message' => "Pengeluaran {$topCat->category} {$dir} " . round(abs($catChange)) . '% dibanding bulan lalu.'];
                }
            }
        }

        $unpaidBills = RecurringBill::where('user_id', $userId)->where('active', true)
            ->with(['payments' => fn ($q) => $q->whereMonth('paid_at', now()->month)->whereYear('paid_at', now()->year)])
            ->get()
            ->filter(fn ($b) => $b->payments->isEmpty())
            ->count();
        if ($unpaidBills > 0) {
            $tips[] = ['type' => 'warning', 'icon' => 'Bell', 'title' => 'Tagihan Belum Lunas', 'message' => "Ada {$unpaidBills} tagihan yang belum dibayar bulan ini."];
        }

        $totalDebt = Debt::where('user_id', $userId)->where('status', 'unpaid')->sum('remaining_amount');
        if ($totalDebt > 0 && $income > 0) {
            $debtRatio = ($totalDebt / ($income * 12)) * 100;
            if ($debtRatio > 30) {
                $tips[] = ['type' => 'danger', 'icon' => 'Banknote', 'title' => 'Utang Cukup Tinggi', 'message' => 'Total utang ' . number_format($debtRatio, 0) . '% dari pendapatan tahunan. Prioritaskan pelunasan!'];
            }
        }

        if (count($tips) === 0) {
            $tips[] = ['type' => 'success', 'icon' => 'Smile', 'title' => 'Keuangan Sehat!', 'message' => 'Tidak ada masalah yang terdeteksi. Terus jaga keuangan Anda!'];
        }

        return $tips;
    }

    private function getCategoryChanges($expenseByCatThis, $expenseByCatLast): array
    {
        $changes = [];
        foreach ($expenseByCatThis as $cat) {
            $lastTotal = 0;
            $last = $expenseByCatLast->firstWhere('category', $cat->category);
            if ($last) $lastTotal = $last->total;

            $change = $lastTotal > 0 ? (($cat->total - $lastTotal) / $lastTotal) * 100 : 100;
            $changes[] = [
                'category' => $cat->category,
                'current' => (float) $cat->total,
                'previous' => (float) $lastTotal,
                'change_percent' => round($change, 1),
            ];
        }

        usort($changes, fn ($a, $b) => abs($b['change_percent']) <=> abs($a['change_percent']));

        return array_slice($changes, 0, 8);
    }
}
