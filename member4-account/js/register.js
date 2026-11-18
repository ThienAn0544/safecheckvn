$(document).ready(function() {
  const USERS_KEY = 'scam_alert_users';
  const CURRENT_USER_KEY = 'scam_alert_current_user';
  let generatedOtp = null;

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

  $('#btnSendOtp').on('click', function() {
    const identifier = $('#regIdentifier').val().trim();
    if (!identifier) {
      $('#registerAlert').removeClass('d-none alert-success alert-info').addClass('alert-danger').text('Vui lòng nhập Email hoặc Số điện thoại trước.');
      return;
    }
    generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    $('#regOtp').val(generatedOtp);
    $('#registerAlert').removeClass('d-none alert-danger').addClass('alert-info').html(`Mã OTP giả lập của bạn là: <strong>${generatedOtp}</strong> (Đã tự điền)`);
  });

  $('#registerForm').on('submit', function(e) {
    e.preventDefault();
    const fullName = $('#regFullName').val().trim();
    const identifier = $('#regIdentifier').val().trim();
    const otp = $('#regOtp').val().trim();
    const password = $('#regPassword').val();
    const confirmPassword = $('#regConfirmPassword').val();

    if (!fullName || !identifier || !otp || !password) {
      $('#registerAlert').removeClass('d-none alert-success alert-info').addClass('alert-danger').text('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (!generatedOtp || otp !== generatedOtp) {
      $('#registerAlert').removeClass('d-none alert-success alert-info').addClass('alert-danger').text('Mã OTP không chính xác hoặc chưa gửi.');
      return;
    }
    if (password.length < 6) {
      $('#registerAlert').removeClass('d-none alert-success alert-info').addClass('alert-danger').text('Mật khẩu tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      $('#registerAlert').removeClass('d-none alert-success alert-info').addClass('alert-danger').text('Mật khẩu xác nhận không khớp.');
      return;
    }

    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    if (users.some(u => u.email === identifier || u.phone === identifier)) {
      $('#registerAlert').removeClass('d-none alert-success alert-info').addClass('alert-danger').text('Email hoặc SĐT này đã tồn tại trong hệ thống.');
      return;
    }

    const isEmail = identifier.includes('@');
    const newUser = {
      id: 'u_' + Date.now(),
      fullName: fullName,
      email: isEmail ? identifier : '',
      phone: !isEmail ? identifier : '',
      password: password,
      bio: 'Thành viên mới gia nhập.',
      points: 20
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    $('#registerAlert').removeClass('d-none alert-danger alert-info').addClass('alert-success').text('Đăng ký thành công! Đang chuyển hướng...');
    setTimeout(() => window.location.href = 'profile.html', 1000);
  });
});