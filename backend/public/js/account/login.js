async function authRequest(path, body) {
  const apiBase = location.protocol === 'file:' || location.port !== '3000'
    ? 'http://localhost:3000/api'
    : '/api';
  const response = await fetch(`${apiBase}/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!(response.headers.get('content-type') || '').includes('application/json')) {
    throw new Error('API xác thực chưa chạy. Hãy khởi động lại Back-end tại cổng 3000.');
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Không thể kết nối máy chủ.');
  return result;
}

function saveSession(token, user, remember = true) {
  const storage = remember ? localStorage : sessionStorage;
  const oldStorage = remember ? sessionStorage : localStorage;
  oldStorage.removeItem('safecheck-token');
  oldStorage.removeItem('safecheck-user');
  storage.setItem('safecheck-token', token);
  storage.setItem('safecheck-user', JSON.stringify(user));
}

const passwordInput = document.querySelector('#loginPassword');
document.querySelector('#togglePassword')?.addEventListener('click', event => {
  passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  event.currentTarget.textContent = passwordInput.type === 'password' ? 'Hiện' : 'Ẩn';
});

document.querySelector('#loginForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const alert = document.querySelector('#loginAlert');
  try {
    const result = await authRequest('login', {
      email: document.querySelector('#loginIdentifier').value,
      password: passwordInput.value
    });
    const remember = document.querySelector('#rememberMe')?.checked ?? true;
    saveSession(result.data.token, result.data.user, remember);
    alert.className = 'message show success';
    alert.textContent = result.message;
    setTimeout(() => {
      location.href = result.data.user.role === 'admin' ? '../admin/admin.html' : 'profile.html';
    }, 500);
  } catch (error) {
    alert.className = 'message show error';
    alert.textContent = error.message;
  }
});

document.querySelectorAll('[data-social]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const provider = btn.dataset.social;
    const alert = document.querySelector('#loginAlert');
    try {
      const result = await authRequest('social', { provider });
      saveSession(result.data.token, result.data.user, true);
      alert.className = 'message show success';
      alert.textContent = result.message;
      setTimeout(() => { location.href = 'profile.html'; }, 500);
    } catch (error) {
      alert.className = 'message show error';
      alert.textContent = error.message;
    }
  });
});

document.querySelector('#btnSendForgotOtp')?.addEventListener('click', async () => {
  const email = document.querySelector('#forgotEmail')?.value.trim();
  const alert = document.querySelector('#forgotAlert');
  if (!email) {
    alert.className = 'message show error';
    alert.textContent = 'Vui lòng nhập email đã đăng ký trước.';
    return;
  }
  try {
    const result = await authRequest('forgot-password', { email });
    if (result.data?.demoOtp) {
      document.querySelector('#forgotOtp').value = result.data.demoOtp;
    }
    alert.className = 'message show success';
    alert.textContent = result.message;
  } catch (error) {
    alert.className = 'message show error';
    alert.textContent = error.message;
  }
});

document.querySelector('#forgotForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const alert = document.querySelector('#forgotAlert');
  try {
    const result = await authRequest('reset-password', {
      email: document.querySelector('#forgotEmail').value.trim(),
      otp: document.querySelector('#forgotOtp').value.trim(),
      newPassword: document.querySelector('#forgotNewPassword').value
    });
    alert.className = 'message show success';
    alert.textContent = result.message;
    setTimeout(() => { location.href = 'login.html'; }, 1200);
  } catch (error) {
    alert.className = 'message show error';
    alert.textContent = error.message;
  }
});
