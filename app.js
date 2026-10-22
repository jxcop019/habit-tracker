import {CFG as C} from './config.js';
import {GROUPS,RANKS,ACT} from './titles.js';
import * as K from './calc.js';
import * as S from './store.js';
import * as Shop from './shop.js';
import * as AI from './ai.js';
import * as FX from './fx.js';
let s=S.load();Shop.seed(s);let view='home';
const $=q=>document.querySelector(q),v=id=>$('#'+id).value;
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p2=n=>String(n).padStart(2,'0'),today=()=>K.dayKey();
const day=()=>s.days[today()]||(s.days[today()]={wake:null,ex:{},meals:[],vit:false,read:0,awarded:{},closed:false});
const body=()=>{const p=s.profile;if(!p.weightKg||!p.heightCm||!p.birthDate)return null;const b=K.bmr(p.sex,p.weightKg,p.heightCm,K.age(p.birthDate));return{bmi:K.bmi(p.weightKg,p.heightCm),bmr:b,tdee:K.tdee(b,p.activity)}};
const lvs=()=>GROUPS.map(g=>K.levelOf(s.exp[g.k]));
let tt;const toast=m=>{const t=$('#toast');t.textContent=m;t.className='show';clearTimeout(tt);tt=setTimeout(()=>t.className='',2200)};
function commit(msg){
 const b=body(),L=lvs(),p0=s.points;
 for(const[k,d]of Object.entries(s.days))if(k<today()&&!d.closed){d.closed=true;d.tdee=b?b.tdee:0}
 K.applyRewards(s);Shop.expire(s);
 const up=lvs().some((x,i)=>x>L[i]);
 if(!S.save(s))toast('บันทึกลงเครื่องไม่สำเร็จ');
 else if(up)toast('🎉 เลเวลอัป!');
 else if(msg)toast(msg+(s.points!==p0?` (${s.points>p0?'+':''}${s.points-p0})`:''));
 render();
}
const fmt=ms=>{const t=Math.max(0,Math.ceil(ms/1000));return `${p2(Math.floor(t/60))}:${p2(t%60)}`};
let pv=null;
const ICON=n=>/ซีรีส์|เกม/.test(n)?'🎮':/ขนม|เครื่องดื่ม|กาแฟ|ชา/.test(n)?'🍰':/ของขวัญ/.test(n)?'🎁':'🎟';
const rar=p=>p<200?['common','สามัญ']:p<500?['rare','หายาก']:p<1000?['epic','เอปิก']:['legend','ตำนาน'];
const avatar=()=>s.profile.photo.startsWith('data:image/')?`<img class="av" src="${esc(s.profile.photo)}" alt="">`:'<div class="av"></div>';
const badge=()=>{const a=Shop.active(s);return a?`<div class="card s12 pop">🎟 กำลังใช้: <b>${esc(a.name)}</b> · เหลือ <b data-exp="${a.expiresAt}">${fmt(a.expiresAt-Date.now())}</b> นาที</div>`:''};
const shopHtml=()=>`<section class="s12"><h2>🛒 ร้านค้า <small>💰 ${s.points} แต้ม</small></h2></section><div class="s12 shelf">${s.shop.customRewards.map(r=>{const[k,n]=rar(r.price);return `<article class="ic r-${k} fx tilt"><span class="tag">ITEM · ${n}</span><div class="ic-ed"><button class="g" data-a="editR" data-i="${esc(r.id)}" title="แก้ไข">✎</button><button class="g" data-a="delR" data-i="${esc(r.id)}" title="ลบ">✕</button></div><div class="ic-ico">${ICON(r.name)}</div><h3>${esc(r.name)}</h3><div class="chips"><span>${r.durationMin?'⏱ '+r.durationMin+' นาที':'✨ ใช้ทันที'}</span></div><div class="ic-foot"><b class="price">💰 ${r.price}</b><button class="fx" data-a="redeem" data-i="${esc(r.id)}">แลก</button></div></article>`}).join('')}
<article class="ic add"><h3>＋ สร้างไอเทมใหม่</h3><input id="r-n" placeholder="ชื่อไอเทม"><input id="r-p" type="number" placeholder="ราคา (แต้ม)"><input id="r-d" type="number" placeholder="นาที (ว่าง = ใช้ทันที)"><button data-a="addR">เพิ่มไอเทม</button></article></div>`;
const invHtml=()=>`<section class="s12"><h2>🎒 คลังของฉัน</h2></section><div class="s12 shelf">${s.inventory.map(i=>{const[k,n]=rar(i.price||0);return `<article class="ic r-${k} ${i.status} fx tilt"><span class="tag">${i.status==='active'?'ACTIVE':i.status==='used'?'USED':'ITEM · '+n}</span><div class="ic-ico">${ICON(i.name)}</div><h3>${esc(i.name)}</h3><div class="ic-foot">${i.status==='ready'?`<button class="fx" data-a="use" data-i="${esc(i.id)}">กดใช้งาน</button>${i.durationMin?`<small>⏱ ${i.durationMin} นาที</small>`:''}`:i.status==='active'?`<b class="timer">⏳ <span data-exp="${i.expiresAt}">${fmt(i.expiresAt-Date.now())}</span></b>`:'<small>ใช้แล้ว</small>'}</div></article>`}).join('')||'<small>ยังไม่มีไอเทม ไปแลกที่ร้านค้าได้เลย</small>'}</div>
${s.inventory.some(i=>i.status==='used')?'<div class="s12 row"><button class="g" data-a="clearUsed">ล้างรายการที่ใช้แล้ว</button></div>':''}`;
const themeHtml=()=>`<section class="s12"><h2>🎨 ธีม <small>กด “ดูตัวอย่าง” เพื่อลองทั้งแอปก่อนซื้อ</small></h2></section><div class="s12 shelf">${Object.entries(C.themes).map(([k,t])=>{const own=k==='default'||s.shop.unlockedThemes.includes(k);return `<article class="ic th r-${k==='default'?'legend':'rare'} fx" data-theme="${k}"><div class="pv"><div class="pv-bar"><i></i></div><div class="pv-row"><span></span><span></span></div><button tabindex="-1">ปุ่มตัวอย่าง</button></div><h3>${esc(t.name)}</h3><div class="ic-foot">${k===s.settings.theme?'<small>✅ ใช้อยู่</small>':own?`<button data-a="theme" data-i="${k}">ใช้ธีมนี้</button>`:`<b class="price">💰 ${t.price}</b><button data-a="buyT" data-i="${k}">ซื้อ</button>`}<button class="g" data-a="preview" data-i="${k}">👁 ดูตัวอย่าง</button></div></article>`}).join('')}</div>`;
const mac=(n,e,t)=>`<div><small>${n} ${e}/${t} g</small><div class="bar"><i style="width:${Math.min(100,t?e/t*100:0)}%"></i></div></div>`;
function homeHtml(b,d,L,avg){
 const p=s.profile,r=K.dayRewards(d),T=b?b.tdee:0,kc=d.meals.reduce((a,m)=>a+m.kcal,0),pct=b?kc/T*100:0,[cc,ct]=K.calState(pct),hi=T-kc,lo=Math.ceil(T*.7)-kc,rem=C.meal.max-d.meals.length;
 const sm=k=>d.meals.reduce((a,m)=>a+(m[k]||0),0),tp=Math.round(1.6*(p.weightKg||0)),tf=Math.round(.25*T/9),tc=Math.max(0,Math.round((T-4*tp-9*tf)/4));
 const tip=!b?'กรอกโปรไฟล์ที่เมนู 👤 เพื่อดูเป้าหมายแคลอรี':pct<70?`ควรกินอีกอย่างน้อย <b>${lo}</b> kcal ให้ถึงช่วงเป้า (70%) และกินได้อีกสูงสุด <b>${hi}</b> kcal จนเต็มเป้า`:pct<=100?`อยู่ในช่วงเป้าแล้ว 👍 กินได้อีกไม่เกิน <b>${hi}</b> kcal`:`เกินเป้า <b>${-hi}</b> kcal ลดมื้อถัดไป หรือขยับร่างกายเพิ่ม`;
 const per=b&&hi>0&&rem>0?`เหลืออีก ${rem} มื้อ ≈ ${Math.round(hi/rem)} kcal/มื้อ`:'',t5=K.taps(d.ex),nx=t5<5?5:t5<10?10:0,hero=C.themes[pv||s.settings.theme]?.logo,bc=b&&K.bmiCat(b.bmi);
 return `${hero?`<div class="hero s12"><img src="${hero}" alt="LifeQuest"></div>`:''}
<section class="card s12 prof"><div class="pf">${avatar()}<div><div class="big">${esc(p.name||'ผู้เล่น')}</div><div>${RANKS[K.rankOf(avg)]} <small>เฉลี่ย Lv.${avg.toFixed(1)}</small></div>${b?`<div class="chips"><span>BMI ${b.bmi} · <b style="color:${bc.c}">${bc.t}</b></span><span>BMR ${b.bmr}</span><span>TDEE ${b.tdee} kcal</span></div>`:'<small>ไปที่ 👤 โปรไฟล์เพื่อกรอกข้อมูล</small>'}</div></div>
<div class="lvg">${GROUPS.map((g,i)=>`<div><div class="lv-h"><b>${g.n}</b><span>Lv.${L[i]}</span></div><small>${esc(g.t[L[i]-1])}</small><div class="bar"><i style="width:${K.progress(s.exp[g.k])}%"></i></div><small>${s.exp[g.k]} EXP${L[i]===10?' · MAX':''}</small></div>`).join('')}</div></section>
<section class="card s12"><h2>🍽 โภชนาการวันนี้ <span class="xp">+${r.nutrition} EXP</span></h2><div class="two"><div class="col">
<div class="big">${kc} <small>/ ${b?T:'—'} kcal</small></div><div class="bar"><i style="width:${Math.min(pct,100)}%;background:${cc}"></i></div><small>${b?`${pct.toFixed(0)}% · ${ct}`:''}</small>
<p class="tip">${tip}${per?`<br><small>${per}</small>`:''}</p>${b?`<div class="mac">${mac('โปรตีน',sm('protein'),tp)}${mac('คาร์บ',sm('carbs'),tc)}${mac('ไขมัน',sm('fat'),tf)}</div><small>เป้าสารอาหารเป็นค่าแนะนำคร่าวๆ · ถ้าสรุปวันแล้วอยู่ 70–100% ของเป้า รับ +${C.calBonus} EXP ตอนข้ามวัน</small>`:''}</div>
<div class="col">${d.meals.map((m,i)=>`<div class="row">🍽 ${esc(m.menu)} · ${m.kcal} kcal${m.protein||m.carbs||m.fat?` · P${m.protein} C${m.carbs} F${m.fat}`:''} <button class="g" data-a="delMeal" data-i="${i}">ลบ</button></div>`).join('')}
<div class="row"><label class="g" style="padding:9px 14px;border-radius:12px;cursor:pointer;border:1px solid var(--b)">📷 สแกนรูปอาหาร<input id="scan" type="file" accept="image/*" hidden></label><small>มื้อที่บันทึก ${d.meals.length}/${C.meal.max}</small></div>
<div class="row"><input id="m-n" placeholder="เมนู" size="12"><input id="m-k" type="number" placeholder="kcal" style="width:80px"></div>
<div class="row"><input id="m-p" type="number" placeholder="โปรตีน g" style="width:92px"><input id="m-c" type="number" placeholder="คาร์บ g" style="width:92px"><input id="m-f" type="number" placeholder="ไขมัน g" style="width:92px"></div>
<div class="row"><button data-a="addMeal">เพิ่มมื้อ</button></div><small id="m-note"></small></div></div></section>
<section class="card s4"><h2>⏰ ตื่นนอน <span class="xp">+${r.earlyBird} EXP</span></h2>${d.wake?`<div class="big pop">${'⭐'.repeat(d.wake.stars)}</div><div>ตื่น ${d.wake.time} · นอน ${d.wake.hours.toFixed(1)} ชม.</div>`:`<small>เป้าหมาย ${esc(p.wakeTarget)} · เช็กอินได้ ${p2(C.wakeWin[0])}:00–${p2(C.wakeWin[1])}:00</small><label>นอนเมื่อคืน <input id="bed" type="time" value="23:30"></label><button data-a="wake">เช็กอินตื่น</button>`}</section>
<section class="card s4"><h2>📚 อ่าน/เรียนรู้ <span class="xp">+${r.wisdom} EXP</span></h2><div class="big">${d.read} <small>นาที</small></div><small>ครบ 30 นาที = +15 EXP (นับสูงสุด 30 นาที/วัน)</small><div class="row"><button data-a="read15">+15 นาที</button><button class="g" data-a="setRead">แก้ยอด</button></div></section>
<section class="card s4"><h2>💊 วิตามิน <span class="xp">+${d.vit?C.vit:0} EXP</span></h2><div class="big">${d.vit?'✅ กินแล้ว':'⬜ ยังไม่กิน'}</div><small>เช็กอินวันละครั้ง +${C.vit} EXP</small><button class="${d.vit?'g':''}" data-a="vit">${d.vit?'ยกเลิก':'กินวิตามินแล้ว'}</button></section>
<section class="card s12"><h2>💪 ออกกำลังกาย <span class="xp">+${r.fitness} / ${C.fitCap+C.fitB1+C.fitB2} EXP</span></h2><small>กดปุ่มของแต่ละท่าเมื่อทำครบเซ็ต · รวม ${t5} เซ็ต${nx?` · ครบ ${nx} เซ็ต โบนัส +${nx===5?C.fitB1:C.fitB2}`:' · รับโบนัสครบแล้ว 🎉'}</small>
<div class="exg">${C.ex.map(e=>`<div class="qt fx tilt"><div class="qt-i">${e.icon}</div><b>${e.n}</b><div class="big">${d.ex[e.k]||0} <small>${e.unit}</small></div><div class="row"><button class="fx" data-a="ex" data-i="${e.k}">+${e.step}</button><button class="g" data-a="exUndo" data-i="${e.k}" title="ย้อน">↩</button></div></div>`).join('')}</div></section>`}
function profHtml(b){const p=s.profile,opt=(o,sel)=>Object.entries(o).map(([k,t])=>`<option value="${k}" ${k===sel?'selected':''}>${esc(t)}</option>`).join(''),bc=b&&K.bmiCat(b.bmi);
 return `<section class="card s12"><h2>👤 โปรไฟล์</h2><div class="pf">${avatar()}${b?`<div class="chips"><span>BMI ${b.bmi} · <b style="color:${bc.c}">${bc.t}</b></span><span>BMR ${b.bmr}</span><span>TDEE ${b.tdee} kcal</span></div>`:'<small>กรอกข้อมูลเพื่อคำนวณ BMI / BMR / TDEE</small>'}</div>
<div class="grid2"><label>ชื่อ<input id="f-n" value="${esc(p.name)}"></label><label>เพศ<select id="f-s">${opt({male:'ชาย',female:'หญิง'},p.sex)}</select></label>
<label>วันเกิด<input id="f-bd" type="date" value="${esc(p.birthDate)}"></label><label>เวลาเป้าหมายตื่น<input id="f-wt" type="time" value="${esc(p.wakeTarget)}"></label>
<label>น้ำหนัก (kg)<input id="f-w" type="number" step="0.1" value="${p.weightKg||''}"></label><label>ส่วนสูง (cm)<input id="f-h" type="number" value="${p.heightCm||''}"></label>
<label style="grid-column:1/-1">ระดับกิจกรรม<select id="f-a">${opt(ACT,p.activity)}</select></label></div>
<div class="row"><button data-a="saveProfile">บันทึกโปรไฟล์</button><label class="g" style="padding:9px 14px;border-radius:12px;cursor:pointer;border:1px solid var(--b)">รูปโปรไฟล์<input id="photo" type="file" accept="image/*" hidden></label></div></section>
<section class="card s12"><h2>💾 ข้อมูล</h2><div class="row"><button data-a="export">Export JSON</button><label class="g" style="padding:9px 14px;border-radius:12px;cursor:pointer;border:1px solid var(--b)">Import JSON<input id="imp" type="file" accept=".json" hidden></label><button class="g" data-a="reset">Reset ทั้งหมด</button></div><small>ข้อมูลอยู่ในเบราว์เซอร์เครื่องนี้ ควร Export สำรองไว้เป็นระยะ</small></section>`}
const TABS=[['home','🏠','หลัก'],['shop','🛒','ร้านค้า'],['inv','🎒','คลัง'],['theme','🎨','ธีม'],['profile','👤','โปรไฟล์']];
const navH=c=>`<nav class="${c}">${TABS.map(([k,i,t])=>`<button class="nv fx ${view===k?'on':''}" data-a="go" data-i="${k}"><span>${i}</span>${t}</button>`).join('')}</nav>`;
function render(){
 const b=body(),d=day(),L=lvs(),avg=L.reduce((a,c)=>a+c,0)/4;
 document.documentElement.dataset.theme=pv||s.settings.theme||'default';
 $('#hdr').innerHTML=`<header><div class="brand"><img src="icon.png" alt=""><b>LifeQuest</b></div>${navH('nav-top')}<div class="hr"><span class="coin">💰 ${s.points}</span><button class="g fx" data-a="snd" title="เสียง">${s.settings.sound===false?'🔇':'🔊'}</button></div></header>`;
 $('#bnav').innerHTML=navH('nav-bot');
 const own=pv&&(pv==='default'||s.shop.unlockedThemes.includes(pv));
 const pvb=pv?`<div class="card s12 pvbar">👁 ตัวอย่างธีม: <b>${esc(C.themes[pv].name)}</b><span>${own?'':`<button data-a="buyT" data-i="${pv}">ซื้อ 💰${C.themes[pv].price}</button>`}<button class="g" data-a="endPv">ปิดตัวอย่าง</button></span></div>`:'';
 $('#app').innerHTML=pvb+badge()+(view==='shop'?shopHtml():view==='inv'?invHtml():view==='theme'?themeHtml():view==='profile'?profHtml(b):homeHtml(b,d,L,avg));
}
const num=(msg,cur,max)=>{const n=parseInt(prompt(msg,cur));return n>=0&&n<=max?n:null};
const H={
 preview(i){pv=i;render()},endPv(){pv=null;render()},snd(){s.settings.sound=s.settings.sound===false;commit()},
 ex(i){const e=C.ex.find(x=>x.k===i),d=day();d.ex[i]=Math.min(2000,(d.ex[i]||0)+e.step);commit(`${e.n} +${e.step}`)},
 exUndo(i){const e=C.ex.find(x=>x.k===i),d=day();d.ex[i]=Math.max(0,(d.ex[i]||0)-e.step);commit()},
 go(i){view=i;render()},
 redeem(i){const e=Shop.redeem(s,i);if(e)return toast(e);commit('แลกแล้ว ไปดูในคลังได้เลย')},
 use(i){const e=Shop.useTicket(s,i);if(e)return toast(e);commit('เริ่มใช้งานตั๋วแล้ว')},
 buyT(i){const e=Shop.buyTheme(s,i);if(e)return toast(e);if(pv===i)pv=null;commit('ปลดล็อกแล้ว กด “ใช้ธีมนี้” ได้เลย')},
 theme(i){const e=Shop.setTheme(s,i);if(e)return toast(e);pv=null;commit()},
 clearUsed(){s.inventory=s.inventory.filter(i=>i.status!=='used');commit()},
 addR(){const n=v('r-n').trim().slice(0,40),p=parseInt(v('r-p')),d=v('r-d')===''?0:parseInt(v('r-d'));
  if(!n||!(p>=1&&p<=100000)||!(d>=0&&d<=1440))return toast('ใส่ชื่อ ราคา และนาที (ถ้ามี) ให้ถูกต้อง');
  s.shop.customRewards.push({id:Shop.uid(),name:n,price:p,durationMin:d});commit('เพิ่มของรางวัลแล้ว')},
 editR(i){const r=s.shop.customRewards.find(x=>x.id===i);if(!r)return;const n=prompt('ชื่อ',r.name)?.trim(),p=n&&parseInt(prompt('ราคา (แต้ม)',r.price)),d=n&&parseInt(prompt('ระยะเวลา (นาที) 0 = ไม่จับเวลา',r.durationMin));
  if(!n||!(p>=1&&p<=100000)||!(d>=0&&d<=1440))return toast('ข้อมูลไม่ถูกต้อง');Object.assign(r,{name:n.slice(0,40),price:p,durationMin:d});commit('แก้ไขแล้ว')},
 delR(i){if(confirm('ลบของรางวัลนี้? (ตั๋วที่แลกไปแล้วยังอยู่ในคลัง)')){s.shop.customRewards=s.shop.customRewards.filter(x=>x.id!==i);commit()}},
 saveProfile(){const w=+v('f-w'),h=+v('f-h'),bd=v('f-bd');
  if(!(w>=20&&w<=300&&h>=100&&h<=250&&bd&&K.age(bd)>=5&&K.age(bd)<=120))return toast('กรอกน้ำหนัก/ส่วนสูง/วันเกิดให้ถูกต้อง');
  Object.assign(s.profile,{name:v('f-n').slice(0,30),sex:v('f-s'),birthDate:bd,weightKg:w,heightCm:h,activity:v('f-a'),wakeTarget:v('f-wt')||'07:30'});commit('บันทึกโปรไฟล์แล้ว')},
 wake(){const bed=v('bed'),n=new Date(),h=n.getHours();if(!bed)return toast('ใส่เวลานอนเมื่อคืน');
  if(h<C.wakeWin[0]||h>=C.wakeWin[1])return toast(`เช็กอินได้ ${p2(C.wakeWin[0])}:00-${p2(C.wakeWin[1])}:00`);
  day().wake=K.wakeResult(s.profile.wakeTarget,`${p2(h)}:${p2(n.getMinutes())}`,bed);commit('เช็กอินตื่นแล้ว')},
 read15(){day().read+=15;commit('อ่าน +15 นาที')},
 setRead(){const n=num('นาทีที่อ่านวันนี้',day().read,1440);if(n!==null){day().read=n;commit()}},
 addMeal(){const m=v('m-n').trim().slice(0,60),k=+v('m-k');if(!m||!(k>0&&k<=5000))return toast('ใส่ชื่อเมนูและแคลอรี');
  const g=id=>Math.min(1000,Math.max(0,Math.round(+v(id)||0)));day().meals.push({menu:m,kcal:Math.round(k),protein:g('m-p'),carbs:g('m-c'),fat:g('m-f')});commit('บันทึกมื้ออาหาร')},
 delMeal(i){day().meals.splice(+i,1);commit()},
 vit(){const d=day();d.vit=!d.vit;commit(d.vit?'กินวิตามินแล้ว':'ยกเลิกวิตามิน')},
 export(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(s,null,1)],{type:'application/json'}));a.download=`habit-${today()}.json`;a.click()},
 reset(){if(confirm('ลบข้อมูลทั้งหมดในเครื่องนี้?')){s=S.def();commit('รีเซ็ตแล้ว')}}
};
function photo(f){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),k=Math.min(1,256/Math.max(im.width,im.height));c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);s.profile.photo=c.toDataURL('image/jpeg',.8);commit()};im.src=r.result};r.readAsDataURL(f)}
async function scan(f){toast('🔍 กำลังวิเคราะห์รูป...');
 try{const o=await AI.analyze(f);if(!$('#m-n'))return;const set=(id,x)=>{$('#'+id).value=x};set('m-n',o.menu);set('m-k',o.kcal);set('m-p',o.protein_g);set('m-c',o.carbs_g);set('m-f',o.fat_g);
  $('#m-note').textContent=o.menu?`ค่าประมาณ (ความมั่นใจ${{low:'ต่ำ',medium:'กลาง',high:'สูง'}[o.confidence]}) ${o.note} · แก้ตัวเลขได้ก่อนกดเพิ่มมื้อ`:'';
  toast(o.menu?'วิเคราะห์เสร็จแล้ว ตรวจตัวเลขก่อนบันทึกนะ':'ไม่พบอาหารในรูป')}catch(e){toast(e.message)}}
document.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(a)H[a.dataset.a]?.(a.dataset.i)});
document.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;
 if(e.target.id==='photo')photo(f);
 if(e.target.id==='scan')scan(f);
 if(e.target.id==='imp')f.text().then(t=>{try{const n=S.parseImport(t);if(confirm('แทนที่ข้อมูลในเครื่องด้วยไฟล์นี้?')){s=n;commit('นำเข้าแล้ว')}}catch{toast('ไฟล์ไม่ถูกต้อง')}});
 e.target.value=''});
FX.init(()=>s.settings.sound!==false);commit();
setInterval(()=>{if(Shop.expire(s)){commit('⏰ ตั๋วหมดเวลาแล้ว');return}document.querySelectorAll('[data-exp]').forEach(e=>e.textContent=fmt(+e.dataset.exp-Date.now()))},1000);
