// Light/dark theme using Bootstrap's data-bs-theme attribute.
// Loaded in <head> (not deferred) so the saved theme applies before the page paints.

(() => {
  const STORAGE_KEY = 'shinobi-theme';
  const root = document.documentElement;

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage unavailable (e.g. private mode): the theme still applies for this page view
    }
  }

  // Saved choice wins; otherwise follow the operating system setting
  function getPreferredTheme() {
    const stored = getStoredTheme();
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function updateToggle(theme) {
    const button = document.getElementById('themeToggle');
    if (!button) return;
    const next = theme === 'dark' ? 'light' : 'dark';
    button.innerHTML = `<i class="bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}"></i>`;
    button.title = `Switch to ${next} theme`;
    button.setAttribute('aria-label', button.title);
  }

  function applyTheme(theme) {
    root.setAttribute('data-bs-theme', theme);
    updateToggle(theme);
  }

  applyTheme(getPreferredTheme());

  document.addEventListener('DOMContentLoaded', () => {
    updateToggle(root.getAttribute('data-bs-theme'));
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      const theme = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      storeTheme(theme);
      applyTheme(theme);
    });
  });

  // Keep other open tabs in sync when the theme changes
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) applyTheme(getPreferredTheme());
  });

  // Follow OS changes only while the user hasn't picked a theme
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!getStoredTheme()) applyTheme(getPreferredTheme());
  });
})();
