$(document).ready(function() {
  const USERS_KEY = 'scam_alert_users';
  const CURRENT_USER_KEY = 'scam_alert_current_user';
  const REPORTS_KEY = 'scam_alert_user_reports';
  const WATCHLIST_KEY = 'scam_alert_user_watchlist';

  // Khởi tạo dữ liệu mẫu báo cáo & theo dõi nếu chưa có
  if (!localStorage.getItem(REPORTS_KEY)) {
    localStorage.setItem(REPORTS_KEY, JSON.stringify([
      { id: 'BC-1024', target: '190384729104 - Techcombank', category: 'Giả mạo tuyển dụng CTV', date: '12/11/2026', status: 'approved', note: 'Đã xác minh qua sao kê.' },
      { id: 'BC-1059', target: '0987654321', category: 'Giả danh cơ quan nhà nước', date: '13/11/2026', status: 'pending', note: 'Chờ duyệt ảnh.' }
    ]));
  }

  if (!localStorage.getItem(WATCHLIST_KEY)) {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify([
      { id: 'w_1', target: '190384729104 - Techcombank', note: 'Chủ TK TRẦN VĂN X - Lừa đảo việc nhẹ lương cao', riskLevel: 'danger', reportCount: 14 }
    ]));
  }

  let currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  if (!currentUser) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    currentUser = users[0];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  }

  function getRank(points) {
    if (points >= 200) return { name: 'Chuyên gia Cảnh báo', next: 500, pct: Math.min(100, Math.round((points / 500) * 100)) };
    if (points >= 100) return { name: 'Thám tử Cộng đồng', next: 200, pct: Math.round((points / 200) * 100) };
    return { name: 'Người bảo vệ Mới', next: 100, pct: Math.round((points / 100) * 100) };
  }

  function renderProfile() {
    const initials = currentUser.fullName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
    $('#userAvatar').text(initials || 'TV');
    $('#sidebarName').text(currentUser.fullName);
    $('#sidebarContact').text(currentUser.email || currentUser.phone);
    $('#navGreeting').text('Xin chào, ' + currentUser.fullName);

    const pts = currentUser.points || 0;
    const r = getRank(pts);
    $('#sidebarPoints').text(pts + ' điểm');
    $('#sidebarRank').html(`<i class="bi bi-award-fill me-1"></i>${r.name}`);
    $('#repCurrentRank').text(r.name);
    $('#repProgressText').text(`${pts} / ${r.next} điểm`);
    $('#repProgressBar').css('width', r.pct + '%');

    $('#editFullName').val(currentUser.fullName);
    $('#editEmail').val(currentUser.email || '');
    $('#editPhone').val(currentUser.phone || '');
    $('#editBio').val(currentUser.bio || '');
  }

  function renderReports(filter = 'all') {
    const reports = JSON.parse(localStorage.getItem(REPORTS_KEY)) || [];
    const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

    $('#countReports').text(reports.length);
    $('#statTotalReports').text(reports.length);
    $('#statApprovedReports').text(reports.filter(r => r.status === 'approved').length);

    const tbody = $('#reportsTableBody');
    tbody.empty();

    if (filtered.length === 0) {
      tbody.append('<tr><td colspan="5" class="text-center text-muted py-3">Không có báo cáo nào.</td></tr>');
      return;
    }

    const badgeMap = {
      approved: '<span class="badge bg-success">Đã duyệt</span>',
      pending: '<span class="badge bg-warning text-dark">Chờ duyệt</span>',
      rejected: '<span class="badge bg-danger">Từ chối</span>'
    };

    filtered.forEach(item => {
      tbody.append(`
        <tr>
          <td class="fw-semibold text-primary">${item.id}</td>
          <td>${item.target}<br><small class="text-muted">${item.note}</small></td>
          <td><span class="badge bg-light text-dark border">${item.category}</span></td>
          <td class="small text-muted">${item.date}</td>
          <td>${badgeMap[item.status]}</td>
        </tr>
      `);
    });
  }

  function renderWatchlist() {
    const list = JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
    $('#countWatchlist').text(list.length);
    $('#statWatchlist').text(list.length);

    const container = $('#watchlistContainer');
    container.empty();

    if (list.length === 0) {
      container.append('<div class="col-12 text-center text-muted py-3">Chưa theo dõi đối tượng nào.</div>');
      return;
    }

    list.forEach(item => {
      container.append(`
        <div class="col-md-6">
          <div class="border rounded-3 p-3 bg-white h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="fw-bold text-dark mb-1">${item.target}</div>
              <p class="small text-muted mb-2">${item.note}</p>
            </div>
            <div class="d-flex justify-content-between align-items-center pt-2 border-top">
              <small class="text-danger fw-semibold">${item.reportCount} lượt tố cáo</small>
              <button class="btn btn-sm btn-outline-secondary btn-unwatch" data-id="${item.id}">Bỏ theo dõi</button>
            </div>
          </div>
        </div>
      `);
    });
  }

  function renderBadges() {
    const pts = currentUser.points || 0;
    const badges = [
      { title: 'Tiên phong', desc: 'Xác thực tài khoản', icon: 'bi-shield-check', color: 'text-primary', unlocked: true },
      { title: 'Mắt diều hâu', desc: '1 báo cáo được duyệt', icon: 'bi-eye-fill', color: 'text-success', unlocked: pts >= 25 },
      { title: 'Thám tử', desc: 'Đạt 100 điểm', icon: 'bi-award-fill', color: 'text-warning', unlocked: pts >= 100 },
      { title: 'Lá chắn Thép', desc: 'Đạt 200 điểm', icon: 'bi-trophy-fill', color: 'text-danger', unlocked: pts >= 200 }
    ];

    const container = $('#badgesContainer');
    container.empty();
    badges.forEach(b => {
      container.append(`
        <div class="col-sm-6 col-md-3">
          <div class="badge-item text-center bg-white h-100 ${b.unlocked ? '' : 'badge-locked'}">
            <i class="bi ${b.icon} ${b.color} fs-1 mb-2 d-block"></i>
            <div class="fw-bold small">${b.title}</div>
            <div class="text-muted small" style="font-size: 0.75rem;">${b.desc}</div>
          </div>
        </div>
      `);
    });
  }

  $('#filterReportStatus').on('change', function() {
    renderReports($(this).val());
  });

  $('#addWatchlistForm').on('submit', function(e) {
    e.preventDefault();
    const target = $('#watchTarget').val().trim();
    const note = $('#watchNote').val().trim();
    if (!target) return;

    let list = JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
    list.unshift({ id: 'w_' + Date.now(), target, note, riskLevel: 'warning', reportCount: 1 });
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    $('#watchTarget').val('');
    $('#watchNote').val('');
    renderWatchlist();
  });

  $(document).on('click', '.btn-unwatch', function() {
    const id = $(this).data('id');
    let list = JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
    list = list.filter(i => i.id !== id);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    renderWatchlist();
  });

  $('#updateProfileForm').on('submit', function(e) {
    e.preventDefault();
    currentUser.fullName = $('#editFullName').val().trim();
    currentUser.email = $('#editEmail').val().trim();
    currentUser.phone = $('#editPhone').val().trim();
    currentUser.bio = $('#editBio').val().trim();

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    let idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = currentUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    renderProfile();
    $('#profileUpdateAlert').removeClass('d-none').addClass('alert-success').text('Cập nhật hồ sơ thành công!');
  });

  $('#changePasswordForm').on('submit', function(e) {
    e.preventDefault();
    const cur = $('#currentPassword').val();
    const nxt = $('#newPassword').val();
    const cfm = $('#confirmNewPassword').val();

    if (cur !== currentUser.password) {
      $('#passwordUpdateAlert').removeClass('d-none').addClass('alert-danger').text('Mật khẩu hiện tại không đúng.');
      return;
    }
    if (nxt.length < 6) {
      $('#passwordUpdateAlert').removeClass('d-none').addClass('alert-danger').text('Mật khẩu mới tối thiểu 6 ký tự.');
      return;
    }
    if (nxt !== cfm) {
      $('#passwordUpdateAlert').removeClass('d-none').addClass('alert-danger').text('Mật khẩu xác nhận không khớp.');
      return;
    }

    currentUser.password = nxt;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    let idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = currentUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    $('#changePasswordForm')[0].reset();
    $('#passwordUpdateAlert').removeClass('d-none').addClass('alert-success').text('Đổi mật khẩu thành công!');
  });

  $('#btnLogout').on('click', function() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'login.html';
  });

  renderProfile();
  renderReports();
  renderWatchlist();
  renderBadges();
});