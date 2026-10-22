// ตัวเลขทั้งหมดของเกมอยู่ที่นี่ที่เดียว
export const CFG={dayResetHour:3,wakeWin:[3,12],
expMin:[0,100,300,600,1000,1500,2200,3000,4000,5500],
act:{sedentary:1.2,light:1.375,moderate:1.55,heavy:1.725,extreme:1.9},
wake:{t1:10,t2:60,xp:{5:70,3:35,1:10},sb:30,sr:[7,9]},
push:{per:10,xp:4,cap:150,b50:20,b100:40},
meal:{xp:10,max:3,all:20},vit:20,calBonus:30,
read:{per:15,xp:10,cap:120,b30:20}};
CFG.defaultRewards=[{name:'ตั๋วดูซีรีส์/เล่นเกม 1 ชม.',price:150,durationMin:60},{name:'ตั๋วขนมหวาน/เครื่องดื่มโปรด 1 แก้ว',price:300,durationMin:0},{name:'ตั๋วซื้อของขวัญให้ตัวเอง 1 ชิ้น',price:1500,durationMin:0}];
CFG.workerUrl='https://expense-ai.phuriphat-zxc84.workers.dev';
CFG.read={per:15,xp:5,cap:30,b30:5};
CFG.ex=[{k:'pushup',n:'Push up',icon:'push',unit:'ครั้ง',step:10,xp:4},{k:'widepush',n:'Wide push up',icon:'push',unit:'ครั้ง',step:10,xp:4},{k:'diamond',n:'Diamond push up',icon:'push',unit:'ครั้ง',step:10,xp:4},
{k:'pullup',n:'Pull up',icon:'pullbar',unit:'ครั้ง',step:5,xp:5},{k:'bprow',n:'Backpack rows',icon:'backpack',unit:'ครั้ง',step:20,xp:5},{k:'bppush',n:'Backpack push up',icon:'backpack',unit:'ครั้ง',step:20,xp:5},
{k:'bpcurl',n:'Backpack curls',icon:'backpack',unit:'ครั้ง',step:20,xp:5},{k:'bplat',n:'Backpack lateral raise',icon:'backpack',unit:'ครั้ง',step:20,xp:5},
{k:'legraise',n:'Leg raises',icon:'core',unit:'ครั้ง',step:10,xp:4},{k:'crunch',n:'Cycling cross crunches',icon:'core',unit:'ครั้ง',step:10,xp:4},{k:'heel',n:'Heel touches',icon:'core',unit:'ครั้ง',step:10,xp:4},{k:'situp',n:'Sit up',icon:'core',unit:'ครั้ง',step:10,xp:4},
{k:'plank',n:'Plank',icon:'plank',unit:'วินาที',step:60,xp:5},{k:'hang',n:'Dead hang',icon:'pullbar',unit:'วินาที',step:30,xp:5},
{k:'cardio',n:'คาร์ดิโอ',icon:'cardio',unit:'นาที',step:15,xp:6}];
// โบนัสต่อ "ท่า" (นับเซ็ตของท่านั้นสะสมต่อวัน) ได้ทั้ง EXP และ Point เท่ากัน — ไม่มีเพดานรวมต่อวันแล้ว
// อยากเพิ่มขั้นโบนัสก็เพิ่มบรรทัดตรงนี้ เช่น {n:20,xp:120}
CFG.exBonus=[{n:5,xp:20},{n:10,xp:50}];

CFG.themePrice=750; // ทุกธีมราคาเท่ากัน
CFG.themes={default:{name:'Luxury',price:0,logo:'logos/luxury.webp',icon:'logos/luxury-icon.webp'},minimal:{name:'Minimal',price:750,logo:'logos/minimal.webp',icon:'logos/minimal-icon.webp'},
gold:{name:'Dark Gold',price:750,logo:'logos/gold.webp',icon:'logos/gold-icon.webp'},cyber:{name:'Cyber Punk',price:750,logo:'logos/cyber.webp',icon:'logos/cyber-icon.webp'},pastel:{name:'Cute',price:750,logo:'logos/cute.webp',icon:'logos/cute-icon.webp'}};
// 5★ = นอน>=8ชม. + ตื่นไม่เกินเป้า+30น. | 3★ = ตื่นก่อน 09:00 | 1★ = หลังจากนั้น
// xp = EXP ตามดาว (1.5 เท่าของเดิม) | ptOn = ตื่นตรงเวลา (ไม่เกินเป้า+t1 นาที) ได้ Point ก้อนนี้เลย ไม่ต้องรอครบ 8 ชม. | pt = Point ถ้าตื่นช้ากว่าเป้า
CFG.wake={t1:30,cut:540,need:8,xp:{5:150,3:75,1:22},ptOn:100,pt:{5:100,3:50,1:15}};
CFG.syncUrl='https://lifequest-sync.phuriphat-zxc84.workers.dev'; // Worker ซิงค์ข้อมูล (ดู sync-worker/index.js) — ว่าง = ปิดระบบซิงค์
