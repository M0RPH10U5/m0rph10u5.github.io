<?php

require_once '../config/config.php';
require_once '../core/OrgAggregator.php';

requireAuth();

$org = new OrgAggregator();
$action = $_GET['action'] ?? '';

switch ($action) {

    case 'dashboard':
        jsonResponse(true, 'Org Dashboard Data', [
            'summary' => $org->getSummary(),
            'by_item' => $org->getTotalsByItem(),
            'by_type' => $org->getTotalsByType(),
            'by_user' => $org->getTotalsByUser(),
            'by_location' => $org->getLocationTotals()
        ]);
        break;

    // case 'totals':
        // $totals = $org->getTotals();
        // jsonResponse(true, 'Org totals retrieved', $totals);
        // break;

    default:
        jsonResponse(false, 'Invalid action', null, ['Unknown action']);
}