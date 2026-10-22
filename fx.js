// เสียง pop เบาๆ + ขยายนิดๆ + เอียงตามเมาส์ (เสียงเริ่มหลังจากกด/แตะหน้าจอครั้งแรก ตามกติกาเบราว์เซอร์)
const mm=q=>typeof matchMedia==='function'&&matchMedia(q).matches;
let ctx,last=0,ready=false,on=()=>true;
const pop=(f=620)=>{if(!ready||!on()||mm('(prefers-reduced-motion:reduce)'))return;const n=performance.now();if(n-last<70)return;last=n;
 try{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
  o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*1.6,t+.06);g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+.09);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+.1)}catch{}};
export const init=soundOn=>{on=soundOn;let cur=null;
 addEventListener('pointerdown',()=>{ready=true},{once:true});
 document.addEventListener('mouseover',e=>{const el=e.target.closest?.('button,.fx');if(el&&el!==cur&&!el.disabled)pop();cur=el});
 document.addEventListener('click',e=>{if(e.target.closest?.('button'))pop(880)});
 if(mm('(prefers-reduced-motion:reduce)'))return;
 document.addEventListener('mousemove',e=>{const el=e.target.closest?.('.tilt');if(!el)return;const r=el.getBoundingClientRect();
  el.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*10+'deg');el.style.setProperty('--rx',-((e.clientY-r.top)/r.height-.5)*10+'deg')});
 document.addEventListener('mouseout',e=>{const el=e.target.closest?.('.tilt');if(el&&!el.contains(e.relatedTarget)){el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')}})};
