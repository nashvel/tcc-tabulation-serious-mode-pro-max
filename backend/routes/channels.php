<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private voting channel - allow all connections without auth
Broadcast::channel('voting.{eventId}', function ($user, $eventId) {
    // Private channel - allow all connections
    return true;
});

// Private scores channel - allow all connections without auth
Broadcast::channel('scores.{eventId}', function ($user, $eventId) {
    // Private channel - allow all connections
    return true;
});
