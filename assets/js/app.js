/* Alatau Air Cargo — интерактив сайта: карта, 3D-глобус, 3D-самолёт, калькулятор, форма. */
{
/* ====== НАСТРОЙКИ КОМПАНИИ — замените на реальные контакты ====== */
const CONFIG={
  email:'sales@example.com',          // TODO: e-mail отдела продаж
  phone:'+7 (700) 000-00-00',         // TODO: телефон
  hours:'Пн–Пт, 09:00–18:00 (UTC+5)'  // TODO: часы работы
};

const $=id=>document.getElementById(id);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const R2=Math.PI/180;
const fmt=(n,d=0)=>Number(n).toLocaleString('ru-RU',{maximumFractionDigits:d,minimumFractionDigits:d});
const hm=h=>{const t=Math.round(h*60);return `${Math.floor(t/60)} ч ${String(t%60).padStart(2,'0')} мин`};

/* read a CSS variable as an rgb() string Three.js understands (handles color-mix etc.) */
const probe=document.createElement('i');probe.style.display='none';document.body.appendChild(probe);
const cx=document.createElement('canvas');cx.width=cx.height=1;const c2=cx.getContext('2d',{willReadFrequently:true});
const col=v=>{probe.style.color=`var(${v})`;const c=getComputedStyle(probe).color;c2.clearRect(0,0,1,1);c2.fillStyle='#000';c2.fillStyle=c;c2.fillRect(0,0,1,1);const d=c2.getImageData(0,0,1,1).data;return `rgb(${d[0]},${d[1]},${d[2]})`};
const isDark=()=>document.documentElement.dataset.tone==='dark';

/* ---------- contacts ---------- */
document.querySelectorAll('[data-contact]').forEach(el=>{const k=el.dataset.contact,v=CONFIG[k];el.textContent=v;
  if(k==='email')el.href='mailto:'+v;if(k==='phone')el.href='tel:'+v.replace(/[^+\d]/g,'')});
$('year').textContent=new Date().getFullYear();

/* ---------- nav ---------- */
const links=$('links'),menuBtn=$('menuBtn');
menuBtn.addEventListener('click',()=>{const o=!links.classList.contains('open');links.classList.toggle('open',o);menuBtn.setAttribute('aria-expanded',String(o))});
links.addEventListener('click',e=>{if(e.target.closest('a')){links.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}});
const navMap=new Map([...links.querySelectorAll('a')].map(a=>[a.getAttribute('href').slice(1),a]));
const secIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){navMap.forEach(a=>a.classList.remove('on'));const a=navMap.get(e.target.id);if(a)a.classList.add('on')}}),{rootMargin:'-45% 0px -50% 0px'});
document.querySelectorAll('section[id]').forEach(s=>secIO.observe(s));

/* ---------- reveal + counters ---------- */
const countUp=el=>{const to=+el.dataset.count,pre=el.dataset.pre||'',suf=el.dataset.suf||'',plain=el.dataset.plain;if(RM)return;const t0=performance.now(),dur=1400;
  const step=now=>{const t=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-t,4),v=Math.round(to*e);el.textContent=pre+(plain?String(v):fmt(v))+suf;if(t<1)requestAnimationFrame(step)};requestAnimationFrame(step)};
const rvIO=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');e.target.querySelectorAll('[data-count]').forEach(countUp);rvIO.unobserve(e.target)}),{rootMargin:'0px 0px -12% 0px'});
document.querySelectorAll('.rv').forEach(el=>rvIO.observe(el));

/* ---------- data ---------- */
const CITY={KGF:['Караганда',73.33,49.67,5],HKG:['Гонконг',113.92,22.31,8],PVG:['Шанхай',121.81,31.14,8],CGO:['Чжэнчжоу',113.84,34.52,8],CTU:['Чэнду',103.95,30.58,8],DWC:['Дубай',55.16,24.9,4],IST:['Стамбул',28.74,41.26,3],BUD:['Будапешт',19.26,47.43,1],FRA:['Франкфурт',8.56,50.03,1],LGG:['Льеж',5.44,50.64,1]};
const ROUTES=['HKG','PVG','CGO','CTU','DWC','IST','BUD','FRA','LGG'];
const STATUS={HKG:'запуск — начало 2027'};
const LBL={KGF:[8,-8],HKG:[8,10],PVG:[8,4],CGO:[-34,-6],CTU:[-34,8],DWC:[8,4],IST:[-30,10],BUD:[6,10],FRA:[-32,10],LGG:[-30,-6]};
const gc=(a,b)=>{const[,l1,p1]=CITY[a],[,l2,p2]=CITY[b];const f1=p1*R2,f2=p2*R2;return 6371*Math.acos(Math.min(1,Math.sin(f1)*Math.sin(f2)+Math.cos(f1)*Math.cos(f2)*Math.cos((l2-l1)*R2)))};
const flyH=k=>gc('KGF',k)/850+.5;

/* ---------- ticker ---------- */
{const items=ROUTES.map(k=>`<span><b>KGF</b> <i>→</i> <b>${k}</b> · ${CITY[k][0]} · ${fmt(gc('KGF',k))} км · ${hm(flyH(k))}</span>`).join('');$('ticker').innerHTML=items+items}

