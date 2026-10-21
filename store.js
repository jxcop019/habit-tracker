const KEY='habit_tracker_v1';
export const def=()=>({schemaVersion:1,profile:{name:'',photo:'',sex:'male',birthDate:'',weightKg:0,heightCm:0,activity:'light',wakeTarget:'07:30'},exp:{fitness:0,earlyBird:0,nutrition:0,wisdom:0},points:0,days:{},settings:{dayResetHour:3},shop:{customRewards:[],unlockedThemes:[]},inventory:[]});
const merge=r=>{const d=def();return{...d,...r,profile:{...d.profile,...r.profile},exp:{...d.exp,...r.exp},days:r.days||{}}};
export const load=()=>{try{const r=JSON.parse(localStorage.getItem(KEY));return r?merge(r):def()}catch{return def()}};
export const save=s=>{try{localStorage.setItem(KEY,JSON.stringify(s));return true}catch{return false}};
export const parseImport=t=>{const r=JSON.parse(t);if(!r||r.schemaVersion!==1||typeof r.days!=='object'||typeof r.exp!=='object')throw new Error('bad');
const m=merge(r);for(const k in m.exp)m.exp[k]=Math.max(0,+m.exp[k]||0);m.points=Math.max(0,+m.points||0);
for(const d of Object.values(m.days)){d.meals=Array.isArray(d.meals)?d.meals:[];d.awarded=d.awarded||{};d.push=+d.push||0;d.read=+d.read||0}return m};
export {merge};
