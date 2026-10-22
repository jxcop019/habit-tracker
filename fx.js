// เสียงมินิมอล (เบา สั้น) + แสงขาวใสตามเมาส์ + การ์ดเอียงตามเมาส์แบบ 3D เล็กน้อย
// เสียงเริ่มทำงานหลังกด/แตะ/กดแป้นครั้งแรก (กติกาเบราว์เซอร์) — แต่ "ไม่ถูกปิด" เมื่อเปิดโหมดลดแอนิเมชันของระบบ (ปิดได้ที่ปุ่มลำโพงบน header)
const mm=q=>typeof matchMedia==='function'&&matchMedia(q).matches;
// ===== ปรับแต่งตรงนี้ได้ =====
const SND={hover:{f:1320,g:.016,d:.055},click:{f:880,g:.03,d:.09}}; // f=ความถี่(Hz) g=ความดัง(0-1 ยิ่งน้อยยิ่งเบา) d=ความยาว(วินาที)
const TILT={small:6,big:1.6};
const RESPECT_REDUCED_MOTION=false; // true = ปิดแสง/เอียงเมื่อระบบเปิดโหมด "ลดแอนิเมชัน" (Windows: Settings > Accessibility > Visual effects > Animation effects)   // องศาเอียงสูงสุด: การ์ดเล็ก / การ์ดใหญ่
const HOVER_SEL='button,.fx,.card,.qc,.qt,.ic,.stat,.mc,select,input';
let ctx,last=0,ready=false,on=()=>true;
const arm=()=>{ready=true;try{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();ctx.resume?.()}catch{}};
const tick=k=>{if(!ready||!on())return;const n=performance.now();if(n-last<80)return;last=n;
 try{if(!ctx)return;if(ctx.state==='suspended')ctx.resume();const p=SND[k],t=ctx.currentTime,o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
  lp.type='lowpass';lp.frequency.value=4200;o.type='sine';o.frequency.value=p.f;o2.type='sine';o2.frequency.value=p.f*2;
  const g2=ctx.createGain();g2.gain.value=.25;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(p.g,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+p.d);
  o.connect(g);o2.connect(g2).connect(g);g.connect(lp).connect(ctx.destination);o.start(t);o2.start(t);o.stop(t+p.d+.02);o2.stop(t+p.d+.02)}catch{}};
const RIB='<svg viewBox="0 0 600 700" aria-hidden="true"><defs><linearGradient id="rb" x1="0" y1="1" x2="1" y2="0"><stop offset="0" style="stop-color:var(--r1)"/><stop offset=".55" style="stop-color:var(--r2)"/><stop offset="1" style="stop-color:var(--r3)"/></linearGradient></defs><path d="M-20 640C120 440 40 280 250 150S520 40 640-20" fill="none" stroke="url(#rb)" stroke-width="28" stroke-linecap="round"/><path d="M-20 700C160 500 110 330 300 200S560 90 660 20" fill="none" stroke="url(#rb)" stroke-width="6" stroke-linecap="round" opacity=".7"/></svg>';
const bg=()=>{if(!document.body||document.querySelector('.fxbg'))return;const r=Math.random,d=document.createElement('div');d.className='fxbg';
 d.innerHTML=RIB+Array.from({length:18},()=>`<i style="left:${(r()*96).toFixed(1)}%;top:${(r()*96).toFixed(1)}%;font-size:${(9+r()*20).toFixed(0)}px;animation-delay:${(r()*5).toFixed(1)}s;animation-duration:${(3+r()*4).toFixed(1)}s"></i>`).join('');document.body.prepend(d)};
export const init=soundOn=>{on=soundOn;bg();let cur=null;
 for(const ev of['pointerdown','keydown','touchstart'])addEventListener(ev,arm,{once:true,passive:true});
 // เสียงตอนเอาเมาส์ไปชี้ (เฉพาะเมาส์จริง ไม่นับการแตะบนมือถือ)
 document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const el=e.target.closest?.(HOVER_SEL);if(el&&el!==cur&&!el.disabled)tick('hover');cur=el||null});
 document.addEventListener('click',e=>{if(e.target.closest?.('button'))tick('click')});
 // ----- แสง glow ตามเมาส์ + เอียงการ์ด: ทำงานเมื่อมี "เมาส์จริง" เท่านั้น (มือถือจะไม่สร้างอะไรเลย) -----
 if(RESPECT_REDUCED_MOTION&&mm('(prefers-reduced-motion:reduce)'))return;
 let g=null,tx=0,ty=0,cx=0,cy=0,run=0,tc=null,ev=null,raf=0;
 const follow=()=>{cx+=(tx-cx)*.22;cy+=(ty-cy)*.22;g.style.transform=`translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;if(Math.abs(tx-cx)+Math.abs(ty-cy)>.4)run=requestAnimationFrame(follow);else run=0};
 const rst=el=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');el.style.setProperty('--lit','0')};
 const off=()=>{g?.classList.remove('on');if(tc){rst(tc);tc=null}};
 const frame=()=>{raf=0;if(!ev)return;const e=ev;
  if(!g){g=document.createElement('div');g.className='fxglow';document.body.appendChild(g)}
  tx=e.clientX;ty=e.clientY;if(!g.classList.contains('on')){cx=tx;cy=ty;g.style.transform=`translate3d(${cx}px,${cy}px,0)`;g.classList.add('on')}if(!run)run=requestAnimationFrame(follow);
  const el=e.target.closest?.('.tilt');if(tc&&tc!==el)rst(tc);tc=el;if(!el)return;
  const r=el.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height,m=r.width>480?TILT.big:TILT.small;
  el.style.setProperty('--ry',((px-.5)*2*m).toFixed(2)+'deg');el.style.setProperty('--rx',(-(py-.5)*2*m).toFixed(2)+'deg');
  el.style.setProperty('--mx',(e.clientX-r.left).toFixed(0)+'px');el.style.setProperty('--my',(e.clientY-r.top).toFixed(0)+'px');el.style.setProperty('--lit','1')};
 document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;ev=e;if(!raf)raf=requestAnimationFrame(frame)},{passive:true});
 document.documentElement.addEventListener('mouseleave',off);addEventListener('blur',off)};
