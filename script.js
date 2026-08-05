(function () {
  const container = document.getElementById('portfolioContainer');
  const footer    = document.getElementById('portfolioFooter');
  const COLS      = 3;

  /* ── Remote JSON (change to your endpoint) ───────────────── */
  const DATA_URL = 'https://raw.githubusercontent.com/ProCodersEg/svwh/refs/heads/main/projects.json';

  /* ── Store projects for lookup on click ──────────────────── */
  let PROJECTS_BY_ID = {};

  /* ── Fetch ───────────────────────────────────────────────── */
  async function fetchData() {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  /* ── Build ───────────────────────────────────────────────── */
  function build(data) {
    const { developer, projects } = data;

    // Index projects by id so handleProjectClick can look up the link
    PROJECTS_BY_ID = {};
    projects.forEach(p => { PROJECTS_BY_ID[p.id] = p; });

    const sorted = [...projects].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.year - a.year;
    });

    container.innerHTML =
      developerSection(developer) +
      sectionDivider() +
      projectsSection(sorted, projects.length);

    footer.innerHTML = buildFooter(projects.length);

    setTimeout(setupFilters, 80);
  }

  /* ── Developer Section ───────────────────────────────────── */
  function developerSection(dev) {
    return `
      <section class="developer-section">
        <div class="dev-avatar-wrapper">
          <img src="${dev.avatar}" alt="${dev.name}" class="dev-avatar"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
          <div class="dev-avatar-fallback" style="display:none;">${dev.name.charAt(0)}</div>
          <div class="dev-verified"><i class="fas fa-check"></i></div>
        </div>

        <div class="dev-info-wrapper">
          <div class="dev-row-1">
            <h1 class="dev-name">${dev.name}</h1>
            <span class="dev-title-tag">${dev.title}</span>
            <span class="dev-badge"><i class="fab fa-google-play"></i> Developer</span>
          </div>
          <div class="dev-row-2">
            <span class="meta-item"><i class="fas fa-envelope"></i> ${dev.email}</span>
            <span class="meta-item"><i class="fas fa-map-marker-alt"></i> ${dev.location}</span>
          </div>
          <p class="dev-bio">${dev.bio}</p>
          <div class="dev-skills">
            ${dev.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
        </div>

        <div class="dev-social">
          ${dev.social.map(s => `
            <a href="${s.url}" class="social-link" target="_blank" rel="noopener" title="${s.platform}">
              <i class="fab ${s.icon}"></i> ${s.platform}
            </a>
          `).join('')}
        </div>
      </section>`;
  }

  /* ── Divider ─────────────────────────────────────────────── */
  function sectionDivider() {
    return `
      <div class="section-divider">
        <span class="divider-icon"><i class="fab fa-google-play"></i></span>
        Apps &amp; Games
      </div>`;
  }

  /* ── Projects Section ────────────────────────────────────── */
  function projectsSection(projects, total) {
    return `
      <div class="projects-header">
        <h2 class="projects-title">
          Featured Apps
          <span class="title-count">${total} apps</span>
        </h2>
        <div class="filter-buttons">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="trending">🔥 Trending</button>
          <button class="filter-btn" data-filter="pinned">📌 Pinned</button>
        </div>
      </div>
      <div class="projects-grid" id="projectsGrid">
        ${buildCards(projects)}
      </div>`;
  }

  /* ── Cards ───────────────────────────────────────────────── */
  function buildCards(projects) {
    let html = projects.map(p => {
      let cls = 'project-card real';
      if (p.pinned)    cls += ' pinned';
      if (p.trending)  cls += ' trending';

      return `
        <div class="${cls}" data-id="${p.id}" data-pinned="${p.pinned}" data-trending="${p.trending}">
          ${badges(p)}
          <div class="app-header">
            <div class="app-icon-wrapper">
              <img src="${p.icon}" alt="${p.name}" class="app-icon-img"
                   onerror="this.style.display='none';this.parentElement.querySelector('.app-icon-fallback').style.display='block';">
              <i class="fas fa-mobile-alt app-icon-fallback" style="display:none;"></i>
            </div>
            <div class="app-info">
              <h3 class="app-name">${p.name}</h3>
              <div class="app-meta">
                <span class="rating"><i class="fas fa-star"></i> ${p.rating}</span>
                <span class="installs">${p.installs}</span>
                <span class="play-badge-small"><i class="fab fa-google-play"></i> Play</span>
              </div>
            </div>
          </div>
          <p class="app-desc">${p.desc}</p>
          <div class="tech-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
          <div class="card-footer">
            <span class="year"><i class="far fa-calendar-alt"></i> ${p.year}</span>
            <button class="action-button"
                    style="background:${p.actionColor || '#01d78f'};"
                    onclick="handleProjectClick(${p.id})">
              <i class="fas fa-arrow-right"></i> ${p.actionText || 'View'}
            </button>
          </div>
        </div>`;
    }).join('');

    // Placeholders
    const rem = projects.length % COLS;
    const fill = rem ? COLS - rem : 0;
    for (let i = 0; i < fill; i++) {
      html += `
        <div class="project-card placeholder">
          <div class="placeholder-content">
            <i class="fas fa-rocket"></i>
            <p>Coming Soon</p>
            <small>New app in development</small>
          </div>
        </div>`;
    }
    return html;
  }

  function badges(p) {
    if (!p.pinned && !p.trending) return '';
    return `<div class="badges">
      ${p.pinned   ? '<span class="badge pin">📌 Pinned</span>'   : ''}
      ${p.trending ? '<span class="badge trend">🔥 Trending</span>' : ''}
    </div>`;
  }

  /* ── Footer ──────────────────────────────────────────────── */
  function buildFooter(count) {
    return `
      <div class="footer-inner">
        <div class="footer-main">
          <div class="footer-stats">
            <div class="stat-item"><i class="fas fa-mobile-alt"></i> <span class="stat-value">${count}+</span> Apps</div>
            <div class="stat-item"><i class="fas fa-star"></i> <span class="stat-value">4.5+</span> Avg Rating</div>
            <div class="stat-item"><i class="fas fa-download"></i> <span class="stat-value">100K+</span> Downloads</div>
          </div>
          <div class="footer-links">
            <a href="#" onclick="showPolicy('privacy');return false;">Privacy Policy</a>
            <a href="#" onclick="showPolicy('terms');return false;">Terms of Service</a>
            <a href="#" onclick="showPolicy('about');return false;">About</a>
            <a href="#" onclick="showPolicy('contact');return false;">Contact</a>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-brand">
            <div class="brand-icon"><i class="fab fa-google-play"></i></div>
            Google Play Developer
          </div>
          <span>© 2025 Altan Droid. All rights reserved.</span>
        </div>
      </div>`;
  }

  /* ── Filters ─────────────────────────────────────────────── */
  function setupFilters() {
    const btns  = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card.real');

    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;

      cards.forEach(c => {
        const show =
          f === 'all'      ? true :
          f === 'trending' ? c.dataset.trending === 'true' :
          f === 'pinned'   ? c.dataset.pinned   === 'true' : true;
        c.style.display = show ? 'flex' : 'none';
      });
      updatePlaceholders();
    }));
  }

  function updatePlaceholders() {
    let vis = 0;
    document.querySelectorAll('.project-card.real').forEach(c => { if (c.style.display !== 'none') vis++; });
    const need = vis % COLS ? COLS - (vis % COLS) : 0;
    document.querySelectorAll('.project-card.placeholder').forEach((p, i) => {
      p.style.display = i < need ? 'flex' : 'none';
    });
  }

  /* ── Modal helpers ───────────────────────────────────────── */
  window.closeModal = function () {
    document.getElementById('modalOverlay').classList.remove('open');
  };

  function openModal(title, content) {
    document.getElementById('modalBody').innerHTML = `<h2>${title}</h2><p>${content}</p>`;
    document.getElementById('modalOverlay').classList.add('open');
  }

  /* ── Policy Modal ────────────────────────────────────────── */
  window.showPolicy = function (type) {
    const map = {
      privacy: ['Privacy Policy', 'We take your privacy seriously. Our apps do not collect, store, or share personal information. All data remains on your device unless you explicitly choose to share it.'],
      terms:   ['Terms of Service', 'By using our apps, you agree to these terms. Apps are provided "as is" without warranties. Users must be at least 13 years old to use our services.'],
      about:   ['About Developer', 'Altan Droid is an independent Android developer focused on high-quality, user-friendly applications — building apps that are both beautiful and functional.'],
      contact: ['Contact Us', 'Email: altan@android.dev\nLocation: San Francisco, CA\nGitHub: github.com/altandroid\n\nWe typically respond within 24–48 hours on business days.']
    };
    const [t, c] = map[type] || ['', ''];
    if (t) openModal(t, c);
  };

  /* ── Project Click ───────────────────────────────────────── */
  window.handleProjectClick = function (id) {
    const project = PROJECTS_BY_ID[id];
    if (project && project.link) {
      window.open(project.link, '_blank', 'noopener');
    } else {
      openModal('⚠️ No Link', `No link is set for project #${id} yet.`);
    }
  };

  /* ── Loading / Error ─────────────────────────────────────── */
  function showLoading() {
    container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading portfolio…</p>
      </div>`;
  }

  function showError(msg) {
    container.innerHTML = `
      <div class="error-container">
        <i class="fas fa-exclamation-circle" style="font-size:2rem;margin-bottom:1rem;display:block;"></i>
        <p>${msg}</p>
        <button onclick="location.reload()"
                style="margin-top:1rem;padding:0.6rem 1.5rem;background:var(--green);color:var(--bg);border:none;border-radius:2rem;cursor:pointer;font-weight:700;font-family:inherit;">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>`;
  }

  /* ── Init ────────────────────────────────────────────────── */
  async function init() {
    showLoading();
    try {
      const data = await fetchData();
      build(data);
    } catch (e) {
      console.error('Failed to load portfolio data:', e);
      showError('Failed to load data. Please check your connection.');
    }
  }

  init();
})();
