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
   Card Rendering Functions
========================= */
function renderFleet(fleet) {
    const grid = document.getElementById('fleet-grid');
    if (!grid) return;

    grid.innerHTML = ''; // clear old content

    if (!fleet || fleet.length === 0) {
        grid.innerHTML = `<p class="loading">No fleet data available.</p>`;
        return;
    }

    fleet.forEach((ship, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h2>${ship.name}</h2>
            <p><Strong>Manufacturer:&nbsp;</strong>${ship.manufacturer || ''}</p>
            <span class="role">${ship.role}</span>
        `;
        grid.appendChild(card);
        animateCard(card, i);
    });
}

function renderMembers(members) {
    const grid = document.getElementById('members-grid');
    if (!grid) return;

    grid.innerHTML = ''; // clear old content

    if (!members || members.length === 0) {
        grid.innerHTML = `<p class="loading">No members found.</p>`;
        return;
    }

    members.forEach((member, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h2>${member.name}</h2>
            <div class="sc-row">
                <strong class="sc-label">SC Name:</strong>
                <span class="sc-name">${member["sc-name"]}</span>
            </div>
            <div class="role-row">
                <strong>Role:</strong> <span class="role">${member.role}</span>
            </div>
            <div class="specialty-row">
                <strong>Specialty:</strong> ${member.specialty || 'N/A'}
            </div>
            <div class="ship-row">
                <strong>Ship:</strong> ${member.ship || 'N/A'}
            </div>
        `;
        grid.appendChild(card);
        animateCard(card, i);
    });
}

/* =========================
   Dynamic Filters
========================= */
function generateFilters(containerSelector, items, gridId) {
    const container = document.querySelector(containerSelector);
    if (!container || !items || items.length === 0) return;

    // Clear existing buttons
    container.innerHTML = '';

    // Get unique roles
    const roles = Array.from(new Set(items.map(i => i.role))).sort();

    // Add "ALL" button first
    const allBtn = document.createElement('button');
    allBtn.dataset.filter = 'all';
    allBtn.textContent = 'ALL';
    container.appendChild(allBtn);

    // Add buttons for each role
    roles.forEach(role => {
        const btn = document.createElement('button');
        btn.dataset.filter = role;
        btn.textContent = role.toUpperCase();
        container.appendChild(btn);
    });

    // Attach click handlers
    container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            const grid = document.getElementById(gridId);
            if (!grid) return;

            const itemsData = JSON.parse(grid.dataset.items);
            const filtered = filter === 'all' ? itemsData : itemsData.filter(i => i.role === filter);

            gridId === 'fleet-grid' ? renderFleet(filtered) : renderMembers(filtered);
        });
    });
}

/* =========================
   Route Rendering
========================= */
async function renderRoute(route) {
    const content = document.querySelector('.content');
    if (!content) return;

    try {
        const res = await fetch(`data/${route}.json`);
        if (!res.ok) throw new Error(`JSON not found: data/${route}.json`);
        const data = await res.json();

        switch(route) {
            case 'overview':
                content.innerHTML = `
                    <h1>${data.title || 'Overview'}</h1>
                    <p>${data.content || ''}</p>
                `;
                break;

            case 'fleet':
                content.innerHTML = `
                    <h1>Fleet</h1>
                    <div class="filters" id="fleet-filters"></div>
                    <div class="card-grid" id="fleet-grid" data-items='${JSON.stringify(data)}'></div>
                `;
                renderFleet(data);
                generateFilters('#fleet-filters', data, 'fleet-grid');
                break;

            case 'members':
                content.innerHTML = `
                    <h1>Members</h1>
                    <div class="filters" id="member-filters"></div>
                    <div class="card-grid" id="members-grid" data-items='${JSON.stringify(data)}'></div>
                `;
                renderMembers(data);
                generateFilters('#member-filters', data, 'members-grid');
                break;

            case 'logs':
                content.innerHTML = `
                    <h1>Captain Logs</h1>
                    <ul>
                        ${Array.isArray(data) ? data.map(log => `<li>${log}</li>`).join('') : '<li>No logs found.</li>'}
                    </ul>
                `;
                break;

            default:
                content.innerHTML = `<h1>Page Not Found</h1>`;
        }

        // Update nav active class
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.toggle('active', link.dataset.route === route);
        });

    } catch(err) {
        console.error(err);
        content.innerHTML = `<h1>Error</h1><p>Could not load data for '${route}'</p>`;
    }
}

