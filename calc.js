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
export const wakeResult=(target,wake,bed)=>{const d=toMin(wake)-toMin(target),hours=((toMin(wake)-toMin(bed)+1440)%1440)/60;const on=d<=C.wake.t1,stars=hours>=C.wake.need&&on?5:toMin(wake)<C.wake.cut?3:1;return{time:wake,bed,stars,hours,ontime:on}};
// แต้มตื่น: ตื่นตรงเวลา = ptOn เลย (ข้อมูลเก่าที่ไม่มี ontime ใช้ 5★ แทน)
export const wakePts=w=>!w?0:((w.ontime??(w.stars===5))?C.wake.ptOn:C.wake.pt[w.stars]);
export const taps=ex=>C.ex.reduce((n,e)=>n+Math.floor((+ex[e.k]||0)/e.step),0);
// ต่อท่า: จำนวนเซ็ต / EXP(=Point) รวมของท่านั้น / โบนัสขั้นถัดไป
export const exSets=(ex,e)=>Math.floor((+ex[e.k]||0)/e.step);
export const exXp=(ex,e)=>{const n=exSets(ex,e);return n*e.xp+C.exBonus.reduce((a,b)=>a+(n>=b.n?b.xp:0),0)};
export const exNext=(ex,e)=>{const n=exSets(ex,e);return C.exBonus.find(b=>n<b.n)||null};
const fitXp=ex=>C.ex.reduce((a,e)=>a+exXp(ex,e),0);
export const dayRewards=d=>{const w=d.wake,kc=d.meals.reduce((s,m)=>s+m.kcal,0),n=Math.min(d.meals.length,C.meal.max),r=d.tdee?kc/d.tdee:0;
return{earlyBird:w?C.wake.xp[w.stars]:0,
fitness:fitXp(d.ex||{}),
nutrition:n*C.meal.xp+(n>=C.meal.max?C.meal.all:0)+(d.vit?C.vit:0)+(d.closed&&r>=.7&&r<=1?C.calBonus:0),
wisdom:Math.floor(Math.min(d.read,C.read.cap)/C.read.per)*C.read.xp+(d.read>=30?C.read.b30:0)}};
// ให้รางวัลด้วย "ผลต่าง" จากที่เคยให้ไปแล้ว → แก้/ลบรายการแล้วแต้มไม่เพี้ยน
// Point แยกจาก EXP (ตอนนี้ต่างกันเฉพาะภารกิจตื่นนอน) — ข้อมูลเก่าที่ยังไม่มี awardedP ถือว่าเคยได้ Point เท่า EXP
export const dayPts=d=>({...dayRewards(d),earlyBird:wakePts(d.wake)});
export const applyRewards=s=>{for(const d of Object.values(s.days)){const r=dayRewards(d),p=dayPts(d);d.awardedP=d.awardedP||{};
 for(const q in r){const o=d.awarded[q]||0,po=d.awardedP[q]??o,dl=r[q]-o,dp=p[q]-po;
  if(dl){s.exp[q]=Math.max(0,s.exp[q]+dl);d.awarded[q]=r[q]}
  if(dp)s.points=Math.max(0,s.points+dp);
  d.awardedP[q]=p[q]}}};
export const prevKey=k=>{const[y,m,d]=k.split('-').map(Number),t=new Date(y,m-1,d-1);return `${t.getFullYear()}-${p2(t.getMonth()+1)}-${p2(t.getDate())}`};
export const streak=(days,today)=>{const on=k=>days[k]&&Object.values(dayRewards(days[k])).some(x=>x>0);let k=today,n=0;if(!on(k))k=prevKey(k);while(on(k)){n++;k=prevKey(k)}return n};
const isOn=(days,k)=>!!days[k]&&Object.values(dayRewards(days[k])).some(x=>x>0);
// วันที่ทำต่อเนื่อง (ย้อนจากวันนี้ ถ้าวันนี้ยังไม่ทำ นับจากเมื่อวาน)
export const streakKeys=(days,today)=>{let k=today;if(!isOn(days,k))k=prevKey(k);const a=[];while(isOn(days,k)){a.push(k);k=prevKey(k)}return a};
// ช่องปฏิทินของเดือน m (0-11): null = ช่องว่างก่อนวันที่ 1
export const calMonth=(y,m,days,tk)=>{const c=[];for(let i=0;i<new Date(y,m,1).getDay();i++)c.push(null);
 for(let d=1,n=new Date(y,m+1,0).getDate();d<=n;d++){const k=`${y}-${p2(m+1)}-${p2(d)}`;c.push({d,k,on:isOn(days,k),today:k===tk,future:k>tk})}return c};
