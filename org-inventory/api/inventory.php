<?php

require_once '../config/config.php';
require_once '../core/InventoryManager.php';

requireAuth();

$inventory = new InventoryManager();
$userId = $_SESSION['user_id'];
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {

    case 'list':
        $items = $inventory->getUserInventory($userId);
        jsonResponse(true, 'Inventory retrieved', $items);
        break;

    case 'add':
        $result = $inventory->addItem($userId, $_POST);

        if (isset($result['errors'])) {
            jsonResponse(false, 'Validation failed', null, $result['errors']);
        }

        jsonResponse(true, 'Item added', $result['item']);
        break;

    case 'update':
        $itemId = $_POST['id'] ?? null;

        if (!$itemId) {
            jsonResponse(false, 'Missing item ID', null, ['Item ID required']);
        }

        $result = $inventory->updateItem($userId, $itemId, $_POST);

        if (isset($result['errors'])) {
            jsonResponse(false, 'Update failed', null, $result['errors']);
        }

        jsonResponse(true, 'Item updated', $result['item']);
        break;

    case 'delete':
        $itemId = $_POST['id'] ?? null;

        if (!$itemId) {
            jsonResponse(false, 'Missing item ID', null, ['Item ID required']);
        }

        $inventory->deleteItem($userId, $itemId);

        jsonResponse(true, 'Item deleted');
        break;

    default:
        jsonResponse(false, 'Invalid action', null, ['Unknown action']);
}