/* ---------- world map ---------- */
const wm=$('wmap');let sel='HKG',flyT=0;
{
  let s=`<path class="w-sea" d="${GEO.sphere}"/><path class="w-grat" d="${GEO.grat}"/><path class="w-land" d="${GEO.land}"/><path class="w-bord" d="${GEO.borders}"/><path class="w-kz" d="${GEO.kz}"/>`;
  s+=ROUTES.map(k=>`<path class="w-arc" data-k="${k}" d="M${GEO.arcs[k].map(p=>p.join(' ')).join(' L')}"/>`).join('');
  for(const k in CITY){const[x,y]=GEO.xy[k],hub=k==='KGF',[dx,dy]=LBL[k];
    if(hub)s+=`<circle class="w-halo" cx="${x}" cy="${y}" r="7"/>`;
    s+=`<circle class="w-pin${hub?' hub':''}" data-k="${hub?'':k}" cx="${x}" cy="${y}" r="${hub?3.8:2.6}"/><text class="w-code${hub?' on':''}" data-k="${hub?'':k}" x="${x+dx}" y="${y+dy}">${k}</text>`}
  s+='<g id="wplane"><path class="w-plane" d="M6 0 C6 -.9 4.8 -1.2 3 -1.2 L-.4 -1.2 L-3 -6 L-4.8 -6 L-3.5 -1.2 L-5.6 -1.2 L-7 -3.2 L-8 -3.2 L-7.3 0 L-8 3.2 L-7 3.2 L-5.6 1.2 L-3.5 1.2 L-4.8 6 L-3 6 L-.4 1.2 L3 1.2 C4.8 1.2 6 .9 6 0 Z" transform="scale(.75)"/></g>';
  wm.setAttribute('viewBox',`0 0 ${GEO.W} ${GEO.H}`);wm.innerHTML=s;
}
const chips=$('chips');
chips.innerHTML=ROUTES.map(k=>`<button type="button" data-k="${k}" aria-pressed="${k===sel}">${CITY[k][0]}<small>${k}</small></button>`).join('');
let globe=null,three=null;
function pick(k){sel=k;flyT=0;
  chips.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.k===k)));
  wm.querySelectorAll('.w-arc').forEach(a=>a.classList.toggle('on',a.dataset.k===k));
  wm.querySelectorAll('.w-code').forEach(t=>t.classList.toggle('on',t.dataset.k===k||t.textContent==='KGF'));
  const on=wm.querySelector(`.w-arc[data-k="${k}"]`);if(on)on.parentNode.insertBefore(on,wm.querySelector('.w-pin'));
  const d=gc('KGF',k);$('cDist').textContent=fmt(d);$('cTime').textContent=hm(flyH(k));
  const tz=CITY[k][3]-CITY.KGF[3];$('cFuel').textContent=(tz>0?'+':tz<0?'−':'')+Math.abs(tz)+' ч';
  $('cStat').textContent=STATUS[k]||'в планах сети';$('r3').textContent=`KGF — ${k} · ${fmt(d)} км`;
  if(globe)globe.focus(k);
}
chips.addEventListener('click',e=>{const b=e.target.closest('button');if(b)pick(b.dataset.k)});
wm.addEventListener('click',e=>{const t=e.target.closest('[data-k]');if(t&&t.dataset.k)pick(t.dataset.k)});
const wplane=$('wplane');
function at(pts,t){const f=t*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),w=f-i,a=pts[i],b=pts[i+1];return[a[0]+(b[0]-a[0])*w,a[1]+(b[1]-a[1])*w,Math.atan2(b[1]-a[1],b[0]-a[0])]}
function mapTick(dt){flyT=(flyT+dt/(3+gc('KGF',sel)/2200))%1;const e=flyT<.5?2*flyT*flyT:1-((-2*flyT+2)**2)/2;const[x,y,a]=at(GEO.arcs[sel],e);wplane.setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(a/R2).toFixed(1)})`)}

/* ---------- specs ---------- */
const AC={
  a:{name:'A340-600',L:75.4,D:5.64,span:63.45,H:17.2,eng:4,engD:2.9,sweep:31,specs:[['75,4 м','длина'],['63,5 м','размах крыла'],['4 × Trent 556','двигатели'],['380 т','макс. взлётная масса']]},
  b:{name:'777F',L:63.7,D:6.2,span:64.8,H:18.6,eng:2,engD:3.9,sweep:31.6,specs:[['63,7 м','длина'],['64,8 м','размах крыла'],['2 × GE90-110B1','двигатели'],['102 т','коммерческая загрузка']]}
};
const renderSpecs=k=>{$('specs').innerHTML=AC[k].specs.map(s=>`<div class="spec"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')};
renderSpecs('a');

/* ---------- 3D ---------- */
const T=window.THREE;
function fail(id,msg){const f=$(id);if(f)f.textContent=msg}
if(T){
  try{globe=initGlobe()}catch(e){fail('gfb','3D недоступно в этом браузере');console.error('globe',e)}
  try{three=initPlane()}catch(e){fail('fb','3D недоступно в этом браузере');console.error('plane',e)}
}else{fail('gfb','3D недоступно: библиотека не загрузилась');fail('fb','3D недоступно: библиотека не загрузилась')}
pick('HKG');

