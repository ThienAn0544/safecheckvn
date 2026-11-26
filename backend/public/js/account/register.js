let generatedRegOtp = null;

document.querySelector('#btnSendRegOtp')?.addEventListener('click', () => {
  const email = document.querySelector('#registerEmail').value.trim();
  const alert = document.querySelector('#registerAlert');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    alert.className = 'message show error';
    alert.textContent = 'Vui lòng nhập địa chỉ Email hợp lệ trước khi lấy OTP.';
    return;
  }
  generatedRegOtp = String(Math.floor(100000 + Math.random() * 900000));
  document.querySelector('#registerOtp').value = generatedRegOtp;
  document.querySelector('#otpHelperText').innerHTML = `Mã OTP xác thực của bạn là: <strong>${generatedRegOtp}</strong> (Đã tự động điền)`;
  alert.className = 'message show success';
  alert.textContent = `Đã gửi mã OTP ${generatedRegOtp} tới ${email}.`;
});

document.querySelector('#registerForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const password = document.querySelector('#registerPassword').value;
  const confirmPassword = document.querySelector('#confirmPassword').value;
  const otp = document.querySelector('#registerOtp').value.trim();
  const alert = document.querySelector('#registerAlert');

  if (!generatedRegOtp || otp !== generatedRegOtp) {
    alert.className = 'message show error';
    alert.textContent = 'Mã OTP chưa được gửi hoặc không chính xác.';
    return;
  }
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: document.querySelector('#fullName').value.trim(),
        email: document.querySelector('#registerEmail').value.trim(),
        phone: document.querySelector('#registerPhone')?.value.trim() || '',
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
    setTimeout(() => { location.href = 'profile.html'; }, 600);
  } catch (error) {
    alert.className = 'message show error';
    alert.textContent = error.message || 'Đăng ký thất bại.';
  }
});
