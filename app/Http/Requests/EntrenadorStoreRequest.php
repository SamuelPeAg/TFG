<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EntrenadorStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'nombre' => ['required', 'string', 'min:3', 'max:50'],
            'email' => ['required', 'email', 'max:191', 'unique:entrenadores,email'],
        ];
    }

    public function messages()
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 3 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
        ];
    }
}