function mkRenderer(stage,fb,opts={}){const r=new T.WebGLRenderer({antialias:true,alpha:true,...opts});r.setPixelRatio(Math.min(2,devicePixelRatio||1));stage.appendChild(r.domElement);$(fb).remove();return r}
function v3(lon,lat,rad=1){const f=lat*R2,l=lon*R2;return new T.Vector3(rad*Math.cos(f)*Math.cos(l),rad*Math.sin(f),-rad*Math.cos(f)*Math.sin(l))}
function radialTex(stops,size=128){const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');const g=x.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);stops.forEach(([o,a])=>g.addColorStop(o,`rgba(255,255,255,${a})`));x.fillStyle=g;x.fillRect(0,0,size,size);return new T.CanvasTexture(c)}

function initGlobe(){
  const stage=$('globe'),rd=mkRenderer(stage,'gfb');
  const scene=new T.Scene(),cam=new T.PerspectiveCamera(30,1,.1,100);cam.position.set(0,0,4.3);
  const world=new T.Group();scene.add(world);
  // background stars
  const starM=new T.PointsMaterial({size:.035,transparent:true,opacity:.7,sizeAttenuation:true,depthWrite:false});
  {const p=[];for(let i=0;i<700;i++){const v=new T.Vector3().randomDirection?new T.Vector3().randomDirection():new T.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize();v.multiplyScalar(9+Math.random()*6);if(v.z>-2&&Math.abs(v.x)<3&&Math.abs(v.y)<3)continue;p.push(v.x,v.y,v.z)}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));var stars=new T.Points(g,starM);scene.add(stars)}
  // atmosphere glow (camera-facing sprite behind the globe)
  const glowM=new T.SpriteMaterial({map:radialTex([[0,0],[.70,0],[.775,.85],[.80,.55],[.88,.16],[1,0]],256),transparent:true,depthWrite:false});
  const glow=new T.Sprite(glowM);glow.scale.set(2.65,2.65,1);scene.add(glow);
  // globe body with fresnel rim
  const sphereM=new T.ShaderMaterial({uniforms:{uBase:{value:new T.Color()},uRim:{value:new T.Color()},uK:{value:.5}},
    vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform vec3 uBase;uniform vec3 uRim;uniform float uK;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-max(dot(vN,vV),0.),2.6);gl_FragColor=vec4(mix(uBase,uRim,clamp(f*uK,0.,1.)),1.);}'});
  const sph=new T.Mesh(new T.SphereGeometry(.995,72,54),sphereM);world.add(sph);
  // graticule
  const gratM=new T.LineBasicMaterial({transparent:true,opacity:.55});
  {const p=[];for(let lat=-60;lat<=60;lat+=30)for(let lon=0;lon<360;lon+=3){const a=v3(lon,lat,1.001),b=v3(lon+3,lat,1.001);p.push(a.x,a.y,a.z,b.x,b.y,b.z)}
   for(let lon=0;lon<360;lon+=30)for(let lat=-80;lat<80;lat+=3){const a=v3(lon,lat,1.001),b=v3(lon,lat+3,1.001);p.push(a.x,a.y,a.z,b.x,b.y,b.z)}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));world.add(new T.LineSegments(g,gratM))}
  const dotTex=radialTex([[0,1],[.55,1],[.75,.6],[1,0]],32);
  const pts=(arr,mat,rad)=>{const p=[];for(let i=0;i<arr.length;i+=2){const v=v3(arr[i+1]/10,arr[i]/10,rad);p.push(v.x,v.y,v.z)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));const m=new T.Points(g,mat);world.add(m);return m};
  const landM=new T.PointsMaterial({size:.042,map:dotTex,transparent:true,alphaTest:.25,depthWrite:false});
  const kzM=new T.PointsMaterial({size:.058,map:dotTex,transparent:true,alphaTest:.25,depthWrite:false});
  pts(GEO.dots,landM,1.003);pts(GEO.kd,kzM,1.005);
  // routes: faint base line + animated comet tube
  const SEG=72,RAD=6,TRAIL=16;
  const arcM=new T.LineBasicMaterial({transparent:true,opacity:.45});
  const pathM=new T.MeshBasicMaterial({transparent:true,opacity:.28,depthWrite:false});
  const arcs={};
  const hub=v3(CITY.KGF[1],CITY.KGF[2]);
  const pinM=new T.MeshBasicMaterial(),hubM=new T.MeshBasicMaterial(),headM=new T.MeshBasicMaterial();
  const pulseTex=radialTex([[0,0],[.6,0],[.8,1],[1,0]],64);
  ROUTES.forEach((k,idx)=>{const b=v3(CITY[k][1],CITY[k][2]);const ang=hub.angleTo(b);const p=[],curve=[];
    for(let i=0;i<=SEG;i++){const t=i/SEG;const s=Math.sin(ang),w1=Math.sin((1-t)*ang)/s,w2=Math.sin(t*ang)/s;const v=hub.clone().multiplyScalar(w1).add(b.clone().multiplyScalar(w2));
      v.multiplyScalar(1.004+ang*.18*Math.sin(Math.PI*t));p.push(v.x,v.y,v.z);curve.push(v.clone())}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));const ln=new T.Line(g,arcM);world.add(ln);
    const cc=new T.CatmullRomCurve3(curve);
    const path=new T.Mesh(new T.TubeGeometry(cc,SEG,.0032,RAD,false),pathM);path.visible=false;world.add(path);
    const trailM=new T.MeshBasicMaterial({transparent:true,opacity:.85,depthWrite:false});
    const trail=new T.Mesh(new T.TubeGeometry(cc,SEG,.0055,RAD,false),trailM);world.add(trail);
    const head=new T.Mesh(new T.SphereGeometry(.011,12,8),headM);world.add(head);
    const pm=new T.SpriteMaterial({map:pulseTex,transparent:true,depthWrite:false,opacity:0});const pulse=new T.Sprite(pm);pulse.position.copy(v3(CITY[k][1],CITY[k][2],1.01));pulse.scale.setScalar(.08);world.add(pulse);
    arcs[k]={ln,curve,path,trail,trailM,head,pulse,pm,t:idx/ROUTES.length,speed:1/(2.6+ang*2.2)}});
  for(const k in CITY){const v=v3(CITY[k][1],CITY[k][2],1.004);const m=new T.Mesh(new T.SphereGeometry(k==='KGF'?.022:.012,14,10),k==='KGF'?hubM:pinM);m.position.copy(v);world.add(m)}
  // hub: pulse ring + beam
  const ringM=new T.MeshBasicMaterial({transparent:true,side:T.DoubleSide,depthWrite:false});const ring=new T.Mesh(new T.RingGeometry(.03,.037,48),ringM);ring.position.copy(v3(CITY.KGF[1],CITY.KGF[2],1.006));ring.lookAt(0,0,0);world.add(ring);
  const ring2=ring.clone();ring2.material=ringM.clone();world.add(ring2);
  const beamM=new T.MeshBasicMaterial({transparent:true,opacity:.55,depthWrite:false});
  const beam=new T.Mesh(new T.CylinderGeometry(.0035,.0035,.22,8,1,true),beamM);beam.geometry.translate(0,.11,0);beam.position.copy(hub);beam.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),hub.clone().normalize());world.add(beam);

  const st={lon:-75,lat:32,tlon:-75,tlat:32,drag:null,idle:9,sel:'HKG'};
  function theme(){const dk=isDark();
    sphereM.uniforms.uBase.value.set(col('--card'));sphereM.uniforms.uRim.value.set(col('--acc'));sphereM.uniforms.uK.value=dk?.55:.35;
    glowM.color.set(col('--acc'));glowM.opacity=dk?.55:.35;glowM.blending=dk?T.AdditiveBlending:T.NormalBlending;glowM.needsUpdate=true;
    starM.color.set(col('--mid'));starM.opacity=dk?.8:.45;
    gratM.color.set(col('--faint'));landM.color.set(col('--mid'));kzM.color.set(col('--acc'));arcM.color.set(col('--lo'));pathM.color.set(col('--acc'));
    for(const k in arcs){arcs[k].trailM.color.set(col('--acc'));arcs[k].pm.color.set(col('--acc'))}
    pinM.color.set(col('--hi'));hubM.color.set(col('--gold'));headM.color.set(col('--lit'));ringM.color.set(col('--gold'));ring2.material.color.set(col('--gold'));beamM.color.set(col('--gold'))}
  theme();
  const rs=()=>{const w=stage.clientWidth,h=stage.clientHeight;rd.setSize(w,h,false);cam.aspect=w/h;cam.position.z=w/h<1?5.6:4.3;cam.updateProjectionMatrix()};new ResizeObserver(rs).observe(stage);
  stage.addEventListener('pointerdown',e=>{st.drag={x:e.clientX,y:e.clientY,lon:st.tlon,lat:st.tlat};stage.setPointerCapture(e.pointerId)});
  stage.addEventListener('pointermove',e=>{if(!st.drag)return;st.tlon=st.drag.lon+(e.clientX-st.drag.x)*.3;st.tlat=Math.max(-60,Math.min(70,st.drag.lat+(e.clientY-st.drag.y)*.3));st.idle=0});
  const up=()=>{st.drag=null};stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
  stage.addEventListener('keydown',e=>{const d={ArrowLeft:[8,0],ArrowRight:[-8,0],ArrowUp:[0,6],ArrowDown:[0,-6]}[e.key];if(!d)return;e.preventDefault();st.tlon+=d[0];st.tlat=Math.max(-60,Math.min(70,st.tlat+d[1]));st.idle=0});
  function focus(k){st.sel=k;for(const a in arcs){const on=a===k;arcs[a].ln.visible=!on;arcs[a].path.visible=on;arcs[a].trailM.opacity=on?1:.5}
    const mid=(CITY.KGF[1]+CITY[k][1])/2,ml=(CITY.KGF[2]+CITY[k][2])/2;
    let d=-mid-st.tlon;d=((d+180)%360+360)%360-180;st.tlon+=d;st.tlat=ml;st.idle=0}
  const IDX=RAD*6;
  function frame(dt){
    st.idle+=dt;if(!RM&&!st.drag&&st.idle>6)st.tlon-=dt*4;
    const k=RM?1:1-Math.exp(-dt*4);st.lon+=(st.tlon-st.lon)*k;st.lat+=(st.tlat-st.lat)*k;
    world.rotation.set(0,0,0);world.rotateOnWorldAxis(new T.Vector3(0,1,0),st.lon*R2-Math.PI/2);world.rotateOnWorldAxis(new T.Vector3(1,0,0),st.lat*R2);
    if(stars)stars.rotation.y=st.lon*R2*.15;
    for(const key in arcs){const a=arcs[key],on=key===st.sel;
      a.t=RM?.6:(a.t+dt*a.speed*(on?1.25:1))%1.25;
      const hh=Math.min(1,a.t)*SEG*(1+TRAIL/SEG),head=Math.min(SEG,hh),tail=Math.max(0,hh-TRAIL*(on?1.4:1));
      const s0=Math.floor(tail),s1=Math.ceil(Math.min(SEG,head));a.trail.geometry.setDrawRange(s0*IDX,Math.max(0,s1-s0)*IDX);
      a.trail.visible=a.t<1.02;a.head.visible=on&&a.t<1&&!RM;
      if(a.head.visible){const f=Math.min(SEG-1e-3,a.t*SEG),i=Math.floor(f);a.head.position.copy(a.curve[i]).lerp(a.curve[i+1],f-i)}
      const arr=a.t>1?(a.t-1)/.25:0;a.pm.opacity=arr>0?(1-arr)*(on?1:.6):0;a.pulse.scale.setScalar(.04+arr*(on?.16:.1))}
    const ph=(performance.now()/1800)%1;ring.scale.setScalar(1+ph*1.2);ringM.opacity=1-ph;const ph2=(ph+.5)%1;ring2.scale.setScalar(1+ph2*1.2);ring2.material.opacity=1-ph2;
    rd.render(scene,cam);
    const L=((Math.round(-st.lon)%360)+360)%360;$('gr').textContent=`LON ${String(L).padStart(3,'0')}° · LAT ${Math.round(st.lat)}°`;
  }
  return {frame,theme,focus,stage};
}

