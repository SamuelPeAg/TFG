<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class TrainersTable extends Component
{
    public $trainers;

    public function __construct($trainers)
    {
        $this->trainers = $trainers;
    }

    public function render(): View|Closure|string
    {
        return view('components.trainers-table');
    }
}
