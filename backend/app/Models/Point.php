<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Point extends Model
{
    use HasFactory;
    protected $fillable = ['candidate_id', 'round_id', 'criteria_id', 'points', 'judge_id'];
    
    public function judge()
    {
        return $this->belongsTo(Judge::class);
    }

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function round()
    {
        return $this->belongsTo(Round::class);
    }

    public function criteria()
    {
        return $this->belongsTo(Criteria::class);
    }
}
