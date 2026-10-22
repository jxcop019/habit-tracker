// สแกนอาหารผ่าน Cloudflare Worker (/ai/food) — คีย์ AI อยู่ใน Worker ไม่อยู่ในหน้าเว็บ
import {CFG as C} from './config.js';
export const resize=(file,max=1024)=>new Promise((ok,no)=>{const im=new Image(),u=URL.createObjectURL(file);
 im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
  c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.8).split(',')[1])};
 im.onerror=()=>no(new Error('อ่านไฟล์รูปไม่ได้'));im.src=u});
// st(ข้อความสถานะ) ถูกเรียกทุกขั้นตอน เพื่อให้หน้าเว็บแสดงว่าถึงไหนแล้ว
export const analyze=async(file,rz=resize,st=()=>{})=>{st('กำลังย่อรูป...');const image=await rz(file);
 st('กำลังส่งรูปให้ AI วิเคราะห์ (ปกติ 5–15 วินาที)...');const ac=new AbortController(),to=setTimeout(()=>ac.abort(),45000);
 try{const r=await fetch(C.workerUrl+'/ai/food',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image,mime:'image/jpeg'}),signal:ac.signal});
  const j=await r.json().catch(()=>({}));if(!r.ok||!j.food)throw new Error(j.error||'วิเคราะห์ไม่สำเร็จ');return j.food}
 catch(e){throw new Error(e.name==='AbortError'?'AI ตอบช้าเกินไป (เกิน 45 วินาที)':e.message==='Failed to fetch'?'เชื่อมต่อ Worker ไม่ได้ ตรวจอินเทอร์เน็ต':e.message)}finally{clearTimeout(to)}};
