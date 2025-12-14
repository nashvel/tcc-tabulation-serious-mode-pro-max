<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TemplateRound extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'spot',
        'name',
        'description',
    ];

    public function template()
    {
        return $this->belongsTo(EventTemplate::class, 'template_id');
    }

    public function criteria()
    {
        return $this->hasMany(TemplateCriteria::class, 'template_round_id');
    }
}
