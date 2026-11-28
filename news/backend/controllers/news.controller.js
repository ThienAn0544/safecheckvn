const db = require('../config/database');
const base = `SELECT n.slug AS id,n.title,n.summary,DATE_FORMAT(n.published_at,'%Y-%m-%d') AS date,m.category,m.author_label AS author,m.read_time AS readTime,m.featured,m.views,m.tags,m.warning_note AS warningNote,m.sections FROM news n JOIN news_member5 m ON m.news_id=n.id WHERE n.status='published'`;
const decode = v => typeof v === 'string' ? JSON.parse(v) : v;
const map = r => ({...r, featured:!!r.featured, tags:decode(r.tags), sections:decode(r.sections)});
exports.list = async (req,res) => {
  const {cat='all',q='',tag='',sort='newest'} = req.query;
  if (![cat,q,tag,sort].every(v=>typeof v==='string' && v.length<=200)) return res.status(400).json({message:'Bộ lọc không hợp lệ'});
  let sql=base; const args=[];
  if(cat!=='all'){sql+=' AND m.category=?';args.push(cat);}
  if(q){sql+=' AND (LOCATE(?,n.title)>0 OR LOCATE(?,n.summary)>0 OR LOCATE(?,CAST(m.tags AS CHAR))>0)';args.push(q,q,q);}
  if(tag){sql+=' AND LOCATE(?,CAST(m.tags AS CHAR))>0';args.push(tag);}
  sql+=sort==='popular'?' ORDER BY m.views DESC,n.id DESC':' ORDER BY n.published_at DESC,n.id DESC';
  const [rows]=await db.execute(sql,args); res.json({success:true,data:rows.map(map)});
};
exports.detail = async (req,res) => {
  const slug=req.params.slug;
  const [result]=await db.execute("UPDATE news_member5 m JOIN news n ON n.id=m.news_id SET m.views=m.views+1 WHERE n.slug=? AND n.status='published'",[slug]);
  if(!result.affectedRows) return res.status(404).json({message:'Không tìm thấy bài viết'});
  const [rows]=await db.execute(base+' AND n.slug=?',[slug]);
  if(!rows.length) return res.status(404).json({message:'Không tìm thấy bài viết'});
  res.json({success:true,data:map(rows[0])});
};
exports.subscribe=async(req,res)=>{
  const email=typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';
  if(email.length>254||!/^\S+@[^\s@]+\.[^\s@]{2,}$/.test(email)||email.split('@').length!==2) return res.status(400).json({message:'Email không hợp lệ'});
  await db.execute('INSERT INTO news_subscriptions(email) VALUES (?) ON DUPLICATE KEY UPDATE email=email',[email]);
  res.json({success:true,data:null});
};
