<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Dompetulun Report</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        h1 { font-size: 18px; margin-bottom: 5px; }
        h2 { font-size: 14px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: 600; }
    </style>
</head>
<body>
    <h1>Dompetulun Financial Report</h1>
    <p>User: {{ $user->name }} | Generated: {{ now()->format('Y-m-d H:i') }}</p>

    <h2>Transactions</h2>
    <table>
        <thead>
            <tr><th>Type</th><th>Category</th><th>Amount</th><th>Date</th></tr>
        </thead>
        <tbody>
            @foreach($transactions as $t)
            <tr>
                <td>{{ ucfirst($t->type) }}</td>
                <td>{{ $t->category }}</td>
                <td>{{ number_format($t->amount, 2) }}</td>
                <td>{{ $t->date }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <h2>Debts</h2>
    <table>
        <thead>
            <tr><th>Creditor</th><th>Total</th><th>Remaining</th><th>Status</th></tr>
        </thead>
        <tbody>
            @foreach($debts as $d)
            <tr>
                <td>{{ $d->creditor_name }}</td>
                <td>{{ number_format($d->total_amount, 2) }}</td>
                <td>{{ number_format($d->remaining_amount, 2) }}</td>
                <td>{{ ucfirst($d->status) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
