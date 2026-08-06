(function () {
  const container = document.getElementById('portfolioContainer');
  const footer = document.getElementById('portfolioFooter');
  const COLS = 3;

  /* ── State ───────────────────────────────────────────────── */
  let currentLang = localStorage.getItem('lang') || 'ar';
  let currentTheme = localStorage.getItem('theme') || 'dark';
  let portfolioData = null;
  let PROJECTS_BY_ID = {};

  /* ── I18N ────────────────────────────────────────────────── */
  const I18N = {
    ar: {
      title: "زرعة - مجتمع الألعاب | ألعاب وتطبيقات أندرويد",
      brand: "العاب زرعة",
      dev: { badge: "مبرمجين متخصصين" },
      section: { apps: "تطبيقات & العاب" },
      projects: {
        title: "تطبيقات مميزة",
        count: "تطبيق",
        filters: { all: "الكل", trending: "🔥 شــائع", pinned: "📌 مثبــت" }
      },
      card: {
        pinned: "📌 مثبــت", trending: "🔥 شــائع", play: "Play", view: "عرض"
      },
      placeholder: { title: "يــاتي قريبا", desc: "جارى تجهيز تطبيقات جديدة" },
      footer: {
        projects: "مشاريع", rating: "معدل التقييم",
        privacy: "سياسة الخصوصية", terms: "شروط الاستخدام",
        about: "نبذه عنا", contact: "تواصل معنا",
        copyright: "العاب زرعة @2026. جميع الحقوق محفوظة."
      },
      loading: "جاري التحميل...",
      error: "فشل تحميل البيانات. يرجى التحقق من اتصالك.",
      retry: "إعادة المحاولة",
      modal: {
        noLink: "⚠️ لا يوجد رابط",
        noLinkDesc: "لم يتم تعيين رابط لهذا المشروع بعد."
      },
      policies: {
        privacy: { title: 'سياسة الخصوصية', text: 'نحن نأخذ خصوصيتك بجدية. تطبيقاتنا لا تجمع أو تخزن أو تشارك أي معلومات شخصية. تبقى جميع البيانات على جهازك ما لم تختر مشاركتها بنفسك.' },
        terms: { title: 'شروط الاستخدام', text: 'باستخدامك لتطبيقاتنا فأنت توافق على هذه الشروط. تُقدَّم التطبيقات كما هي دون أي ضمانات. يجب أن يكون عمر المستخدم 13 عامًا على الأقل.' },
        about: { title: 'نبذة عنا', text: 'زرعة هو مجتمع ألعاب عربي يجمع اللاعبين العرب تحت سقف واحد. نصنع تطبيقات وألعاب عربية ممتعة تعكس روح الإبداع في مجتمعنا العربي.' },
        contact: { title: 'تواصل معنا', text: 'البريد الإلكتروني: Codecafe.eg@gmail.com\nتيليجرام: t.me/Circl_e\nجوجل بلاي: play.google.com/store/apps/dev?id=6681521285283655488\n\nنرد عادةً خلال 24-48 ساعة في أيام العمل.' }
      }
    },
    en: {
      title: "Zar3a - Gaming Community | Android Apps",
      brand: "Zar3a Games",
      dev: { badge: "Pro Developers" },
      section: { apps: "Apps & Games" },
      projects: {
        title: "Featured Apps",
        count: "apps",
        filters: { all: "All", trending: "🔥 Trending", pinned: "📌 Pinned" }
      },
      card: {
        pinned: "📌 Pinned", trending: "🔥 Trending", play: "Play", view: "View"
      },
      placeholder: { title: "Coming Soon", desc: "Preparing new apps" },
      footer: {
        projects: "Projects", rating: "Avg Rating",
        privacy: "Privacy Policy", terms: "Terms of Use",
        about: "About Us", contact: "Contact Us",
        copyright: "Zar3a Games @2026. All rights reserved."
      },
      loading: "Loading portfolio...",
      error: "Failed to load data. Please check your connection.",
      retry: "Retry",
      modal: {
        noLink: "⚠️ No Link",
        noLinkDesc: "No link is set for this project yet."
      },
      policies: {
        privacy: { title: 'Privacy Policy', text: 'We take your privacy seriously. Our apps do not collect, store, or share any personal information. All data remains on your device unless you choose to share it.' },
        terms: { title: 'Terms of Use', text: 'By using our apps, you agree to these terms. Apps are provided as-is without warranties. Users must be at least 13 years old.' },
        about: { title: 'About Us', text: 'Zar3a is an Arab gaming community. We create fun Arabic apps and games that reflect creativity in our community.' },
        contact: { title: 'Contact Us', text: 'Email: Codecafe.eg@gmail.com\nTelegram: t.me/Circl_e\nGoogle Play: play.google.com/store/apps/dev?id=6681521285283655488\n\nWe usually reply within 24-48 hours on business days.' }
      }
    }
  };

  function t(keyPath) {
    return keyPath.split('.').reduce((obj, key) => obj && obj[key], I18N[currentLang]) || '';
  }

  /* ── Remote JSON (change to your endpoint) ───────────────── */
  const DATA_URL = 'https://raw.githubusercontent.com/ProCodersEg/svwh/refs/heads/main/projects.json';

  async function fetchData() {
    try {
      const res = await fetch('./project.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error('Both remote and local fetch failed');
      return await res.json();
    }
  }

  /* ── Theme & Lang Toggles ────────────────────────────────── */
  function setupToggles() {
    const langBtn = document.getElementById('langToggle');
    const themeBtn = document.getElementById('themeToggle');

    updateToggleUI();

    langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'ar' ? 'en' : 'ar';
      localStorage.setItem('lang', currentLang);
      document.documentElement.lang = currentLang;
      document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
      updateToggleUI();
      if (portfolioData) render(portfolioData);
    });

    themeBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', currentTheme);
      document.documentElement.dataset.theme = currentTheme;
      updateToggleUI();
    });
  }

  function updateToggleUI() {
    document.getElementById('langLabel').textContent = currentLang === 'ar' ? 'EN' : 'عربي';
    const themeIcon = document.getElementById('themeIcon');
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    document.title = t('title');
    document.getElementById('brandName').textContent = t('brand');
  }

  /* ── Render ──────────────────────────────────────────────── */
  function render(data) {
    const { developer, projects } = data;

    PROJECTS_BY_ID = {};
    projects.forEach(p => { PROJECTS_BY_ID[p.id] = p; });

    const sorted = [...projects].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.year - a.year;
    });

    container.innerHTML =
      developerSection(developer) +
      projectsSection(sorted, projects.length);

    footer.innerHTML = buildFooter(projects.length);
    footer.style.display = 'block';

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
            <span class="dev-badge"><i class="fas fa-code"></i> ${t('dev.badge')}</span>
          </div>
          <div class="dev-row-2">
            <span class="meta-item"><i class="fas fa-envelope"></i> ${dev.email}</span>
            <span class="meta-item"><i class="fas fa-location-dot"></i> ${dev.location}</span>
          </div>
          <p class="dev-bio">${dev.bio}</p>
          <div class="dev-skills">
            ${dev.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
        </div>

        <div class="dev-social">
          ${dev.social.map(s => {
            const iconClass = s.icon.includes('fas') ? s.icon : 'fab ' + s.icon;
            return `
            <a href="${s.url}" class="social-link" target="_blank" rel="noopener" title="${s.platform}">
              <i class="${iconClass}"></i>
            </a>`;
          }).join('')}
        </div>
      </section>`;
  }

  /* ── Projects Section ────────────────────────────────────── */
  function projectsSection(projects, total) {
    return `
      <div class="projects-header">
        <h2 class="projects-title">
          ${t('projects.title')}
          <span class="title-count">${total} ${t('projects.count')}</span>
        </h2>
        <div class="filter-buttons">
          <button class="filter-btn active" data-filter="all">${t('projects.filters.all')}</button>
          <button class="filter-btn" data-filter="trending">${t('projects.filters.trending')}</button>
          <button class="filter-btn" data-filter="pinned">${t('projects.filters.pinned')}</button>
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
      if (p.pinned) cls += ' pinned';
      if (p.trending) cls += ' trending';

      return `
        <div class="${cls}" data-id="${p.id}" data-pinned="${p.pinned}" data-trending="${p.trending}">
          ${badges(p)}
          <div class="app-header">
            <div class="app-icon-wrapper">
              <img src="${p.icon}" alt="${p.name}" class="app-icon-img"
                   onerror="this.style.display='none';this.parentElement.querySelector('.app-icon-fallback').style.display='block';">
              <i class="fas fa-mobile-screen app-icon-fallback" style="display:none;"></i>
            </div>
            <div class="app-info">
              <h3 class="app-name">${p.name}</h3>
              <div class="app-meta">
                <span class="rating"><i class="fas fa-star"></i> ${p.rating}</span>
                <span class="installs">${p.installs}</span>
              </div>
            </div>
          </div>
          <p class="app-desc">${p.desc}</p>
          <div class="tech-tags">${p.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
          <div class="card-footer">
            <span class="year"><i class="far fa-calendar-days"></i> ${p.year}</span>
            <button class="action-button" onclick="handleProjectClick(${p.id})">
              <span>${p.actionText || t('card.view')}</span>
              <div class="action-button-icon"><i class="fas fa-arrow-right"></i></div>
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
            <i class="fas fa-box-open"></i>
            <p>${t('placeholder.title')}</p>
            <small>${t('placeholder.desc')}</small>
          </div>
        </div>`;
    }
    return html;
  }

  function badges(p) {
    if (!p.pinned && !p.trending) return '';
    return `<div class="badges">
      ${p.pinned ? `<span class="badge pin" title="${t('card.pinned')}"><i class="fas fa-thumbtack"></i></span>` : ''}
      ${p.trending ? `<span class="badge trend" title="${t('card.trending')}"><i class="fas fa-fire"></i></span>` : ''}
    </div>`;
  }

  /* ── Footer ──────────────────────────────────────────────── */
  function buildFooter(count) {
    return `
      <div class="footer-inner">
        <div class="footer-main">
          <div class="footer-stats">
            <div class="stat-item"><i class="fas fa-cubes"></i> <span class="stat-value">${count}+</span> ${t('footer.projects')}</div>
            <div class="stat-item"><i class="fas fa-star"></i> <span class="stat-value">4.5+</span> ${t('footer.rating')}</div>
          </div>
          <div class="footer-links">
            <a href="#" onclick="showPolicy('privacy');return false;">${t('footer.privacy')}</a>
            <a href="#" onclick="showPolicy('terms');return false;">${t('footer.terms')}</a>
            <a href="#" onclick="showPolicy('about');return false;">${t('footer.about')}</a>
            <a href="#" onclick="showPolicy('contact');return false;">${t('footer.contact')}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-brand">
            <div class="brand-icon"><i class="fab fa-google-play"></i></div>
            ${t('brand')}
          </div>
          <span>${t('footer.copyright')}</span>
        </div>
      </div>`;
  }

  /* ── Filters ─────────────────────────────────────────────── */
  function setupFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card.real');

    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;

      cards.forEach(c => {
        const show =
          f === 'all' ? true :
            f === 'trending' ? c.dataset.trending === 'true' :
              f === 'pinned' ? c.dataset.pinned === 'true' : true;
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
    const policy = t(`policies.${type}`);
    if (policy && policy.title) openModal(policy.title, policy.text);
  };

  /* ── Project Click ───────────────────────────────────────── */
  window.handleProjectClick = function (id) {
    const project = PROJECTS_BY_ID[id];
    if (project && project.link) {
      window.open(project.link, '_blank', 'noopener');
    } else {
      openModal(t('modal.noLink'), t('modal.noLinkDesc'));
    }
  };

  // Close modal on outside click or close button
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
  });
  document.getElementById('modalClose').addEventListener('click', closeModal);

  /* ── Loading / Error ─────────────────────────────────────── */
  function showLoading() {
    container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>${t('loading')}</p>
      </div>`;
  }

  function showError(msg) {
    container.innerHTML = `
      <div class="error-container">
        <i class="fas fa-exclamation-circle" style="font-size:2rem;margin-bottom:1rem;display:block;"></i>
        <p>${msg || t('error')}</p>
        <button onclick="location.reload()"
                style="margin-top:1rem;padding:0.6rem 1.5rem;background:var(--green);color:var(--bg);border:none;border-radius:2rem;cursor:pointer;font-weight:700;font-family:inherit;">
          <i class="fas fa-redo"></i> ${t('retry')}
        </button>
      </div>`;
  }

  /* ── Init ────────────────────────────────────────────────── */
  async function init() {
    setupToggles();
    showLoading();
    try {
      portfolioData = await fetchData();
      render(portfolioData);
    } catch (e) {
      console.error('Failed to load portfolio data:', e);
      showError();
    }
  }

  init();
})();
