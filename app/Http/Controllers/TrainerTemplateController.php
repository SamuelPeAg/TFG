<?php

namespace App\Http\Controllers;

use App\Models\TrainerTemplate;
use Illuminate\Http\Request;

class TrainerTemplateController extends Controller
{
    public function index()
    {
        $trainerId = auth()->id();
        $templates = TrainerTemplate::where('trainer_id', $trainerId)->get();
        
        return response()->json($templates);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'data' => 'required|array'
        ]);

        $template = TrainerTemplate::create([
            'trainer_id' => auth()->id(),
            'name' => $request->name,
            'data' => $request->data
        ]);

        return response()->json($template);
    }
}
