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

        // Mover el archivo hot fuera de public para evitar conflictos en producción
        if (app()->environment('production')) {
            \Illuminate\Support\Facades\Vite::useHotFile(base_path('storage/non_existent_hot'));
        } else {
            \Illuminate\Support\Facades\Vite::useHotFile(storage_path('vite.hot'));
        }
    }
}
