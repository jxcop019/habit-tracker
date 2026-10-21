// ร้านค้า / คลังไอเทม / ตั๋วนับถอยหลัง (ฟังก์ชันล้วน คืนข้อความ error หรือ '' ถ้าสำเร็จ)
import {CFG as C} from './config.js';
export const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
export const seed=s=>{if(!s.shop.seeded){if(!s.shop.customRewards.length)C.defaultRewards.forEach(r=>s.shop.customRewards.push({id:uid(),...r}));s.shop.seeded=true}};
export const active=s=>s.inventory.find(i=>i.status==='active');
export const expire=(s,now=Date.now())=>{let n=0;for(const i of s.inventory)if(i.status==='active'&&i.expiresAt<=now){i.status='used';n++}return n};
export const redeem=(s,id)=>{const r=s.shop.customRewards.find(x=>x.id===id);if(!r)return'ไม่พบของรางวัล';if(s.points<r.price)return'แต้มไม่พอ';
 s.points-=r.price;s.inventory.unshift({id:uid(),name:r.name,durationMin:r.durationMin||0,status:'ready',redeemedAt:Date.now(),expiresAt:null,usedAt:null});return''};
export const useTicket=(s,id,now=Date.now())=>{const i=s.inventory.find(x=>x.id===id);if(!i||i.status!=='ready')return'ใช้ตั๋วนี้ไม่ได้';
 if(i.durationMin){if(active(s))return'มีตั๋วที่กำลังใช้อยู่ รอให้หมดเวลาก่อน';i.status='active';i.expiresAt=now+i.durationMin*6e4}else i.status='used';i.usedAt=now;return''};
export const buyTheme=(s,k)=>{const t=C.themes[k];if(!t)return'ไม่พบธีม';if(s.shop.unlockedThemes.includes(k))return'ปลดล็อกแล้ว';if(s.points<t.price)return'แต้มไม่พอ';s.points-=t.price;s.shop.unlockedThemes.push(k);return''};
export const setTheme=(s,k)=>{if(!C.themes[k]||(k!=='default'&&!s.shop.unlockedThemes.includes(k)))return'ยังไม่ได้ปลดล็อก';s.settings.theme=k;return''};
