
<?php require_once 'config/config.php'; ?>
<!DOCTYPE html>
<html>
<head>
    <title>Org Logistics Dashboard</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<div id="app">

    <div id="topbar">
        <div class="logo">ORG LOGISTICS</div>
        <div id="userPanel"></div>
    </div>

    <div id="main">

        <!-- LEFT PANEL -->
        <div id="personalPanel" class="panel">
            <h2>Personal Inventory</h2>

            <div class="filters">
                <select id="typeFilter"></select>
                <select id="sortOrder">
                    <option value="asc">A → Z</option>
                    <option value="desc">Z → A</option>
                </select>
                <input type="text" id="searchBox" placeholder="Search item...">
            </div>

            <div id="inventoryGrid"></div>
        </div>

        <!-- RIGHT PANEL -->
        <div id="orgPanel" class="panel">
            <h2>Org Overview</h2>

            <div id="orgSummary"></div>
            <div id="orgTypeBreakdown"></div>
            <div id="orgMemberBreakdown"></div>
            <div id="orgLocationBreakdown"></div>

        </div>

    </div>

</div>

<script src="assets/js/app.js"></script>
<script src="assets/js/inventory.js"></script>
<script src="assets/js/org.js"></script>

</body>
</html>