function initPlane(){
  const stage=$('stage'),renderer=mkRenderer(stage,'fb');
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const scene=new T.Scene(),cam=new T.PerspectiveCamera(28,1,1,1000);
  renderer.outputEncoding=T.sRGBEncoding;
  const hemi=new T.HemisphereLight(0xffffff,0x444444,.6);scene.add(hemi);
  const sun=new T.DirectionalLight(0xffffff,.8);sun.position.set(-40,80,50);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-50,right:50,top:50,bottom:-50,near:10,far:220});sun.shadow.bias=-.0006;sun.shadow.radius=4;scene.add(sun);
  const rim=new T.DirectionalLight(0xffffff,.35);rim.position.set(60,30,-70);scene.add(rim);
  const std=(o)=>new T.MeshStandardMaterial(o);
  const mats={hull:std({roughness:.38,metalness:.12}),hull2:std({roughness:.5,metalness:.1}),metal:std({roughness:.28,metalness:.75}),tyre:std({roughness:.95}),uld:std({roughness:.4,metalness:.6}),acc:std({roughness:.35,metalness:.2}),gold:std({roughness:.35,metalness:.4}),
    floor:new T.MeshBasicMaterial({transparent:true,depthWrite:false}),dark:new T.MeshBasicMaterial(),glass:std({roughness:.15,metalness:.6})};
  const edge=new T.LineBasicMaterial({transparent:true,opacity:.55}),edgeLit=new T.LineBasicMaterial(),tick=new T.LineBasicMaterial(),tickMaj=new T.LineBasicMaterial(),tickAcc=new T.LineBasicMaterial();
  const ring=new T.Group();scene.add(ring);const R=48;
  const outer=new T.Group();ring.add(outer);
  {const g=new T.CircleGeometry(R+4,128);g.rotateX(-Math.PI/2);const m=new T.Mesh(g,mats.floor);m.position.y=-.02;ring.add(m);
   const lp=[],lm=[],la=[];for(let a=0;a<360;a+=5){const maj=a%30===0,r0=R+(maj?-3:-1.4),c=Math.cos(a*R2),s=Math.sin(a*R2);(maj?lm:lp).push(r0*c,0,r0*s,R*c,0,R*s)}
   for(let a=0;a<360;a+=1.5){if((a%90)>12)continue;const c=Math.cos(a*R2),s=Math.sin(a*R2);la.push((R+1)*c,0,(R+1)*s,(R+3)*c,0,(R+3)*s)}
   const mk=(arr,mat,Ln=T.LineSegments,parent=ring)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(arr,3));parent.add(new Ln(g,mat))};
   mk(lp,tick);mk(lm,tickMaj);mk(la,tickAcc,T.LineSegments,outer);const c1=[],c2=[];for(let a=0;a<=360;a+=2){c1.push(R*Math.cos(a*R2),0,R*Math.sin(a*R2));c2.push((R+4)*Math.cos(a*R2),0,(R+4)*Math.sin(a*R2))}mk(c1,tickMaj,T.Line);mk(c2,tick,T.Line)}
  const shadowM=new T.ShadowMaterial({opacity:.25});const shadowFloor=new T.Mesh(new T.PlaneGeometry(220,220),shadowM);shadowFloor.rotation.x=-Math.PI/2;shadowFloor.position.y=.01;shadowFloor.receiveShadow=true;ring.add(shadowFloor);
  const glowTex=radialTex([[0,1],[.2,.8],[.5,.18],[1,0]],64);
  const withEdges=(mesh,mat=edge,ang=28)=>{mesh.add(new T.LineSegments(new T.EdgesGeometry(mesh.geometry,ang),mat));return mesh};
  let plane=null,door=null,ulds=[],spec=null,fans=[],lights=[];
  const lathe=(pts,seg=48)=>new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg);
  function wing(root,tip,semi,sweep,th,side,dih,mat=mats.hull){const s=new T.Shape(),off=semi*Math.tan(sweep*R2);s.moveTo(0,0);s.lineTo(-off,semi);s.lineTo(-off-tip,semi);s.lineTo(-root,0);s.lineTo(0,0);
    const g=new T.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:th*.35,bevelSize:th*.3,bevelSegments:2});g.translate(0,0,-th/2);g.rotateX(Math.PI/2*side);
    const m=withEdges(new T.Mesh(g,mat));m.rotation.x=-side*dih*R2;return m}
  function navLight(color,pos,kind){const m=new T.Mesh(new T.SphereGeometry(.28,10,8),new T.MeshBasicMaterial({color}));m.position.copy(pos);
    const sp=new T.Sprite(new T.SpriteMaterial({map:glowTex,color,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));sp.scale.setScalar(kind==='strobe'?3.2:2.4);m.add(sp);plane.add(m);lights.push({m,sp,kind});return m}
  function build(k){
    if(plane){ring.remove(plane);plane.traverse(o=>{o.geometry&&o.geometry.dispose()})}
    fans=[];lights=[];
    spec=AC[k];const{L,D,span,eng,engD,sweep}=spec,r=D/2;plane=new T.Group();ring.add(plane);
    const tailL=r*4.2,noseL=r*2.1,pts=[[.001,0]];
    for(let i=1;i<=14;i++){const t=i/14;pts.push([r*(.16+.84*Math.sin(t*Math.PI/2)),tailL*t])}
    pts.push([r,L-noseL]);for(let i=1;i<=16;i++){const t=i/16;pts.push([r*Math.pow(Math.max(0,1-t*t),.55)+.001,L-noseL+noseL*t])}
    const fg=lathe(pts,64);fg.rotateZ(-Math.PI/2);fg.translate(-L/2,0,0);
    const fus=withEdges(new T.Mesh(fg,mats.hull),edge,40);fus.position.y=r+3.4;plane.add(fus);const y0=fus.position.y;
    // livery: accent cheatline + gold pinstripe
    const bodyLen=L-noseL-tailL;
    const stripe=new T.Mesh(new T.CylinderGeometry(r*1.004,r*1.004,bodyLen,64,1,true,Math.PI*.62,Math.PI*.05),mats.acc);stripe.rotation.z=Math.PI/2;stripe.position.set((tailL-noseL)/2,y0,0);plane.add(stripe);
    const stripe2=stripe.clone();stripe2.rotation.x=Math.PI;plane.add(stripe2);
    const pin=new T.Mesh(new T.CylinderGeometry(r*1.005,r*1.005,bodyLen,64,1,true,Math.PI*.69,Math.PI*.012),mats.gold);pin.rotation.z=Math.PI/2;pin.position.copy(stripe.position);plane.add(pin);
    const pin2=pin.clone();pin2.rotation.x=Math.PI;plane.add(pin2);
    const belly=withEdges(new T.Mesh(new T.SphereGeometry(1,40,14),mats.hull2),edge,60);belly.scale.set(L*.17,r*.42,r*.95);belly.position.set(L*.02,y0-r*.68,0);plane.add(belly);
    // cockpit glazing
    for(const s of[-1,1]){const w=new T.Mesh(new T.BoxGeometry(r*.55,r*.2,.1),mats.glass);w.position.set(L/2-noseL*.62,y0+r*.4,s*r*.55);w.rotation.y=s*.55;w.rotation.x=-s*.25;plane.add(w)}
    const semi=span/2-r,root=L*.15,tip=root*.22,le=L*.06;
    [1,-1].forEach(side=>{const w=wing(root,tip,semi,sweep,.9,side,5.5);w.position.set(le,y0-r*.55,side*r*.8);plane.add(w);
      const off=semi*Math.tan(sweep*R2);const wl=withEdges(new T.Mesh(new T.BoxGeometry(tip*.9,2.6,.18),mats.acc));
      const wlp=new T.Vector3(le-off-tip*.5,y0-r*.55+semi*Math.sin(5.5*R2)+1.3,side*(r*.8+semi*Math.cos(5.5*R2)));wl.position.copy(wlp);wl.rotation.z=.35;plane.add(wl);
      navLight(side<0?0xff3b30:0x30d158,new T.Vector3(wlp.x+tip*.3,wlp.y-1.3,wlp.z+side*.3),'nav');
      navLight(0xffffff,new T.Vector3(wlp.x-tip*.5,wlp.y-1.2,wlp.z+side*.3),'strobe');
      (eng===4?[.33,.63]:[.34]).forEach(f=>{const s=semi*f,xle=le-s*Math.tan(sweep*R2),er=engD/2,el=engD*(eng===4?2.1:1.75);
        const n=lathe([[er*.86,0],[er,el*.12],[er*1.04,el*.4],[er*.95,el*.85],[er*.62,el],[er*.3,el*1.12],[.001,el*1.2]],40);n.rotateZ(Math.PI/2);
        const yy=y0-r*.55+s*Math.sin(5.5*R2)-er*1.15,zz=side*(r*.8+s),fx=xle+el*.55;
        const nm=withEdges(new T.Mesh(n,mats.hull2),edge,35);nm.position.set(fx,yy,zz);plane.add(nm);
        const lip=new T.Mesh(new T.TorusGeometry(er*.93,er*.07,8,40),mats.metal);lip.rotation.y=Math.PI/2;lip.position.set(fx,yy,zz);plane.add(lip);
        const disc=new T.Mesh(new T.CircleGeometry(er*.86,40),mats.dark);disc.rotation.y=Math.PI/2;disc.position.set(fx-.45,yy,zz);plane.add(disc);
        const fan=new T.Group();fan.position.set(fx-.3,yy,zz);const nb=eng===4?20:22;
        for(let i=0;i<nb;i++){const b=new T.Mesh(new T.BoxGeometry(.06,er*.72,er*.22),mats.metal);b.position.y=er*.46;const piv=new T.Group();piv.rotation.x=i/nb*Math.PI*2;b.rotation.y=.55;piv.add(b);fan.add(piv)}
        plane.add(fan);fans.push(fan);
        const sp=withEdges(new T.Mesh(new T.ConeGeometry(er*.26,er*.55,24),mats.metal),edge,40);sp.rotation.z=-Math.PI/2;sp.position.set(fx-.05,yy,zz);plane.add(sp);
        const py=withEdges(new T.Mesh(new T.BoxGeometry(el*.75,er*.9,.35),mats.hull2));py.position.set(xle-el*.05,yy+er*.95,zz);plane.add(py)});
      const hs=wing(L*.075,L*.03,span*.165,34,.5,side,6);hs.position.set(-L/2+L*.13,y0+r*.25,side*r*.3);plane.add(hs)});
    {const s=new T.Shape(),h=spec.H-y0-r*.6,c=L*.13,off=h*Math.tan(40*R2);s.moveTo(0,0);s.lineTo(-off,h);s.lineTo(-off-c*.38,h);s.lineTo(-c*1.05,0);s.lineTo(0,0);
     const g=new T.ExtrudeGeometry(s,{depth:.6,bevelEnabled:true,bevelThickness:.2,bevelSize:.2,bevelSegments:2});g.translate(0,0,-.3);
     const fin=withEdges(new T.Mesh(g,mats.hull));fin.position.set(-L/2+L*.2,y0+r*.35,0);plane.add(fin);
     // tail logo: globe ring, Alatau peaks and flight arc in livery colours
     const u=c*.12,cxL=-L/2+L*.2-off*.55-u*2,cyL=y0+r*.35+h*.5;
     const peaks=new T.Shape();peaks.moveTo(-u*2.2,-u*.9);peaks.lineTo(-u*1.1,u*.1);peaks.lineTo(-u*.5,-u*.3);peaks.lineTo(u*.4,u*1.2);peaks.lineTo(u*1.3,u*.1);peaks.lineTo(u*1.7,u*.4);peaks.lineTo(u*2.2,-u*.9);peaks.lineTo(-u*2.2,-u*.9);
     const ringS=new T.Shape();ringS.absarc(0,0,u*2.5,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,u*2.25,0,Math.PI*2,true);ringS.holes.push(hole);
     const arcS=new T.Shape();{const a0=Math.PI*.95,a1=Math.PI*.2;for(let i=0;i<=20;i++){const a=a0+(a1-a0)*i/20;const x=Math.cos(a)*u*1.7,y=Math.sin(a)*u*1.2+u*.5;i?arcS.lineTo(x,y):arcS.moveTo(x,y)}for(let i=20;i>=0;i--){const a=a0+(a1-a0)*i/20;arcS.lineTo(Math.cos(a)*u*1.7*.9,Math.sin(a)*u*1.2*.86+u*.5)}}
     for(const sd of[1,-1]){const grp=new T.Group();grp.position.set(cxL,cyL,sd*.53);if(sd<0)grp.rotation.y=Math.PI;
       grp.add(new T.Mesh(new T.ShapeGeometry(ringS,40),mats.acc));grp.add(new T.Mesh(new T.ShapeGeometry(peaks),mats.acc));const ar=new T.Mesh(new T.ShapeGeometry(arcS),mats.gold);ar.position.z=.01;grp.add(ar);plane.add(grp)}
     navLight(0xffffff,new T.Vector3(-L/2+.2,y0+r*.2,0),'strobe')}
    navLight(0xff3b30,new T.Vector3(L*.05,y0+r+.15,0),'beacon');
    const wheel=(x,z,n,rows,wr=.62)=>{const g=new T.Group();for(let a=0;a<rows;a++)for(let b=0;b<n;b++){const w=new T.Mesh(new T.CylinderGeometry(wr,wr,.5,24),mats.tyre);w.rotation.x=Math.PI/2;w.position.set(a*1.5-(rows-1)*.75,wr,(b-(n-1)/2)*1.15);g.add(withEdges(w,edge,40))}
      const st=new T.Mesh(new T.CylinderGeometry(.18,.18,y0-r-wr+.6,10),mats.metal);st.position.y=wr+(y0-r-wr)/2+.3;g.add(st);g.position.set(x,0,z);plane.add(g)};
    wheel(L/2-noseL*1.4,0,2,1,.5);wheel(le-root*.75,r*1.25,2,eng===2?3:2);wheel(le-root*.75,-r*1.25,2,eng===2?3:2);if(eng===4)wheel(le-root*.68,0,2,2);
    const dw=3.6,dh=2.6,dx=L/2-noseL-6;
    door=new T.Group();door.position.set(dx,y0+r*.55,-r*.92);plane.add(door);
    const dm=new T.Mesh(new T.BoxGeometry(dw,dh,.22),mats.hull2);dm.position.y=-dh/2;door.add(withEdges(dm,edgeLit,5));
    const fr=new T.Mesh(new T.PlaneGeometry(dw*.98,dh*.98),mats.dark);fr.position.set(dx,y0+r*.55-dh/2,-r*.9);fr.rotation.y=Math.PI;fr.visible=false;plane.add(fr);door.userData.frame=fr;
    const loader=new T.Group();loader.position.set(dx,0,-r-4.2);plane.add(loader);
    const deck=withEdges(new T.Mesh(new T.BoxGeometry(4.2,.4,5.2),mats.metal));deck.position.y=door.position.y-dh-.2;loader.add(deck);
    const base=withEdges(new T.Mesh(new T.BoxGeometry(5,1,6.4),mats.hull2));base.position.y=.5;loader.add(base);
    for(const s of[-1,1]){const len=Math.hypot(deck.position.y-1,4.4),sc=withEdges(new T.Mesh(new T.BoxGeometry(.18,len,.18),mats.metal));sc.position.set(s*1.4,(deck.position.y+1)/2,0);sc.rotation.x=Math.atan2(4.4,deck.position.y-1);loader.add(sc);const s2=sc.clone();s2.rotation.x*=-1;loader.add(s2)}
    const cab=withEdges(new T.Mesh(new T.BoxGeometry(2.2,2.2,2),mats.hull));cab.position.set(0,2.1,-3.8);loader.add(cab);
    const lamp=new T.Mesh(new T.SphereGeometry(.22,8,6),new T.MeshBasicMaterial({color:0xffb020}));lamp.position.set(0,3.35,-3.8);loader.add(lamp);
    const lsp=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xffb020,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));lsp.scale.setScalar(2.2);lamp.add(lsp);lights.push({m:lamp,sp:lsp,kind:'amber'});
    ulds=[];for(let i=0;i<8;i++){const u=withEdges(new T.Mesh(new T.BoxGeometry(2.4,1.6,2.9),mats.uld));const pal=withEdges(new T.Mesh(new T.BoxGeometry(2.5,.12,3.05),mats.metal));pal.position.y=-.82;u.add(pal);
      const band=new T.Mesh(new T.BoxGeometry(2.42,.22,2.92),i%3===1?mats.gold:mats.acc);band.position.y=.35;u.add(band);plane.add(u);ulds.push(u)}
    plane.traverse(o=>{if(o.isMesh&&!(o.material&&o.material.blending===T.AdditiveBlending)&&o.material!==mats.dark){o.castShadow=true}});
    $('f1title').textContent=`${spec.name} · поворотный стол`;renderSpecs(k);
    st.door=0;st.target=0;st.load=0;$('bDoor').textContent='Открыть люк и загрузить';theme();place(0);
  }
  function place(load){const r=spec.D/2,dx=door.position.x,deckY=door.position.y-1.8,zq=-r-4.2,zb=zq-3.8;
    ulds.forEach((u,i)=>{const p=Math.max(0,Math.min(1,load-i));let x,y,z;const qx=dx-6-i*2.8,qz=zq-6;
      if(p<.4){const t=p/.4,e=t*t*(3-2*t);x=qx+(dx-qx)*e;y=.9;z=qz+(zb-qz)*e}else if(p<.6){const t=(p-.4)/.2,e=t*t*(3-2*t);x=dx;z=zb;y=.9+(deckY-.9)*e}else{const t=(p-.6)/.4,e=t*t*(3-2*t);x=dx;y=deckY;z=zb+(-r*.2-zb)*e}
      u.position.set(x,y,z);u.visible=p<.98})}
  const VIEWS=[['облёт',null,null],['сбоку',-Math.PI/2,.12],['сверху',-.75,1.25],['спереди',0,.18],['ракурс 3/4',-.75,.38]];let view=0;
  const st={az:-.75,el:.38,taz:-.75,tel:.38,dist:1,intro:0,door:0,target:0,load:0,idle:0,drag:null};
  const lin=(c,v)=>c.set(col(v)).convertSRGBToLinear();
  function theme(){lin(mats.hull.color,'--hull');lin(mats.hull2.color,'--hull2');lin(mats.metal.color,'--metal');lin(mats.tyre.color,'--tyre');lin(mats.uld.color,'--metal');lin(mats.acc.color,'--acc');lin(mats.gold.color,'--gold');lin(mats.glass.color,'--s0');
    lin(mats.floor.color,'--s2');mats.floor.opacity=.85;lin(mats.dark.color,'--s0');lin(edge.color,'--mid');lin(edgeLit.color,'--acc');lin(tick.color,'--lo');lin(tickMaj.color,'--mid');lin(tickAcc.color,'--acc');
    const dk=isDark();hemi.intensity=dk?.55:.75;sun.intensity=dk?.85:.6;rim.intensity=dk?.5:.25;shadowM.opacity=dk?.55:.22;}
  const rs=()=>{const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();st.dist=w<600?1.35:1};new ResizeObserver(rs).observe(stage);
  stage.addEventListener('pointerdown',e=>{st.drag={x:e.clientX,y:e.clientY,az:st.taz,el:st.tel};stage.setPointerCapture(e.pointerId)});
  stage.addEventListener('pointermove',e=>{if(!st.drag)return;st.taz=st.drag.az-(e.clientX-st.drag.x)*.008;st.tel=Math.max(.06,Math.min(1.35,st.drag.el+(e.clientY-st.drag.y)*.005));st.idle=0});
  const up=()=>{st.drag=null;st.idle=0};stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
  stage.addEventListener('keydown',e=>{const d={ArrowLeft:[.12,0],ArrowRight:[-.12,0],ArrowUp:[0,-.06],ArrowDown:[0,.06]}[e.key];if(!d)return;e.preventDefault();st.taz+=d[0];st.tel=Math.max(.06,Math.min(1.35,st.tel+d[1]));st.idle=0});
  const choose=k=>{$('bA').setAttribute('aria-pressed',k==='a');$('bB').setAttribute('aria-pressed',k==='b');build(k)};
  $('bA').onclick=()=>choose('a');$('bB').onclick=()=>choose('b');
  $('bDoor').onclick=()=>{if(st.target===0){st.target=1;$('bDoor').textContent='Закрыть люк'}else{st.target=0;$('bDoor').textContent='Открыть люк и загрузить'}};
  $('bView').onclick=()=>{view=(view+1)%VIEWS.length;const v=VIEWS[view];$('bView').textContent='Вид: '+v[0];if(v[1]!==null){let d=v[1]-st.taz;d=Math.atan2(Math.sin(d),Math.cos(d));st.taz+=d;st.tel=v[2]}st.idle=view?-1e9:0};
  build('a');
  let time=0;
  function frame(dt){time+=dt;st.idle+=dt;if(!RM&&!st.drag&&st.idle>3)st.taz-=dt*.12;
    const k=RM?1:1-Math.exp(-dt*3.5);st.az+=(st.taz-st.az)*k;st.el+=(st.tel-st.el)*k;
    st.intro=RM?1:Math.min(1,st.intro+dt*.45);const ie=1-Math.pow(1-st.intro,3);
    st.door+=(st.target-st.door)*(1-Math.exp(-dt*(RM?60:3.2)));
    if(st.target===1&&st.door>.95)st.load=Math.min(8,st.load+dt*(RM?99:.7));if(st.target===0)st.load=0;
    door.rotation.x=st.door*1.6;door.userData.frame.visible=st.door>.02;place(st.load);
    if(!RM)fans.forEach(f=>f.rotation.x+=dt*(2.2+st.door*0));
    outer.rotation.y=RM?0:time*.05;
    for(const l of lights){let on=1;const ph=time%1.3;
      if(l.kind==='strobe')on=(ph<.06||(ph>.16&&ph<.22))?1:0;else if(l.kind==='beacon')on=.25+.75*Math.max(0,Math.sin(time*5.2));else if(l.kind==='amber')on=.4+.6*Math.max(0,Math.sin(time*7));
      if(RM)on=1;l.sp.material.opacity=on;l.m.visible=l.kind!=='strobe'||on>0}
    const dd=spec.span*1.85*st.dist*(1+.6*(1-ie));const el=st.el+.5*(1-ie);
    cam.position.set(Math.cos(st.az)*Math.cos(el)*dd,Math.sin(el)*dd+2,Math.sin(st.az)*Math.cos(el)*dd);cam.lookAt(0,spec.H*.3,0);
    renderer.render(scene,cam);
    const az=((Math.round(-st.az/R2)%360)+360)%360;$('r1').textContent=`AZ ${String(az).padStart(3,'0')}° · ЛЮК ${Math.round(st.door*92)}° · ULD ${Math.floor(st.load)}/8`}
  return {frame,theme,stage};
}

