<?php

session_start();

define('DATA_PATH', __DIR__ . '/../data/');
define('ALLOWED_TYPES', [
    'Armor',
    'Clothing',
    'Weapons',
    'Utility',
    'Ammo',
    'Vehicles',
    'Sustenance',
    'Container',
    
]);

define('MAX_NAME_LENGTH', 100);
define('MAX_LOCATION_LENGTH', 100);
define('MAX_NOTES_LENGTH', 500);
define('MAX_QUANTITY', 100000);

function jsonResponse($success, $message = '', $data = null, $errors = [])
{
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'errors' => $errors
    ], JSON_PRETTY_PRINT);
    exit;
}

function requireAuth()
{
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(false, 'Unauthorized', null, ['Authentication required']);
    }
}