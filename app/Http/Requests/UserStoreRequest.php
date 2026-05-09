<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name'          => 'required|string|min:3|max:100',
            'email'         => 'required|email|max:150|unique:users,email',
            'password'      => 'nullable|string|min:6|max:64',
            'iban'          => 'nullable|string|unique:users,iban|min:16|max:34|regex:/^[A-Z]{2}[0-9]{2}[A-Z0-9]{12,30}$/i',
            'firma_digital' => 'nullable|string|max:1000',
            'dni'           => 'nullable|string|regex:/^[0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]$/i',
            'codigo_postal' => 'nullable|string|regex:/^[0-9]{5}$/',
        ];
    }

    public function messages()
    {
        return [
            'name.required'      => 'El nombre es obligatorio.',
            'name.min'           => 'El nombre debe tener al menos 3 caracteres.',
            'email.required'     => 'El correo electrónico es obligatorio.',
            'email.unique'       => 'Este correo ya está registrado por otro usuario.',
            'password.min'       => 'La contraseña debe tener al menos 6 caracteres.',
            'iban.unique'        => 'Este iban ya pertenece a otro usuario.',
            'iban.regex'         => 'El formato del IBAN no es válido.',
            'dni.regex'          => 'El DNI/NIE introducido no tiene un formato válido.',
            'codigo_postal.regex'=> 'El código postal debe tener exactamente 5 dígitos.',
        ];
    }
}
