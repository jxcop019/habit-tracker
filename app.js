import {CFG as C} from './config.js';
import {GROUPS,RANKS,ACT} from './titles.js';
import * as K from './calc.js';
import * as S from './store.js';
import * as Shop from './shop.js';
import * as AI from './ai.js';
import * as FX from './fx.js';
import {I} from './icons.js';
let s=S.load();Shop.seed(s);let view='home';
const $=q=>document.querySelector(q),v=id=>$('#'+id).value;
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p2=n=>String(n).padStart(2,'0'),today=()=>K.dayKey();
const day=()=>s.days[today()]||(s.days[today()]={wake:null,ex:{},meals:[],vit:false,read:0,awarded:{},closed:false});
const body=()=>{const p=s.profile;if(!p.weightKg||!p.heightCm||!p.birthDate)return null;const b=K.bmr(p.sex,p.weightKg,p.heightCm,K.age(p.birthDate));return{bmi:K.bmi(p.weightKg,p.heightCm),bmr:b,tdee:K.tdee(b,p.activity)}};
const lvs=()=>GROUPS.map(g=>K.levelOf(s.exp[g.k]));
let tt;const toast=m=>{const t=$('#toast');t.textContent=m;t.className='show';clearTimeout(tt);tt=setTimeout(()=>t.className='',2200)};
// ===== ซิงค์ข้อมูลข้ามอุปกรณ์ (Cloudflare Worker + KV) — ส่งแค่ค่า hash ของรหัส ไม่ส่งรหัสจริง =====
const lsg=k=>{try{return localStorage.getItem(k)||''}catch{return''}},lss=(k,x)=>{try{x?localStorage.setItem(k,x):localStorage.removeItem(k)}catch{}};
let sy={key:lsg('lq_sync_key'),msg:'',show:false,busy:false,t:0,st:''},calOff=0,pt;
sy.st=sy.key?'busy':'off';
// สถานะซิงค์ที่แสดงบน header: off=ไม่ได้เชื่อม ok=ซิงค์แล้ว wait=รอซิงค์ busy=กำลังซิงค์ err=ซิงค์ไม่สำเร็จ
const SYS={off:'ไม่ได้ซิงค์',ok:'ซิงค์แล้ว',wait:'รอซิงค์',busy:'กำลังซิงค์',err:'ซิงค์ไม่สำเร็จ'};
const sybH=()=>{if(!C.syncUrl)return'';const k=sy.key?sy.st:'off';return `<button class="g syb s-${k}" data-a="syncBtn" title="${SYS[k]}">${I('cloud')}<i class="sd"></i><span>${SYS[k]}</span></button>`};
const setSync=k=>{sy.st=k;const e=$('.syb');if(e){const q=sy.key?k:'off';e.className='g syb s-'+q;e.title=SYS[q];const sp=e.querySelector('span');if(sp)sp.textContent=SYS[q]}};
const snap=()=>JSON.stringify({...s,updatedAt:0});let lastJ=snap();
const fk=k=>k.match(/.{1,5}/g).join('-'),tm=()=>new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
const setSy=m=>{sy.msg=m;const e=$('#sy-st');if(e)e.textContent=m};
const sid=async k=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('lifequest:'+k)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const newKey=()=>[...crypto.getRandomValues(new Uint8Array(15))].map(x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');
const api=async(m,body)=>{const id=await sid(sy.key),ac=new AbortController(),to=setTimeout(()=>ac.abort(),15000);
 try{const r=await fetch(`${C.syncUrl}/sync/${id}`,{method:m,headers:body?{'Content-Type':'application/json'}:{},body,signal:ac.signal});return{status:r.status,j:await r.json().catch(()=>({}))}}finally{clearTimeout(to)}};
const pushSoon=()=>{if(!sy.key||!C.syncUrl)return;setSync('wait');clearTimeout(pt);pt=setTimeout(push,1500)};
async function push(){if(!sy.key||!s.updatedAt)return;setSync('busy');
 try{const r=await api('PUT',JSON.stringify(s));if(r.status===409)return pull();setSync(r.status===200?'ok':'err');setSy(r.status===200?'☁️ ซิงค์ล่าสุด '+tm():'❌ '+(r.j.error||'ซิงค์ไม่สำเร็จ'))}
 catch{setSync('err');setSy('❌ ออฟไลน์ จะซิงค์ใหม่เมื่อกลับมาออนไลน์')}}
async function pull(){if(!sy.key||!C.syncUrl||sy.busy)return;sy.busy=true;sy.t=Date.now();setSync('busy');
 try{const r=await api('GET');
  if(r.status===404){if(s.updatedAt)await push();else setSync('ok');return}
  if(r.status!==200||!r.j.data)throw 0;
  const n=S.parseImport(JSON.stringify(r.j.data));
  if(n.updatedAt>s.updatedAt){s=n;Shop.seed(s);setSync('ok');commit('☁️ อัปเดตข้อมูลจากอุปกรณ์อื่นแล้ว',true)}
  else if(s.updatedAt>n.updatedAt)await push();
  else{setSync('ok');setSy('✅ ข้อมูลเป็นปัจจุบัน · '+tm())}}
 catch{setSync('err');setSy('❌ ซิงค์ไม่สำเร็จ (ออฟไลน์?) จะลองใหม่เมื่อเปิดแอป')}finally{sy.busy=false}}
function commit(msg,auto){
 const b=body(),L=lvs(),p0=s.points;
 for(const[k,d]of Object.entries(s.days))if(k<today()&&!d.closed){d.closed=true;d.tdee=b?b.tdee:0}
 K.applyRewards(s);Shop.expire(s);
 const j=snap();if(!auto&&j!==lastJ){s.updatedAt=Date.now();pushSoon()}lastJ=j;
 const up=lvs().some((x,i)=>x>L[i]);
 if(!S.save(s))toast('บันทึกลงเครื่องไม่สำเร็จ');
 else if(up)toast('🎉 เลเวลอัป!');
 else if(msg)toast(msg+(s.points!==p0?` (${s.points>p0?'+':''}${s.points-p0})`:''));
 render();
}
const fmt=ms=>{const t=Math.max(0,Math.ceil(ms/1000));return `${p2(Math.floor(t/60))}:${p2(t%60)}`};
let pv=null,editM=null,scanSt={m:'',c:''},pendingFill=null,scanning=false;
const ICON=n=>I(/ซีรีส์|เกม/.test(n)?'game':/ขนม|เครื่องดื่ม|กาแฟ|ชา/.test(n)?'sweet':/ของขวัญ/.test(n)?'gift':'ticket');
const rar=p=>p<200?['common','สามัญ']:p<500?['rare','หายาก']:p<1000?['epic','เอปิก']:['legend','ตำนาน'];
const avatar=()=>s.profile.photo.startsWith('data:image/')?`<img class="av" src="${esc(s.profile.photo)}" alt="">`:`<div class="av">${I('user')}</div>`;
const badge=()=>{const a=Shop.active(s);return a?`<div class="card s12 pop">${I('ticket')} กำลังใช้: <b>${esc(a.name)}</b> · เหลือ <b data-exp="${a.expiresAt}">${fmt(a.expiresAt-Date.now())}</b> นาที</div>`:''};
const shopHtml=()=>shopItems()+shopTh();const shopItems=()=>`<section class="s12"><h2>${I('shop')} ร้านค้า <small>${I('coin')} ${s.points} แต้ม</small></h2></section><div class="s12 shelf">${s.shop.customRewards.map(r=>{const[k,n]=rar(r.price);return `<article class="ic r-${k} fx tilt"><span class="tag">ITEM · ${n}</span><div class="ic-ed"><button class="g" data-a="editR" data-i="${esc(r.id)}" title="แก้ไข">✎</button><button class="g" data-a="delR" data-i="${esc(r.id)}" title="ลบ">✕</button></div><div class="ic-ico">${ICON(r.name)}</div><h3>${esc(r.name)}</h3><div class="chips"><span>${r.durationMin?'⏱ '+r.durationMin+' นาที':'✨ ใช้ทันที'}</span></div><div class="ic-foot"><b class="price">${I('coin')} ${r.price}</b><button class="fx" data-a="redeem" data-i="${esc(r.id)}">แลก</button></div></article>`}).join('')}
<article class="ic add"><h3>＋ สร้างไอเทมใหม่</h3><input id="r-n" placeholder="ชื่อไอเทม"><input id="r-p" type="number" placeholder="ราคา (แต้ม)"><input id="r-d" type="number" placeholder="นาที (ว่าง = ใช้ทันที)"><button data-a="addR">เพิ่มไอเทม</button></article></div>`;
const invHtml=()=>`<section class="s12"><h2>${I('inv')} คลังของฉัน</h2></section><div class="s12 shelf">${s.inventory.map(i=>{const[k,n]=rar(i.price||0);return `<article class="ic r-${k} ${i.status} fx tilt"><span class="tag">${i.status==='active'?'ACTIVE':i.status==='used'?'USED':'ITEM · '+n}</span><div class="ic-ico">${ICON(i.name)}</div><h3>${esc(i.name)}</h3><div class="ic-foot">${i.status==='ready'?`<button class="fx" data-a="use" data-i="${esc(i.id)}">กดใช้งาน</button>${i.durationMin?`<small>⏱ ${i.durationMin} นาที</small>`:''}`:i.status==='active'?`<b class="timer">⏳ <span data-exp="${i.expiresAt}">${fmt(i.expiresAt-Date.now())}</span></b>`:'<small>ใช้แล้ว</small>'}</div></article>`}).join('')||'<small>ยังไม่มีไอเทม ไปแลกที่ร้านค้าได้เลย</small>'}</div>
${s.inventory.some(i=>i.status==='used')?'<div class="s12 row"><button class="g" data-a="clearUsed">ล้างรายการที่ใช้แล้ว</button></div>':''}`;
const pvBox=t=>`<div class="pv"><div class="pv-top"><img class="pv-ico" src="${t.icon}" alt=""><div class="pv-bar"><i></i></div></div><div class="pv-row"><span></span><span></span></div><button tabindex="-1">ปุ่มตัวอย่าง</button></div>`;
const shopTh=()=>{const l=Object.entries(C.themes).filter(([k])=>k!=='default'&&!s.shop.unlockedThemes.includes(k));return `<section class="s12"><h2>${I('theme')} ธีม <small>กด “ดูตัวอย่าง” เพื่อลองทั้งแอปก่อนซื้อ</small></h2></section><div class="s12 shelf">${l.map(([k,t])=>`<article class="ic th r-rare fx" data-theme="${k}">${pvBox(t)}<h3>${esc(t.name)}</h3><div class="ic-foot"><b class="price">${I('coin')} ${t.price}</b><button data-a="buyT" data-i="${k}">ซื้อ</button><button class="g" data-a="preview" data-i="${k}">👁 ดูตัวอย่าง</button></div></article>`).join('')||'<small>ปลดล็อกครบทุกธีมแล้ว 🎉</small>'}</div>`};
const themeHtml=()=>{const l=Object.entries(C.themes).filter(([k])=>k==='default'||s.shop.unlockedThemes.includes(k));return `<div class="s12 hero"><img src="${C.themes[pv||s.settings.theme].logo}" alt="LifeQuest"></div><section class="s12"><h2>${I('theme')} ธีมของฉัน <small>อยากได้ธีมใหม่ ไปดูตัวอย่างและซื้อที่ร้านค้า</small></h2></section><div class="s12 shelf">${l.map(([k,t])=>`<article class="ic th r-${k==='default'?'legend':'rare'} fx" data-theme="${k}">${pvBox(t)}<h3>${esc(t.name)}</h3><div class="ic-foot">${k===s.settings.theme?'<small>✅ ใช้อยู่</small>':`<button data-a="theme" data-i="${k}">ใช้ธีมนี้</button>`}</div></article>`).join('')}</div>${l.length<Object.keys(C.themes).length?`<div class="s12 row"><button class="g" data-a="go" data-i="shop">${I('shop')} ไปดูธีมอื่นในร้านค้า</button></div>`:''}`};
const calHtml=()=>{const tk=today(),[ty,tm0]=tk.split('-').map(Number),dt=new Date(ty,tm0-1+calOff,1),cells=K.calMonth(dt.getFullYear(),dt.getMonth(),s.days,tk),ks=K.streakKeys(s.days,tk),sk=new Set(ks);
 return `<div class="card cal fx tilt"><div class="cal-t"><b>${I('fire')} ${ks.length} วันต่อเนื่อง</b></div><div class="cal-h"><button class="g" data-a="calP" title="เดือนก่อน">‹</button><small>${dt.toLocaleDateString('th-TH',{month:'long',year:'numeric'})}</small><button class="g" data-a="calN" title="เดือนถัดไป" ${calOff>=0?'disabled':''}>›</button></div><div class="cal-g">${['อา','จ','อ','พ','พฤ','ศ','ส'].map(x=>`<small>${x}</small>`).join('')}${cells.map(c=>c?`<span class="${c.on?sk.has(c.k)?'cs':'co':''}${c.today?' td':''}${c.future?' fu':''}">${c.d}</span>`:'<span></span>').join('')}</div></div>`};
const syncHtml=()=>!C.syncUrl?'':`<section class="card s12"><h2>${I('cloud')} ซิงค์ข้อมูลข้ามอุปกรณ์</h2>${sy.key?`<div class="row"><small>รหัสซิงค์</small><code class="skey">${sy.show?fk(sy.key):'•••••-•••••-•••••'}</code><button class="g" data-a="syncShow">${sy.show?'ซ่อน':'แสดง'}</button><button class="g" data-a="syncCopy">คัดลอก</button></div><div class="row"><button data-a="syncNow">ซิงค์ตอนนี้</button><button class="g" data-a="syncOff">ยกเลิกการเชื่อมต่อเครื่องนี้</button></div><small>ใส่รหัสนี้ในอุปกรณ์อื่นเพื่อใช้ข้อมูลชุดเดียวกัน · อย่าแชร์รหัสให้คนอื่น</small>`:`<small>เครื่องแรก: กดสร้างรหัส · เครื่องอื่น: ใส่รหัสที่ได้จากเครื่องแรก</small><div class="row"><button data-a="syncCreate">สร้างรหัสซิงค์ (เครื่องหลัก)</button></div><div class="row"><input id="sy-k" placeholder="ใส่รหัสจากเครื่องอื่น เช่น ABCDE-FGHJK-LMNPQ" autocomplete="off" style="flex:1;min-width:200px"><button data-a="syncJoin">เชื่อมต่อ</button></div>`}<small id="sy-st">${esc(sy.msg)}</small></section>`;
// ===== หน้าประวัติ: อาหาร / ออกกำลังกาย / การซื้อ =====
let hTab='food',hMore=14;
const dlabel=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric'})};
const dtlabel=at=>at?new Date(at).toLocaleString('th-TH',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'ก่อนเริ่มบันทึกประวัติ';
const hsum=a=>`<div class="hsum">${a.map(([n,x])=>`<div><small>${n}</small><b>${x}</b></div>`).join('')}</div>`;
const more=(n,t)=>n>t?`<div class="s12 row" style="justify-content:center"><button class="g" data-a="hMore">ดูเพิ่ม (เหลืออีก ${n-t} รายการ)</button></div>`:'';
const empty=t=>`<div class="card s12"><small>${t}</small></div>`;
function histFood(b){const ks=Object.keys(s.days).filter(k=>(s.days[k].meals||[]).length).sort().reverse();
 if(!ks.length)return empty('ยังไม่มีประวัติอาหาร ไปบันทึกมื้อแรกที่หน้าหลักได้เลย');
 const sm=(d,k)=>d.meals.reduce((a,m)=>a+(m[k]||0),0),tot=ks.reduce((a,k)=>a+sm(s.days[k],'kcal'),0),nm=ks.reduce((a,k)=>a+s.days[k].meals.length,0);
 return `<div class="s12 card">${hsum([['วันที่บันทึก',ks.length+' วัน'],['เฉลี่ยต่อวัน',Math.round(tot/ks.length)+' kcal'],['รวมทั้งหมด',nm+' มื้อ']])}</div>
<div class="s12 hl">${ks.slice(0,hMore).map(k=>{const d=s.days[k],kc=sm(d,'kcal'),T=d.tdee||(k===today()&&b?b.tdee:0),pct=T?kc/T*100:0,[cc,ct]=K.calState(pct);
  return `<article class="card hd"><div class="hd-h"><b>${dlabel(k)}</b>${k===today()?'<span class="pill p-exp">วันนี้</span>':''}</div>
<div class="hd-k"><b class="big">${kc}</b><small>kcal${T?` · เป้า ${T} (${pct.toFixed(0)}%) · <span style="color:${cc};font-weight:600">${ct}</span>`:''}</small></div>${T?`<div class="bar"><i style="width:${Math.min(100,pct)}%;background:${cc}"></i></div>`:''}
<div class="chips"><span>โปรตีน ${sm(d,'protein')} g</span><span>คาร์บ ${sm(d,'carbs')} g</span><span>ไขมัน ${sm(d,'fat')} g</span>${d.vit?`<span>${I('pill')} วิตามิน</span>`:''}</div>
${d.meals.map(m=>`<div class="hm"><span>${esc(m.menu)}</span><small>${m.kcal} kcal${m.protein||m.carbs||m.fat?` · P${m.protein} C${m.carbs} F${m.fat}`:''}</small></div>`).join('')}</article>`}).join('')}</div>${more(ks.length,hMore)}`}
function histEx(){const ks=Object.keys(s.days).filter(k=>C.ex.some(e=>(s.days[k].ex?.[e.k]||0)>0)).sort().reverse();
 if(!ks.length)return empty('ยังไม่มีประวัติการออกกำลังกาย ไปกดบันทึกท่าแรกที่หน้าหลักได้เลย');
 const sets=ks.reduce((a,k)=>a+K.taps(s.days[k].ex),0),xp=ks.reduce((a,k)=>a+K.dayRewards(s.days[k]).fitness,0);
 return `<div class="s12 card">${hsum([['วันที่ออกกำลัง',ks.length+' วัน'],['เซ็ตรวม',sets+' เซ็ต'],['EXP รวม','+'+xp]])}</div>
<div class="s12 hl">${ks.slice(0,hMore).map(k=>{const d=s.days[k],t=K.taps(d.ex);
  return `<article class="card hd"><div class="hd-h"><b>${dlabel(k)}</b>${k===today()?'<span class="pill p-exp">วันนี้</span>':''}</div>
<div class="hd-k"><b class="big">${t} <small>เซ็ต</small></b><small>+${K.dayRewards(d).fitness} EXP${t>=10?' · โบนัสครบ 10 เซ็ต':t>=5?' · โบนัสครบ 5 เซ็ต':''}</small></div>
${C.ex.filter(e=>(d.ex[e.k]||0)>0).map(e=>`<div class="hm"><span>${I(e.icon)} ${e.n}</span><b>${d.ex[e.k]} <small>${e.unit}</small></b></div>`).join('')}</article>`}).join('')}</div>${more(ks.length,hMore)}`}
function histBuy(){const a=[...(s.purchases||[])].sort((x,y)=>y.at-x.at);
 if(!a.length)return empty('ยังไม่มีประวัติการซื้อ ไปแลกของที่ร้านค้าได้เลย');
 const sp=a.reduce((n,p)=>n+p.price,0),th=a.filter(p=>p.type==='theme').length;
 return `<div class="s12 card">${hsum([['รายการทั้งหมด',a.length+' รายการ'],['แต้มที่ใช้ไป',sp+' P'],['ธีม / ไอเทม',th+' / '+(a.length-th)]])}</div>
<div class="s12 card hbuy">${a.slice(0,hMore).map(p=>`<div class="hb-r"><div class="qc-i sm">${p.type==='theme'?I('theme'):ICON(p.name)}</div><div class="hb-n"><b>${esc(p.name)}</b><small>${p.type==='theme'?'ธีม':'ไอเทม'} · ${dtlabel(p.at)}</small></div><span class="pill p-pt">−${p.price} P</span></div>`).join('')}</div>${more(a.length,hMore)}`}
const histHtml=b=>{const T=[['food','meal','อาหาร'],['ex','dumbbell','ออกกำลังกาย'],['buy','shop','การซื้อ']];
 return `<section class="s12"><h2>${I('hist')} ประวัติ</h2></section><div class="s12 seg">${T.map(([k,i,t])=>`<button class="${hTab===k?'':'g'}" data-a="hTab" data-i="${k}">${I(i)} ${t}</button>`).join('')}</div>${hTab==='ex'?histEx():hTab==='buy'?histBuy():histFood(b)}`};
const mac=(n,e,t)=>`<div><small>${n} ${e}/${t} g</small><div class="bar"><i style="width:${Math.min(100,t?e/t*100:0)}%"></i></div></div>`;
const SK=['dumbbell','alarm','meal','book'];
const greet=()=>{const h=new Date().getHours();return h<12?'สวัสดีตอนเช้า':h<17?'สวัสดีตอนบ่าย':h<21?'สวัสดีตอนเย็น':'ราตรีสวัสดิ์'};
const qc=(ico,t,desc,e,prog,body,done)=>`<div class="qc fx tilt${done?' done':''}"><div class="qc-h"><div class="qc-i">${I(ico)}</div><div><b>${t}</b><br><small>${desc}</small></div>${done?`<span class="tick">${I('check')}</span>`:''}</div><div class="row"><span class="pill p-exp">+${e} EXP</span><span class="pill p-pt">+${e} P</span></div><div class="bar"><i style="width:${prog}%"></i></div>${body}</div>`;
const mcard=(n,e,t,col)=>`<div class="mc fx tilt"><small><i class="dt" style="background:${col}"></i>${n}</small><b>${e} <small>/ ${t} g</small></b><div class="bar"><i style="width:${Math.min(100,t?e/t*100:0)}%"></i></div></div>`;
function homeHtml(b,d,L,avg){
 const p=s.profile,r=K.dayRewards(d),T=b?b.tdee:0,kc=d.meals.reduce((a,m)=>a+m.kcal,0),pct=b?kc/T*100:0,[cc,ct]=K.calState(pct),hi=T-kc,lo=Math.ceil(T*.7)-kc,rem=C.meal.max-d.meals.length;
 const sm=k=>d.meals.reduce((a,m)=>a+(m[k]||0),0),tp=Math.round(1.6*(p.weightKg||0)),tf=Math.round(.25*T/9),tc=Math.max(0,Math.round((T-4*tp-9*tf)/4));
 const tip=!b?'กรอกโปรไฟล์ที่เมนูโปรไฟล์เพื่อดูเป้าหมายแคลอรี':pct<70?`ควรกินอีกอย่างน้อย <b>${lo}</b> kcal ให้ถึงช่วงเป้า (70%) และกินได้อีกสูงสุด <b>${hi}</b> kcal จนเต็มเป้า`:pct<=100?`อยู่ในช่วงเป้าแล้ว 👍 กินได้อีกไม่เกิน <b>${hi}</b> kcal`:`เกินเป้า <b>${-hi}</b> kcal ลดมื้อถัดไป หรือขยับร่างกายเพิ่ม`;
 const per=b&&hi>0&&rem>0?`เหลืออีก ${rem} มื้อ ≈ ${Math.round(hi/rem)} kcal/มื้อ`:'',t5=K.taps(d.ex),nx=t5<5?5:t5<10?10:0,bc=b&&K.bmiCat(b.bmi);
 const rw=[...s.shop.customRewards].sort((x,y)=>x.price-y.price)[0];
 const wk=d.wake?`<div class="big">${'⭐'.repeat(d.wake.stars)}</div><small>ตื่น ${d.wake.time} · นอน ${d.wake.hours.toFixed(1)} ชม.${d.wake.stars<5?` · ${d.wake.hours<C.wake.need?'นอนไม่ถึง '+C.wake.need+' ชม. ':''}${K.toMin(d.wake.time)>K.toMin(p.wakeTarget)+C.wake.t1?'ตื่นช้ากว่าเป้า':''}`:' · เต็ม 5 ดาว 🎉'}</small>`:`<div class="row"><label><small>นอนเมื่อคืน</small> <input id="bed" type="time" value="23:30" style="width:118px"></label><button data-a="wake">เช็กอินตื่น</button></div><small>เช็กอินได้ ${p2(C.wakeWin[0])}:00–${p2(C.wakeWin[1])}:00</small>`;
 return `<div class="s12 home"><div class="top"><div class="hello"><h1>${greet()}, ${esc(p.name||'ผู้เล่น')} ✦</h1><p>${new Date().toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · วันนี้ก็เก็บเลเวลกันต่อ</p></div>
<div class="stats"><div class="stat fx tilt"><span class="si">${I('coin')}</span><div><b>${s.points}</b><small>แต้มของคุณ</small></div></div>${calHtml()}</div></div>
<div class="dash"><div class="dcol">
<section class="card"><h2>${I('quest')} ภารกิจประจำวัน</h2><small>ทำกิจวัตรให้ครบเพื่อรับ EXP และ Points</small><div class="qg">
${qc('alarm','ตื่นนอน',`นอน ≥${C.wake.need} ชม. + ตื่นไม่เกินเป้า +${C.wake.t1} นาที = ⭐5`,r.earlyBird,d.wake?d.wake.stars*20:0,wk+`<div class="row"><small>เป้าตื่น</small><input id="wt" type="time" value="${esc(p.wakeTarget)}" style="width:118px"><button class="g" data-a="saveWT">ตั้ง</button></div>`,!!d.wake)}
${qc('dumbbell','ออกกำลังกาย','ทำครบ 5 เซ็ตขึ้นไปต่อวัน',r.fitness,Math.min(100,t5*10),`<small>${t5} เซ็ตวันนี้</small><button data-a="goto" data-i="sec-ex">ไปทำ</button>`,t5>=5)}
${qc('meal','กินให้ถึงเป้าแคลอรี','อยู่ช่วง 70–100% ของเป้า',r.nutrition,Math.min(100,pct),`<small>${kc} / ${b?T:'—'} kcal · ${d.meals.length}/${C.meal.max} มื้อ</small><button data-a="goto" data-i="sec-nut">บันทึกอาหาร</button>`,d.meals.length>=C.meal.max)}
${qc('book','อ่าน / เรียนรู้','อ่านหรือเรียนรู้ครบ 30 นาที',r.wisdom,Math.min(100,d.read/30*100),`<small>${d.read} / 30 นาที</small><div class="row"><button data-a="read15">+15 นาที</button><button class="g" data-a="setRead">แก้ยอด</button></div>`,d.read>=30)}
</div></section>
<section class="card" id="sec-nut"><h2>${I('meal')} โภชนาการ & แคลอรี <span class="xp">+${r.nutrition} EXP</span></h2><div class="nut">
<div class="col ringc"><div class="ring"><svg width="150" height="150" viewBox="0 0 150 150"><circle cx="75" cy="75" r="62" fill="none" stroke="var(--b)" stroke-width="12"/><circle class="rg" cx="75" cy="75" r="62" fill="none" stroke="${cc}" stroke-width="12" stroke-linecap="round" stroke-dasharray="389.6" stroke-dashoffset="${(389.6*(1-Math.min(pct,100)/100)).toFixed(1)}"/></svg><div class="rc"><b class="big">${kc}</b><small>kcal · จาก ${b?T:'—'}</small></div></div><small>${b?`${pct.toFixed(0)}% · ${ct}`:''}</small></div>
<div class="col"><p class="tip">${tip}${per?`<br><small>${per}</small>`:''}</p>${b?`<div class="mcs">${mcard('โปรตีน',sm('protein'),tp,'#c084fc')}${mcard('คาร์บ',sm('carbs'),tc,'#f0a24a')}${mcard('ไขมัน',sm('fat'),tf,'#60a5fa')}</div><small>เป้าสารอาหารเป็นค่าแนะนำคร่าวๆ · สรุปวันแล้วอยู่ 70–100% ได้ +${C.calBonus} EXP</small>`:''}
${d.meals.map((m,i)=>`<div class="row meal">${I('meal')} ${esc(m.menu)} · ${m.kcal} kcal${m.protein||m.carbs||m.fat?` · P${m.protein} C${m.carbs} F${m.fat}`:''} <button class="g" data-a="editMeal" data-i="${i}">แก้</button><button class="g" data-a="delMeal" data-i="${i}">ลบ</button></div>`).join('')}
<div class="row"><button class="${d.vit?'g':''}" data-a="vit">${d.vit?I('check')+' กินวิตามินแล้ว':I('pill')+' เช็กอินวิตามิน'} (+${C.vit})</button></div></div>
<div class="col qa"><b>เพิ่มอาหาร</b>
<div class="row"><label class="g" style="padding:9px 14px;border-radius:12px;cursor:pointer;border:1px solid var(--b)">${I('cam')} สแกนรูปอาหาร<input id="scan" type="file" accept="image/*" hidden></label></div><div id="scan-st" class="st ${scanSt.c}">${scanSt.m}</div>
<input id="m-n" placeholder="ชื่ออาหาร"><input id="m-k" type="number" placeholder="แคลอรี (kcal)">
<div class="row3"><input id="m-p" type="number" placeholder="โปรตีน g"><input id="m-c" type="number" placeholder="คาร์บ g"><input id="m-f" type="number" placeholder="ไขมัน g"></div>
<div class="row"><button data-a="addMeal">${editM!==null?'บันทึกการแก้ไข':'เพิ่มมื้อ'}</button>${editM!==null?'<button class="g" data-a="cancelEdit">ยกเลิก</button>':''}</div>${editM!==null?`<small>✏️ กำลังแก้ไขมื้อที่ ${editM+1}</small>`:''}<small id="m-note"></small><small>มื้อที่บันทึก ${d.meals.length}/${C.meal.max}</small></div></div></section>
<section class="card" id="sec-ex"><h2>${I('dumbbell')} ออกกำลังกาย <span class="xp">+${r.fitness} / ${C.fitCap+C.fitB1+C.fitB2} EXP</span></h2><small>กดปุ่มของแต่ละท่าเมื่อทำครบเซ็ต · รวม ${t5} เซ็ต${nx?` · ครบ ${nx} เซ็ต โบนัส +${nx===5?C.fitB1:C.fitB2}`:' · รับโบนัสครบแล้ว 🎉'}</small>
<div class="exg">${C.ex.map(e=>`<div class="qt fx tilt"><div class="qt-i">${I(e.icon)}</div><b>${e.n}</b><div class="big">${d.ex[e.k]||0} <small>${e.unit}</small></div><div class="row"><button class="fx" data-a="ex" data-i="${e.k}">+${e.step}</button><button class="g" data-a="exUndo" data-i="${e.k}" title="ย้อน">↩</button></div></div>`).join('')}</div></section>
</div><aside class="dcol">
<section class="card"><h2>${I('user')} โปรไฟล์ผู้เล่น <button class="g hb" data-a="go" data-i="profile">แก้ไข</button></h2>
<div class="pf">${avatar()}<div><div class="big">${esc(p.name||'ผู้เล่น')}</div><small>${RANKS[K.rankOf(avg)]} · เฉลี่ย Lv.${avg.toFixed(1)}</small><div class="bar"><i style="width:${(avg-1)/9*100}%"></i></div></div></div>
${b?`<div class="chips"><span>BMI ${b.bmi} · <b style="color:${bc.c}">${bc.t}</b></span><span>BMR ${b.bmr}</span><span>TDEE ${b.tdee}</span></div>`:'<small>ไปที่เมนูโปรไฟล์เพื่อกรอกข้อมูล</small>'}
<h3>✦ ทักษะ</h3>${GROUPS.map((g,i)=>`<div class="sk"><div class="qc-i sm">${I(SK[i])}</div><div><div class="lv-h"><b>${g.n}</b><small>Lv.${L[i]} · ${s.exp[g.k]} EXP</small></div><small>${esc(g.t[L[i]-1])}</small><div class="bar"><i style="width:${K.progress(s.exp[g.k])}%"></i></div></div></div>`).join('')}</section>
${rw?`<section class="card rest"><h2>${I('moon')} แลกเวลาพัก <button class="g hb" data-a="go" data-i="shop">ร้านค้า</button></h2><div class="qc"><div class="qc-h"><div class="qc-i">${ICON(rw.name)}</div><div><b>${esc(rw.name)}</b><br><small>${rw.durationMin?rw.durationMin+' นาที':'ใช้ทันที'}</small></div><span class="pill p-pt" style="margin-left:auto">${I('coin')} ${rw.price}</span></div><small>ความคืบหน้า ${Math.min(s.points,rw.price)} / ${rw.price} P</small><div class="bar"><i style="width:${Math.min(100,s.points/rw.price*100)}%"></i></div>${s.points>=rw.price?`<button data-a="redeem" data-i="${esc(rw.id)}">แลกเลย</button>`:''}</div></section>`:''}
</aside></div>
<footer class="foot"><b>LifeQuest</b><small>Small Habits · Big Dreams</small><span>✦ “Better Habits · Brighter Future” ✦</span></footer></div>`}
function profHtml(b){const p=s.profile,opt=(o,sel)=>Object.entries(o).map(([k,t])=>`<option value="${k}" ${k===sel?'selected':''}>${esc(t)}</option>`).join(''),bc=b&&K.bmiCat(b.bmi);
 return `<section class="card s12"><h2>${I('user')} โปรไฟล์</h2><div class="pf">${avatar()}${b?`<div class="chips"><span>BMI ${b.bmi} · <b style="color:${bc.c}">${bc.t}</b></span><span>BMR ${b.bmr}</span><span>TDEE ${b.tdee} kcal</span></div>`:'<small>กรอกข้อมูลเพื่อคำนวณ BMI / BMR / TDEE</small>'}</div>
<div class="grid2"><label>ชื่อ<input id="f-n" value="${esc(p.name)}"></label><label>เพศ<select id="f-s">${opt({male:'ชาย',female:'หญิง'},p.sex)}</select></label>
<label>วันเกิด<input id="f-bd" type="date" value="${esc(p.birthDate)}"></label><label>เวลาเป้าหมายตื่น<input id="f-wt" type="time" value="${esc(p.wakeTarget)}"></label>
<label>น้ำหนัก (kg)<input id="f-w" type="number" step="0.1" value="${p.weightKg||''}"></label><label>ส่วนสูง (cm)<input id="f-h" type="number" value="${p.heightCm||''}"></label>
<label style="grid-column:1/-1">ระดับกิจกรรม<select id="f-a">${opt(ACT,p.activity)}</select></label></div>
<div class="row"><button data-a="saveProfile">บันทึกโปรไฟล์</button><label class="g" style="padding:9px 14px;border-radius:12px;cursor:pointer;border:1px solid var(--b)">รูปโปรไฟล์<input id="photo" type="file" accept="image/*" hidden></label></div></section>
${syncHtml()}<section class="card s12"><h2>${I('disk')} ข้อมูล</h2><div class="row"><button data-a="export">Export JSON</button><label class="g" style="padding:9px 14px;border-radius:12px;cursor:pointer;border:1px solid var(--b)">Import JSON<input id="imp" type="file" accept=".json" hidden></label><button class="g" data-a="reset">Reset ทั้งหมด</button></div><small>ข้อมูลอยู่ในเบราว์เซอร์เครื่องนี้ ควร Export สำรองไว้เป็นระยะ</small></section>`}
const TABS=[['home','home','หลัก'],['shop','shop','ร้านค้า'],['inv','inv','คลัง'],['history','hist','ประวัติ'],['theme','theme','ธีม'],['profile','user','โปรไฟล์']];
const navH=c=>`<nav class="${c}">${TABS.map(([k,i,t])=>`<button class="nv fx ${view===k?'on':''}" data-a="go" data-i="${k}"><span>${I(i)}</span>${t}</button>`).join('')}</nav>`;
function render(){
 const b=body(),d=day(),L=lvs(),avg=L.reduce((a,c)=>a+c,0)/4;
 document.documentElement.dataset.theme=pv||s.settings.theme||'default';
 $('#hdr').innerHTML=`<header><div class="brand"><img src="${C.themes[pv||s.settings.theme||'default']?.icon||'icon.png'}" alt=""><b>LifeQuest</b></div>${navH('nav-top')}<div class="hr">${sybH()}<span class="coin">${I('coin')} ${s.points}</span><button class="g fx" data-a="snd" title="เสียง">${I(s.settings.sound===false?'snd0':'snd')}</button><button class="amini fx" data-a="go" data-i="profile" title="โปรไฟล์">${s.profile.photo.startsWith('data:image/')?`<img src="${esc(s.profile.photo)}" alt="">`:I('user')}</button></div></header>`;
 $('#bnav').innerHTML=navH('nav-bot');
 const own=pv&&(pv==='default'||s.shop.unlockedThemes.includes(pv));
 const pvb=pv?`<div class="card s12 pvbar">👁 ตัวอย่างธีม: <b>${esc(C.themes[pv].name)}</b><span>${own?'':`<button data-a="buyT" data-i="${pv}">ซื้อ ${I('coin')}${C.themes[pv].price}</button>`}<button class="g" data-a="endPv">ปิดตัวอย่าง</button></span></div>`:'';
 $('#app').innerHTML=pvb+badge()+(view==='shop'?shopHtml():view==='inv'?invHtml():view==='theme'?themeHtml():view==='profile'?profHtml(b):view==='history'?histHtml(b):homeHtml(b,d,L,avg));
 if(pendingFill&&$('#m-n')){fillForm(pendingFill);pendingFill=null}
}
const num=(msg,cur,max)=>{const n=parseInt(prompt(msg,cur));return n>=0&&n<=max?n:null};
const H={
 preview(i){pv=i;render()},
 hTab(i){hTab=i;hMore=14;render()},hMore(){hMore+=14;render()},
 syncBtn(){if(!C.syncUrl)return;if(!sy.key){toast('ยังไม่ได้เชื่อมซิงค์ — ตั้งค่าที่หน้าโปรไฟล์');return H.go('profile')}toast(SYS[sy.st]+' · กำลังตรวจสอบกับคลาวด์');pull()},
 calP(){calOff--;render()},calN(){if(calOff<0){calOff++;render()}},
 syncShow(){sy.show=!sy.show;render()},
 syncCopy(){navigator.clipboard?.writeText(fk(sy.key)).then(()=>toast('คัดลอกรหัสแล้ว'),()=>toast('คัดลอกไม่ได้ ให้จดรหัสเอง'))},
 async syncCreate(){if(sy.key||!C.syncUrl)return;sy.key=newKey();lss('lq_sync_key',sy.key);sy.show=true;if(!s.updatedAt){s.updatedAt=Date.now();S.save(s)}setSy('กำลังอัปโหลดข้อมูลขึ้นคลาวด์...');setSync('busy');render();await push()},
 async syncJoin(){const k=v('sy-k').toUpperCase().replace(/[^A-Z0-9]/g,'');if(k.length!==15)return toast('รหัสต้องมี 15 ตัว เช่น ABCDE-FGHJK-LMNPQ');
  sy.key=k;setSy('กำลังเชื่อมต่อ...');let r;try{r=await api('GET')}catch{r=null}
  const fail=m=>{sy.key='';setSync('off');setSy(m)};
  if(!r)return fail('❌ เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ต');if(r.status===404)return fail('❌ ไม่พบรหัสนี้ ตรวจรหัสอีกครั้ง');if(r.status!==200||!r.j.data)return fail('❌ เชื่อมต่อไม่สำเร็จ');
  let n;try{n=S.parseImport(JSON.stringify(r.j.data))}catch{return fail('❌ ข้อมูลบนคลาวด์อ่านไม่ได้')}
  if(s.updatedAt&&!confirm('เครื่องนี้มีข้อมูลอยู่แล้ว จะถูกแทนที่ด้วยข้อมูลจากคลาวด์ ดำเนินการต่อ?'))return fail('ยกเลิกแล้ว');
  lss('lq_sync_key',k);s=n;Shop.seed(s);setSy('✅ เชื่อมต่อแล้ว · '+tm());setSync('ok');commit('เชื่อมต่อซิงค์แล้ว ✅',true)},
 syncNow(){if(!sy.key)return;setSy('กำลังซิงค์...');pull()},
 syncOff(){if(confirm('ยกเลิกการซิงค์บนเครื่องนี้? (ข้อมูลบนคลาวด์และเครื่องอื่นไม่ถูกลบ)')){sy.key='';sy.show=false;lss('lq_sync_key','');setSync('off');setSy('');render()}},
saveWT(){const t=v('wt');if(!/^\d\d:\d\d$/.test(t))return toast('ใส่เวลาให้ถูกต้อง');s.profile.wakeTarget=t;commit('ตั้งเป้าตื่น '+t+' แล้ว')},
 cancelEdit(){editM=null;render()},
 editMeal(i){editM=+i;render();const m=day().meals[editM];if(m){setV('m-n',m.menu);setV('m-k',m.kcal);setV('m-p',m.protein||'');setV('m-c',m.carbs||'');setV('m-f',m.fat||'');$('#m-n')?.scrollIntoView?.({block:'center',behavior:'smooth'})}},endPv(){pv=null;render()},snd(){s.settings.sound=s.settings.sound===false;commit()},
 ex(i){const e=C.ex.find(x=>x.k===i),d=day();d.ex[i]=Math.min(2000,(d.ex[i]||0)+e.step);commit(`${e.n} +${e.step}`)},
 exUndo(i){const e=C.ex.find(x=>x.k===i),d=day();d.ex[i]=Math.max(0,(d.ex[i]||0)-e.step);commit()},
 go(i){view=i;render();const x=$('#app');x.classList.add('enter');setTimeout(()=>x.classList.remove('enter'),900);if(typeof scrollTo==='function')scrollTo(0,0)},
 goto(i){document.getElementById(i)?.scrollIntoView?.({behavior:'smooth',block:'start'})},
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
  const g=id=>Math.min(1000,Math.max(0,Math.round(+v(id)||0)));const o={menu:m,kcal:Math.round(k),protein:g('m-p'),carbs:g('m-c'),fat:g('m-f')},ms=day().meals;if(editM!==null&&ms[editM]){ms[editM]=o;editM=null;commit('แก้ไขมื้อแล้ว')}else{ms.push(o);commit('บันทึกมื้ออาหาร')}},
 delMeal(i){editM=null;day().meals.splice(+i,1);commit()},
 vit(){const d=day();d.vit=!d.vit;commit(d.vit?'กินวิตามินแล้ว':'ยกเลิกวิตามิน')},
 export(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(s,null,1)],{type:'application/json'}));a.download=`habit-${today()}.json`;a.click()},
 reset(){if(confirm(sy.key?'ลบข้อมูลทั้งหมด? ซิงค์เปิดอยู่ ข้อมูลบนคลาวด์และทุกเครื่องจะถูกรีเซ็ตด้วย':'ลบข้อมูลทั้งหมดในเครื่องนี้?')){s=S.def();Shop.seed(s);commit('รีเซ็ตแล้ว')}}
};
function photo(f){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),m=Math.min(im.width,im.height);c.width=c.height=256;c.getContext('2d').drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,256,256);s.profile.photo=c.toDataURL('image/jpeg',.8);commit()};im.src=r.result};r.readAsDataURL(f)}
const setV=(id,x)=>{const e=$('#'+id);if(e)e.value=x};
const setSt=(m,c='')=>{scanSt={m,c};const e=$('#scan-st');if(e){e.className='st '+c;e.innerHTML=m}};
const fillForm=o=>{setV('m-n',o.menu);setV('m-k',o.kcal);setV('m-p',o.protein_g);setV('m-c',o.carbs_g);setV('m-f',o.fat_g);
 const n=$('#m-note');if(n)n.textContent=o.menu?`ค่าประมาณ (ความมั่นใจ${{low:'ต่ำ',medium:'กลาง',high:'สูง'}[o.confidence]}) ${o.note} · แก้ตัวเลขได้ก่อนกดบันทึก`:''};
