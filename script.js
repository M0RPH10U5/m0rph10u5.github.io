let tooltip;
let rsiServices = [];

/* =========================
   Utility: Animate card entry
========================= */
function animateCard(card, index) {
    card.style.animationDelay = `${index * 60}ms`;
    card.classList.add('animate-in');
}

/* =========================
   Filtering
========================= */
document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        const grid = btn.closest('section')
            ?.querySelector('.card-grid') || document.querySelector('.card-grid');

        const items = JSON.parse(grid.dataset.items);
        const filtered = filter === 'all'
            ? items
            : items.filter(i => i.role === filter);

        grid.id === 'fleet-grid'
            ? renderFleet(filtered)
            : renderMembers(filtered);
    });
});


/* ===========================
     Per Route Loading
=========================== */
// Define your pages as functions or HTML strings
const routes = {
    overview: `
        <h1>Organization Overview</h1>
        <p>
            Shadow Liner is a private spacefaring organization operating luxury, logistics,
            and long-range exploration vessels across UEE-controlled space.
        </p>
    `,
    fleet: `
        <h1>Fleet</h1>
        <div class="filters">
            <button data-filter="all">ALL</button>
            <button data-filter="Flagship">FLAGSHIP</button>
            <button data-filter="Recon / Data">RECON</button>
        </div>

        <div id="fleet-grid"></div>
    `,
    members: `
        <h1>Members</h1>
        <div class="filters">
            <button data-filter="all">ALL</button>
            <button data-filter="Captain">CAPTAIN</button>
            <button data-filter="Pilot">PILOT</button>
            <button data-filter="Engineer">ENGINEER</button>
        </div>

        <p>List of current members will appear here.</p>
    `,
    logs: `
        <h1>Captain Logs</h1>
        <p>Log entries from recent missions will appear here.</p>
    `
};

// Function to render page content
function renderRoute(route) {
    const content = document.querySelector('.content');
    if (routes[route]) {
        content.innerHTML = routes[route];
    } else {
        content.innerHTML = `<h1>Page Not Found</h1><p>The page '${route}' does not exist.</p>`;
    }

    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.toggle('active', link.dataset.route === route);
    });
}

// Listen for hash changes
window.addEventListener('hashchange', () => {
    const route = location.hash.slice(2) || 'overview';
    renderRoute(route);
});

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
    const route = location.hash.slice(2) || 'overview';
    renderRoute(route);
});

// ===== RSI Status Fetch and Cache =====
const RSI_STATUS_URL = 'https://rsi-status.m0rph10u5.workers.dev';
const CACHE_KEY = 'rsiStatus';
const CACHE_TTL = 60 * 1000; // 1 minute cache

async function fetchRSIStatus() {
    // Check cache first
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_TTL) {
        updateStatusUI(cached.data);
        return;
    }

    try {
        const res = await fetch(RSI_STATUS_URL);
        if (!res.ok) throw new Error('Failed to fetch RSI status');
        const data = await res.json();

        // Cache it
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: now }));

        // Update UI
        updateStatusUI(data);
    } catch (err) {
        console.error('RSI Status Error:', err);
        // Use cached data if available
        if (cached) updateStatusUI(cached.data);
    }
}

// Map RSI status string to mini indicator class
function mapStatusToClass(status) {
    switch (status.toLowerCase()) {
        case 'operational': return 'operational';
        case 'degraded': return 'degraded';
        case 'offline': return 'offline';
        default: return 'operational';
    }
}

// Update the Status Bar UI
function mapSummaryStatus(status) {
    switch (status.toLowerCase()) {
        case 'operational': return { text: 'ONLINE', class: 'online' };
        case 'degraded':
        case 'partial_outage': return { text: 'DEGRADED', class: 'degraded' };
        case 'major_outage': return { text: 'OFFLINE', class: 'offline' };
        default: return { text: 'UNKNOWN', class: 'offline' };
    }
}

function updateStatusUI(data) {
    // Update summary status (status-right)
    const summaryData = mapSummaryStatus(data.summaryStatus || 'operational');
    const statusLeft = document.getElementById('summary-status');

    statusLeft.textContent = summaryData.text;
    statusLeft.className = `status-left ${summaryData.class}`;

    // Cache services for tooltips
    rsiServices = data.services || [];
    
    const getService = (name) =>
        rsiServices.find(s => s.name === name);

    const platform = getService('Platform');
    const pu = getService('Persistent Universe');
    const ac = getService('Arena Commander');

    if (!tooltip) createTooltip();

    if (platform) {
        const el = document.getElementById('Platform');
        el.className = `mini ${mapStatusToClass(platform.status)}`;
        attachTooltip(el, platform);
    }

    if (pu) {
        const el = document.getElementById('Persistent-Universe');
        el.className = `mini ${mapStatusToClass(pu.status)}`;
        attachTooltip(el, pu);
    }

    if (ac) {
        const el = document.getElementById('Arena-Commander');
        el.className = `mini ${mapStatusToClass(ac.status)}`;
        attachTooltip(el, ac);
    }
}

// Initial fetch
fetchRSIStatus();

// Optional: auto-refresh every 60 seconds
setInterval(fetchRSIStatus, CACHE_TTL);

// Create tooltip element once
function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);
}

// Attach tooltip behavior to a mini indicator
function attachTooltip(el, service) {
    el.onmouseenter = () => {
        const statusClass = mapStatusToClass(service.status);

    tooltip.innerHTML = `
        <div class="title">${service.name}</div>
        <div class="status ${statusClass}">
            ${service.status.replace('_', ' ').toUpperCase()}
        </div>
        ${service.description ? `<div class="desc">${service.description}</div>` : ''}
    `;

    const rect = el.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
        tooltip.classList.add('visible');
    };

    el.onmouseleave = () => {
        tooltip.classList.remove('visible');
    };
}