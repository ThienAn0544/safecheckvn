$(document).ready(function() {
  const USERS_KEY = 'scam_alert_users';
  const CURRENT_USER_KEY = 'scam_alert_current_user';

  // Khởi tạo tài khoản mẫu nếu chưa có
  if (!localStorage.getItem(USERS_KEY)) {
    const defaultUsers = [{
      id: 'u_01',
      fullName: 'Nguyễn Văn An',
      email: 'nguyenvana@gmail.com',
      phone: '0901234567',
      password: '123456',
      bio: 'Thành viên tích cực cộng đồng chống lừa đảo.',
      points: 125
    }];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }

  // Toggle mật khẩu hiển thị
  $('.toggle-pwd').on('click', function() {
    const target = $($(this).data('target'));
    const icon = $(this).find('i');
    if (target.attr('type') === 'password') {
      target.attr('type', 'text');
      icon.removeClass('bi-eye').addClass('bi-eye-slash');
    } else {
      target.attr('type', 'password');
      icon.removeClass('bi-eye-slash').addClass('bi-eye');
    }
  });

  // Đăng nhập form
  $('#loginForm').on('submit', function(e) {
    e.preventDefault();
    const identifier = $('#loginIdentifier').val().trim();
    const password = $('#loginPassword').val();

    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const found = users.find(u => (u.email === identifier || u.phone === identifier) && u.password === password);

    if (!found) {
      $('#loginAlert').removeClass('d-none alert-success').addClass('alert-danger')
        .html('Sai tài khoản hoặc mật khẩu! (Gợi ý test: <b>nguyenvana@gmail.com</b> / <b>123456</b>)');
      return;
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    $('#loginAlert').removeClass('d-none alert-danger').addClass('alert-success').text('Đăng nhập thành công! Đang chuyển hướng...');
    setTimeout(() => window.location.href = 'profile.html', 800);
  });

  // Giả lập Đăng nhập Social (Google / Facebook)
  $('.btn-social').on('click', function() {
    const provider = $(this).data('provider');
    const socialUser = {
      id: 'u_social_' + provider.toLowerCase(),
      fullName: `Người dùng ${provider}`,
      email: `user.${provider.toLowerCase()}@example.com`,
      phone: '0909998887',
      password: 'social_login',
      bio: `Đăng nhập nhanh qua ${provider}.`,
      points: 100
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(socialUser));
    $('#loginAlert').removeClass('d-none alert-danger').addClass('alert-success').text(`Đăng nhập bằng ${provider} thành công! Đang chuyển hướng...`);
    setTimeout(() => window.location.href = 'profile.html', 800);
  });
});