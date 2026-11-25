const getToken = () => localStorage.getItem('safecheck-token') || sessionStorage.getItem('safecheck-token');
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('safecheck-user') || sessionStorage.getItem('safecheck-user') || 'null');
  } catch (_e) { return null; }
};
const setStoredUser = user => {
  if (localStorage.getItem('safecheck-token')) localStorage.setItem('safecheck-user', JSON.stringify(user));
  if (sessionStorage.getItem('safecheck-token')) sessionStorage.setItem('safecheck-user', JSON.stringify(user));
};

async function authFetch(path, options = {}) {
  const token = getToken();
  return window.SafeCheck.api(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
}

document.querySelectorAll('.profile-tab-btn[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.profile-tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab)?.classList.add('active');
  });
});

let cachedReports = [];

function getRankInfo(points) {
  if (points >= 200) return { name: 'Chuyên gia Cảnh báo', next: 500, pct: Math.min(100, Math.round((points / 500) * 100)) };
  if (points >= 100) return { name: 'Thám tử Cộng đồng', next: 200, pct: Math.round((points / 200) * 100) };
  return { name: 'Người bảo vệ Mới', next: 100, pct: Math.round((points / 100) * 100) };
}

function renderUser(user) {
  const initials = (user.fullName || 'U')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  document.getElementById('profileAvatar').textContent = initials || 'TV';
  document.getElementById('sidebarName').textContent = user.fullName || 'Thành viên';
  document.getElementById('sidebarEmail').textContent = user.email || '';

  const points = Number(user.points ?? 20);
  const rank = getRankInfo(points);

  document.getElementById('sidebarPoints').textContent = `${points} điểm`;
  document.getElementById('sidebarRank').textContent = `🏅 ${rank.name}`;
  document.getElementById('repCurrentRank').textContent = rank.name;
  document.getElementById('repProgressText').textContent = `${points} / ${rank.next} điểm`;
  document.getElementById('repProgressBar').style.width = `${rank.pct}%`;

  document.getElementById('profileName').value = user.fullName || '';
  document.getElementById('profileEmail').value = user.email || '';
  document.getElementById('profilePhone').value = user.phone || '';
  document.getElementById('profileBio').value = user.bio || '';

  renderBadges(points);
}

function renderBadges(points) {
  const badges = [
    { emoji: '🛡️', title: 'Người tiên phong', desc: 'Xác thực tài khoản thành công', unlocked: true },
    { emoji: '👁️', title: 'Mắt diều hâu', desc: 'Có ít nhất 1 báo cáo được duyệt', unlocked: points >= 25 },
    { emoji: '🏅', title: 'Thám tử Cộng đồng', desc: 'Đạt mốc 100 điểm uy tín', unlocked: points >= 100 },
    { emoji: '🏆', title: 'Lá chắn Thép', desc: 'Đạt mốc 200 điểm uy tín', unlocked: points >= 200 }
  ];

  const container = document.getElementById('badgesContainer');
  container.innerHTML = badges.map(b => `
    <div class="badge-card ${b.unlocked ? '' : 'locked'}">
      <span class="badge-emoji">${b.emoji}</span>
      <strong>${b.title}</strong>
      <p class="muted" style="font-size: 0.82rem; margin: 6px 0 8px;">${b.desc}</p>
      <span class="badge ${b.unlocked ? '' : 'high'}">${b.unlocked ? 'Đã mở khóa' : 'Chưa đạt'}</span>
    </div>
  `).join('');
}

function renderReports(filter = 'all') {
  const filtered = filter === 'all' ? cachedReports : cachedReports.filter(r => r.status === filter);
  document.getElementById('countReports').textContent = cachedReports.length;
  document.getElementById('statTotalReports').textContent = cachedReports.length;
  document.getElementById('statVerifiedReports').textContent = cachedReports.filter(r => r.status === 'verified').length;

  const tbody = document.getElementById('reportsTableBody');
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">Chưa có báo cáo nào phù hợp bộ lọc.</td></tr>';
    return;
  }

  const labelMap = {
    verified: 'Đã xác minh',
    pending: 'Chờ duyệt',
    rejected: 'Từ chối'
  };

  tbody.innerHTML = filtered.map(item => `
    <tr>
      <td><strong>#BC-${item.id}</strong></td>
      <td>
        <strong>${item.suspect_value}</strong>
        <div class="muted" style="font-size: 0.84rem;">${item.description ? item.description.slice(0, 75) + (item.description.length > 75 ? '...' : '') : ''}</div>
      </td>
      <td><span class="badge">${item.scam_type}</span></td>
      <td class="muted">${window.SafeCheck.formatDate(item.created_at)}</td>
      <td><span class="status-pill ${item.status}">${labelMap[item.status] || item.status}</span></td>
    </tr>
  `).join('');
}

