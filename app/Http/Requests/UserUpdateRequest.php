<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $user = $this->route('user');
        $userId = $user ? $user->id : null;

        return [
            'name'          => 'required|string|min:3|max:100',
            'email'         => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($userId)],
            'password'      => 'nullable|string|min:6|max:64',
            'iban'          => [
                'nullable',
                'string',
                Rule::unique('users', 'iban')->ignore($userId),
                function ($attribute, $value, $fail) {
                    $cleanIban = strtoupper(str_replace(' ', '', $value));
                    if (str_starts_with($cleanIban, 'ES')) {
                        if (strlen($cleanIban) !== 24) $fail('El IBAN español debe tener exactamente 24 caracteres.');
                    }
                }
            ],
            'firma_digital' => 'nullable|string|max:1000',
            'dni'           => 'nullable|string|regex:/^[0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]$/i',
            'codigo_postal' => 'nullable|string|regex:/^[0-9]{5}$/',
        ];
    }

    public function messages()
    {
        return [
            'name.required'      => 'El nombre es obligatorio.',
            'email.unique'       => 'Este correo ya está registrado por otro usuario.',
            'iban.unique'        => 'Este iban ya pertenece a otro usuario.',
            'dni.regex'          => 'El DNI/NIE introducido no tiene un formato válido.',
            'codigo_postal.regex'=> 'El código postal debe tener exactamente 5 dígitos.',
        ];
    }
}
