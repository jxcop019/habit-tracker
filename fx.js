// เสียง pop เบาๆ + ขยายนิดๆ + เอียงตามเมาส์ (เสียงเริ่มหลังจากกด/แตะหน้าจอครั้งแรก ตามกติกาเบราว์เซอร์)
const mm=q=>typeof matchMedia==='function'&&matchMedia(q).matches;
let ctx,last=0,ready=false,on=()=>true;
const pop=(f=620)=>{if(!ready||!on()||mm('(prefers-reduced-motion:reduce)'))return;const n=performance.now();if(n-last<70)return;last=n;
 try{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
  o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*1.6,t+.06);g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+.09);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+.1)}catch{}};
const RIB='<svg viewBox="0 0 600 700" aria-hidden="true"><defs><linearGradient id="rb" x1="0" y1="1" x2="1" y2="0"><stop offset="0" style="stop-color:var(--r1)"/><stop offset=".55" style="stop-color:var(--r2)"/><stop offset="1" style="stop-color:var(--r3)"/></linearGradient></defs><path d="M-20 640C120 440 40 280 250 150S520 40 640-20" fill="none" stroke="url(#rb)" stroke-width="28" stroke-linecap="round"/><path d="M-20 700C160 500 110 330 300 200S560 90 660 20" fill="none" stroke="url(#rb)" stroke-width="6" stroke-linecap="round" opacity=".7"/></svg>';
const bg=()=>{if(!document.body||document.querySelector('.fxbg'))return;const r=Math.random,d=document.createElement('div');d.className='fxbg';
 d.innerHTML=RIB+Array.from({length:18},()=>`<i style="left:${(r()*96).toFixed(1)}%;top:${(r()*96).toFixed(1)}%;font-size:${(9+r()*20).toFixed(0)}px;animation-delay:${(r()*5).toFixed(1)}s;animation-duration:${(3+r()*4).toFixed(1)}s"></i>`).join('');document.body.prepend(d)};
export const init=soundOn=>{on=soundOn;bg();let cur=null;
 addEventListener('pointerdown',()=>{ready=true},{once:true});
 document.addEventListener('mouseover',e=>{const el=e.target.closest?.('button,.fx');if(el&&el!==cur&&!el.disabled)pop();cur=el});
 document.addEventListener('click',e=>{if(e.target.closest?.('button'))pop(880)});
 if(mm('(prefers-reduced-motion:reduce)'))return;
 document.addEventListener('mousemove',e=>{const el=e.target.closest?.('.tilt');if(!el)return;const r=el.getBoundingClientRect();
  el.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*10+'deg');el.style.setProperty('--rx',-((e.clientY-r.top)/r.height-.5)*10+'deg')});
 document.addEventListener('mouseout',e=>{const el=e.target.closest?.('.tilt');if(el&&!el.contains(e.relatedTarget)){el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')}})};