function renderWatchlist(items) {
  document.getElementById('countWatchlist').textContent = items.length;
  document.getElementById('statWatchlist').textContent = items.length;

  const container = document.getElementById('watchlistContainer');
  if (!items.length) {
    container.innerHTML = '<div class="empty" style="grid-column: 1/-1;">Bạn chưa theo dõi đối tượng nào.</div>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="watch-card">
      <div>
        <div class="watch-card-top">
          <strong>${item.suspect_value}</strong>
          <span class="badge ${item.risk_level === 'high' ? 'high' : ''}">${item.risk_level === 'high' ? 'Nguy hiểm cao' : 'Đang theo dõi'}</span>
        </div>
        <p class="muted" style="font-size: 0.88rem; margin: 8px 0 0;">${item.note || 'Theo dõi biến động báo cáo'}</p>
      </div>
      <div class="watch-card-footer">
        <span style="color: var(--danger); font-weight: 700;">🚩 ${item.report_count || 1} lượt tố cáo</span>
        <button type="button" class="button outline" style="padding: 6px 12px; font-size: 0.82rem;" data-unwatch="${item.id}">Bỏ theo dõi</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-unwatch]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await authFetch(`/auth/watchlist/${btn.dataset.unwatch}`, { method: 'DELETE' });
        await loadWatchlist();
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

async function loadWatchlist() {
  try {
    const res = await authFetch('/auth/watchlist');
    renderWatchlist(res.data || []);
  } catch (_err) {
    renderWatchlist([]);
  }
}

async function initProfilePage() {
  const token = getToken();
  if (!token) {
    location.href = 'login.html';
    return;
  }

  const localUser = getStoredUser();
  if (localUser) renderUser(localUser);

  try {
    const meRes = await authFetch('/auth/me');
    if (meRes.data?.user) {
      setStoredUser(meRes.data.user);
      renderUser(meRes.data.user);
    }

    const repRes = await authFetch('/auth/my-reports');
    cachedReports = repRes.data || [];
    renderReports();

    await loadWatchlist();
  } catch (error) {
    console.warn('Không thể tải dữ liệu từ API:', error.message);
    renderReports();
    renderWatchlist([]);
  }
}

document.getElementById('filterReportStatus')?.addEventListener('change', event => {
  renderReports(event.target.value);
});

document.getElementById('addWatchlistForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const suspectValue = document.getElementById('watchTarget').value.trim();
  const note = document.getElementById('watchNote').value.trim();
  if (!suspectValue) return;

  try {
    await authFetch('/auth/watchlist', {
      method: 'POST',
      body: JSON.stringify({ suspectValue, note, riskLevel: 'medium' })
    });
    document.getElementById('watchTarget').value = '';
    document.getElementById('watchNote').value = '';
    await loadWatchlist();
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById('profileForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const alertBox = document.getElementById('profileAlert');
  try {
    const res = await authFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({
        fullName: document.getElementById('profileName').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
        bio: document.getElementById('profileBio').value.trim()
      })
    });
    setStoredUser(res.data.user);
    renderUser(res.data.user);
    alertBox.className = 'message show success';
    alertBox.textContent = res.message;
  } catch (error) {
    alertBox.className = 'message show error';
    alertBox.textContent = error.message;
  }
});

document.getElementById('passwordForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const alertBox = document.getElementById('passwordAlert');
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;

  if (newPassword !== confirmNewPassword) {
    alertBox.className = 'message show error';
    alertBox.textContent = 'Mật khẩu mới xác nhận không khớp.';
    return;
  }

  try {
    const res = await authFetch('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    document.getElementById('passwordForm').reset();
    alertBox.className = 'message show success';
    alertBox.textContent = res.message;
  } catch (error) {
    alertBox.className = 'message show error';
    alertBox.textContent = error.message;
  }
});

document.getElementById('logoutButton')?.addEventListener('click', () => {
  ['safecheck-token', 'safecheck-user'].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  location.href = 'login.html';
});

initProfilePage();
