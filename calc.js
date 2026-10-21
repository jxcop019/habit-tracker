// ฟังก์ชันคำนวณล้วน ไม่แตะ UI
import {CFG as C} from './config.js';
const p2=n=>String(n).padStart(2,'0');
export const dayKey=(d=new Date())=>{const t=new Date(d.getTime()-C.dayResetHour*36e5);return `${t.getFullYear()}-${p2(t.getMonth()+1)}-${p2(t.getDate())}`};
export const toMin=s=>{const[a,b]=s.split(':').map(Number);return a*60+b};
export const age=(bd,now=new Date())=>{const b=new Date(bd);let a=now.getFullYear()-b.getFullYear();const m=now.getMonth()-b.getMonth();if(m<0||(m===0&&now.getDate()<b.getDate()))a--;return a};
export const bmi=(w,h)=>Math.round(w/((h/100)**2)*10)/10;
export const bmiCat=v=>v<18.5?{t:'ผอมเกินไป',c:'#3b82f6'}:v<23?{t:'สมส่วน',c:'#22c55e'}:v<25?{t:'ท้วม/เริ่มอ้วน',c:'#eab308'}:v<30?{t:'อ้วนระดับ 1',c:'#f97316'}:{t:'อ้วนระดับ 2',c:'#ef4444'};
export const bmr=(sex,w,h,a)=>Math.round(10*w+6.25*h-5*a+(sex==='male'?5:-161));
export const tdee=(b,act)=>Math.round(b*C.act[act]);
export const calState=p=>p<70?['#38bdf8','ต่ำกว่าเป้า']:p<=100?['#22c55e','อยู่ในเป้า']:p<=120?['#f97316','เกินเป้า']:['#ef4444','เกินมาก'];
export const levelOf=e=>{let l=1;C.expMin.forEach((m,i)=>{if(e>=m)l=i+1});return l};
export const progress=e=>{const l=levelOf(e);if(l===C.expMin.length)return 100;const lo=C.expMin[l-1];return(e-lo)/(C.expMin[l]-lo)*100};
export const rankOf=a=>{const i=[2,4,6,8,9].findIndex(x=>a<x);return i<0?5:i};
export const wakeResult=(target,wake,bed)=>{const d=toMin(wake)-toMin(target);const stars=d<=C.wake.t1?5:d<=C.wake.t2?3:1;return{time:wake,bed,stars,hours:((toMin(wake)-toMin(bed)+1440)%1440)/60}};
export const dayRewards=d=>{const w=d.wake,kc=d.meals.reduce((s,m)=>s+m.kcal,0),n=Math.min(d.meals.length,C.meal.max),r=d.tdee?kc/d.tdee:0;
return{earlyBird:w?C.wake.xp[w.stars]+(w.hours>=C.wake.sr[0]&&w.hours<=C.wake.sr[1]?C.wake.sb:0):0,
fitness:Math.floor(Math.min(d.push,C.push.cap)/C.push.per)*C.push.xp+(d.push>=50?C.push.b50:0)+(d.push>=100?C.push.b100:0),
nutrition:n*C.meal.xp+(n>=C.meal.max?C.meal.all:0)+(d.vit?C.vit:0)+(d.closed&&r>=.7&&r<=1?C.calBonus:0),
wisdom:Math.floor(Math.min(d.read,C.read.cap)/C.read.per)*C.read.xp+(d.read>=30?C.read.b30:0)}};
// ให้รางวัลด้วย "ผลต่าง" จากที่เคยให้ไปแล้ว → แก้/ลบรายการแล้วแต้มไม่เพี้ยน
export const applyRewards=s=>{for(const d of Object.values(s.days)){const r=dayRewards(d);for(const q in r){const dl=r[q]-(d.awarded[q]||0);if(dl){s.exp[q]=Math.max(0,s.exp[q]+dl);s.points=Math.max(0,s.points+dl);d.awarded[q]=r[q]}}}};
