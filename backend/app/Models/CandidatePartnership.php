<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CandidatePartnership extends Model
{
    protected $fillable = [
        'candidate_id',
        'partner_number',
        'partner_name',
        'partner_gender',
    ];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
}
