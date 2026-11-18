const warnings = [
    {
        id: 1,
        title: "Tài khoản nhận tiền có dấu hiệu lừa đảo",
        target: "0123 456 789",
        type: "Giả mạo ngân hàng",
        bank: "Vietcombank",
        status: "red",
        reports: 18,
        date: "2026-11-14",
        method: "Đối tượng tự xưng là nhân viên ngân hàng, gọi điện yêu cầu xác minh tài khoản và cung cấp mã OTP. Sau đó hướng dẫn nạn nhân chuyển tiền đến một tài khoản khác.",
        evidence: "Ảnh chụp giao dịch đã che số tài khoản, tên người nhận và mã giao dịch.",
        comments: [
            "Tôi nhận được cuộc gọi với nội dung tương tự.",
            "Đã có người thân được cảnh báo về tài khoản này."
        ]
    },
    {
        id: 2,
        title: "Fanpage bán hàng yêu cầu chuyển khoản trước",
        target: "facebook.com/shop-gia-dung-abc",
        type: "Lừa đảo mua bán",
        bank: "MB Bank",
        status: "yellow",
        reports: 7,
        date: "2026-11-10",
        method: "Trang bán hàng đăng sản phẩm giá thấp bất thường và yêu cầu khách hàng chuyển khoản đặt cọc. Sau khi nhận tiền, trang ngừng phản hồi.",
        evidence: "Ảnh hội thoại đã che tên, ảnh đại diện và thông tin người gửi.",
        comments: [
            "Nên kiểm tra kỹ thông tin người bán trước khi đặt cọc."
        ]
    },
    {
        id: 3,
        title: "Số điện thoại giả danh cơ quan chức năng",
        target: "09** *** 321",
        type: "Giả danh cơ quan",
        bank: "Không xác định",
        status: "red",
        reports: 24,
        date: "2026-11-08",
        method: "Người gọi thông báo người nghe có liên quan đến một vụ việc và yêu cầu giữ bí mật, kết nối cuộc gọi video hoặc chuyển tiền để xác minh.",
        evidence: "Nội dung cuộc gọi đã lược bỏ giọng nói và dữ liệu nhận dạng.",
        comments: [
            "Có cuộc gọi tương tự vào buổi chiều."
        ]
    },
    {
        id: 4,
        title: "Tài khoản tuyển cộng tác viên trực tuyến",
        target: "0987 *** 210",
        type: "Tuyển cộng tác viên",
        bank: "Techcombank",
        status: "yellow",
        reports: 5,
        date: "2026-10-29",
        method: "Đối tượng mời làm nhiệm vụ đặt đơn nhận hoa hồng. Ban đầu trả khoản tiền nhỏ, sau đó yêu cầu nạp số tiền lớn để mở khóa nhiệm vụ.",
        evidence: "Ảnh chụp nhóm trò chuyện đã che tên thành viên.",
        comments: [
            "Cẩn thận với những công việc yêu cầu nạp tiền trước."
        ]
    },
    {
        id: 5,
        title: "Tài khoản ngân hàng bị phản ánh nhiều lần",
        target: "****** 4568",
        type: "Giả mạo ngân hàng",
        bank: "Vietcombank",
        status: "gray",
        reports: 2,
        date: "2026-09-20",
        method: "Có phản ánh về giao dịch không rõ ràng. Hiện thông tin chưa đủ để xác định hành vi lừa đảo.",
        evidence: "Chứng từ đã che số tài khoản và mã giao dịch.",
        comments: [
            "Cần thêm thông tin xác thực trước khi kết luận."
        ]
    },
    {
        id: 6,
        title: "Website giả mạo chương trình ưu đãi",
        target: "qua-tang-khach-hang.example",
        type: "Lừa đảo mua bán",
        bank: "Không xác định",
        status: "red",
        reports: 13,
        date: "2026-11-12",
        method: "Website quảng cáo nhận quà miễn phí, yêu cầu người dùng nhập thông tin đăng nhập và mã xác thực.",
        evidence: "Ảnh chụp giao diện đã làm mờ logo, email và dữ liệu cá nhân.",
        comments: [
            "Không nhập mật khẩu hoặc OTP từ đường dẫn lạ."
        ]
    }
];

const statusText = {
    red: "Đã xác nhận",
    yellow: "Đang nghi ngờ",
    gray: "Chưa đủ căn cứ"
};

const id = Number(
    new URLSearchParams(window.location.search).get("id")
);

const warning = warnings.find(item => item.id === id);

function getVotes() {
    return JSON.parse(
        localStorage.getItem("safecheckVotes") || "{}"
    );
}

