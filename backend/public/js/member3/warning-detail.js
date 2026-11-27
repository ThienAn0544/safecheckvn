(() => {
  const detailNode = document.querySelector('#warning-detail');
  if (!detailNode || !window.SafeCheck) return;

  const warningId = new URLSearchParams(window.location.search).get('id');
  const riskLabels = {
    low: 'Rủi ro thấp',
    medium: 'Rủi ro trung bình',
    high: 'Rủi ro cao',
    critical: 'Nguy hiểm'
  };
  const riskClasses = {
    low: 'risk-low',
    medium: 'risk-medium',
    high: 'risk-high',
    critical: 'risk-critical'
  };

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Chưa cập nhật thời gian';

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function renderError(message) {
    detailNode.setAttribute('aria-busy', 'false');
    const wrapper = createElement('div', 'warning-detail__state');
    wrapper.append(
      createElement('div', 'warning-detail__state-icon', '⚠'),
      createElement('h1', '', 'Không thể mở cảnh báo'),
      createElement('p', '', message)
    );

    const backLink = createElement('a', 'button', 'Quay lại danh sách cảnh báo');
    backLink.href = 'warning-list.html';
    wrapper.append(backLink);
    detailNode.replaceChildren(wrapper);
  }

  function renderWarning(warning) {
    detailNode.setAttribute('aria-busy', 'false');
    const riskClass = riskClasses[warning.risk_level] || 'risk-medium';
    const article = createElement('article', 'warning-detail__article');

    const breadcrumb = createElement('nav', 'warning-breadcrumb');
    breadcrumb.setAttribute('aria-label', 'Đường dẫn');
    const listLink = createElement('a', '', 'Danh sách cảnh báo');
    listLink.href = 'warning-list.html';
    breadcrumb.append(listLink, createElement('span', '', ' / Chi tiết cảnh báo'));

    const header = createElement('header', 'warning-detail__header');
    const badges = createElement('div', 'warning-detail__badges');
    badges.append(
      createElement('span', 'warning-category', warning.category_name || 'Chưa phân loại'),
      createElement('span', `warning-risk ${riskClass}`, riskLabels[warning.risk_level] || 'Chưa xác định')
    );
    const title = createElement('h1', '', warning.title || 'Cảnh báo lừa đảo');
    const summary = createElement('p', 'warning-detail__summary', warning.summary || 'Chưa có mô tả ngắn.');
    const meta = createElement('div', 'warning-detail__meta');
    meta.append(
      createElement('span', '', `Ngày đăng: ${formatDate(warning.created_at)}`),
      createElement('span', '', `Mã cảnh báo: #${warning.id}`)
    );
    header.append(badges, title, summary, meta);

    const contentSection = createElement('section', 'warning-detail__content');
    contentSection.append(
      createElement('h2', '', 'Nội dung cảnh báo'),
      createElement('p', 'warning-detail__body', warning.content || 'Chưa có nội dung chi tiết.')
    );

    const notice = createElement('aside', 'warning-safety-note');
    notice.append(
      createElement('span', 'warning-safety-note__icon', '🛡️'),
      createElement('div', '', '')
    );
    const noticeText = notice.querySelector('div');
    noticeText.append(
      createElement('strong', '', 'Khuyến nghị an toàn'),
      createElement('p', '', 'Không cung cấp mã OTP, mật khẩu hoặc thông tin ngân hàng cho người lạ. Không chuyển tiền khi chưa xác minh người nhận qua kênh chính thức.')
    );

    const actions = createElement('div', 'warning-detail__actions');
    const backButton = createElement('a', 'button outline', '← Danh sách cảnh báo');
    backButton.href = 'warning-list.html';
    const reportButton = createElement('a', 'button', 'Gửi báo cáo');
    reportButton.href = '../member2-report/report.html';
    actions.append(backButton, reportButton);

    article.append(breadcrumb, header, contentSection, notice, actions);
    detailNode.replaceChildren(article);
    document.title = `${warning.title || 'Chi tiết cảnh báo'} - SafeCheck`;
  }

  if (!warningId || !/^\d+$/.test(warningId)) {
    renderError('Đường dẫn không chứa mã cảnh báo hợp lệ.');
    return;
  }

  SafeCheck.api(`/warnings/${encodeURIComponent(warningId)}`)
    .then((result) => renderWarning(result.data))
    .catch((error) => renderError(error.message || 'Cảnh báo không tồn tại hoặc chưa được công bố.'));
})();
