<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        // Forzar uso de assets compilados en producción si existe un archivo hot por error
        if (app()->environment('production')) {
            $hotFile = public_path('hot');
            $storageHotFile = storage_path('vite.hot');
            
            if (file_exists($hotFile)) {
                @unlink($hotFile);
            }
            if (file_exists($storageHotFile)) {
                @unlink($storageHotFile);
            }
        }
    }
}
