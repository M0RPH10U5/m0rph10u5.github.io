<?php

require_once __DIR__ . '/JsonStorage.php';
require_once __DIR__ . '/Validator.php';

class InventoryManager
{
    private $storage;

    public function __construct()
    {
        $this->storage = new JsonStorage('inventory.json');
    }

    public function getUserInventory($userId)
    {
        $data = $this->storage->read();
        return $data[$userId] ?? [];
    }

    public function addItem($userId, $item)
    {
        $errors = Validator::validateItem($item);

        if (!empty($errors)) {
            return ['errors' => $errors];
        }

        $data = $this->storage->read();

        $item['id'] = uniqid('item_', true);
        $item['quantity'] = (int)$item['quantity'];
        $item['location'] = $item['location'] ?? '';
        $item['notes'] = $item['notes'] ?? '';
        $item['created_at'] = gmdate('c');
        $item['updated_at'] = gmdate('c');

        if (!isset($data[$userId])) {
            $data[$userId] = [];
        }

        $data[$userId][] = $item;

        $this->storage->write($data);

        return ['item' => $item];
    }

    public function deleteItem($userId, $itemId)
    {
        $data = $this->storage->read();

        if (!isset($data[$userId])) return false;

        $data[$userId] = array_values(array_filter(
            $data[$userId],
            fn($item) => $item['id'] !== $itemId
        ));

        $this->storage->write($data);

        return true;
    }

    public function updateItem($userId, $itemId, $updatedData)
    {
        $errors = Validator::validateItem($updatedData);

        if (!empty($errors)) {
            return ['errors' => $errors];
        }

        $data = $this->storage->read();

        if (!isset($data[$userId])) {
            return ['errors' => ['Inventory not found']];
        }

        foreach ($data[$userId] as &$item) {
            if ($item['id'] === $itemId) {
                $item['name'] = $updatedData['name'];
                $item['type'] = $updatedData['type'];
                $item['quantity'] = (int)$updatedData['quantity'];
                $item['location'] = $updatedData['location'] ?? '';
                $item['notes'] = $updatedData['notes'] ?? '';
                $item['updated_at'] = gmdate('c');

                $this->storage->write($data);

                return ['item' => $item];
            }
        }

        return ['errors' => ['Item not found']];
    }
}