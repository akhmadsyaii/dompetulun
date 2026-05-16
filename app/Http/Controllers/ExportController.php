<?php

namespace App\Http\Controllers;

use App\Exports\TransactionsExport;
use App\Models\Debt;
use App\Models\DebtPayment;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function exportExcel(Request $request)
    {
        return Excel::download(
            new TransactionsExport(auth()->id()),
            'dompetulun-report.xlsx',
        );
    }

    public function exportPdf(Request $request)
    {
        $user = auth()->user();
        $transactions = Transaction::where('user_id', $user->id)->latest()->get();
        $debts = Debt::where('user_id', $user->id)->with('debtPayments')->get();

        $pdf = Pdf::loadView('exports.report', compact('user', 'transactions', 'debts'));

        return $pdf->download('dompetulun-report.pdf');
    }

    public function backupJson(Request $request)
    {
        $user = auth()->user();

        return response()->json([
            'transactions' => Transaction::where('user_id', $user->id)->get(),
            'debts' => Debt::where('user_id', $user->id)->get(),
            'debt_payments' => DebtPayment::whereIn(
                'debt_id',
                Debt::where('user_id', $user->id)->pluck('id'),
            )->get(),
        ]);
    }

    public function restoreJson(Request $request)
    {
        $data = $request->validate([
            'file' => 'required|file|mimes:json,txt',
        ]);

        $import = json_decode(file_get_contents($data['file']->getRealPath()), true);
        $user = auth()->user();

        if (!$import) {
            return redirect()->back()->withErrors(['file' => 'Invalid JSON file']);
        }

        if (isset($import['transactions'])) {
            foreach ($import['transactions'] as $transaction) {
                $user->transactions()->create([
                    'type' => $transaction['type'],
                    'category' => $transaction['category'],
                    'amount' => $transaction['amount'],
                    'description' => $transaction['description'] ?? null,
                    'date' => $transaction['date'],
                    'attachment' => $transaction['attachment'] ?? null,
                ]);
            }
        }

        if (isset($import['debts'])) {
            foreach ($import['debts'] as $debt) {
                $user->debts()->create([
                    'creditor_name' => $debt['creditor_name'],
                    'total_amount' => $debt['total_amount'],
                    'remaining_amount' => $debt['remaining_amount'],
                    'description' => $debt['description'] ?? null,
                    'due_date' => $debt['due_date'],
                    'status' => $debt['status'] ?? 'unpaid',
                ]);
            }
        }

        return redirect()->back();
    }
}
