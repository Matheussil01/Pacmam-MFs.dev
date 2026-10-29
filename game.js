const MAP=[
"###################",
"#........#........#",
"#o##.###.#.###.##o#",
"#.................#",
"#.##.#.#####.#.##.#",
"#....#...#...#....#",
"####.###.#.###.####",
"####.#.......#.####",
"####.#.##-##.#.####",
".......#GGG#.......",
"####.#.#####.#.####",
"####.#.......#.####",
"#........#........#",
"#.##.###.#.###.##.#",
"#o.#.....P.....#.o#",
"##.#.#.#####.#.#.##",
"#....#...#...#....#",
"#.######.#.######.#",
"#.................#",
"###################"];
const MAPB=[
"###################",
"#o...#.......#...o#",
"#.##.#.##.##.#.##.#",
"#.................#",
"#.##.##.#.#.##.##.#",
"#....#.......#....#",
"####.###.#.###.####",
"####.#.......#.####",
"####.#.##-##.#.####",
".......#GGG#.......",
"####.#.#####.#.####",
"####.#.......#.####",
"#....#.......#....#",
"#.##.#.#####.#.##.#",
"#o.......P.......o#",
"#.##.###.#.###.##.#",
"#.....#.....#.....#",
"#.#.###.#.#.###.#.#",
"#.................#",
"###################"];
const MAPC=[
"###################",
"#o...............o#",
"#.####.#####.####.#",
"#.#.............#.#",
"#.#.###.....###.#.#",
"#.....#.....#.....#",
"####.###.#.###.####",
"####.#.......#.####",
"####.#.##-##.#.####",
".......#GGG#.......",
"####.#.#####.#.####",
"####.#.......#.####",
"#.................#",
"#.#.###.....###.#.#",
"#o.......P.......o#",
"#.#.#.#######.#.#.#",
"#.................#",
"#.##.#.......#.##.#",
"#.................#",
"###################"];
const MAPS=[MAP,MAPB,MAPC];
const T=20,W=19,H=20,DIRS=[[0,-1],[-1,0],[0,1],[1,0]];
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
cv.width=W*T;cv.height=H*T;
const $=id=>document.getElementById(id);
let grid,dots,score=0,lives=3,level=1,state='ready',paused=false,frame=0,power=0,combo=0,timer=0,hi=0,face=0;
let pac,ghosts=[],pops=[];
try{hi=+localStorage.getItem('cc_hi')||0}catch(e){}

function load(){
  grid=MAPS[(level-1)%MAPS.length].map(r=>r.padEnd(W,'#').slice(0,W).replace(/[GP]/g,' ').split(''));
  dots=0;grid.forEach(r=>r.forEach(c=>{if(c==='.'||c==='o')dots++}));
}
function reset(){
  pac={x:9*T,y:14*T,dx:0,dy:0,wx:0,wy:0};
  const cols=['#ff4d4d','#ff9ad5','#35e0ff','#ffa23a'];
  const st=[[9,7],[9,9],[8,9],[10,9]];
  const gap=Math.max(60,200-level*20);
  ghosts=st.map((s,i)=>({x:s[0]*T,y:s[1]*T,dx:i?0:-1,dy:0,col:cols[i],i,mode:'normal',leaving:i>0,wait:i?i*gap:0}));
  power=0;pops=[];
}
function restart(){score=0;lives=3;level=1;load();reset();state='ready'}

