$(document).ready(function() {
    
    $('#evidenceFiles').change(function(e) {
        $('#imagePreviewContainer').html('');
        let files = e.target.files;
        
        if (files.length > 3) {
            alert('Bạn chỉ được tải lên tối đa 3 ảnh bằng chứng!');
            $(this).val('');
            return;
        }
        
        for (let i = 0; i < files.length; i++) {
            let reader = new FileReader();
            reader.onload = function(event) {
                let imgTag = `<img src="${event.target.result}" class="preview-img rounded border">`;
                $('#imagePreviewContainer').append(imgTag);
            }
            reader.readAsDataURL(files[i]);
        }
    });
});