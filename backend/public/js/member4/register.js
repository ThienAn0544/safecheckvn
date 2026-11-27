document.querySelector('#registerForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const password = document.querySelector('#registerPassword').value;
  const confirmPassword = document.querySelector('#confirmPassword').value;
  const alert = document.querySelector('#registerAlert');
  if (password !== confirmPassword) {
    alert.className = 'message show error';
    alert.textContent = 'Mật khẩu nhập lại chưa khớp.';
    return;
  }
  try {
    const apiBase = location.protocol === 'file:' || location.port !== '3000'
      ? 'http://localhost:3000/api'
      : '/api';
    const response = await fetch(`${apiBase}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: document.querySelector('#fullName').value,
        email: document.querySelector('#registerEmail').value,
        password
      })
    });
    if (!(response.headers.get('content-type') || '').includes('application/json')) {
      throw new Error('API xác thực chưa chạy. Hãy khởi động lại Back-end tại cổng 3000.');
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    localStorage.setItem('safecheck-token', result.data.token);
    localStorage.setItem('safecheck-user', JSON.stringify(result.data.user));
    alert.className = 'message show success';
    alert.textContent = result.message;
    setTimeout(() => { location.href = 'profile.html'; }, 500);
  } catch (error) {
    alert.className = 'message show error';
    alert.textContent = error.message || 'Đăng ký thất bại.';
  }
});
