function validateStep(step) {
    let isValid = true;
    
    if (step === 1) {
        let type = $('#targetType').val();
        let val = $('#targetValue').val().trim();
        
        if (!type) {
            $('#targetType').addClass('is-invalid');
            return false;
        } else {
            $('#targetType').removeClass('is-invalid');
        }
        
        let phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        let bankRegex = /^[0-9]{6,15}$/;

        if (type === 'phone' && !phoneRegex.test(val)) {
            $('#targetValueError').text('Số điện thoại không hợp lệ (10 chữ số).');
            $('#targetValue').addClass('is-invalid');
            isValid = false;
        } else if (type === 'bank' && !bankRegex.test(val)) {
            $('#targetValueError').text('Số tài khoản ngân hàng phải từ 6-15 chữ số.');
            $('#targetValue').addClass('is-invalid');
            isValid = false;
        } else if (val.length < 3) {
            $('#targetValueError').text('Vui lòng nhập thông tin chính xác hơn.');
            $('#targetValue').addClass('is-invalid');
            isValid = false;
        } else {
            $('#targetValue').removeClass('is-invalid');
        }
    } 
    else if (step === 2) {
        let desc = $('#incidentDesc').val().trim();
        if (desc.length < 20) {
            $('#incidentDesc').addClass('is-invalid');
            isValid = false;
        } else {
            $('#incidentDesc').removeClass('is-invalid');
        }
    }
    
    return isValid;
}