function getComments() {
    return JSON.parse(
        localStorage.getItem("safecheckComments") || "{}"
    );
}

function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function renderDetail() {
    const content = document.getElementById("detailContent");

    if (!warning) {
        content.innerHTML = `
            <div class="not-found">
                Không tìm thấy thông tin cảnh báo.
            </div>
        `;
        return;
    }

    const votes = getVotes();
    const comments = getComments();

    const voteData = votes[id] || {
        yes: 0,
        no: 0
    };

    const commentList = [
        ...warning.comments,
        ...(comments[id] || [])
    ];

    content.innerHTML = `
        <div class="detail-card">

            <div class="detail-header">
                <div>
                    <h1>${warning.title}</h1>

                    <div class="detail-meta">
                        Đối tượng: ${warning.target}<br>
                        Ngân hàng: ${warning.bank}<br>
                        Ngày ghi nhận:
                        ${new Date(warning.date)
                            .toLocaleDateString("vi-VN")}
                    </div>
                </div>

                <span class="status status-${warning.status}">
                    ${statusText[warning.status]}
                </span>
            </div>

            <div class="detail-grid">

                <div>

                    <div class="section">
                        <h2>Thông tin báo cáo</h2>
                        <p><b>Số báo cáo:</b> ${warning.reports}</p>
                        <p><b>Loại cảnh báo:</b> ${warning.type}</p>
                        <p><b>Trạng thái:</b> ${statusText[warning.status]}</p>
                    </div>

                    <div class="section">
                        <h2>Thủ đoạn được phản ánh</h2>
                        <p>${warning.method}</p>
                    </div>

                    <div class="section">
                        <h2>Bằng chứng đã che thông tin</h2>
                        <div class="evidence">
                            🔒 ${warning.evidence}
                        </div>
                    </div>

                    <div class="section">
                        <h2>Bình luận cộng đồng</h2>

                        <div id="commentList">
                            ${commentList.map(comment => `
                                <div class="comment">
                                    <strong>Người dùng cộng đồng</strong>
                                    <p>${escapeHTML(comment)}</p>
                                </div>
                            `).join("")}
                        </div>

                        <textarea
                            id="commentInput"
                            placeholder="Nhập bình luận của bạn...">
                        </textarea>

                        <button class="send-btn" onclick="addComment()">
                            Gửi bình luận
                        </button>
                    </div>

                </div>

                <div>

                    <div class="section">
                        <h2>Đánh giá cảnh báo</h2>

                        <p>
                            Bạn có xác nhận thông tin cảnh báo này
                            là đúng không?
                        </p>

                        <div class="vote-buttons">
                            <button class="vote-yes"
                                onclick="vote('yes')">
                                ✓ Xác nhận đúng
                            </button>

                            <button class="vote-no"
                                onclick="vote('no')">
                                ! Nghi ngờ sai
                            </button>
                        </div>

                        <div class="vote-result" id="voteResult">
                            Xác nhận đúng: ${voteData.yes}<br>
                            Nghi ngờ sai: ${voteData.no}
                        </div>
                    </div>

                    <div class="section">
                        <h2>Lưu ý</h2>

                        <div class="notice">
                            Thông tin do cộng đồng gửi và cần được
                            kiểm chứng. Không chia sẻ dữ liệu cá nhân
                            hoặc tự kết luận khi chưa có đủ căn cứ.
                        </div>
                    </div>

                </div>

            </div>
        </div>
    `;
}

function vote(type) {
    const allVotes = getVotes();

    const votedItems = JSON.parse(
        localStorage.getItem("safecheckVoted") || "{}"
    );

    if (votedItems[id]) {
        alert("Bạn đã bỏ phiếu cho cảnh báo này rồi.");
        return;
    }

    if (!allVotes[id]) {
        allVotes[id] = {
            yes: 0,
            no: 0
        };
    }

    allVotes[id][type]++;

    votedItems[id] = type;

    localStorage.setItem(
        "safecheckVotes",
        JSON.stringify(allVotes)
    );

    localStorage.setItem(
        "safecheckVoted",
        JSON.stringify(votedItems)
    );

    renderDetail();

    alert("Đã ghi nhận đánh giá của bạn.");
}

function addComment() {
    const input = document.getElementById("commentInput");
    const value = input.value.trim();

    if (!value) {
        alert("Vui lòng nhập nội dung bình luận.");
        return;
    }

    const allComments = getComments();

    if (!allComments[id]) {
        allComments[id] = [];
    }

    allComments[id].push(value);

    localStorage.setItem(
        "safecheckComments",
        JSON.stringify(allComments)
    );

    renderDetail();
}

function goBack() {
    window.location.href = "warning-list.html";
}

renderDetail();