/* ---------- cargo calculator ---------- */
const ccTo=$('ccTo');ccTo.innerHTML=ROUTES.map(k=>`<option value="${k}">${CITY[k][0]} (${k})</option>`).join('');
const ccIn=['ccN','ccW','ccL','ccB','ccH'].map($);
let ccLast=null;
function calc(){
  const [n,w,l,b,h]=ccIn.map(i=>Math.max(0,parseFloat(String(i.value).replace(',','.'))||0));
  const act=n*w,m3=n*l*b*h/1e6,vol=n*l*b*h/6000,ch=Math.max(act,vol),den=m3?act/m3:0;
  const pmc=ch?Math.max(1,Math.ceil(Math.max(m3/11,act/6800)-1e-9)):0,to=ccTo.value;
  $('oAct').textContent=fmt(act,1);$('oVol').textContent=fmt(vol,1);$('oM3').textContent=fmt(m3,2);$('oDen').textContent=fmt(den);$('oPmc').textContent=pmc;$('oCh').textContent=fmt(Math.ceil(ch*2)/2,1);
  $('oFly').textContent=hm(flyH(to));$('oFlyL').textContent=`в воздухе KGF → ${to}`;
  const volumetric=vol>act;$('oChL').textContent=volumetric?'платный вес, кг — по объёму':'платный вес, кг — по факту';
  $('oBar').style.width=Math.min(100,den/334*100)+'%';
  $('oNote').textContent=!act&&!vol?'':volumetric?`Груз «лёгкий»: плотность ${fmt(den)} кг/м³ ниже 167 кг/м³, поэтому тариф считается по объёму. Плотная упаковка снизит платный вес.`:`Груз «тяжёлый»: плотность ${fmt(den)} кг/м³ выше 167 кг/м³, тариф считается по фактическому весу.`;
  ccLast={n,act,m3,ch,to};
}
[...ccIn,ccTo].forEach(i=>i.addEventListener('input',calc));calc();
$('ccSend').addEventListener('click',()=>{if(!ccLast)return;const f=$('reqForm');
  f.weight.value=`${ccLast.n} мест, ${fmt(ccLast.act,1)} кг, ${fmt(ccLast.m3,2)} м³ (платный ${fmt(ccLast.ch,1)} кг)`;
  if(!f.to.value)f.to.value=CITY[ccLast.to][0];if(!f.from.value)f.from.value='';
  document.getElementById('contact').scrollIntoView({behavior:RM?'auto':'smooth'});setTimeout(()=>f.name.focus({preventScroll:true}),RM?0:700)});

