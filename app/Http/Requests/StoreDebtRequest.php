<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDebtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'creditor_name' => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0|max:999999999.99',
            'description' => 'nullable|string|max:1000',
            'due_date' => 'required|date',
        ];
    }

    public function messages(): array
    {
        return [
            'total_amount.max' => 'Jumlah utang terlalu besar',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('description')) {
            $this->merge([
                'description' => strip_tags($this->description),
                'creditor_name' => strip_tags($this->creditor_name),
            ]);
        }
    }
}
