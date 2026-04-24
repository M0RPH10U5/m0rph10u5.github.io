<?php

require_once __DIR__ . '/JsonStorage.php';

class OrgAggregator
{
    private $storage;

    public function __construct()
    {
        $this->storage = new JsonStorage('inventory.json');
    }

    private function getAll()
    {
        return $this->storage->read();
    }

    public function getTotalsByItem()
    {
        $data = $this->getAll();
        $totals = [];

        foreach ($data as $userInventory) {
            foreach ($userInventory as $item) {
                $name = $item['name'];
                $totals[$name] = ($totals[$name] ?? 0) + $item['quantity'];
            }
        }

        return $totals;
    }

    public function getTotalsByType()
    {
        $data = $this->getAll();
        $totals = [];

        foreach ($data as $userInventory) {
            foreach ($userInventory as $item) {
                $type = $item['type'];
                $totals[$type] = ($totals[$type] ?? 0) + $item['quantity'];
            }
        }

        return $totals;
    }

    public function getTotalsByUser()
    {
        $data = $this->getAll();
        $totals = [];

        foreach ($data as $userId => $inventory) {
            $totalQty = 0;

            foreach ($inventory as $item) {
                $totalQty += $item['quantity'];
            }

            $totals[$userId] = $totalQty;
        }

        return $totals;
    }

    public function getLocationTotals()
    {
        $data = $this->getAll();
        $locations = [];

        foreach ($data as $userInventory) {
            foreach ($userInventory as $item) {
                $loc = $item['location'] ?? 'Unknown';
                $locations[$loc] = ($locations[$loc] ?? 0) + $item['quantity'];
            }
        }

        return $locations;
    }

    public function getSummary()
    {
        $data = $this->getAll();

        $totalItems = 0;
        $uniqueItems = [];

        foreach ($data as $inventory) {
            foreach ($inventory as $item) {
                $totalItems += $item['quantity'];
                $uniqueItems[$item['name']] = true;
            }
        }

        return [
            'total_quantity' => $totalItems,
            'unique_item_types' => count($uniqueItems),
            'total_members' => count($data)
        ];
    }
}