/* ---------- request form ---------- */
$('reqForm').addEventListener('submit',e=>{e.preventDefault();const f=e.target,hint=$('reqHint');
  const bad=[...f.querySelectorAll('[required]')].find(i=>!i.value.trim()||(i.type==='email'&&!/^\S+@\S+\.\S+$/.test(i.value)));
  if(bad){hint.className='hint';hint.textContent=bad.type==='email'?'Проверьте e-mail.':'Заполните имя и e-mail.';bad.focus();return}
  const v=n=>f[n].value.trim();
  const body=[`Имя: ${v('name')}`,`Компания: ${v('company')}`,`E-mail: ${v('email')}`,`Телефон: ${v('phone')}`,`Маршрут: ${v('from')||'—'} → ${v('to')||'—'}`,`Тип груза: ${v('type')}`,`Вес / объём: ${v('weight')||'—'}`,'',v('msg')].join('\n');
  location.href=`mailto:${CONFIG.email}?subject=${encodeURIComponent('Запрос на перевозку — '+(v('company')||v('name')))}&body=${encodeURIComponent(body)}`;
  hint.className='ok';hint.textContent='Письмо подготовлено в почтовой программе. Спасибо!'});

/* ---------- starfield for the «Ночь» background ---------- */
const sc=$('stars'),sx=sc.getContext('2d');let stars=[],shoot=null;
function sizeStars(){const d=Math.min(2,devicePixelRatio||1);sc.width=innerWidth*d;sc.height=innerHeight*d;sx.setTransform(d,0,0,d,0,0);
  stars=Array.from({length:Math.round(innerWidth*innerHeight/4200)},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.1+.2,p:Math.random()*6.28,s:.5+Math.random()*1.5}))}
