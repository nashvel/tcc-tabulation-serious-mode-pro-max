<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventTheme extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'primary_color',
        'secondary_color',
        'accent_color',
        'background_type',
        'background_value',
        'font_family',
        'header_style',
        'custom_css',
        'is_system',
        'is_active',
    ];

    protected $casts = [
        'custom_css' => 'array',
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function events()
    {
        return $this->hasMany(Event::class, 'theme_id');
    }

    public function templates()
    {
        return $this->hasMany(EventTemplate::class, 'default_theme_id');
    }
}
