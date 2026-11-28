// JavaScript Thành viên 5 – Tin tức & Cẩm nang + Chi tiết + Chia sẻ MXH + Hướng dẫn khi bị lừa + Newsletter
(function () {
  "use strict";

  var CATEGORY_INFO = {
    "canh-bao-nong": {
      label: "Cảnh báo nóng",
      badgeClass: "high",
      illusClass: "sc5-illus--alert",
      icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    },
    "thu-doan": {
      label: "Thủ đoạn mới",
      badgeClass: "",
      illusClass: "sc5-illus--method",
      icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v3l2 2"/></svg>'
    },
    "cam-nang": {
      label: "Cẩm nang bảo mật",
      badgeClass: "",
      illusClass: "sc5-illus--guide",
      icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>'
    },
    "phap-luat": {
      label: "Pháp luật & Chính sách",
      badgeClass: "",
      illusClass: "sc5-illus--law",
      icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
    }
  };

  var ARTICLES = [];

  var BANK_HOTLINES = [
    { bank: "Vietcombank", hotline: "1900 54 54 13", note: "Khóa thẻ & báo giao dịch gian lận 24/7" },
    { bank: "BIDV", hotline: "1900 9247", note: "Hỗ trợ khóa khẩn cấp BIDV SmartBanking & thẻ" },
    { bank: "VietinBank", hotline: "1900 558 868", note: "Tổng đài CSKH & xử lý sự cố 24/7" },
    { bank: "Agribank", hotline: "1900 558 818", note: "Khóa dịch vụ Agribank Plus & thẻ khẩn cấp" },
    { bank: "Techcombank", hotline: "1800 588 822", note: "Miễn phí cuộc gọi, khóa tài khoản 24/7" },
    { bank: "MB Bank", hotline: "1900 545 426", note: "Khóa App MBBank & tra soát giao dịch" },
    { bank: "ACB", hotline: "1900 54 54 86", note: "Hỗ trợ khóa thẻ và tài khoản 24/7" },
    { bank: "VPBank", hotline: "1900 54 54 15", note: "Khóa khẩn cấp VPBank NEO & thẻ" },
    { bank: "TPBank", hotline: "1900 6036", note: "Tổng đài hỗ trợ khẩn cấp 24/7" },
    { bank: "Sacombank", hotline: "1800 5858 88", note: "Miễn phí cuộc gọi, khóa thẻ & Sacombank Pay" },
    { bank: "Ví MoMo", hotline: "1900 545 441", note: "Báo cáo tài khoản lừa đảo & khóa ví" },
    { bank: "ZaloPay", hotline: "1900 545 436", note: "Hỗ trợ sự cố bảo mật & giao dịch lạ" }
  ];

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatDateVN(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso;
  }

  function renderTagChips(tags) {
    return (tags || [])
      .map(function (t) {
        return (
          '<a class="sc5-tag" href="news.html?tag=' +
          encodeURIComponent(t) +
          '">#' +
          esc(t) +
          "</a>"
        );
      })
      .join("");
  }

  /* =========================================================
     1. FORM ĐĂNG KÝ BẢN TIN TRONG FOOTER (4 CỘT)
     ========================================================= */
  function initNewsletterForms() {
    var forms = document.querySelectorAll("[data-newsletter-form]");


    forms.forEach(function (form) {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        var msg = form.querySelector(".sc5-newsletter-msg");
        if (!input || !msg) return;

        var email = input.value.trim().toLowerCase();
        var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
        if (!valid) {
          msg.className = "sc5-newsletter-msg is-err";
          msg.textContent = "Vui lòng nhập địa chỉ email hợp lệ.";
          input.focus();
          return;
        }

        var button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        msg.textContent = "Đang lưu đăng ký...";
        try {
          await api('/api/news/subscriptions', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:email})});
          msg.className = "sc5-newsletter-msg";
          msg.textContent = "Đã lưu đăng ký nhận bản tin.";
          input.value = "";
        } catch (err) {
          msg.className = "sc5-newsletter-msg is-err";
          msg.textContent = err.message;
        } finally { button.disabled = false; }
      });
    });
  }

  /* =========================================================
     2. TRANG TIN TỨC & CẨM NANG (news.html)
     ========================================================= */
  function initNewsPage() {
    var gridEl = document.getElementById("news-grid");
    if (!gridEl) return;

    var featuredEl = document.getElementById("featured-news");
    var searchInput = document.getElementById("news-search");
    var sortSelect = document.getElementById("news-sort");
    var countEl = document.getElementById("news-count");
    var tabButtons = Array.prototype.slice.call(document.querySelectorAll("[data-cat]"));

    var params = new URLSearchParams(window.location.search);
    var state = {
      cat: params.get("cat") || "all",
      tag: params.get("tag") || "",
      q: params.get("q") || "",
      sort: "newest"
    };

    if (searchInput && (state.q || state.tag)) {
      searchInput.value = state.q || "#" + state.tag;
    }

    function renderFeatured() {
      if (!featuredEl) return;
      var top =
        ARTICLES.find(function (a) {
          return a.featured;
        }) || ARTICLES[0];
      if (!top) return;
      var cat = CATEGORY_INFO[top.category] || CATEGORY_INFO["canh-bao-nong"];

      featuredEl.innerHTML =
        '<article class="card sc5-featured">' +
        '<div class="sc5-featured__art">' +
        '<div class="sc5-featured__svg" aria-hidden="true">' + cat.icon + "</div>" +
        "<div>" +
        '<div style="font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;opacity:.85;font-weight:800">Tiêu điểm cảnh báo</div>' +
        '<div style="font-size:1.15rem;font-weight:800;margin-top:4px">' + esc(cat.label) + "</div>" +
        '<div style="font-size:.85rem;opacity:.85;margin-top:6px">' +
        formatDateVN(top.date) +
        " · " +
        esc(top.views.toLocaleString("vi-VN")) +
        " lượt xem</div>" +
        "</div></div>" +
        '<div class="sc5-featured__body">' +
        '<div><span class="badge ' + cat.badgeClass + '">' + esc(cat.label) + "</span></div>" +
        '<h2><a href="news-detail.html?id=' + encodeURIComponent(top.id) + '">' + esc(top.title) + "</a></h2>" +
        '<p class="muted" style="margin:0 0 14px">' + esc(top.summary) + "</p>" +
        '<div class="sc5-tags" style="margin-bottom:0">' + renderTagChips(top.tags) + "</div>" +
        '<div class="sc5-featured__foot">' +
        '<span class="muted" style="font-size:.86rem">' + esc(top.author) + " · " + esc(top.readTime) + "</span>" +
        '<a class="button" href="news-detail.html?id=' + encodeURIComponent(top.id) + '">Đọc phân tích chi tiết</a>' +
        "</div></div></article>";
    }

    var requestId = 0;
    async function renderCards() {
      tabButtons.forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-cat") === state.cat);
      });

      var rawKw = state.q.trim().toLowerCase();
      var tagFilter = state.tag.toLowerCase();
      if (rawKw.charAt(0) === "#") {
        tagFilter = rawKw.slice(1);
        rawKw = "";
      }

      var seq = ++requestId;
      var filtered;
      try {
        filtered = await api('/api/news?' + new URLSearchParams({cat:state.cat,q:rawKw,tag:tagFilter,sort:state.sort}));
        if (seq !== requestId) return;
      } catch (err) { if (seq === requestId) gridEl.textContent = err.message; return; }

      if (countEl) {
        countEl.textContent = "Hiển thị " + filtered.length + " bài viết";
      }

      if (!filtered.length) {
        gridEl.innerHTML =
          '<div class="card empty" style="grid-column:1/-1">Không tìm thấy bài viết phù hợp với từ khóa hoặc chuyên mục đã chọn.</div>';
        return;
      }

      gridEl.innerHTML = filtered
        .map(function (item) {
          var cat = CATEGORY_INFO[item.category] || CATEGORY_INFO["cam-nang"];
          return (
            '<article class="card sc5-news-card">' +
            '<div class="sc5-news-card__illus ' + cat.illusClass + '">' +
            '<div class="sc5-illus-icon" aria-hidden="true">' + cat.icon + "</div>" +
            '<span class="badge ' + cat.badgeClass + '">' + esc(cat.label) + "</span>" +
            "</div>" +
            '<div class="sc5-news-card__body">' +
            '<div class="sc5-news-card__meta">' +
            "<span>" + formatDateVN(item.date) + "</span><span>·</span><span>" + esc(item.readTime) + "</span>" +
            "</div>" +
            '<h3 class="sc5-news-card__title"><a href="news-detail.html?id=' +
            encodeURIComponent(item.id) +
            '">' +
            esc(item.title) +
            "</a></h3>" +
            '<p class="sc5-news-card__excerpt">' + esc(item.summary) + "</p>" +
            '<div class="sc5-tags">' + renderTagChips(item.tags) + "</div>" +
            '<div class="sc5-news-card__foot">' +
            '<span class="muted">' + esc(item.views.toLocaleString("vi-VN")) + " lượt xem</span>" +
            '<a class="sc5-read-link" href="news-detail.html?id=' +
            encodeURIComponent(item.id) +
            '">Đọc chi tiết →</a>' +
            "</div></div></article>"
          );
        })
        .join("");
    }

    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.cat = btn.getAttribute("data-cat");
        state.tag = "";
        renderCards();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.q = searchInput.value;
        state.tag = "";
        renderCards();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        state.sort = sortSelect.value;
        renderCards();
      });
    }

    renderFeatured();
    renderCards();
  }

  /* =========================================================
     3. TRANG CHI TIẾT BÀI VIẾT + TAG + BÀI LIÊN QUAN + CHIA SẺ MXH
     ========================================================= */
  function initNewsDetailPage() {
    var articleHost = document.getElementById("article-detail");
    if (!articleHost) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var article =
      ARTICLES.find(function (a) {
        return a.id === id;
      });
    if (!article) { articleHost.textContent = "Không tìm thấy bài viết."; return; }

    document.title = article.title + " - SafeCheck";
    var crumbTitle = document.getElementById("crumb-title");
    if (crumbTitle) crumbTitle.textContent = article.title;

    var cat = CATEGORY_INFO[article.category] || CATEGORY_INFO["cam-nang"];
    var sectionsHTML = (article.sections || [])
      .map(function (sec) {
        var ps = (sec.paragraphs || [])
          .map(function (p) {
            return "<p>" + esc(p) + "</p>";
          })
          .join("");
        var uls =
          sec.bullets && sec.bullets.length
            ? "<ul>" +
              sec.bullets
                .map(function (b) {
                  return "<li>" + esc(b) + "</li>";
                })
                .join("") +
              "</ul>"
            : "";
        return "<h2>" + esc(sec.heading) + "</h2>" + ps + uls;
      })
      .join("");

    articleHost.innerHTML =
      '<article class="card sc5-article-card">' +
      '<span class="badge ' + cat.badgeClass + '">' + esc(cat.label) + "</span>" +
      '<h1 class="sc5-article-title">' + esc(article.title) + "</h1>" +
      '<div class="sc5-article-meta">' +
      "<span>Tác giả: <strong>" + esc(article.author) + "</strong></span>" +
      "<span>Ngày đăng: " + formatDateVN(article.date) + "</span>" +
      "<span>" + esc(article.readTime) + "</span>" +
      "<span>" + esc(article.views.toLocaleString("vi-VN")) + " lượt đọc</span>" +
      "</div>" +
      '<div class="sc5-article-hero-banner ' + cat.illusClass + '">' +
      '<div class="sc5-illus-icon" aria-hidden="true">' + cat.icon + "</div>" +
      "<div><strong>Chuyên mục: " + esc(cat.label) + "</strong>" +
      '<div class="muted" style="font-size:.9rem">Kiểm chứng và biên tập bởi đội ngũ SafeCheck Việt Nam</div></div>' +
      "</div>" +
      '<div class="sc5-article-lead">' + esc(article.summary) + "</div>" +
      (article.warningNote
        ? '<div class="sc5-article-alert" role="note"><strong>Lưu ý khẩn: </strong>' +
          esc(article.warningNote) +
          "</div>"
        : "") +
      '<div class="sc5-article-body">' + sectionsHTML + "</div>" +
      '<div class="sc5-article-footer">' +
      '<div><strong style="display:block;margin-bottom:8px">Thẻ chủ đề (Tags):</strong>' +
      '<div class="sc5-tags" style="margin-bottom:0">' + renderTagChips(article.tags) + "</div></div>" +
      '<div class="sc5-share-bar">' +
      "<strong>Chia sẻ cảnh báo này:</strong>" +
      '<div class="sc5-share-buttons">' +
      '<button type="button" class="sc5-share-btn sc5-share-fb" data-share="facebook">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>' +
      "Facebook</button>" +
      '<button type="button" class="sc5-share-btn sc5-share-zalo" data-share="zalo">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
      "Zalo</button>" +
      '<button type="button" class="sc5-share-btn sc5-share-tg" data-share="telegram">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.5 3.5 2.7 10.8c-1.3.5-1.3 1.2-.2 1.6l4.8 1.5 11.2-7c.5-.3 1-.1.6.2l-9.1 8.2-.3 5c.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.6.2 1.8-.9l3.2-15.2c.3-1.3-.5-1.9-1.6-1.6z"/></svg>' +
      "Telegram</button>" +
      '<button type="button" class="sc5-share-btn sc5-share-copy" data-share="copy">Sao chép link</button>' +
      "</div></div>" +
      '<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
      '<a class="button outline" href="news.html">← Quay lại Tin tức &amp; Cẩm nang</a>' +
      '<a class="button danger" href="../report/report.html">Gửi báo cáo đối tượng</a>' +
      "</div></div></article>";

    // Xử lý nút chia sẻ mạng xã hội
    articleHost.querySelectorAll("[data-share]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var platform = btn.getAttribute("data-share");
        var pageUrl = window.location.href;
        var shareText = "[Cảnh báo SafeCheck] " + article.title;

        if (platform === "facebook") {
          window.open(
            "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(pageUrl),
            "_blank",
            "noopener,noreferrer,width=640,height=520"
          );
        } else if (platform === "zalo") {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText + " - " + pageUrl).catch(function () {});
          }
          window.open(
            "https://zalo.me/share?url=" + encodeURIComponent(pageUrl),
            "_blank",
            "noopener,noreferrer,width=640,height=560"
          );
        } else if (platform === "telegram") {
          window.open(
            "https://t.me/share/url?url=" +
              encodeURIComponent(pageUrl) +
              "&text=" +
              encodeURIComponent(shareText),
            "_blank",
            "noopener,noreferrer,width=640,height=520"
          );
        } else if (platform === "copy") {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(pageUrl).then(function () {
              btn.textContent = "✓ Đã sao chép link";
              setTimeout(function () {
                btn.textContent = "Sao chép link";
              }, 2200);
            });
          }
        }
      });
    });

    // Sidebar bài mới & bài liên quan phía dưới
    var sidebarList = document.getElementById("sidebar-news-list");
    var relatedGrid = document.getElementById("related-news-grid");
    var others = ARTICLES.filter(function (a) {
      return a.id !== article.id;
    });

    if (sidebarList) {
      sidebarList.innerHTML = others
        .slice(0, 4)
        .map(function (item) {
          return (
            '<div class="sc5-side-item">' +
            '<a href="news-detail.html?id=' + encodeURIComponent(item.id) + '">' + esc(item.title) + "</a>" +
            '<span class="muted" style="font-size:.82rem">' +
            formatDateVN(item.date) +
            " · " +
            esc(item.readTime) +
            "</span></div>"
          );
        })
        .join("");
    }

    if (relatedGrid) {
      var related = others
        .filter(function (a) {
          return a.category === article.category;
        })
        .concat(
          others.filter(function (a) {
            return a.category !== article.category;
          })
        )
        .slice(0, 3);

      relatedGrid.innerHTML = related
        .map(function (item) {
          var rCat = CATEGORY_INFO[item.category] || CATEGORY_INFO["cam-nang"];
          return (
            '<article class="card sc5-news-card">' +
            '<div class="sc5-news-card__illus ' + rCat.illusClass + '">' +
            '<div class="sc5-illus-icon" aria-hidden="true">' + rCat.icon + "</div>" +
            '<span class="badge ' + rCat.badgeClass + '">' + esc(rCat.label) + "</span>" +
            "</div>" +
            '<div class="sc5-news-card__body">' +
            '<h3 class="sc5-news-card__title"><a href="news-detail.html?id=' +
            encodeURIComponent(item.id) +
            '">' +
            esc(item.title) +
            "</a></h3>" +
            '<div class="sc5-tags">' + renderTagChips((item.tags || []).slice(0, 3)) + "</div>" +
            '<div class="sc5-news-card__foot">' +
            '<span class="muted">' + formatDateVN(item.date) + "</span>" +
            '<a class="sc5-read-link" href="news-detail.html?id=' +
            encodeURIComponent(item.id) +
            '">Xem bài →</a>' +
            "</div></div></article>"
          );
        })
        .join("");
    }
  }

  /* =========================================================
     4. TRANG HƯỚNG DẪN KHI BỊ LỪA (guide.html)
     ========================================================= */
  function initGuidePage() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-guide-step]"));
    var fill = document.getElementById("guide-progress-fill");
    var label = document.getElementById("guide-progress-label");
    var resetBtn = document.getElementById("guide-reset-btn");
    var KEY = "safecheck-guide-checklist-2026";

    function syncProgress() {
      if (!boxes.length) return;
      var done = 0;
      var state = {};
      boxes.forEach(function (cb) {
        var k = cb.getAttribute("data-guide-step");
        var parent = cb.closest(".sc5-checklist-label");
        if (cb.checked) {
          done++;
          state[k] = true;
          if (parent) parent.classList.add("done");
        } else {
          if (parent) parent.classList.remove("done");
        }
      });
      var pct = Math.round((done / boxes.length) * 100);
      if (fill) fill.style.width = pct + "%";
      if (label) label.textContent = "Đã hoàn thành " + done + "/" + boxes.length + " bước (" + pct + "%)";
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch (e) {}
    }

    if (boxes.length) {
      try {
        var saved = JSON.parse(localStorage.getItem(KEY) || "{}");
        boxes.forEach(function (cb) {
          if (saved[cb.getAttribute("data-guide-step")]) cb.checked = true;
          cb.addEventListener("change", syncProgress);
        });
      } catch (e) {}
      syncProgress();
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        boxes.forEach(function (cb) {
          cb.checked = false;
        });
        syncProgress();
      });
    }

    var tbody = document.getElementById("bank-hotline-body");
    var bankInput = document.getElementById("bank-search");
    function renderBanks(q) {
      if (!tbody) return;
      var kw = (q || "").trim().toLowerCase();
      var rows = BANK_HOTLINES.filter(function (b) {
        return !kw || b.bank.toLowerCase().indexOf(kw) !== -1 || b.hotline.indexOf(kw) !== -1;
      });
      tbody.innerHTML = rows.length
        ? rows
            .map(function (b) {
              return (
                "<tr><td><strong>" +
                esc(b.bank) +
                '</strong></td><td><a href="tel:' +
                esc(b.hotline.replace(/\s+/g, "")) +
                '" style="color:#d9485f;font-weight:800">' +
                esc(b.hotline) +
                '</a></td><td class="muted">' +
                esc(b.note) +
                "</td></tr>"
              );
            })
            .join("")
        : '<tr><td colspan="3" class="empty">Không tìm thấy ngân hàng phù hợp.</td></tr>';
    }
    if (tbody) {
      renderBanks("");
      bankInput &&
        bankInput.addEventListener("input", function () {
          renderBanks(bankInput.value);
        });
    }

    var copyTplBtn = document.getElementById("copy-template-btn");
    var tplPre = document.getElementById("police-template-text");
    if (copyTplBtn && tplPre) {
      copyTplBtn.addEventListener("click", function () {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(tplPre.innerText).then(function () {
            copyTplBtn.textContent = "✓ Đã sao chép mẫu đơn";
            setTimeout(function () {
              copyTplBtn.textContent = "Sao chép mẫu đơn";
            }, 2200);
          });
        }
      });
    }
  }

  initNewsletterForms();
  async function api(url, options) {
    var response = await fetch(url, options);
    var result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể tải dữ liệu.');
    return result.data;
  }
  async function startNews() {
    var host = document.getElementById('news-grid') || document.getElementById('article-detail');
    if (!host) return;
    host.textContent = 'Đang tải dữ liệu từ SafeCheck...';
    try {
      ARTICLES = await api('/api/news');
      if (host.id === 'article-detail') {
        var id = new URLSearchParams(location.search).get('id');
        var article = await api('/api/news/' + encodeURIComponent(id || ''));
        ARTICLES = [article].concat(ARTICLES.filter(a => a.id !== article.id));
        initNewsDetailPage();
      } else initNewsPage();
    } catch (err) {
      host.textContent = 'Không thể tải bài viết: ' + err.message + '. ';
      var retry = document.createElement('button'); retry.textContent = 'Thử lại'; retry.className = 'button'; retry.onclick = startNews; host.appendChild(retry);
    }
  }
  startNews();
  initGuidePage();
})();
