<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Debt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AssetController extends Controller
{
    public function index()
    {
        return Inertia::render('NetWorth');
    }

    public function data()
    {
        $assets = Asset::where('user_id', Auth::id())->orderBy('value', 'desc')->get();
        $totalAssets = $assets->sum('value');
        $totalDebts = Debt::where('user_id', Auth::id())->where('status', 'unpaid')->sum('remaining_amount');

        return response()->json([
            'assets' => $assets,
            'total_assets' => (float) $totalAssets,
            'total_debts' => (float) $totalDebts,
            'net_worth' => (float) $totalAssets - (float) $totalDebts,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:property,savings,investment,vehicle,other',
            'value' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $data['user_id'] = Auth::id();
        Asset::create($data);

        return response()->json(['message' => 'Aset berhasil ditambahkan']);
    }

    public function update(Request $request, Asset $asset)
    {
        if ($asset->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:property,savings,investment,vehicle,other',
            'value' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $asset->update($data);

        return response()->json(['message' => 'Aset berhasil diperbarui']);
    }

    public function destroy(Asset $asset)
    {
        if ($asset->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $asset->delete();

        return response()->json(['message' => 'Aset berhasil dihapus']);
    }
}
