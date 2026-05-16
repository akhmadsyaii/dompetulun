<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Models\Transaction;
use App\Services\FundingProcessor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::where('user_id', auth()->id());

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Transactions', [
            'transactions' => $query->with('wallet', 'labels')->latest()->paginate(15),
            'filters' => $request->only(['type', 'category', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function data(Request $request)
    {
        $query = Transaction::where('user_id', auth()->id())->with('wallet', 'labels');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $field = $request->get('sort_field', 'date');
        $dir = $request->get('sort_dir', 'desc');
        $query->orderBy($field, $dir);

        return response()->json($query->paginate(15));
    }

    public function store(StoreTransactionRequest $request)
    {
        $validated = $request->validated();
        $labelIds = $validated['label_ids'] ?? [];
        unset($validated['label_ids']);

        $transaction = auth()->user()->transactions()->create($validated);
        $transaction->labels()->sync($labelIds);

        $fundingResults = [];
        if ($transaction->wasRecentlyCreated) {
            $fundingResults = (new FundingProcessor())->process($transaction);
        }

        $transaction->load('wallet', 'labels');

        return response()->json([
            'message' => 'Created',
            'transaction' => $transaction,
            'funding' => $fundingResults,
        ]);
    }

    public function update(StoreTransactionRequest $request, Transaction $transaction)
    {
        if ($transaction->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validated();
        $labelIds = $validated['label_ids'] ?? [];
        unset($validated['label_ids']);

        $transaction->update($validated);
        $transaction->labels()->sync($labelIds);
        $transaction->load('wallet', 'labels');

        return response()->json(['message' => 'Updated', 'transaction' => $transaction]);
    }

    public function destroy(Transaction $transaction)
    {
        if ($transaction->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $transaction->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
