<?php

namespace App\Exports;

use App\Models\Debt;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class DebtSheet implements FromCollection, WithTitle, ShouldAutoSize
{
    protected $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
    }

    public function collection()
    {
        return Debt::where('user_id', $this->userId)
            ->latest()
            ->get(['creditor_name', 'total_amount', 'remaining_amount', 'due_date', 'status']);
    }

    public function title(): string
    {
        return 'Utang';
    }
}
