<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class TransactionsExport implements WithMultipleSheets
{
    protected $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
    }

    public function sheets(): array
    {
        return [
            new IncomeSheet($this->userId),
            new ExpenseSheet($this->userId),
            new DebtSheet($this->userId),
        ];
    }
}
