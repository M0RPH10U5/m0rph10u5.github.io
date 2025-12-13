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
const RSI_STATUS_URL = 'https://status.robertsspaceindustries.com/index.json';
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
function updateStatusUI(data) {
    // Update summary status (status-right)
    const summary = data.summaryStatus || 'ONLINE';
    const statusLeft = document.querySelector('.status-left');
    statusRight.textContent = summary.toUpperCase();

    // Update status-right color class
    statusRight.classList.remove('online', 'degraded', 'offline');
    statusRight.classList.add(summary.toLowerCase());

    // Update mini indicators
    const services = data.services || [];
    const getMini = (name) => {
        const service = services.find(s => s.name === name);
        return service ? mapStatusToClass(service.status) : 'operational';
    };

    document.getElementById('Platform').className = `mini ${getMini('Platform')}`;
    document.getElementById('Persistent-Universe').className = `mini ${getMini('Persistent Universe')}`;
    document.getElementById('Arena-Commander').className = `mini ${getMini('Arena Commander')}`;
}

// Initial fetch
fetchRSIStatus();

// Optional: auto-refresh every 60 seconds
setInterval(fetchRSIStatus, CACHE_TTL);