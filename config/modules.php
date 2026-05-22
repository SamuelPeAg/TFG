<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Módulos de Factomove B2B Marca Blanca
    |--------------------------------------------------------------------------
    |
    | Define qué módulos están activos en la suscripción actual de este gimnasio.
    | Las variables se configuran de forma segura a través del archivo `.env`.
    |
    */

    'nutrition'    => env('MODULE_NUTRITION', true),
    'payroll'      => env('MODULE_PAYROLL', true),
    'vacations'    => env('MODULE_VACATIONS', true),
    'statistics'   => env('MODULE_STATISTICS', true),
    'booking_swap' => env('MODULE_BOOKING_SWAP', true),
];
