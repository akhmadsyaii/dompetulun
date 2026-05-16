<?php

namespace App\Http\Controllers;

use App\Models\RecurringBill;
use App\Models\BillPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BillController extends Controller
{
    public function index()
    {
        return Inertia::render('Bills');
    }

    public function data()
    {
        $bills = RecurringBill::where('user_id', Auth::id())
            ->with(['payments' => function ($q) {
                $q->whereMonth('paid_at', now()->month)
                  ->whereYear('paid_at', now()->year);
            }])
            ->orderBy('due_day')
            ->get()
            ->map(function ($bill) {
                $bill->paid_this_month = $bill->payments->isNotEmpty();
                $bill->next_due_date = $bill->next_due_date;
                return $bill;
            });

        return response()->json($bills);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'category' => 'required|string',
            'frequency' => 'required|in:monthly,yearly',
            'due_day' => 'required|integer|min:1|max:31',
            'notes' => 'nullable|string',
        ]);

        $data['user_id'] = Auth::id();

        RecurringBill::create($data);

        return response()->json(['message' => 'Tagihan berhasil ditambahkan']);
    }

    public function update(Request $request, RecurringBill $bill)
    {
        if ($bill->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'category' => 'required|string',
            'frequency' => 'required|in:monthly,yearly',
            'due_day' => 'required|integer|min:1|max:31',
            'notes' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $bill->update($data);

        return response()->json(['message' => 'Tagihan berhasil diperbarui']);
    }

    public function destroy(RecurringBill $bill)
    {
        if ($bill->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $bill->delete();

        return response()->json(['message' => 'Tagihan berhasil dihapus']);
    }

    public function markPaid(Request $request, RecurringBill $bill)
    {
        if ($bill->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'amount' => 'required|numeric|min:0',
            'paid_at' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $bill->payments()->create($data);

        return response()->json(['message' => 'Tagihan ditandai lunas']);
    }

    public function unpaid(RecurringBill $bill)
    {
        if ($bill->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        BillPayment::where('bill_id', $bill->id)
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->delete();

        return response()->json(['message' => 'Tagihan ditandai belum dibayar']);
    }
}
