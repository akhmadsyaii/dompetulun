<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PayDebtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0|max:999999999.99',
            'notes' => 'nullable|string|max:500',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('notes')) {
            $this->merge([
                'notes' => strip_tags($this->notes),
            ]);
        }
    }
}
