(function () {
  try {
    var theme = localStorage.getItem('tcpacThemePreference') || 'system';
    var dark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.add(dark ? 'theme-dark' : 'theme-light');

    var accent = localStorage.getItem('tcpacAccentPreference') || '{{DEFAULT_ACCENT}}';
    var valid = {{ACCENT_IDS_JSON}};
    document.documentElement.setAttribute(
      'data-accent',
      valid[accent] ? accent : '{{DEFAULT_ACCENT}}'
    );
  } catch (e) {
    // ignore
  }
})();
