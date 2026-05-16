<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ReceiptController extends Controller
{
    public function index()
    {
        return Inertia::render('Receipts');
    }

    public function data()
    {
        $receipts = Transaction::where('user_id', Auth::id())
            ->whereNotNull('attachment')
            ->with('wallet')
            ->latest()
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'transaction_id' => $t->id,
                    'amount' => $t->amount,
                    'category' => $t->category,
                    'type' => $t->type,
                    'description' => $t->description,
                    'date' => $t->date,
                    'attachment' => $t->attachment ? Storage::url($t->attachment) : null,
                    'wallet_name' => $t->wallet?->name,
                ];
            });

        return response()->json($receipts);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120|mimes:jpg,jpeg,png,pdf',
            'transaction_id' => 'required|exists:transactions,id',
        ]);

        $transaction = Transaction::findOrFail($request->transaction_id);
        if ($transaction->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($transaction->attachment) {
            Storage::delete($transaction->attachment);
        }

        $path = $request->file('file')->store('receipts', 'public');
        $transaction->update(['attachment' => $path]);

        return response()->json([
            'message' => 'Struk berhasil diupload',
            'url' => Storage::url($path),
        ]);
    }

    public function delete(Transaction $transaction)
    {
        if ($transaction->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($transaction->attachment) {
            Storage::delete($transaction->attachment);
            $transaction->update(['attachment' => null]);
        }

        return response()->json(['message' => 'Struk berhasil dihapus']);
    }
}
