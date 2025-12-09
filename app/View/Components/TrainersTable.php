<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class TrainersTable extends Component
{
    public $entrenadores;

    public function __construct($entrenadores)
    {
        $this->entrenadores = $entrenadores;
    }

    public function render(): View|Closure|string
    {
        return view('components.trainers-table');
    }
}
