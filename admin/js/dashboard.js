'use strict';

const message = document.querySelector('#admin-message');
const content = document.querySelector('#admin-content');
const token = localStorage.getItem('safecheck-token') || sessionStorage.getItem('safecheck-token');
const labels = { pending: 'Chờ duyệt', verified: 'Đã duyệt', rejected: 'Đã từ chối', locked: 'Đã khóa', active: 'Hoạt động' };

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

async function request(path = '', body) {
  const response = await fetch('/api/admin' + path, {
    method: body ? 'PATCH' : 'GET',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body)
  });
  const result = await response.json();
  if (response.status === 401 || response.status === 403) content.hidden = true;
  if (!response.ok) throw new Error(result.message || 'Không thể thực hiện yêu cầu.');
  return result.data;
}

async function update(button, path, payload) {
  button.disabled = true;
  try {
    await request(path, payload);
    await loadDashboard();
    message.textContent = 'Đã lưu thay đổi.';
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

function reportCard(report) {
  const card = element('article', undefined, 'card admin-card');
  card.append(element('h3', '#' + report.id + ' · ' + report.scam_type),
    element('p', report.suspect_value), element('p', report.description), element('p', labels[report.status]));
  if (report.reason) card.append(element('p', 'Lý do: ' + report.reason));
  if (report.status !== 'pending') return card;
  const form = element('form');
  const label = element('label', 'Lý do xử lý');
  const reason = element('textarea');
  reason.required = true;
  reason.maxLength = 500;
  label.append(reason);
  const approve = element('button', 'Duyệt', 'button');
  const reject = element('button', 'Từ chối', 'button outline');
  approve.value = 'verified';
  reject.value = 'rejected';
  form.append(label, approve, reject);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (event.submitter) update(event.submitter, '/reports/' + report.id, { status: event.submitter.value, reason: reason.value });
  });
  card.append(form);
  return card;
}

function userCard(user) {
  const card = element('article', undefined, 'card admin-card');
  card.append(element('h3', user.full_name), element('p', user.email), element('p', user.role + ' · ' + labels[user.status]));
  if (user.role !== 'admin') {
    const locked = user.status === 'locked';
    const button = element('button', locked ? 'Mở khóa' : 'Khóa tài khoản', 'button outline');
    button.addEventListener('click', () => update(button, '/users/' + user.id, { status: locked ? 'active' : 'locked' }));
    card.append(button);
  }
  return card;
}

async function loadDashboard() {
  const { reports, users, totals } = await request();
  document.querySelector('#admin-totals').replaceChildren(...Object.entries(totals).map(([key, count]) => {
    const tile = element('div', undefined, 'card admin-card');
    tile.append(element('dt', labels[key]), element('dd', count));
    return tile;
  }));
  document.querySelector('#report-list').replaceChildren(...(reports.length ? reports.map(reportCard) : [element('p', 'Chưa có báo cáo.')]));
  document.querySelector('#user-list').replaceChildren(...users.map(userCard));
  content.hidden = false;
  message.textContent = '';
}

if (token) {
  loadDashboard().catch(error => { message.textContent = error.message; });
} else {
  location.replace('../account/login.html');
}
