import {CFG as C} from './config.js';
import {GROUPS,RANKS,ACT} from './titles.js';
import * as K from './calc.js';
import * as S from './store.js';
import * as Shop from './shop.js';
let s=S.load();Shop.seed(s);let view='home';
const $=q=>document.querySelector(q),v=id=>$('#'+id).value;
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p2=n=>String(n).padStart(2,'0'),today=()=>K.dayKey();
const day=()=>s.days[today()]||(s.days[today()]={wake:null,push:0,meals:[],vit:false,read:0,awarded:{},closed:false});
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
const badge=()=>{const a=Shop.active(s);return a?`<div class="card wide pop">🎟 กำลังใช้: ${esc(a.name)} · เหลือ <b data-exp="${a.expiresAt}">${fmt(a.expiresAt-Date.now())}</b> นาที</div>`:''};
const shopHtml=()=>`<section class="card wide"><h2>🎁 ของรางวัล · 💰 ${s.points}</h2>${s.shop.customRewards.map(r=>`<div class="row"><b>${esc(r.name)}</b><small>${r.durationMin?r.durationMin+' นาที':'ไม่จับเวลา'}</small><span>💰${r.price}</span><button data-a="redeem" data-i="${esc(r.id)}">แลก</button><button class="g" data-a="editR" data-i="${esc(r.id)}">แก้</button><button class="g" data-a="delR" data-i="${esc(r.id)}">ลบ</button></div>`).join('')||'<small>ยังไม่มีของรางวัล</small>'}
<div class="row"><input id="r-n" placeholder="ชื่อตั๋ว" size="14"><input id="r-p" type="number" placeholder="ราคา" style="width:80px"><input id="r-d" type="number" placeholder="นาที (ว่างได้)" style="width:120px"><button data-a="addR">เพิ่ม</button></div></section>
<section class="card wide"><h2>🎨 Theme</h2>${Object.entries(C.themes).map(([k,t])=>{const own=k==='default'||s.shop.unlockedThemes.includes(k);return `<div class="row"><b>${t.name}</b>${k===s.settings.theme?'<small>ใช้อยู่</small>':own?`<button data-a="theme" data-i="${k}">ใช้</button>`:`<span>💰${t.price}</span><button data-a="buyT" data-i="${k}">ปลดล็อก</button>`}</div>`}).join('')}</section>`;
const invHtml=()=>`<section class="card wide"><h2>🎒 คลังของฉัน</h2>${s.inventory.map(i=>`<div class="row"><b>${esc(i.name)}</b>${i.status==='ready'?`<button data-a="use" data-i="${esc(i.id)}">กดใช้งาน</button>`:i.status==='active'?`<span>⏳ เหลือ <b data-exp="${i.expiresAt}">${fmt(i.expiresAt-Date.now())}</b></span>`:'<small>ใช้แล้ว</small>'}</div>`).join('')||'<small>ยังไม่มีไอเทม ไปแลกที่ร้านค้าได้เลย</small>'}
${s.inventory.some(i=>i.status==='used')?'<div class="row"><button class="g" data-a="clearUsed">ล้างรายการที่ใช้แล้ว</button></div>':''}</section>`;
function render(){document.documentElement.dataset.theme=s.settings.theme||'default';
 const b=body(),d=day(),p=s.profile,L=lvs(),avg=L.reduce((a,c)=>a+c,0)/4;
 const kc=d.meals.reduce((a,m)=>a+m.kcal,0),pct=b?kc/b.tdee*100:0,[cc,ct]=K.calState(pct),bc=b&&K.bmiCat(b.bmi);
 const photo=p.photo.startsWith('data:image/')?`<img class="av" src="${esc(p.photo)}">`:'<div class="av"></div>';
 const opt=(o,sel)=>Object.entries(o).map(([k,t])=>`<option value="${k}" ${k===sel?'selected':''}>${esc(t)}</option>`).join('');
 const home=`
 <section class="card wide"><div class="row">${photo}<div><div class="big">${esc(p.name||'ผู้เล่น')}</div><div>${RANKS[K.rankOf(avg)]} <small>(เฉลี่ย Lv.${avg.toFixed(1)})</small></div><div>💰 ${s.points} Points</div></div></div>
 <div class="grid2">${GROUPS.map((g,i)=>`<div><b>${g.n}</b> Lv.${L[i]} · ${esc(g.t[L[i]-1])}<div class="bar"><i style="width:${K.progress(s.exp[g.k])}%"></i></div><small>${s.exp[g.k]} EXP${L[i]===10?' · MAX':''}</small></div>`).join('')}</div></section>
 <section class="card"><h2>🔥 แคลอรีวันนี้</h2><div class="big">${kc} / ${b?b.tdee:'—'} kcal</div><div class="bar"><i style="width:${Math.min(pct,100)}%;background:${cc}"></i></div><small>${b?`${pct.toFixed(0)}% · ${ct}`:'กรอกโปรไฟล์เพื่อดูเป้าหมาย'}</small>
 ${d.meals.map((m,i)=>`<div class="row">🍽 ${esc(m.menu)} · ${m.kcal} kcal <button class="g" data-a="delMeal" data-i="${i}">ลบ</button></div>`).join('')}
 <div class="row"><input id="m-n" placeholder="เมนู" size="12"><input id="m-k" type="number" placeholder="kcal" style="width:80px"><button data-a="addMeal">เพิ่มมื้อ</button></div>
 <small>มื้อที่บันทึก ${d.meals.length}/${C.meal.max}</small>
 <div class="row"><button class="${d.vit?'':'g'}" data-a="vit">${d.vit?'✅':'⬜'} กินวิตามินแล้ว</button></div></section>
 <section class="card"><h2>⏰ ตื่นนอน</h2>${d.wake?`<div class="big pop">${'⭐'.repeat(d.wake.stars)}</div><div>ตื่น ${d.wake.time} · นอน ${d.wake.hours.toFixed(1)} ชม.</div>`:
 `<small>เป้าหมาย ${esc(p.wakeTarget)} · เช็กอินได้ ${p2(C.wakeWin[0])}:00-${p2(C.wakeWin[1])}:00</small><div class="row"><label>นอนเมื่อคืน <input id="bed" type="time" value="23:30"></label><button data-a="wake">เช็กอินตื่น</button></div>`}</section>
 <section class="card"><h2>💪 วิดพื้น</h2><div class="big">${d.push} ครั้ง</div><div class="row"><button data-a="push10">+10</button><button class="g" data-a="setPush">แก้ยอด</button></div></section>
 <section class="card"><h2>📚 อ่าน/เรียนรู้</h2><div class="big">${d.read} นาที</div><div class="row"><button data-a="read15">+15 นาที</button><button class="g" data-a="setRead">แก้ยอด</button></div></section>
 <section class="card wide"><h2>👤 โปรไฟล์</h2>${b?`<p>BMI <b style="color:${bc.c}">${b.bmi} · ${bc.t}</b> · BMR ${b.bmr} · TDEE ${b.tdee} kcal</p>`:''}
 <div class="grid2"><label>ชื่อ<input id="f-n" value="${esc(p.name)}"></label><label>เพศ<select id="f-s">${opt({male:'ชาย',female:'หญิง'},p.sex)}</select></label>
 <label>วันเกิด<input id="f-bd" type="date" value="${esc(p.birthDate)}"></label><label>เวลาเป้าหมายตื่น<input id="f-wt" type="time" value="${esc(p.wakeTarget)}"></label>
 <label>น้ำหนัก (kg)<input id="f-w" type="number" step="0.1" value="${p.weightKg||''}"></label><label>ส่วนสูง (cm)<input id="f-h" type="number" value="${p.heightCm||''}"></label>
 <label style="grid-column:1/-1">ระดับกิจกรรม<select id="f-a">${opt(ACT,p.activity)}</select></label></div>
 <div class="row"><button data-a="saveProfile">บันทึกโปรไฟล์</button><label class="g" style="padding:8px 10px;border-radius:10px;cursor:pointer">รูปโปรไฟล์<input id="photo" type="file" accept="image/*" hidden></label></div></section>
 <section class="card wide"><h2>💾 ข้อมูล</h2><div class="row"><button data-a="export">Export JSON</button><label class="g" style="padding:8px 10px;border-radius:10px;cursor:pointer">Import JSON<input id="imp" type="file" accept=".json" hidden></label><button class="g" data-a="reset">Reset ทั้งหมด</button></div><small>ข้อมูลอยู่ในเบราว์เซอร์เครื่องนี้ ควร Export สำรองไว้เป็นระยะ</small></section>`;
 const nav=`<nav class="card wide row">${[['home','🏠 หลัก'],['shop','🛒 ร้านค้า'],['inv','🎒 คลัง']].map(([k,t])=>`<button class="${view===k?'':'g'}" data-a="go" data-i="${k}">${t}</button>`).join('')}<small>💰 ${s.points}</small></nav>`;
 $('#app').innerHTML=nav+badge()+(view==='shop'?shopHtml():view==='inv'?invHtml():home);
}
const num=(msg,cur,max)=>{const n=parseInt(prompt(msg,cur));return n>=0&&n<=max?n:null};
const H={
 go(i){view=i;render()},
 redeem(i){const e=Shop.redeem(s,i);if(e)return toast(e);commit('แลกแล้ว ไปดูในคลังได้เลย')},
 use(i){const e=Shop.useTicket(s,i);if(e)return toast(e);commit('เริ่มใช้งานตั๋วแล้ว')},
 buyT(i){const e=Shop.buyTheme(s,i);if(e)return toast(e);commit('ปลดล็อก Theme แล้ว')},
 theme(i){const e=Shop.setTheme(s,i);if(e)return toast(e);commit()},
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
 push10(){day().push+=10;commit('วิดพื้น +10')},
 setPush(){const n=num('ยอดวิดพื้นวันนี้',day().push,2000);if(n!==null){day().push=n;commit()}},
 read15(){day().read+=15;commit('อ่าน +15 นาที')},
 setRead(){const n=num('นาทีที่อ่านวันนี้',day().read,1440);if(n!==null){day().read=n;commit()}},
 addMeal(){const m=v('m-n').trim().slice(0,60),k=+v('m-k');if(!m||!(k>0&&k<=5000))return toast('ใส่ชื่อเมนูและแคลอรี');
  day().meals.push({menu:m,kcal:Math.round(k),protein:0,carbs:0,fat:0});commit('บันทึกมื้ออาหาร')},
 delMeal(i){day().meals.splice(+i,1);commit()},
 vit(){const d=day();d.vit=!d.vit;commit(d.vit?'กินวิตามินแล้ว':'ยกเลิกวิตามิน')},
 export(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(s,null,1)],{type:'application/json'}));a.download=`habit-${today()}.json`;a.click()},
 reset(){if(confirm('ลบข้อมูลทั้งหมดในเครื่องนี้?')){s=S.def();commit('รีเซ็ตแล้ว')}}
};
function photo(f){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),k=Math.min(1,256/Math.max(im.width,im.height));c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);s.profile.photo=c.toDataURL('image/jpeg',.8);commit()};im.src=r.result};r.readAsDataURL(f)}
document.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(a)H[a.dataset.a]?.(a.dataset.i)});
document.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;
 if(e.target.id==='photo')photo(f);
 if(e.target.id==='imp')f.text().then(t=>{try{const n=S.parseImport(t);if(confirm('แทนที่ข้อมูลในเครื่องด้วยไฟล์นี้?')){s=n;commit('นำเข้าแล้ว')}}catch{toast('ไฟล์ไม่ถูกต้อง')}});
 e.target.value=''});
commit();
setInterval(()=>{if(Shop.expire(s)){commit('⏰ ตั๋วหมดเวลาแล้ว');return}document.querySelectorAll('[data-exp]').forEach(e=>e.textContent=fmt(+e.dataset.exp-Date.now()))},1000);
