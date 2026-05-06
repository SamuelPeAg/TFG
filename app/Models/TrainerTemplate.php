<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainerTemplate extends Model
{
    protected $fillable = [
        'trainer_id',
        'name',
        'data'
    ];

    protected $casts = [
        'data' => 'array'
    ];

    public function trainer()
    {
        return $this->belongsTo(Entrenador::class, 'trainer_id');
    }
}