const solid=(c,r,door)=>{
  if(r<0||r>=H)return true;
  if(c<0||c>=W)return false;
  const t=grid[r][c];
  return t==='#'||(t==='-'&&!door);
};
function advance(e){
  e.x+=e.dx*2;e.y+=e.dy*2;
  if(e.x<=-T)e.x+=W*T;else if(e.x>=W*T)e.x-=W*T;
}
function eat(c,r){
  if(c<0||c>=W)return;
  const t=grid[r][c];
  if(t==='.'){score+=10;dots--;grid[r][c]=' '}
  else if(t==='o'){
    score+=50;dots--;grid[r][c]=' ';
    power=Math.max(150,420-level*40);combo=0;
    ghosts.forEach(g=>{if(g.mode==='normal'&&!g.leaving&&g.wait<=0){g.dx*=-1;g.dy*=-1}});
  }
}
function movePac(){
  if((pac.wx||pac.wy)&&pac.wx===-pac.dx&&pac.wy===-pac.dy){pac.dx=pac.wx;pac.dy=pac.wy}
  if(pac.x%T===0&&pac.y%T===0){
    const c=pac.x/T,r=pac.y/T;
    eat(c,r);
    if((pac.wx||pac.wy)&&!solid(c+pac.wx,r+pac.wy,false)){pac.dx=pac.wx;pac.dy=pac.wy}
    if(solid(c+pac.dx,r+pac.dy,false)){pac.dx=0;pac.dy=0}
  }
  if(pac.dx||pac.dy)face=Math.atan2(pac.dy,pac.dx);
  advance(pac);
}
const rnd=n=>Math.floor(Math.random()*n);
function think(g,scared){
  const c=g.x/T,r=g.y/T;
  if(g.mode==='eyes'&&c===9&&r===9){g.mode='normal';g.leaving=true}
  if(g.leaving&&r<=7)g.leaving=false;
  const door=g.mode==='eyes'||g.leaving;
  const pc=Math.round(pac.x/T),pr=Math.round(pac.y/T);
  let tx,ty;
  if(g.mode==='eyes'){tx=9;ty=9}
  else if(g.leaving){tx=9;ty=7}
  else if(frame%1800<400){const k=[[17,0],[1,0],[17,19],[1,19]][g.i];tx=k[0];ty=k[1]}
  else if(g.i===0){tx=pc;ty=pr}
  else if(g.i===1){tx=pc+pac.dx*4;ty=pr+pac.dy*4}
  else if(g.i===2){if(Math.random()<.35){tx=pc;ty=pr}else{tx=rnd(W);ty=rnd(H)}}
  else{if(Math.hypot(pc-c,pr-r)>8){tx=pc;ty=pr}else{tx=1;ty=18}}
  const opts=[];
  for(const d of DIRS){
    if(d[0]===-g.dx&&d[1]===-g.dy)continue;
    if(solid(c+d[0],r+d[1],door))continue;
    opts.push(d);
  }
  if(!opts.length){g.dx=-g.dx;g.dy=-g.dy;return}
  let pick;
  if(scared&&!g.leaving&&g.mode==='normal')pick=opts[rnd(opts.length)];
  else{
    let bd=1e9;
    for(const d of opts){const dd=(c+d[0]-tx)**2+(r+d[1]-ty)**2;if(dd<bd){bd=dd;pick=d}}
  }
  g.dx=pick[0];g.dy=pick[1];
}
function moveGhost(g){
  if(g.wait>0){g.wait--;return}
  const scared=power>0&&g.mode==='normal';
  let n;
  if(g.mode==='eyes')n=2;else if(scared)n=frame%2;else{const sk=level<5?12-level*2:0;n=(sk&&frame%sk===0)?0:1}
  while(n-->0){
    if(g.x%T===0&&g.y%T===0)think(g,scared);
    advance(g);
  }
}
function collide(){
  for(const g of ghosts){
    if(g.mode==='eyes')continue;
    if(Math.abs(g.x-pac.x)<14&&Math.abs(g.y-pac.y)<14){
      if(power>0){
        g.mode='eyes';g.wait=0;g.leaving=false;combo++;
        const pts=200*2**(combo-1);score+=pts;
        pops.push({x:g.x,y:g.y,t:50,s:String(pts)});
      }else{lives--;state='dead';timer=100;return}
    }
  }
}
function saveHi(){
  if(score>hi){hi=score;try{localStorage.setItem('cc_hi',hi)}catch(e){}}
}
function update(){
  if(paused)return;
  frame++;
  if(state==='play'){
    if(power>0)power--;
    movePac();ghosts.forEach(moveGhost);
    if(state==='play')collide();
    if(state==='play'&&dots<=0){state='win';timer=90}
    if(score>hi)saveHi();
  }else if(state==='dead'){
    if(--timer<=0){
      if(lives<=0){state='over';timer=60;saveHi()}else{reset();state='ready'}
    }
  }else if(state==='win'){
    if(--timer<=0){level++;load();reset();state='ready'}
  }else if(state==='over')timer--;
  pops.forEach(p=>{p.t--;p.y-=.3});pops=pops.filter(p=>p.t>0);
  hud();
}
const HINT={ready:'Deslize ou use as setas para começar',over:'Fim de jogo. Toque ou aperte uma tecla para jogar de novo'};
function hud(){
  $('s').textContent=String(score).padStart(5,'0');
  $('h').textContent=String(Math.max(hi,score)).padStart(5,'0');
  $('l').textContent=level;
  $('v').textContent='●'.repeat(Math.max(lives,0));
  const h=paused?'Pausado. Aperte espaço para voltar':(HINT[state]||'');
  if($('hint').textContent!==h)$('hint').textContent=h;
}

