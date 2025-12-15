<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'event_type',
        'default_judges',
        'default_theme_id',
        'header_image',
        'lock_screen_image',
        'is_system',
        'is_active',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function defaultTheme()
    {
        return $this->belongsTo(EventTheme::class, 'default_theme_id');
    }

    public function participants()
    {
        return $this->hasMany(TemplateParticipant::class, 'template_id')->orderBy('number');
    }

    public function rounds()
    {
        return $this->hasMany(TemplateRound::class, 'template_id')->orderBy('spot');
    }

    public function events()
    {
        return $this->hasMany(Event::class, 'template_id');
    }
}
