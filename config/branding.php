<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Identificación del Gimnasio / Cliente B2B (Tenant)
    |--------------------------------------------------------------------------
    */
    'name' => env('BRAND_GYM_NAME', 'Factomove Gym'),
    'slug' => env('BRAND_GYM_SLUG', 'factomove-gym'),

    /*
    |--------------------------------------------------------------------------
    | Diccionario de Vocabulario y Estilo de Palabras (Wording Customization)
    |--------------------------------------------------------------------------
    | Permite cambiar las palabras en todo el proyecto de manera instantánea
    | para adaptar el sistema a diferentes tipos de centros de fitness
    | (ej: "Gimnasio" -> "Box" para CrossFit, "Socio" -> "Atleta", "Entrenador" -> "Coach").
    |
    */
    'vocabulary' => [
        'gym' => env('VOCAB_GYM', 'Gimnasio'),           // Box, Centro, Club, Gimnasio
        'coach' => env('VOCAB_COACH', 'Entrenador'),       // Coach, Instructor, Entrenador, Monitor
        'member' => env('VOCAB_MEMBER', 'Socio'),         // Socio, Cliente, Atleta, Alumno
        'class' => env('VOCAB_CLASS', 'Clase'),           // Clase, Sesión, Turno, WOD, Entrenamiento
        'payroll' => env('VOCAB_PAYROLL', 'Nómina'),       // Nómina, Pago, Honorarios, Recibo
        'vacation' => env('VOCAB_VACATION', 'Vacaciones'), // Vacaciones, Descansos, Días Libres
        'nutrition' => env('VOCAB_NUTRITION', 'Nutrición'), // Nutrición, Dieta, Plan de Alimentación
    ],

    /*
    |--------------------------------------------------------------------------
    | Datos de Contacto Corporativos
    |--------------------------------------------------------------------------
    */
    'contact' => [
        'email' => env('BRAND_CONTACT_EMAIL', 'contacto@factomovegym.com'),
        'phone' => env('BRAND_CONTACT_PHONE', '+34 600 000 000'),
        'address' => env('BRAND_CONTACT_ADDRESS', 'Calle Deporte 12, Madrid'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Enlaces a Redes Sociales
    |--------------------------------------------------------------------------
    */
    'social' => [
        'instagram' => env('BRAND_SOCIAL_INSTAGRAM', 'https://instagram.com/factomovegym'),
        'facebook' => env('BRAND_SOCIAL_FACEBOOK', 'https://facebook.com/factomovegym'),
        'twitter' => env('BRAND_SOCIAL_TWITTER', 'https://x.com/factomovegym'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Diseño, Tipografía y Colores Predominantes
    |--------------------------------------------------------------------------
    */
    'colors' => [
        'primary' => env('BRAND_COLOR_PRIMARY', '#4BB7AE'),
        'secondary' => env('BRAND_COLOR_SECONDARY', '#EF5D7A'),
        'accent' => env('BRAND_COLOR_ACCENT', '#A5EFE2'),
    ],

    'typography' => [
        'font_family' => env('BRAND_FONT', 'Outfit'), // Ej: Inter, Montserrat, Outfit, Poppins, Roboto, Oswald
    ],

    /*
    |--------------------------------------------------------------------------
    | Rutas o URLs de Logotipos y favicon
    |--------------------------------------------------------------------------
    */
    'logos' => [
        'header' => env('BRAND_LOGO_HEADER', '/images/branding/logo_header.png'),
        'dark' => env('BRAND_LOGO_DARK', '/images/branding/logo_dark.png'),
        'login' => env('BRAND_LOGO_LOGIN', '/images/branding/logo_login.png'),
        'favicon' => env('BRAND_FAVICON', '/favicon.ico'),
    ],
];
