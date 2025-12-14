<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TemplateCriteria extends Model
{
    use HasFactory;

    protected $table = 'template_criteria';

    protected $fillable = [
        'template_round_id',
        'name',
        'points',
    ];

    public function round()
    {
        return $this->belongsTo(TemplateRound::class, 'template_round_id');
    }
}
