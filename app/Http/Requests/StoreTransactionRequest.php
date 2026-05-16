<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:100',
            'amount' => 'required|numeric|min:0|max:999999999.99',
            'description' => 'nullable|string|max:500',
            'date' => 'required|date|before_or_equal:today',
            'attachment' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
            'wallet_id' => 'nullable|exists:wallets,id',
            'label_ids' => 'nullable|array',
            'label_ids.*' => 'exists:labels,id',
        ];
    }

    public function messages(): array
    {
        return [
            'amount.max' => 'Jumlah transaksi terlalu besar',
            'attachment.max' => 'File maksimal 5MB',
            'attachment.mimes' => 'File harus berupa jpg, png, atau pdf',
            'date.before_or_equal' => 'Tanggal tidak boleh di masa depan',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('description')) {
            $this->merge([
                'description' => strip_tags($this->description),
            ]);
        }
    }
}
