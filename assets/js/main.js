const API_BASE_URL = location.protocol === 'file:' || location.port !== '3000'
  ? 'http://localhost:3000/api'
  : '/api';

window.SafeCheck = {
  api: async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('API không trả về JSON. Hãy khởi động lại Back-end tại cổng 3000.');
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể kết nối máy chủ');
    return result;
  },
  formatDate: value => new Intl.DateTimeFormat('vi-VN').format(new Date(value))
};

document.querySelectorAll('[data-current-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

function setupAccountMenu() {
  const token = localStorage.getItem('safecheck-token') || sessionStorage.getItem('safecheck-token');
  const rawUser = localStorage.getItem('safecheck-user') || sessionStorage.getItem('safecheck-user');
  const loginLink = document.querySelector('a[href*="account/login.html"]');
  if (!token || !rawUser || !loginLink) return;

  try {
    const user = JSON.parse(rawUser);
    const initial = (user.fullName || user.email || 'U').trim().charAt(0).toUpperCase();
    const wrapper = document.createElement('div');
    wrapper.className = 'account-menu';
    wrapper.innerHTML = `
      <button class="account-trigger" type="button" aria-expanded="false" aria-label="Mở menu tài khoản">
        <span class="account-avatar">${initial}</span>
        <span class="account-name">${user.fullName || 'Tài khoản'}</span>
      </button>
      <div class="account-dropdown">
        <strong>${user.fullName || 'Người dùng'}</strong>
        <small>${user.email || ''}</small>
        <a href="${loginLink.href.replace('login.html', 'profile.html')}">Hồ sơ cá nhân</a>
        <button type="button" data-logout>Đăng xuất</button>
      </div>`;
    loginLink.replaceWith(wrapper);

    const trigger = wrapper.querySelector('.account-trigger');
    trigger.addEventListener('click', () => {
      const opened = wrapper.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(opened));
    });
    wrapper.querySelector('[data-logout]').addEventListener('click', () => {
      ['safecheck-token', 'safecheck-user'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      location.href = '/index.html';
    });
    document.addEventListener('click', event => {
      if (!wrapper.contains(event.target)) wrapper.classList.remove('open');
    });
  } catch (_error) {
    localStorage.removeItem('safecheck-user');
    sessionStorage.removeItem('safecheck-user');
  }
}

setupAccountMenu();
