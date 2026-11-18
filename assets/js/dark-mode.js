const darkButton = document.querySelector('[data-dark-toggle]');
if (localStorage.getItem('safecheck-theme') === 'dark') document.body.classList.add('dark');
darkButton?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('safecheck-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});
