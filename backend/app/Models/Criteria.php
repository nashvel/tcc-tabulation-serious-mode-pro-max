<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Criteria extends Model
{
    use HasFactory;
    protected $table = 'criteria';
    protected $fillable = ['round_id', 'name', 'points'];

    public function round()
    {
        return $this->belongsTo(Round::class);
    }

    public function scoringPoints()
    {
        return $this->hasMany(Point::class);
    }
}
