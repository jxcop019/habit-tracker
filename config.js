// ตัวเลขทั้งหมดของเกมอยู่ที่นี่ที่เดียว
export const CFG={dayResetHour:3,wakeWin:[3,12],
expMin:[0,100,300,600,1000,1500,2200,3000,4000,5500],
act:{sedentary:1.2,light:1.375,moderate:1.55,heavy:1.725,extreme:1.9},
wake:{t1:10,t2:60,xp:{5:70,3:35,1:10},sb:30,sr:[7,9]},
push:{per:10,xp:4,cap:150,b50:20,b100:40},
meal:{xp:10,max:3,all:20},vit:20,calBonus:30,
read:{per:15,xp:10,cap:120,b30:20}};
CFG.themes={default:{name:'ค่าเริ่มต้น',price:0},pastel:{name:'Pastel',price:400},gold:{name:'Dark Gold',price:800},cyber:{name:'Cyberpunk',price:1200}};
CFG.defaultRewards=[{name:'ตั๋วดูซีรีส์/เล่นเกม 1 ชม.',price:150,durationMin:60},{name:'ตั๋วขนมหวาน/เครื่องดื่มโปรด 1 แก้ว',price:300,durationMin:0},{name:'ตั๋วซื้อของขวัญให้ตัวเอง 1 ชิ้น',price:1500,durationMin:0}];
CFG.workerUrl='https://expense-ai.phuriphat-zxc84.workers.dev';
