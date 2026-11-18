window.SafeCheck = {
  api: async (path, options = {}) => {
    const response = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options
    });
    const result = await response.json().catch(() => ({ success: false, message: 'Phản hồi không hợp lệ' }));
    if (!response.ok) throw new Error(result.message || 'Không thể kết nối máy chủ');
    return result;
  },
  formatDate: value => new Intl.DateTimeFormat('vi-VN').format(new Date(value))
};

document.querySelectorAll('[data-current-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
