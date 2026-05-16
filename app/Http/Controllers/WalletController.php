<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WalletController extends Controller
{
    public function index()
    {
        return Inertia::render('Wallets');
    }

    public function data()
    {
        $wallets = Wallet::where('user_id', Auth::id())->get()->map(function ($w) {
            $w->balance = $w->balance;
            return $w;
        });

        return response()->json($wallets);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:cash,bank,ewallet,other',
            'initial_balance' => 'required|numeric|min:0',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $data['user_id'] = Auth::id();

        $hasDefault = Wallet::where('user_id', Auth::id())->where('is_default', true)->exists();
        $data['is_default'] = !$hasDefault;

        $wallet = Wallet::create($data);
        $wallet->balance = $wallet->balance;

        return response()->json(['message' => 'Dompet berhasil ditambahkan', 'wallet' => $wallet]);
    }

    public function update(Request $request, Wallet $wallet)
    {
        if ($wallet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:cash,bank,ewallet,other',
            'initial_balance' => 'required|numeric|min:0',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $wallet->update($data);
        $wallet->balance = $wallet->balance;

        return response()->json(['message' => 'Dompet berhasil diperbarui', 'wallet' => $wallet]);
    }

    public function destroy(Wallet $wallet)
    {
        if ($wallet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        Transaction::where('wallet_id', $wallet->id)->update(['wallet_id' => null]);
        $wallet->delete();

        return response()->json(['message' => 'Dompet berhasil dihapus']);
    }
}