/* =========================
   Routing
========================= */
window.addEventListener('hashchange', () => {
    const route = location.hash.slice(2) || 'overview';
    renderRoute(route);
});

document.addEventListener('DOMContentLoaded', () => {
// Initial fetch
    fetchRSIStatus();
    // Optional: auto-refresh every 60 seconds
    setInterval(fetchRSIStatus, CACHE_TTL);

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
    if (!status) return 'operational';

    switch (status.toLowerCase()) {
        case 'operational':
            return 'operational';

        case 'degraded':
        case 'degraded_performance':
        case 'partial_outage':
            return 'degraded';

        case 'major_outage':
            return 'offline';

        default:
            return 'operational';
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
    const statusLeft = document.getElementById('summary-status');
    if (!statusLeft) return; // 🔴 DOM not ready yet

    const summaryData = mapSummaryStatus(data.summaryStatus || 'operational');

    statusLeft.textContent = summaryData.text;
    statusLeft.className = `status-left ${summaryData.class}`;

    const statusRight = document.querySelector('.status-right');
    if (statusRight) {
        statusRight.className = `status-right ${summaryData.class}`;
    }

    rsiServices = data.systems || [];

    if (!tooltip) createTooltip();

    const platformEl = document.getElementById('Platform');
    const puEl = document.getElementById('Persistent-Universe');
    const acEl = document.getElementById('Arena-Commander');

    if (!platformEl || !puEl || !acEl) {
        // 🔴 status bar not mounted yet
        return;
    }

    const getService = (name) =>
        rsiServices.find(s => s.name === name);

    const platform = getService('Platform');
    const pu = getService('Persistent Universe');
    const ac = getService('Arena Commander');

    if (platform) {
        platformEl.className = `mini ${mapStatusToClass(platform.status)}`;
        attachTooltip(platformEl, platform);
    }

    if (pu) {
        puEl.className = `mini ${mapStatusToClass(pu.status)}`;
        attachTooltip(puEl, pu);
    }

    if (ac) {
        acEl.className = `mini ${mapStatusToClass(ac.status)}`;
        attachTooltip(acEl, ac);
    }

}

function getService(name) {
    const svc = rsiServices.find(s => s.name === name);
    if (!svc) console.warn(`RSI service not found: ${name}`);
    return svc;
}

function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
}

// Create tooltip element once
function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);
}

// Attach tooltip behavior to a mini indicator
function attachTooltip(el, service) {
    if (!el || !service) return;

    // prevent rebinding on refresh
    if (el.dataset.tooltipBound) return;
    el.dataset.tooltipBound = '1';

    el.addEventListener('mouseenter', () => {
        const statusClass = mapStatusToClass(service.status);

        tooltip.innerHTML = `
            <div class="title">${service.name}</div>
            <div class="status ${statusClass}">
                ${service.status.replace(/_/g, ' ').toUpperCase()}
            </div>
            ${service.description ? `<div class="desc">${service.description}</div>` : ''}
        `;

        const rect = el.getBoundingClientRect();
        
        // Force layout BEFORE measuring tooltip
        tooltip.classList.add('visible');
        const tooltipRect = tooltip.getBoundingClientRect();

        let left = rect.left + window.scrollX;
        let top  = rect.bottom + window.scrollY + 8;

        const scrollbarWidth = getScrollbarWidth();
        const maxX = window.innerWidth - scrollbarWidth - tooltipRect.width - 12;

        // Prevent overflow behind scrollbar / viewport edge
        const viewportWidth = window.innerWidth;
        if (left + tooltipRect.width > viewportWidth - 12) {
            left = viewportWidth - tooltipRect.width - 12;
        }

        if (left > maxX) {
            left = maxX;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    });

    el.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
    });
}
