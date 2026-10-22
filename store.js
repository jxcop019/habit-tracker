import {CFG as C} from './config.js';
const KEY='habit_tracker_v1',STAT=['ready','active','used'];
export const def=()=>({schemaVersion:1,updatedAt:0,profile:{name:'',photo:'',sex:'male',birthDate:'',weightKg:0,heightCm:0,activity:'light',wakeTarget:'07:30'},exp:{fitness:0,earlyBird:0,nutrition:0,wisdom:0},points:0,days:{},settings:{dayResetHour:3,theme:'default',sound:true},shop:{customRewards:[],unlockedThemes:[],seeded:false},inventory:[]});
const normDay=d=>{if(!d.ex||typeof d.ex!=='object'){d.ex={};if(+d.push>0)d.ex.pushup=Math.min(2000,+d.push)}delete d.push;for(const k in d.ex)d.ex[k]=Math.min(2000,Math.max(0,Math.round(+d.ex[k]||0)));return d};
export const merge=r=>{const d=def();const m={...d,...r,profile:{...d.profile,...r.profile},exp:{...d.exp,...r.exp},settings:{...d.settings,...r.settings},shop:{...d.shop,...r.shop},days:r.days||{}};Object.values(m.days).forEach(normDay);return m};
export const load=()=>{try{const r=JSON.parse(localStorage.getItem(KEY));return r?merge(r):def()}catch{return def()}};
export const save=s=>{try{localStorage.setItem(KEY,JSON.stringify(s));return true}catch{return false}};
const str=(x,n)=>String(x??'').slice(0,n),n0=x=>Math.max(0,+x||0),arr=x=>Array.isArray(x)?x:[];
export const parseImport=t=>{const r=JSON.parse(t);if(!r||r.schemaVersion!==1||typeof r.days!=='object'||typeof r.exp!=='object')throw new Error('bad');
 const m=merge(r);for(const k in m.exp)m.exp[k]=n0(m.exp[k]);m.points=n0(m.points);m.updatedAt=n0(m.updatedAt);
 for(const d of Object.values(m.days)){d.meals=arr(d.meals).filter(m=>m&&m.menu!==undefined).map(m=>({menu:str(m.menu,60),kcal:n0(m.kcal),protein:n0(m.protein),carbs:n0(m.carbs),fat:n0(m.fat)}));d.awarded=d.awarded||{};d.read=+d.read||0}
 m.inventory=arr(m.inventory).filter(i=>i&&STAT.includes(i.status)).map(i=>({id:str(i.id,20),name:str(i.name,40),durationMin:n0(i.durationMin),price:n0(i.price),status:i.status,redeemedAt:n0(i.redeemedAt),expiresAt:i.status==='active'?n0(i.expiresAt):null,usedAt:i.usedAt?n0(i.usedAt):null}));
 m.shop.customRewards=arr(m.shop.customRewards).filter(x=>x&&x.name).map(x=>({id:str(x.id,20),name:str(x.name,40),price:Math.max(1,Math.round(n0(x.price))),durationMin:n0(x.durationMin)}));
 m.shop.unlockedThemes=arr(m.shop.unlockedThemes).filter(k=>C.themes[k]&&k!=='default');
 if(!C.themes[m.settings.theme]||(m.settings.theme!=='default'&&!m.shop.unlockedThemes.includes(m.settings.theme)))m.settings.theme='default';
 return m};
