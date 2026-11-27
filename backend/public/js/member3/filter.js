(function () {
  function buildWarningQuery(form, page, limit) {
    const formData = new FormData(form);
    const params = new URLSearchParams();

    ['q', 'category_id', 'risk_level', 'days'].forEach((key) => {
      const value = String(formData.get(key) || '').trim();
      if (value) params.set(key, value);
    });

    params.set('page', String(page || 1));
    params.set('limit', String(limit || 9));
    return params.toString();
  }

  window.WarningFilters = { buildWarningQuery };
})();
