window.validateReport=data=>{if(!data.scamType||!data.suspectValue)return'Vui lòng điền các trường bắt buộc.';if(data.description.trim().length<20)return'Mô tả cần có ít nhất 20 ký tự.';return''};