async function scan(f){
 if(scanning)return toast('กำลังวิเคราะห์รูปก่อนหน้าอยู่');scanning=true;const t0=Date.now();let step='กำลังเริ่ม...';
 const show=()=>setSt(`<span class="spin"></span>${step} <small>(${Math.round((Date.now()-t0)/1000)} วินาที)</small>`,'busy'),tk=setInterval(show,500);show();
 try{const o=await AI.analyze(f,undefined,m=>{step=m;show()});
  if(!o.menu)setSt('ไม่พบอาหารในรูป ลองถ่ายใหม่ หรือกรอกเอง','err');
  else{setSt('✅ วิเคราะห์เสร็จแล้ว ตรวจตัวเลขก่อนกดบันทึกนะ','ok');if($('#m-n'))fillForm(o);else pendingFill=o}}
 catch(e){setSt('❌ '+e.message+' · ลองใหม่ หรือกรอกเอง','err')}
 finally{clearInterval(tk);scanning=false}}
document.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(a)H[a.dataset.a]?.(a.dataset.i)});
document.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;
 if(e.target.id==='photo')photo(f);
 if(e.target.id==='scan')scan(f);
 if(e.target.id==='imp')f.text().then(t=>{try{const n=S.parseImport(t);if(confirm('แทนที่ข้อมูลในเครื่องด้วยไฟล์นี้?')){s=n;commit('นำเข้าแล้ว')}}catch{toast('ไฟล์ไม่ถูกต้อง')}});
 e.target.value=''});
FX.init(()=>s.settings.sound!==false);commit(null,true);pull();
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-sy.t>15000)pull()});addEventListener('online',()=>pull());addEventListener('offline',()=>{if(sy.key)setSync('err')});
setInterval(()=>{if(Shop.expire(s)){commit('⏰ ตั๋วหมดเวลาแล้ว',true);return}document.querySelectorAll('[data-exp]').forEach(e=>e.textContent=fmt(+e.dataset.exp-Date.now()))},1000);
