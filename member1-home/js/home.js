// JavaScript trang chủ
(function () {
  "use strict";

  var CONFIG = {
    apiBase: window.SAFECHECK_API_BASE || "http://localhost:3000/api",
    featuredLimit: 6,
  };
  var BADGES = {
    scam: ["sc-badge--scam", "Lừa đảo"],
    verifying: ["sc-badge--warn", "Đang xác minh"],
    none: ["sc-badge--none", "Chưa có cảnh báo"],
  };
  var TYPE_LABEL = { bank: "STK", phone: "SĐT", url: "URL", social: "FB/Zalo" };

  function getJSON(path) {
    return fetch(CONFIG.apiBase + path, {
      headers: { Accept: "application/json" },
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  function loadFeatured(tab) {
    return getJSON(
      "/warnings?sort=" + tab + "&limit=" + CONFIG.featuredLimit,
    ).then(function (r) {
      return (Array.isArray(r) ? r : (r && r.items) || []).map(function (w) {
        return {
          id: w.id,
          type: TYPE_LABEL[w.type] || w.type || "",
          value: w.value,
          sub: w.subtitle || "",
          status: w.status,
          date: w.createdAt,
          summary: w.summary,
          reports: w.reportCount,
        };
      });
    });
  }

  var FALLBACK = {
    header:
      '<nav class="navbar navbar-expand-md sc-nav sticky-top"><div class="container">' +
      '<a class="navbar-brand sc-brand" href="../member1-home/home.html"><img src="../assets/img/logo-mark.svg" alt="" width="32" height="32"><span>SafeCheck <span class="sc-brand__vn">VN</span></span></a>' +
      '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#scNav" aria-controls="scNav" aria-expanded="false" aria-label="Mở menu"><span class="navbar-toggler-icon"></span></button>' +
      '<div class="collapse navbar-collapse" id="scNav">' +
      '<ul class="navbar-nav mx-md-auto">' +
      '<li class="nav-item"><a class="nav-link" href="../member1-home/home.html">Tra cứu</a></li>' +
      '<li class="nav-item"><a class="nav-link" href="../member3-warning/warning-list.html">Cảnh báo</a></li>' +
      '<li class="nav-item"><a class="nav-link" href="../member5-news/news.html">Tin tức</a></li>' +
      '<li class="nav-item"><a class="nav-link" href="../member5-news/guide.html">Hướng dẫn</a></li></ul>' +
      '<div class="d-flex align-items-center gap-2 py-2 py-md-0">' +
      '<button type="button" class="btn btn-sm sc-icon-btn" data-theme-toggle aria-label="Chuyển chế độ sáng/tối" title="Chuyển chế độ sáng/tối">' +
      '<svg class="sc-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="sc-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>' +
      '<a class="btn btn-sm btn-danger" href="../member2-report/report.html">Tố cáo</a>' +
      '<a class="btn btn-sm btn-outline-secondary" href="../member4-account/login.html">Đăng nhập</a>' +
      "</div></div></div></nav>",
    footer:
      '<footer class="py-4 mt-auto" style="background:#081a33;color:#a9b9d3;font-size:.8125rem"><div class="container text-center">' +
      "SafeCheck VN - Kho cảnh báo cộng đồng</div></footer>",
  };

  function loadInclude(el) {
    var fallback = FALLBACK[el.getAttribute("data-fallback")] || "";
    return fetch(el.getAttribute("data-include"))
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (html) {
        html = html.replace(/<!--[\s\S]*?-->/g, "").trim();
        el.innerHTML = html || fallback;
      })
      .catch(function () {
        el.innerHTML = fallback;
      });
  }

  function initTheme() {
    if (window.SafeCheckTheme) return;
    var root = document.documentElement;
    document.addEventListener("click", function (e) {
      if (!e.target.closest("[data-theme-toggle]")) return;
      var next =
        root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-bs-theme", next);
      try {
        localStorage.setItem("safecheck-theme", next);
      } catch (err) {}
    });
  }

  var SOCIAL =
    /(^|[./])(facebook\.com|fb\.com|fb\.me|m\.me|zalo\.me|zalo\.ca|chat\.zalo\.me)(\/|$|\?)/i;
  var URL_RE =
    /^(https?:\/\/|www\.)\S+$|^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(\/\S*)?$/i;

  function detect(raw) {
    var v = raw.trim();
    if (!v) return null;
    if (SOCIAL.test(v)) return { key: "social", label: "Link Facebook / Zalo" };
    if (URL_RE.test(v)) return { key: "url", label: "Website / URL" };
    var digits = v.replace(/[\s.\-]/g, "");
    if (/^(\+84|84|0)[35789]\d{8}$/.test(digits))
      return { key: "phone", label: "Số điện thoại" };
    if (/^\d{6,19}$/.test(digits))
      return { key: "bank", label: "Số tài khoản ngân hàng" };
    return { key: "unknown", label: "" };
  }

  function initSearch() {
    var form = document.getElementById("searchForm");
    var input = document.getElementById("q");
    var hint = document.getElementById("detect");

    function showDetect() {
      var d = detect(input.value);
      hint.className = "sc-detect" + (d && d.key !== "unknown" ? " is-ok" : "");
      hint.textContent =
        d && d.key !== "unknown" ? "Đã nhận diện: " + d.label : "";
      return d;
    }
    input.addEventListener("input", showDetect);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = showDetect();
      if (!d || d.key === "unknown") {
        hint.className = "sc-detect is-error";
        hint.textContent =
          "Chưa nhận diện được. Hãy nhập số tài khoản (6–19 số), số điện thoại, website hoặc link Facebook/Zalo.";
        input.focus();
        return;
      }
      window.location.href =
        "../member3-warning/warning-list.html?type=" +
        d.key +
        "&q=" +
        encodeURIComponent(input.value.trim());
    });
  }

  function initStats() {
    var fmt = new Intl.NumberFormat("vi-VN");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    getJSON("/stats")
      .then(function (s) {
        document.querySelectorAll("[data-stat]").forEach(function (el) {
          var raw = s[el.getAttribute("data-stat")],
            target = Number(raw);
          if (raw == null || raw === "" || !isFinite(target)) return;
          if (reduce) {
            el.textContent = fmt.format(target);
            return;
          }
          var start = null,
            dur = 900;
          requestAnimationFrame(function step(ts) {
            start = start || ts;
            var p = Math.min((ts - start) / dur, 1);
            el.textContent = fmt.format(
              Math.round(target * (1 - Math.pow(1 - p, 3))),
            );
            if (p < 1) requestAnimationFrame(step);
          });
        });
      })
      .catch(function () {
        /* chưa có API/CSDL: giữ “—” */
      });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function timeAgo(iso) {
    var ms = Date.now() - new Date(iso).getTime();
    if (isNaN(ms)) return "";
    var h = Math.floor(Math.max(ms, 0) / 36e5);
    if (h < 1) return "Vừa xong";
    if (h < 24) return h + " giờ trước";
    var d = Math.floor(h / 24);
    return d < 30 ? d + " ngày trước" : Math.floor(d / 30) + " tháng trước";
  }

  function cardHTML(a) {
    var b = BADGES[a.status] || BADGES.none;
    return (
      '<div class="col-12 col-md-6 col-lg-4"><article class="sc-card">' +
      '<div class="sc-card__top"><span class="sc-badge ' +
      b[0] +
      '">' +
      b[1] +
      "</span>" +
      (a.type ? '<span class="sc-type">' + esc(a.type) + "</span>" : "") +
      '<time class="sc-card__time">' +
      timeAgo(a.date) +
      "</time></div>" +
      '<h3 class="sc-card__value">' +
      esc(a.value) +
      "</h3>" +
      (a.sub ? '<p class="sc-card__sub">' + esc(a.sub) + "</p>" : "") +
      '<p class="sc-card__summary">' +
      esc(a.summary) +
      "</p>" +
      '<div class="sc-card__foot"><span>' +
      esc(a.reports) +
      " báo cáo</span>" +
      '<a class="sc-link stretched-link" href="../member3-warning/warning-detail.html?id=' +
      encodeURIComponent(a.id) +
      '">Chi tiết</a></div>' +
      "</article></div>"
    );
  }

  function initAlerts() {
    var list = document.getElementById("alertList");
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".sc-tab"));

    var token = 0;

    function render(tab) {
      var t = ++token;
      list.setAttribute("aria-labelledby", "tab-" + tab);
      list.innerHTML = ""; // chưa có dữ liệu → để trống khu vực này
      loadFeatured(tab)
        .then(function (rows) {
          if (t === token) list.innerHTML = rows.map(cardHTML).join("");
        })
        .catch(function () {
          /* chưa có API/CSDL: giữ trống */
        });
    }

    function select(tabEl) {
      tabs.forEach(function (t) {
        var on = t === tabEl;
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;
      });
      render(tabEl.getAttribute("data-tab"));
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        select(t);
      });
      t.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        var n =
          tabs[
            (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length
          ];
        n.focus();
        select(n);
      });
    });
    render("latest");
  }

  initTheme();
  initSearch();
  initStats();
  initAlerts();
  document.querySelectorAll("[data-include]").forEach(loadInclude);
})();
