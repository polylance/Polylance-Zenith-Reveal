(function () {
  try {
    var saved = localStorage.getItem('pl-theme');
    var theme = saved === 'storm' || saved === 'light' ? saved : 'light';
    document.documentElement.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'storm' ? '#0A0E11' : '#FFFFFF');
    }
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
