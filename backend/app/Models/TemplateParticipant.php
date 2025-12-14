<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TemplateParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'number',
        'name',
        'gender',
        'department',
        'participant_type',
        'order',
    ];

    public function template()
    {
        return $this->belongsTo(EventTemplate::class, 'template_id');
    }
}
