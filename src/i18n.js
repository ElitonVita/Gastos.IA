// ---------- i18n (Internationalization) ----------
let currentLang = 'en';
let translations = {};

async function loadTranslations(lang) {
  // Lê de window.GASTOS_LOCALES (src/locales.js), não via fetch: o app é
  // pensado pra abrir direto no navegador (file://), e fetch() para um
  // arquivo local é bloqueado nesse caso — só <script src> funciona.
  try {
    const data = window.GASTOS_LOCALES && window.GASTOS_LOCALES[lang];
    if (!data) throw new Error(`Locale "${lang}" not found in window.GASTOS_LOCALES`);
    translations = data;
    currentLang = lang;
    localStorage.setItem('gastosai_lang', lang);
    return true;
  } catch (e) {
    console.error('Failed to load translations:', e);
    return false;
  }
}

function t(key, params = {}) {
  const keys = key.split('.');
  let value = translations;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation missing: ${key}`);
      return key; // fallback to key
    }
  }
  if (typeof value !== 'string') {
    console.warn(`Translation not a string: ${key}`);
    return key;
  }
  // Replace params like {count}, {desc}, etc.
  return value.replace(/\{(\w+)\}/g, (match, param) => params[param] ?? match);
}

function tArray(key) {
  const keys = key.split('.');
  let value = translations;
  for (const k of keys) { if (value && typeof value === 'object' && k in value) value = value[k]; else return []; }
  return Array.isArray(value) ? value : [];
}

function tHtml(key, params = {}) {
  // For translations that contain HTML (like app.title with span)
  // Safe: translations loaded from our own trusted JSON locale files
  return t(key, params);
}

function getCurrentLang() {
  return currentLang;
}

function getAvailableLangs() {
  return [
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];
}

async function switchLanguage(lang) {
  if (lang === currentLang) return;
  const success = await loadTranslations(lang);
  if (success) {
    applyTranslations();
    updateLanguageSelector();
    // Re-render all dynamic content
    if (typeof renderCategoryChips === 'function') renderCategoryChips();
    if (typeof renderTable === 'function') renderTable();
    if (typeof updateCharts === 'function') updateCharts();
    if (typeof updateKPIs === 'function') updateKPIs();
    if (typeof renderBankTypeChips === 'function') renderBankTypeChips();
    if (typeof refreshPeriodOptions === 'function') refreshPeriodOptions();
    if (typeof updateOpeningBalanceStatus === 'function') updateOpeningBalanceStatus();
    if (typeof updateFsStatus === 'function') updateFsStatus();
  }
}

function applyTranslations() {
  // Update static elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const translation = t(key);
    if (el.dataset.i18nHtml === 'true') {
      el.innerHTML = translation;
    } else {
      el.textContent = translation;
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = t(key);
  });

  // Update titles (tooltips)
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    el.title = t(key);
  });

  // Update select options with data-i18n-option
  document.querySelectorAll('[data-i18n-option]').forEach(el => {
    const key = el.dataset.i18nOption;
    el.textContent = t(key);
  });
}

function updateLanguageSelector() {
  const selector = document.getElementById('languageSelector');
  if (!selector) return;
  const langs = getAvailableLangs();
  selector.innerHTML = langs.map(l => `
    <button
      type="button"
      class="lang-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${l.code === currentLang ? 'bg-white dark:bg-zinc-700 shadow-sm text-violet-600 dark:text-violet-300' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}"
      data-lang="${l.code}"
      aria-label="${l.label}"
      title="${l.label}"
    >
      <span class="text-base">${l.flag}</span>
      <span class="font-semibold text-xs hidden sm:inline">${l.label}</span>
    </button>
  `).join('');

  selector.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
  });
}

// Initialize i18n on page load
async function initI18n() {
  const savedLang = localStorage.getItem('gastosai_lang') || 'en';
  await loadTranslations(savedLang);
  updateLanguageSelector();
  applyTranslations();
}

// Export for use in other modules
window.i18n = {
  t,
  tArray,
  tHtml,
  getCurrentLang,
  getAvailableLangs,
  switchLanguage,
  applyTranslations,
  initI18n
};