<?php

namespace App\Imports;

/**
 * Clase deshabilitada temporalmente por incompatibilidad de Maatwebsite/Excel con Laravel 12.
 * El proceso de importación se ha movido directamente a UserController@handleCsvImport
 * para trabajar con archivos CSV de forma nativa.
 */
class ClientImport
{
    public function model(array $row)
    {
        return null;
    }
}
