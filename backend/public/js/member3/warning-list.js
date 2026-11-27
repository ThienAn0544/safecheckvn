(() => {
  const listNode = document.querySelector('#warning-list');
  const form = document.querySelector('#warning-filters');
  const paginationNode = document.querySelector('#warning-pagination');
  const countNode = document.querySelector('#warning-count');
  const pageNode = document.querySelector('#warning-page-info');
  const categorySelect = document.querySelector('#category-filter');
  const submitButton = form?.querySelector('[type="submit"]');

  if (!listNode || !form || !window.SafeCheck || !window.WarningFilters) return;

  const PAGE_SIZE = 9;
  let currentPage = 1;
  let activeRequest = 0;

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
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  function showMessage(message, type = 'empty') {
    listNode.replaceChildren(createElement('div', `warning-message ${type}`, message));
    paginationNode.replaceChildren();
    if (countNode) countNode.textContent = 'Chưa có dữ liệu';
    if (pageNode) pageNode.textContent = '';
  }

  function renderWarnings(items) {
    if (!items.length) {
      showMessage('Không tìm thấy cảnh báo phù hợp. Hãy thử từ khóa hoặc bộ lọc khác.');
      return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
      const article = createElement('article', 'warning-card');
      const top = createElement('div', 'warning-card__top');
      const category = createElement('span', 'warning-category', item.category_name || 'Chưa phân loại');
      const riskClass = riskClasses[item.risk_level] || 'risk-medium';
      const risk = createElement('span', `warning-risk ${riskClass}`, riskLabels[item.risk_level] || 'Chưa xác định');
      top.append(category, risk);

      const title = createElement('h3', 'warning-card__title', item.title || 'Cảnh báo chưa có tiêu đề');
      const summary = createElement('p', 'warning-card__summary', item.summary || 'Chưa có mô tả ngắn.');
      const meta = createElement('div', 'warning-card__meta');
      const date = createElement('span', '', `◷ ${formatDate(item.created_at)}`);
      const id = createElement('span', '', `Mã cảnh báo #${item.id}`);
      meta.append(date, id);

      const footer = createElement('div', 'warning-card__footer');
      const detailLink = createElement('a', 'button warning-detail-link', 'Xem chi tiết');
      detailLink.href = `warning-detail.html?id=${encodeURIComponent(item.id)}`;
      detailLink.setAttribute('aria-label', `Xem chi tiết cảnh báo: ${item.title || 'Cảnh báo'}`);
      footer.append(detailLink);

      article.append(top, title, summary, meta, footer);
      fragment.append(article);
    });

    listNode.replaceChildren(fragment);
  }

  function renderPagination(pagination) {
    paginationNode.replaceChildren();
    const totalPages = Number(pagination.totalPages) || 0;
    if (totalPages <= 1) return;

    const addPageButton = (label, page, options = {}) => {
      const button = createElement('button', options.active ? 'page-button active' : 'page-button', label);
      button.type = 'button';
      button.dataset.page = String(page);
      if (options.active) button.setAttribute('aria-current', 'page');
      if (options.disabled) button.disabled = true;
      paginationNode.append(button);
    };

    addPageButton('←', Math.max(1, currentPage - 1), { disabled: currentPage === 1 });

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 2) end = Math.min(totalPages, 5);
    if (currentPage >= totalPages - 1) start = Math.max(1, totalPages - 4);

    for (let page = start; page <= end; page += 1) {
      addPageButton(String(page), page, { active: page === currentPage });
    }

    addPageButton('→', Math.min(totalPages, currentPage + 1), { disabled: currentPage === totalPages });
  }

  async function loadCategories() {
    if (!categorySelect) return;

    try {
      const result = await SafeCheck.api('/warnings/categories');
      const selectedValue = categorySelect.value;
      result.data.forEach((category) => {
        const option = createElement('option', '', category.name);
        option.value = String(category.id);
        categorySelect.append(option);
      });
      categorySelect.value = selectedValue;
    } catch (_error) {
      categorySelect.disabled = true;
      categorySelect.title = 'Không thể tải danh mục. Hãy kiểm tra kết nối máy chủ.';
    }
  }

  async function loadWarnings(page = 1) {
    currentPage = page;
    const requestId = ++activeRequest;
    const query = WarningFilters.buildWarningQuery(form, currentPage, PAGE_SIZE);

    listNode.setAttribute('aria-busy', 'true');
    listNode.replaceChildren(createElement('div', 'warning-message loading', 'Đang tải dữ liệu cảnh báo...'));
    if (submitButton) submitButton.disabled = true;

    try {
      const result = await SafeCheck.api(`/warnings?${query}`);
      if (requestId !== activeRequest) return;

      const items = Array.isArray(result.data) ? result.data : [];
      const pagination = result.pagination || { total: items.length, totalPages: 1, page: 1 };
      renderWarnings(items);
      renderPagination(pagination);

      if (countNode) {
        const total = Number(pagination.total) || 0;
        countNode.textContent = `${total.toLocaleString('vi-VN')} cảnh báo`;
      }
      if (pageNode) {
        pageNode.textContent = pagination.totalPages > 0
          ? `Trang ${pagination.page} / ${pagination.totalPages}`
          : 'Chưa có dữ liệu';
      }
    } catch (error) {
      if (requestId !== activeRequest) return;
      showMessage(error.message || 'Không thể tải cảnh báo. Vui lòng thử lại.', 'warning-error');

      const retry = createElement('button', 'button warning-retry', 'Thử tải lại');
      retry.type = 'button';
      retry.addEventListener('click', () => loadWarnings(currentPage));
      listNode.querySelector('.warning-message')?.append(document.createElement('br'), retry);
    } finally {
      if (requestId === activeRequest) {
        listNode.setAttribute('aria-busy', 'false');
        if (submitButton) submitButton.disabled = false;
      }
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    loadWarnings(1);
  });

  form.addEventListener('reset', () => {
    window.setTimeout(() => loadWarnings(1), 0);
  });

  form.querySelectorAll('select').forEach((select) => {
    select.addEventListener('change', () => loadWarnings(1));
  });

  paginationNode.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;
    loadWarnings(Number(button.dataset.page));
  });

  loadCategories();
  loadWarnings(1);
})();