/* ---------- desenho ---------- */
function drawMaze(){
  ctx.fillStyle='#0b0b1e';ctx.fillRect(0,0,cv.width,cv.height);
  const open=(c,r)=>r>=0&&r<H&&c>=0&&c<W&&grid[r][c]!=='#';
  const PAL=[['#101240','#3b5bff'],['#2a1040','#c04bff'],['#3a1010','#ff5b3b'],['#0f3320','#2fe08a'],['#3a3010','#ffd23f']];
  const pal=PAL[(level-1)%PAL.length];
  ctx.fillStyle=pal[0];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(grid[r][c]==='#')ctx.fillRect(c*T,r*T,T,T);
  ctx.strokeStyle=pal[1];ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){
    if(grid[r][c]!=='#')continue;
    const x=c*T,y=r*T;
    if(open(c,r-1)){ctx.moveTo(x+1,y+1);ctx.lineTo(x+T-1,y+1)}
    if(open(c,r+1)){ctx.moveTo(x+1,y+T-1);ctx.lineTo(x+T-1,y+T-1)}
    if(open(c-1,r)){ctx.moveTo(x+1,y+1);ctx.lineTo(x+1,y+T-1)}
    if(open(c+1,r)){ctx.moveTo(x+T-1,y+1);ctx.lineTo(x+T-1,y+T-1)}
  }
  ctx.stroke();
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){
    const t=grid[r][c],x=c*T+T/2,y=r*T+T/2;
    if(t==='.'){ctx.fillStyle='#ffe9b0';ctx.beginPath();ctx.arc(x,y,2,0,7);ctx.fill()}
    else if(t==='o'&&frame%30<20){ctx.fillStyle='#fff3c8';ctx.beginPath();ctx.arc(x,y,6,0,7);ctx.fill()}
    else if(t==='-'){ctx.fillStyle='#ff9ad5';ctx.fillRect(c*T,r*T+T/2-2,T,4)}
  }
}
function drawPac(){
  const cx=pac.x+T/2,cy=pac.y+T/2;
  ctx.fillStyle='#ffd23f';ctx.beginPath();
  if(state==='dead'){
    const m=Math.min(1,(100-timer)/90)*Math.PI;
    if(m>=Math.PI)return;
    ctx.moveTo(cx,cy);ctx.arc(cx,cy,8.5,-Math.PI/2+m,-Math.PI/2+2*Math.PI-m);
  }else{
    const moving=pac.dx||pac.dy;
    const m=moving?Math.abs(Math.sin(frame*.25))*.8:.25;
    ctx.moveTo(cx,cy);ctx.arc(cx,cy,8.5,face+m,face+2*Math.PI-m);
  }
  ctx.fill();
}
function drawGhost(g){
  const x=g.x+T/2,y=g.y+T/2,scared=power>0&&g.mode==='normal';
  if(g.mode!=='eyes'){
    ctx.fillStyle=scared?(power<120&&frame%20<10?'#fff':'#2233ff'):g.col;
    ctx.beginPath();ctx.arc(x,y-1,8.5,Math.PI,0);
    const j=frame%16<8?3:0;
    ctx.lineTo(x+8.5,y+8);ctx.lineTo(x+5.7,y+5+j/3);ctx.lineTo(x+2.8,y+8);ctx.lineTo(x,y+5+j/3);
    ctx.lineTo(x-2.8,y+8);ctx.lineTo(x-5.7,y+5+j/3);ctx.lineTo(x-8.5,y+8);ctx.closePath();ctx.fill();
  }
  if(scared){
    ctx.fillStyle='#ffd9c9';
    ctx.fillRect(x-4,y-3,2,2);ctx.fillRect(x+2,y-3,2,2);
  }else{
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(x-3.5,y-3,2.8,0,7);ctx.arc(x+3.5,y-3,2.8,0,7);ctx.fill();
    ctx.fillStyle='#1a2cff';
    ctx.beginPath();ctx.arc(x-3.5+g.dx*1.4,y-3+g.dy*1.4,1.4,0,7);ctx.arc(x+3.5+g.dx*1.4,y-3+g.dy*1.4,1.4,0,7);ctx.fill();
  }
}
function banner(t,col){
  ctx.fillStyle='rgba(11,11,30,.85)';ctx.fillRect(2*T,10.2*T,(W-4)*T,1.7*T);
  ctx.fillStyle=col;ctx.font='12px "Press Start 2P",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(t,W*T/2,11*T+1);
}
function draw(){
  drawMaze();
  if(state!=='dead')ghosts.forEach(drawGhost);
  if(state!=='win'||frame%16<8)drawPac();
  ctx.font='8px "Press Start 2P",monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#35e0ff';
  pops.forEach(p=>ctx.fillText(p.s,p.x+T/2,p.y+T/2));
  if(state==='ready')banner(level>1?'FASE '+level:'PRONTO!','#ffd23f');
  else if(state==='over')banner('FIM DE JOGO','#ff4d4d');
  else if(state==='win')banner('FASE COMPLETA!','#35e0ff');
  else if(paused)banner('PAUSA','#f4f1ff');
}
let last=0,acc=0;
function loop(t){
  acc+=Math.min(t-last,100);last=t;
  while(acc>=1000/60){acc-=1000/60;update()}
  draw();requestAnimationFrame(loop);
}

