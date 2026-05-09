<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EntrenadorUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $id = $this->route('entrenadore'); // Depende de cómo esté definida la ruta

        return [
            'name' => ['nullable', 'string', 'min:3', 'max:100'],
            'email' => ['nullable', 'email', Rule::unique('entrenadores', 'email')->ignore($id)],
            'dni' => ['nullable', 'string', 'regex:/^[0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]$/i'],
            'precio_hora' => ['nullable', 'numeric', 'min:0'],
            'activo' => ['nullable', 'boolean'],
            'centro_id' => ['nullable', 'exists:centros,id'],
        ];
    }
}
