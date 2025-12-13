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
        <div id="fleet-grid"></div>
    `,
    members: `
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