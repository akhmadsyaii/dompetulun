<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\GoalFundingRule;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class FundingProcessor
{
    public function process(Transaction $transaction): array
    {
        $results = [];

        if (!$transaction->user_id) return $results;

        $rules = GoalFundingRule::where('user_id', $transaction->user_id)
            ->where('active', true)
            ->with('goal')
            ->get();

        foreach ($rules as $rule) {
            if (!$rule->goal || $rule->goal->current_amount >= $rule->goal->target_amount) continue;

            $amount = $this->calculateAmount($rule, $transaction);
            if ($amount <= 0) continue;

            $rule->goal->increment('current_amount', $amount);
            $rule->goal->append(['progress', 'remaining']);

            $results[] = [
                'goal_id' => $rule->goal_id,
                'goal_name' => $rule->goal->name,
                'amount' => $amount,
                'rule_type' => $rule->type,
            ];
        }

        return $results;
    }

    private function calculateAmount(GoalFundingRule $rule, Transaction $transaction): float
    {
        return match ($rule->type) {
            'percentage' => $this->calcPercentage($rule, $transaction),
            'roundup' => $this->calcRoundup($rule, $transaction),
            'fixed' => 0,
            default => 0,
        };
    }

    private function calcPercentage(GoalFundingRule $rule, Transaction $transaction): float
    {
        if ($transaction->type !== 'income') return 0;
        return round($transaction->amount * ($rule->value / 100), 2);
    }

    private function calcRoundup(GoalFundingRule $rule, Transaction $transaction): float
    {
        if ($transaction->type !== 'expense') return 0;
        if ($rule->value <= 0) return 0;

        $nextMultiple = ceil($transaction->amount / $rule->value) * $rule->value;
        return round($nextMultiple - $transaction->amount, 2);
    }
}
