/* =========================
   Utility: Animate card entry
========================= */
function animateCard(card, index) {
    card.style.animationDelay = `${index * 60}ms`;
    card.classList.add('animate-in');
}

/* =========================
   Fleet Loader
========================= */
fetch('data/fleet.json')
  .then(res => res.json())
  .then(fleet => {
    const grid = document.getElementById('fleet-grid');
    grid.dataset.items = JSON.stringify(fleet);
    renderFleet(fleet);
  });

function renderFleet(fleet) {
    const grid = document.getElementById('fleet-grid');
    grid.innerHTML = '';

    fleet.forEach((ship, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.role = ship.role;

        card.innerHTML = `
          <h2>${ship.name}</h2>
          <span class="role">${ship.role}</span>
          <p>${ship.description}</p>
        `;

        grid.appendChild(card);
        animateCard(card, index);
    });
}

/* =========================
   Member Loader
========================= */
fetch('data/members.json')
  .then(res => res.json())
  .then(members => {
    const grid = document.getElementById('member-grid');
    grid.dataset.items = JSON.stringify(members);
    renderMembers(members);
  });

function renderMembers(members) {
    const grid = document.getElementById('member-grid');
    grid.innerHTML = '';

    members.forEach((member, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.role = member.role;

        card.innerHTML = `
          <h2>${member.name}</h2>
          <h3>${member.sc-name}</h3>
          <span class="role">${member.role}</span>
          <p>${member.specialty} — ${member.ship}</p>
        `;

        grid.appendChild(card);
        animateCard(card, index);
    });
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

/* =========================
   RSI Server Status
========================= */
const statusEl = document.querySelector('.status-right');

fetch('https://status.robertsspaceindustries.com/index.json')
    .then(response => response.json())
    .then(data => {
        const status = (data.summaryStatus || 'unknown').toUpperCase();

        statusEl.textContent = status;

        // Reset state
        statusEl.classList.remove('online', 'degraded', 'offline');
        statusEl.style.color = 
            status === 'OPERATIONAL' ? data.colorOk :
            status === 'DISRUPTED' ? data.colorDisrupted :
            data.colorDown;

        switch (status) {
            case 'OPERATIONAL':
                statusEl.classList.add('online');
                break;
            case 'DEGRADED':
                statusEl.classList.add('degraded');
                break;
            default:
                statusEl.classList.add('offline');
        }
    })
    .catch(() => {
        statusEl.textContent = 'OFFLINE';
        statusEl.classList.remove('online');
        statusEl.classList.add('offline');
    });


/* ===========================
     Per Route Loading
=========================== */
    const routes = {
    overview: renderOverview,
    fleet: renderFleet,
    members: renderMembers,
    logs: renderLogs
};

function navigate(route) {
    document.querySelectorAll('.nav-links a')
        .forEach(a => a.classList.toggle('active', a.dataset.route === route));

    document.querySelector('.content').innerHTML = '';
    routes[route]?.();
}

window.addEventListener('hashchange', () => {
    const route = location.hash.replace('#/', '') || 'overview';
    navigate(route);
});