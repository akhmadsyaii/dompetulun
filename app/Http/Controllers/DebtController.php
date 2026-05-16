<?php

namespace App\Http\Controllers;

use App\Http\Requests\PayDebtRequest;
use App\Http\Requests\StoreDebtRequest;
use App\Models\Debt;
use Inertia\Inertia;

class DebtController extends Controller
{
    public function index()
    {
        return Inertia::render('Debts', [
            'debts' => Debt::where('user_id', auth()->id())
                ->with('debtPayments')
                ->latest()
                ->get(),
        ]);
    }

    public function store(StoreDebtRequest $request)
    {
        auth()->user()->debts()->create(array_merge(
            $request->validated(),
            ['remaining_amount' => $request->total_amount, 'status' => 'unpaid'],
        ));

        return redirect()->back();
    }

    public function pay(PayDebtRequest $request, Debt $debt)
    {
        $debt->debtPayments()->create(array_merge(
            $request->validated(),
            ['paid_at' => now()->format('Y-m-d')],
        ));
        $debt->decrement('remaining_amount', $request->amount);

        if ($debt->remaining_amount <= 0) {
            $debt->update(['status' => 'paid', 'remaining_amount' => 0]);
        }

        return redirect()->back();
    }

    public function destroy(Debt $debt)
    {
        $debt->delete();

        return redirect()->back();
    }
}
