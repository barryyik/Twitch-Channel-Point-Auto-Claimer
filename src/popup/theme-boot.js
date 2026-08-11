(function () {
  try {
    var theme = localStorage.getItem('tcpacThemePreference') || 'system';
    var dark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.add(dark ? 'theme-dark' : 'theme-light');
  } catch (e) {
    // ignore
  }
})();
