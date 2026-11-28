const router=require('express').Router();
const c=require('../controllers/news.controller');
const wrap=fn=>async(req,res)=>{try{await fn(req,res);}catch(err){console.error(err);res.status(500).json({success:false,message:'Không thể xử lý dữ liệu tin tức. Kiểm tra kết nối DB và migration.'});}};
router.get('/',wrap(c.list));
router.post('/subscriptions',wrap(c.subscribe));
router.get('/:slug',wrap(c.detail));
module.exports=router;
