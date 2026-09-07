// ============================================================
// Aanuoluwapo Afolabi — portfolio front-end
// Fetches data/portfolio.json and renders every dynamic section.
// Falls back to the Flask API (API_BASE) for the contact form,
// with a mailto fallback if no backend is deployed alongside it.
// ============================================================

const API_BASE = ''; // same-origin. When served by Flask (backend/app.py) this just works.
                      // On static hosts (Netlify/GitHub Pages) with no backend, the contact
                      // form automatically falls back to a mailto link — see wireContactForm().

let DATA = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  document.getElementById('year').textContent = new Date().getFullYear();
  updateStatus();
  setInterval(updateStatus, 30000);
  wireNav();
  wireMobileMenu();
  wireHeroFlip();
  wireTabs();
  wireLightbox();

  try {
    const res = await fetch('data/portfolio.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    DATA = await res.json();
  } catch (err) {
    console.error('Could not load portfolio data:', err);
    document.querySelectorAll('.skeleton').forEach(el => {
      el.textContent = 'Could not load data/portfolio.json — open this site through a local server (not file://) or check the file exists.';
    });
    return;
  }

  renderHeroStats(DATA.stats);
  renderTimeline(DATA.timeline);
  renderSkills(DATA.skills);
  renderProjects(DATA.projects);
  renderAchievements(DATA.achievements);
  renderGradeChart(DATA.certifications);
  renderCertifications(DATA.certifications);
  renderEducation(DATA.education);
  renderInterests(DATA.interests);
  renderContactCards(DATA.meta);
  wireContactForm(DATA.meta);
}

// ---------- status line ----------
function updateStatus() {
  try {
    const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }).format(new Date());
    document.getElementById('statusText').textContent = `Open to new opportunities — Abuja, Nigeria — ${t} local`;
  } catch (e) { /* ignore */ }
}

// ---------- nav ----------
function wireNav() {
  const nav = document.getElementById('siteNav');
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-links a[data-nav]');
  function onScroll() {
    nav.classList.toggle('solid', window.scrollY > 40);
    const pos = window.scrollY + 140;
    let current = '';
    sections.forEach(s => { if (pos >= s.offsetTop) current = s.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function wireMobileMenu() {
  const navToggle = document.getElementById('navToggle');
  const mobilePanel = document.getElementById('mobilePanel');
  navToggle.addEventListener('click', () => mobilePanel.classList.toggle('open'));
  mobilePanel.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => mobilePanel.classList.remove('open'))
  );
}

function wireHeroFlip() {
  const flipCard = document.getElementById('flipCard');
  flipCard.addEventListener('click', () => flipCard.classList.toggle('flipped'));
  flipCard.setAttribute('tabindex', '0');
  flipCard.setAttribute('role', 'button');
  flipCard.setAttribute('aria-label', 'Click to flip photo');
  flipCard.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard.classList.toggle('flipped'); }
  });
}

function wireTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

// ---------- hero stats ----------
function renderHeroStats(stats) {
  const el = document.getElementById('heroStats');
  el.innerHTML = stats.map(s => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('');
}

// ---------- timeline ----------
function renderTimeline(timeline) {
  const el = document.getElementById('timeline');
  el.innerHTML = timeline.map((job, i) => `
    <div class="tl-item ${i === 0 ? 'open' : ''}">
      <div class="tl-node"></div>
      <div class="tl-body">
        <div class="tl-header">
          <div>
            <h3>${esc(job.role)}</h3>
            <span class="tl-org">${esc(job.org)} — ${esc(job.location)}</span>
          </div>
          <div style="display:flex; align-items:center; gap:14px;">
            <span class="tl-date">${esc(job.start)} – ${esc(job.end)}</span>
            <svg class="tl-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div class="tl-details">
          <ul>${job.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  `).join('');

  el.querySelectorAll('.tl-header').forEach(h => {
    h.addEventListener('click', () => h.closest('.tl-item').classList.toggle('open'));
  });
}

// ---------- skills (Chart.js horizontal bar) ----------
function renderSkills(skills) {
  const legend = document.getElementById('skillLegend');
  legend.innerHTML = skills.map(s =>
    `<div class="skill-legend-item"><span>${esc(s.name)}</span><b>${esc(s.tier)}</b></div>`
  ).join('');

  const ctx = document.getElementById('skillChart');
  const colors = skills.map(s => s.level === 4 ? '#1D9C82' : s.level === 3 ? '#2FD5B2' : '#9FD9C9');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: skills.map(s => s.name),
      datasets: [{
        label: 'Depth of experience',
        data: skills.map(s => s.level),
        backgroundColor: colors,
        borderRadius: 3,
        maxBarThickness: 18
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => skills[ctx.dataIndex].tier
          }
        }
      },
      scales: {
        x: { min: 0, max: 4, ticks: { stepSize: 1, display: false }, grid: { display: false } },
        y: { grid: { display: false }, ticks: { font: { family: "'Space Grotesk', sans-serif", size: 12 } } }
      }
    }
  });
}