sizeStars();addEventListener('resize',sizeStars);
function starTick(now){if(document.documentElement.dataset.bg!=='night')return;const t=now/1000;sx.clearRect(0,0,innerWidth,innerHeight);
  for(const s of stars){const a=RM?.7:.35+.65*(.5+.5*Math.sin(t*s.s+s.p));sx.globalAlpha=a;sx.fillStyle='#dfe9ff';sx.beginPath();sx.arc(s.x,s.y,s.r,0,6.283);sx.fill()}
  if(!RM){if(!shoot&&Math.random()<.004)shoot={x:Math.random()*innerWidth*.7,y:Math.random()*innerHeight*.4,l:0};
    if(shoot){shoot.l+=12;const g=sx.createLinearGradient(shoot.x,shoot.y,shoot.x+shoot.l,shoot.y+shoot.l*.4);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,.9)');sx.globalAlpha=1;sx.strokeStyle=g;sx.lineWidth=1.2;sx.beginPath();sx.moveTo(shoot.x,shoot.y);sx.lineTo(shoot.x+shoot.l,shoot.y+shoot.l*.4);sx.stroke();if(shoot.l>260)shoot=null}}
  sx.globalAlpha=1}

/* ---------- loop ---------- */
const vis=new Map();
const io=new IntersectionObserver(es=>es.forEach(e=>vis.set(e.target,e.isIntersecting)),{rootMargin:'120px'});
[globe&&globe.stage,three&&three.stage,wm].forEach(el=>{if(el){vis.set(el,true);io.observe(el)}});
let last=performance.now();
function loop(now){const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=Math.max(last,now);
  if(!document.hidden){
    if(globe&&vis.get(globe.stage))globe.frame(dt);
    if(three&&vis.get(three.stage))three.frame(dt);
    if(!RM&&vis.get(wm))mapTick(dt);
    starTick(now)}
  requestAnimationFrame(loop)}
if(RM)mapTick(.5);
requestAnimationFrame(loop);
const retheme=()=>{globe&&globe.theme();three&&three.theme();
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=col('--page')};
addEventListener('bgchange',()=>requestAnimationFrame(retheme));
retheme();
}
