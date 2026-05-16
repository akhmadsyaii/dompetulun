<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class IncomeSheet implements FromCollection, WithTitle, ShouldAutoSize
{
    protected $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
    }

    public function collection()
    {
        return Transaction::where('user_id', $this->userId)
            ->where('type', 'income')
            ->latest()
            ->get(['category', 'amount', 'description', 'date']);
    }

    public function title(): string
    {
        return 'Pemasukan';
    }
}
