$(document).ready(function() {
    let currentStep = 1;
    let generatedCaptcha = "";

    function initCaptcha() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        generatedCaptcha = code;
        $("#captchaText").text(code);
    }
    initCaptcha();

    $('#targetType').change(function() {
        let val = $(this).val();
        if (val === 'phone') {
            $('#labelTargetValue').text('Số điện thoại lừa đảo');
            $('#targetValue').attr('placeholder', 'Ví dụ: 0912345678');
        } else if (val === 'bank') {
            $('#labelTargetValue').text('Số tài khoản ngân hàng');
            $('#targetValue').attr('placeholder', 'Ví dụ: 0123456789 (Vietcombank)');
        } else if (val === 'url') {
            $('#labelTargetValue').text('Đường dẫn website độc hại');
            $('#targetValue').attr('placeholder', 'Ví dụ: https://trang-web-gia-mao.com');
        } else {
            $('#labelTargetValue').text('Link tài khoản mạng xã hội');
            $('#targetValue').attr('placeholder', 'Ví dụ: facebook.com/scammer');
        }
    });

    $('.next-btn').click(function() {
        if (validateStep(currentStep)) {
            if (currentStep < 4) {
                currentStep++;
                updateStepUI();
            }
        }
    });

    $('.prev-btn').click(function() {
        if (currentStep > 1) {
            currentStep--;
            updateStepUI();
        }
    });

    function updateStepUI() {
        $('.step-content').removeClass('active');
        $(`.step-content[data-step="${currentStep}"]`).addClass('active');

        $('.step-item').each(function() {
            let stepNum = parseInt($(this).attr('data-step'));
            if (stepNum < currentStep) {
                $(this).removeClass('active').addClass('completed').html('<i class="fas fa-check"></i>');
            } else if (stepNum === currentStep) {
                $(this).removeClass('completed').addClass('active').text(stepNum);
            } else {
                $(this).removeClass('active completed').text(stepNum);
            }
        });
    }

    $('#reportForm').submit(function(e) {
        e.preventDefault();
        let userCaptcha = $('#captchaInput').val().trim();

        if (userCaptcha !== generatedCaptcha) {
            $('#captchaInput').addClass('is-invalid');
            return;
        } else {
            $('#captchaInput').removeClass('is-invalid');
        }

        let randomCode = "#SC-2026-" + Math.floor(1000 + Math.random() * 9000);
        $('#reportCode').text(randomCode);

        let reportData = {
            code: randomCode,
            type: $('#targetType').val(),
            platform: $('#targetPlatform').val(),
            value: $('#targetValue').val(),
            amount: $('#damageAmount').val(),
            desc: $('#incidentDesc').val(),
            anonymous: $('#isAnonymous').is(':checked'),
            date: new Date().toLocaleDateString(),
            status: 'Pending'
        };

        let reports = JSON.parse(localStorage.getItem('listReports')) || [];
        reports.unshift(reportData);
        localStorage.setItem('listReports', JSON.stringify(reports));

        $('#reportForm').slideUp();
        $('.step-indicator').slideUp();
        $('#successAlert').removeClass('d-none');
    });
});