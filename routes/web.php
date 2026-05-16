<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DebtController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\FundingRuleController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\InsightController;
use App\Http\Controllers\LabelController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check() ? redirect('/dashboard') : redirect('/login');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware(['auth', 'throttle.api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/transactions/data', [TransactionController::class, 'data'])->name('transactions.data');
    Route::resource('transactions', TransactionController::class)->except(['show']);
    Route::resource('debts', DebtController::class)->except(['show']);
    Route::post('/debts/{debt}/pay', [DebtController::class, 'pay'])->name('debts.pay');

    Route::get('/export/excel', [ExportController::class, 'exportExcel'])->name('export.excel');
    Route::get('/export/pdf', [ExportController::class, 'exportPdf'])->name('export.pdf');
    Route::get('/export/backup', [ExportController::class, 'backupJson'])->name('export.backup');
    Route::post('/export/restore', [ExportController::class, 'restoreJson'])->name('export.restore');

    Route::get('/reports', [ReportsController::class, 'index'])->name('reports');
    Route::get('/reports/data', [ReportsController::class, 'data'])->name('reports.data');

    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar');
    Route::get('/calendar/data', [CalendarController::class, 'data'])->name('calendar.data');

    Route::get('/insights', [InsightController::class, 'index'])->name('insights');
    Route::get('/insights/data', [InsightController::class, 'data'])->name('insights.data');

    Route::get('/receipts', [ReceiptController::class, 'index'])->name('receipts');
    Route::get('/receipts/data', [ReceiptController::class, 'data']);
    Route::post('/receipts/upload', [ReceiptController::class, 'upload']);
    Route::delete('/receipts/{transaction}', [ReceiptController::class, 'delete']);

    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::post('/settings/update', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/change-password', [SettingsController::class, 'changePassword'])->name('settings.change-password');
    Route::post('/settings/reset-data', [SettingsController::class, 'resetData'])->name('settings.reset-data');
    Route::post('/settings/toggle-dark-mode', [SettingsController::class, 'toggleDarkMode'])->name('settings.toggle-dark-mode');

    Route::get('/budget', [PageController::class, 'budget'])->name('budget');
    Route::prefix('budgets')->group(function () {
        Route::get('/data', [BudgetController::class, 'index']);
        Route::post('/', [BudgetController::class, 'store']);
        Route::put('/{budget}', [BudgetController::class, 'update']);
        Route::delete('/{budget}', [BudgetController::class, 'destroy']);
    });

    Route::get('/goals', [PageController::class, 'goals'])->name('goals');
    Route::prefix('goals')->group(function () {
        Route::get('/data', [GoalController::class, 'index']);
        Route::post('/', [GoalController::class, 'store']);
        Route::put('/{goal}', [GoalController::class, 'update']);
        Route::delete('/{goal}', [GoalController::class, 'destroy']);
    });
    Route::get('/budgets/report', [BudgetController::class, 'report']);

    Route::get('/bills', [BillController::class, 'index'])->name('bills');
    Route::prefix('bills')->group(function () {
        Route::get('/data', [BillController::class, 'data']);
        Route::post('/', [BillController::class, 'store']);
        Route::put('/{bill}', [BillController::class, 'update']);
        Route::delete('/{bill}', [BillController::class, 'destroy']);
        Route::post('/{bill}/pay', [BillController::class, 'markPaid']);
        Route::delete('/{bill}/pay', [BillController::class, 'unpaid']);
    });
    Route::get('/net-worth', [AssetController::class, 'index'])->name('net-worth');
    Route::prefix('net-worth')->group(function () {
        Route::get('/data', [AssetController::class, 'data']);
        Route::post('/', [AssetController::class, 'store']);
        Route::put('/{asset}', [AssetController::class, 'update']);
        Route::delete('/{asset}', [AssetController::class, 'destroy']);
    });
    Route::get('/export', [PageController::class, 'exportIndex'])->name('export');
    Route::get('/settings/categories', [PageController::class, 'categories'])->name('settings.categories');

    Route::prefix('funding-rules')->group(function () {
        Route::get('/', [FundingRuleController::class, 'index']);
        Route::post('/', [FundingRuleController::class, 'store']);
        Route::put('/{rule}', [FundingRuleController::class, 'update']);
        Route::delete('/{rule}', [FundingRuleController::class, 'destroy']);
    });

    Route::prefix('labels')->group(function () {
        Route::get('/', [LabelController::class, 'index']);
        Route::post('/', [LabelController::class, 'store']);
        Route::put('/{label}', [LabelController::class, 'update']);
        Route::delete('/{label}', [LabelController::class, 'destroy']);
    });

    Route::get('/wallets', [WalletController::class, 'index'])->name('wallets');
    Route::prefix('wallets')->group(function () {
        Route::get('/data', [WalletController::class, 'data']);
        Route::post('/', [WalletController::class, 'store']);
        Route::put('/{wallet}', [WalletController::class, 'update']);
        Route::delete('/{wallet}', [WalletController::class, 'destroy']);
    });
});
