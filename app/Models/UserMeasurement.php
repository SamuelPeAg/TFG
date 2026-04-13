<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMeasurement extends Model
{
    use HasFactory;

    protected $table = 'user_measurements';

    protected $fillable = [
        'user_id',
        'peso',
        'altura',
        'imc',
        'measured_at',
    ];

    protected $casts = [
        'measured_at' => 'date',
        'peso' => 'float',
        'altura' => 'float',
        'imc' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