// ---------- projects ----------
function renderProjects(projects) {
  const el = document.getElementById('projectsGrid');
  el.innerHTML = projects.map(p => {
    if (p.comingSoon) {
      return `
        <div class="project-card">
          <span class="p-tag">${esc(p.tag)}</span>
          <h3>${esc(p.title)}</h3>
        </div>`;
    }
    return `
      <div class="project-card">
        <span class="p-tag">${esc(p.tag)}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        <div class="p-meta"><span>${esc(p.org)}</span><span>${esc(p.period)}</span></div>
      </div>`;
  }).join('');
}

// ---------- achievements ----------
function renderAchievements(achievements) {
  const el = document.getElementById('achieveGrid');
  el.innerHTML = achievements.map(a => `
    <div class="achieve-item">
      <span class="achieve-num">${esc(a.num)}</span>
      <h4>${esc(a.title)}</h4>
      <p>${esc(a.desc)}</p>
    </div>
  `).join('');
}

// ---------- grade chart (Chart.js bar, from certifications with a grade) ----------
function renderGradeChart(certifications) {
  const graded = certifications.filter(c => c.grade !== null && c.grade !== undefined);
  const ctx = document.getElementById('gradeChart');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: graded.map(c => c.title),
      datasets: [{
        label: 'Grade',
        data: graded.map(c => c.grade),
        backgroundColor: '#2FD5B2',
        borderRadius: 3,
        maxBarThickness: 46
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, grid: { color: 'rgba(22,35,46,0.08)' } },
        x: { grid: { display: false }, ticks: { font: { family: "'Space Grotesk', sans-serif", size: 11 } } }
      }
    }
  });
}

// ---------- certifications ----------
const CATEGORY_LABELS = { tech: 'Technology', business: 'Business & data', safety: 'Safety & environment', people: 'People & project' };
const CATEGORY_COLORS = { tech: '#2FD5B2', business: '#E7A33E', safety: '#1B3A52', people: '#5A6670' };

function renderCertifications(certifications) {
  // summary + doughnut
  const counts = {};
  certifications.forEach(c => { counts[c.category] = (counts[c.category] || 0) + 1; });
  const cats = Object.keys(counts);

  document.getElementById('certSummaryLegend').innerHTML = cats.map(cat =>
    `<div><b>${counts[cat]}</b>${esc(CATEGORY_LABELS[cat] || cat)}</div>`
  ).join('') + `<div><b>${certifications.length}</b>Total certifications</div>`;

  new Chart(document.getElementById('certCategoryChart'), {
    type: 'doughnut',
    data: {
      labels: cats.map(c => CATEGORY_LABELS[c] || c),
      datasets: [{ data: cats.map(c => counts[c]), backgroundColor: cats.map(c => CATEGORY_COLORS[c] || '#ccc'), borderWidth: 0 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      cutout: '65%'
    }
  });

  // grid
  const grid = document.getElementById('certGrid');
  grid.innerHTML = certifications.map(c => {
    const thumb = c.image
      ? `<div class="cert-thumb"><img src="${esc(c.image)}" alt="${esc(c.title)} certificate"></div>`
      : `<div class="cert-thumb no-image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/></svg></div>`;
    return `
      <div class="cert-card show" data-cat="${esc(c.category)}" ${c.image ? `data-img="${esc(c.image)}"` : ''} data-title="${esc(c.title)}" data-meta="${esc(c.meta)}">
        ${thumb}
        <div class="cert-info"><h4>${esc(c.title)}</h4><span>${esc(c.issuer)} · ${esc(String(c.date).slice(-4))}</span></div>
      </div>`;
  }).join('');

  // filters
  const filterBtns = document.querySelectorAll('.cert-filter');
  const certCards = () => document.querySelectorAll('.cert-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      certCards().forEach(c => c.classList.toggle('show', f === 'all' || c.dataset.cat === f));
    });
  });

  attachLightboxTriggers();
}