/* ---------- controles ---------- */
function input(dx,dy){
  if(paused)return;
  if(state==='over'){if(timer<=0)restart();return}
  pac.wx=dx;pac.wy=dy;
  if(state==='ready')state='play';
}
const KEYS={ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0],ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowDown:[0,1],s:[0,1],S:[0,1]};
addEventListener('keydown',e=>{
  if(e.key===' '||e.key==='p'||e.key==='P'){e.preventDefault();if(state==='play'||paused)paused=!paused;return}
  const k=KEYS[e.key];
  if(k){e.preventDefault();input(k[0],k[1])}
  else if(state==='over'&&e.key==='Enter')input(0,0);
});
let sx=0,sy=0,act=false;
cv.addEventListener('pointerdown',e=>{
  sx=e.clientX;sy=e.clientY;act=true;
  if(state==='over')input(0,0);
  else if(state==='ready'&&!(pac.wx||pac.wy))input(-1,0);
});
cv.addEventListener('pointermove',e=>{
  if(!act)return;
  const dx=e.clientX-sx,dy=e.clientY-sy;
  if(Math.hypot(dx,dy)>22){
    if(Math.abs(dx)>Math.abs(dy))input(Math.sign(dx),0);else input(0,Math.sign(dy));
    sx=e.clientX;sy=e.clientY;
  }
});
addEventListener('pointerup',()=>act=false);
document.querySelectorAll('#pad button').forEach(b=>{
  b.addEventListener('pointerdown',e=>{e.preventDefault();const d=b.dataset.d.split(',').map(Number);input(d[0],d[1])});
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')paused=true});

load();reset();hud();requestAnimationFrame(loop);
