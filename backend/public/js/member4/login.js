async function authRequest(path, body) {
  const apiBase = location.protocol === 'file:' || location.port !== '3000'
    ? 'http://localhost:3000/api'
    : '/api';
  const response = await fetch(`${apiBase}/auth/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  if (!(response.headers.get('content-type') || '').includes('application/json')) {
    throw new Error('API xác thực chưa chạy. Hãy khởi động lại Back-end tại cổng 3000.');
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Không thể kết nối máy chủ.');
  return result;
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
    const remember = document.querySelector('#rememberMe').checked;
    const storage = remember ? localStorage : sessionStorage;
    const oldStorage = remember ? sessionStorage : localStorage;
    oldStorage.removeItem('safecheck-token');
    oldStorage.removeItem('safecheck-user');
    storage.setItem('safecheck-token', result.data.token);
    storage.setItem('safecheck-user', JSON.stringify(result.data.user));
    alert.className = 'message show success';
    alert.textContent = result.message;
    setTimeout(() => { location.href = '../index.html'; }, 500);
  } catch (error) {
    alert.className = 'message show error';
    alert.textContent = error.message;
  }
});

document.querySelector('#forgotForm')?.addEventListener('submit', event => {
  event.preventDefault();
  const alert = document.querySelector('#forgotAlert');
  alert.className = 'message show error';
  alert.textContent = 'API quên mật khẩu chưa được triển khai.';
});