// ---------- education ----------
function renderEducation(education) {
  const el = document.getElementById('eduGrid');
  el.innerHTML = education.map(e => `
    <div class="edu-card" data-img="${esc(e.image)}" data-title="${esc(e.title)}" data-meta="${esc(e.org)} · ${esc(e.meta)}">
      <div class="edu-thumb"><img src="${esc(e.image)}" alt="${esc(e.title)} certificate"></div>
      <div class="edu-body">
        <h3>${esc(e.title)}</h3>
        <span class="edu-org">${esc(e.org)}</span>
        <p>${esc(e.description)}</p>
        <div class="edu-meta">${esc(e.meta)}</div>
      </div>
    </div>
  `).join('');
  attachLightboxTriggers();
}

// ---------- interests ----------
function renderInterests(interests) {
  const el = document.getElementById('interestGrid');
  const icons = [
    '<path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="3"/>',
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    '<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>'
  ];
  el.innerHTML = interests.map((it, i) => `
    <div class="interest-card">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${icons[i % icons.length]}</svg>
      <h3>${esc(it.title)}</h3>
      <p>${esc(it.desc)}</p>
    </div>
  `).join('');
}

// ---------- contact ----------
function renderContactCards(meta) {
  const el = document.getElementById('contactCards');
  el.innerHTML = `
    <a class="contact-card" href="mailto:${esc(meta.email)}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
      <div><b>Email</b><span>${esc(meta.email)}</span></div>
    </a>
    <a class="contact-card" href="tel:${esc(meta.phone)}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .3 2 .6 3a2 2 0 01-.5 2L8 10a16 16 0 006 6l1.3-1.2a2 2 0 012-.5c1 .3 2 .5 3 .6a2 2 0 011.7 2z"/></svg>
      <div><b>Phone</b><span>${esc(meta.phoneDisplay)}</span></div>
    </a>
    <div class="contact-card">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <div><b>Location</b><span>${esc(meta.location)}</span></div>
    </div>
  `;
}

function wireContactForm(meta) {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim()
    };
    status.textContent = 'Sending…';
    status.className = 'form-status';
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('backend unavailable');
      status.textContent = 'Message sent — thank you!';
      status.className = 'form-status ok';
      form.reset();
    } catch (err) {
      // No Flask backend reachable (e.g. static hosting on Netlify/GitHub Pages) — fall back to mailto.
      const subject = encodeURIComponent(`Portfolio contact from ${payload.name}`);
      const body = encodeURIComponent(`${payload.message}\n\n— ${payload.name} (${payload.email})`);
      window.location.href = `mailto:${meta.email}?subject=${subject}&body=${body}`;
      status.textContent = 'Opening your email app (no live backend detected)…';
      status.className = 'form-status';
    }
  });
}

// ---------- lightbox ----------
let lightboxWired = false;
function wireLightbox() {
  if (lightboxWired) return;
  lightboxWired = true;
  const lightbox = document.getElementById('lightbox');
  document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lightbox.classList.remove('open'); });
}

function attachLightboxTriggers() {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbTitle = document.getElementById('lightboxTitle');
  const lbMeta = document.getElementById('lightboxMeta');
  document.querySelectorAll('.cert-card, .edu-card').forEach(c => {
    c.addEventListener('click', () => {
      const img = c.dataset.img;
      if (!img) return;
      lbImg.src = img;
      lbImg.alt = c.dataset.title || '';
      lbTitle.textContent = c.dataset.title || '';
      lbMeta.textContent = c.dataset.meta || '';
      lightbox.classList.add('open');
    });
  });
}

// ---------- utils ----------
function esc(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}
