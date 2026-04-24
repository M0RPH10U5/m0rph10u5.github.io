<?php

class Validator
{
    public static function validateItem($data)
    {
        $errors = [];

        // Required fields
        if (empty($data['name'])) {
            $errors[] = 'Item name is required.';
        }

        if (empty($data['type'])) {
            $errors[] = 'Item type is required.';
        }

        if (!isset($data['quantity'])) {
            $errors[] = 'Quantity is required.';
        }

        // Length checks
        if (!empty($data['name']) && strlen($data['name']) > MAX_NAME_LENGTH) {
            $errors[] = 'Item name exceeds max length.';
        }

        if (!empty($data['location']) && strlen($data['location']) > MAX_LOCATION_LENGTH) {
            $errors[] = 'Location exceeds max length.';
        }

        if (!empty($data['notes']) && strlen($data['notes']) > MAX_NOTES_LENGTH) {
            $errors[] = 'Notes exceed max length.';
        }

        // Type whitelist
        if (!empty($data['type']) && !in_array($data['type'], ALLOWED_TYPES)) {
            $errors[] = 'Invalid item type.';
        }

        // Quantity validation
        if (!is_numeric($data['quantity']) || $data['quantity'] < 0) {
            $errors[] = 'Quantity must be a positive number.';
        }

        if ($data['quantity'] > MAX_QUANTITY) {
            $errors[] = 'Quantity exceeds allowed limit.';
        }

        return $errors;
    }
}