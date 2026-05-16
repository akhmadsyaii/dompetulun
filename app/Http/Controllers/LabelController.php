<?php

namespace App\Http\Controllers;

use App\Models\Label;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LabelController extends Controller
{
    public function index()
    {
        $labels = Label::where('user_id', Auth::id())->orderBy('name')->get();

        return response()->json($labels);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string',
        ]);

        $data['user_id'] = Auth::id();

        $label = Label::create($data);

        return response()->json(['message' => 'Label berhasil ditambahkan', 'label' => $label]);
    }

    public function update(Request $request, Label $label)
    {
        if ($label->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string',
        ]);

        $label->update($data);

        return response()->json(['message' => 'Label berhasil diperbarui', 'label' => $label]);
    }

    public function destroy(Label $label)
    {
        if ($label->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $label->delete();

        return response()->json(['message' => 'Label berhasil dihapus']);
    }
}
