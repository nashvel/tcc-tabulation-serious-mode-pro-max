<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Point extends Model
{
    protected $fillable = ['candidate_id', 'round_id', 'criteria_id', 'points', 'judge_id', 'category'];

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
