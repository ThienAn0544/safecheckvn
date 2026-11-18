const warnings = [
    {
        id: 1,
        title: "Tài khoản nhận tiền có dấu hiệu lừa đảo",
        target: "0123 456 789",
        type: "Giả mạo ngân hàng",
        bank: "Vietcombank",
        status: "red",
        reports: 18,
        date: "2026-11-14"
    },
    {
        id: 2,
        title: "Fanpage bán hàng yêu cầu chuyển khoản trước",
        target: "facebook.com/shop-gia-dung-abc",
        type: "Lừa đảo mua bán",
        bank: "MB Bank",
        status: "yellow",
        reports: 7,
        date: "2026-11-10"
    },
    {
        id: 3,
        title: "Số điện thoại giả danh cơ quan chức năng",
        target: "09** *** 321",
        type: "Giả danh cơ quan",
        bank: "Không xác định",
        status: "red",
        reports: 24,
        date: "2026-11-08"
    },
    {
        id: 4,
        title: "Tài khoản tuyển cộng tác viên trực tuyến",
        target: "0987 *** 210",
        type: "Tuyển cộng tác viên",
        bank: "Techcombank",
        status: "yellow",
        reports: 5,
        date: "2026-10-29"
    },
    {
        id: 5,
        title: "Tài khoản ngân hàng bị phản ánh nhiều lần",
        target: "****** 4568",
        type: "Giả mạo ngân hàng",
        bank: "Vietcombank",
        status: "gray",
        reports: 2,
        date: "2026-09-20"
    },
    {
        id: 6,
        title: "Website giả mạo chương trình ưu đãi",
        target: "qua-tang-khach-hang.example",
        type: "Lừa đảo mua bán",
        bank: "Không xác định",
        status: "red",
        reports: 13,
        date: "2026-11-12"
    }
];

const statusText = {
    red: "Đã xác nhận",
    yellow: "Đang nghi ngờ",
    gray: "Chưa đủ căn cứ"
};

let currentPage = 1;
const itemsPerPage = 3;

function renderPagination(totalPages) {
    const pagination = document.getElementById("pagination");

    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");

        button.textContent = i;

        if (i === currentPage) {
            button.classList.add("active");
        }

        button.onclick = function () {
            currentPage = i;
            renderWarnings();
        };

        pagination.appendChild(button);
    }
}

function renderWarnings() {
    const data = getFilteredWarnings(warnings);

    const totalPages = Math.max(
        1,
        Math.ceil(data.length / itemsPerPage)
    );

    currentPage = Math.min(currentPage, totalPages);

    const start = (currentPage - 1) * itemsPerPage;
    const pageData = data.slice(start, start + itemsPerPage);

    document.getElementById("resultCount").textContent =
        data.length + " cảnh báo";

    const list = document.getElementById("warningList");

    if (pageData.length === 0) {
        list.innerHTML =
            '<div class="empty">Không tìm thấy cảnh báo phù hợp.</div>';
    } else {
        list.innerHTML = pageData.map(item => `
            <div class="warning-card">
                <div class="card-top">
                    <span class="status status-${item.status}">
                        ${statusText[item.status]}
                    </span>

                    <span class="category">${item.type}</span>
                </div>

                <h3>${item.title}</h3>

                <div class="warning-info">
                    Đối tượng: ${item.target}<br>
                    Ngân hàng: ${item.bank}<br>
                    Ngày cập nhật:
                    ${new Date(item.date).toLocaleDateString("vi-VN")}
                </div>

                <div class="card-bottom">
                    <span class="report-count">
                        ${item.reports} báo cáo
                    </span>

                    <button class="detail-btn"
                        onclick="viewDetail(${item.id})">
                        Xem chi tiết
                    </button>
                </div>
            </div>
        `).join("");
    }

    renderPagination(totalPages);
}

function viewDetail(id) {
    window.location.href = "warning-detail.html?id=" + id;
}

["typeFilter", "bankFilter", "timeFilter"].forEach(id => {
    document.getElementById(id).addEventListener("change", () => {
        currentPage = 1;
        renderWarnings();
    });
});

document.getElementById("searchInput")
    .addEventListener("input", () => {
        currentPage = 1;
        renderWarnings();
    });

document.getElementById("resetBtn").onclick = function () {
    document.getElementById("typeFilter").value = "";
    document.getElementById("bankFilter").value = "";
    document.getElementById("timeFilter").value = "";
    document.getElementById("searchInput").value = "";

    currentPage = 1;
    renderWarnings();
};

renderWarnings();
