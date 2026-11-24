/* Alatau Air Cargo — смена фона сайта.
   Подключается в <head> без defer: применяет сохранённый фон до отрисовки страницы.
   Состояние хранится в localStorage (только у этого посетителя). */
(function(){
  'use strict';
  var KEY='aac-bg', IMG='aac-bg-img';
  var root=document.documentElement;
  var PRESETS=[
    {id:'auto',      name:'Авто',      tone:null,   page:'linear-gradient(135deg,#f2f2ef 50%,#0b0b0b 50%)', card:'#888',   acc:'#3fc6de'},
    {id:'graphite',  name:'Графит',    tone:'dark', page:'#0b0b0b', card:'#1c1c1c', acc:'#3fc6de'},
    {id:'paper',     name:'Бумага',    tone:'light',page:'#f2f2ef', card:'#ffffff', acc:'#0090ad'},
    {id:'night',     name:'Ночь',      tone:'dark', page:'radial-gradient(circle at 70% 20%,#1d3a7a,#050a16 60%)', card:'#13203a', acc:'#45d3f0'},
    {id:'steppe',    name:'Степь',     tone:'light',page:'radial-gradient(circle at 85% 5%,#f6c87a,#efe7d8 55%)', card:'#fffaf1', acc:'#00809a'},
    {id:'blueprint', name:'Чертёж',    tone:'dark', page:'repeating-linear-gradient(0deg,#ffffff14 0 1px,transparent 1px 8px),repeating-linear-gradient(90deg,#ffffff14 0 1px,transparent 1px 8px),#0b2440', card:'#153a60', acc:'#7fe3ff'},
    {id:'aurora',    name:'Аврора',    tone:'dark', page:'radial-gradient(circle at 20% 20%,#14b8a6aa,transparent 50%),radial-gradient(circle at 80% 60%,#6d4affaa,transparent 50%),#07080d', card:'#1a1d29', acc:'#5ef0c8'}
  ];
  var CUSTOM_KEYS=['--page','--card','--s0','--s2','--top','--faint','--lo','--mid','--sea','--land','--hull','--hull2','--metal','--text','--strong','--muted','--hi','--acc','--acc-ink'];
  var mq=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):{matches:false,addEventListener:function(){}};

  function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  function loadImg(){try{return localStorage.getItem(IMG)}catch(e){return null}}
  function saveImg(d){try{if(d)localStorage.setItem(IMG,d);else localStorage.removeItem(IMG);return true}catch(e){return false}}

  /* --- colour helpers --- */
  function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(function(c){return c+c}).join('');var n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]}
  function rgb2hex(r){return '#'+r.map(function(v){return ('0'+Math.round(Math.max(0,Math.min(255,v))).toString(16)).slice(-2)}).join('')}
  function mix(a,b,t){var x=hex2rgb(a),y=hex2rgb(b);return rgb2hex([0,1,2].map(function(i){return x[i]+(y[i]-x[i])*t}))}
  function lum(h){var c=hex2rgb(h).map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
  function hue(h,s,l){/* hsl→hex */s/=100;l/=100;var k=function(n){return (n+h/30)%12},a=s*Math.min(l,1-l),f=function(n){return l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)))};return rgb2hex([f(0)*255,f(8)*255,f(4)*255])}
  function rgb2hsl(hx){var r=hex2rgb(hx).map(function(v){return v/255}),mx=Math.max.apply(null,r),mn=Math.min.apply(null,r),h=0,s=0,l=(mx+mn)/2;if(mx!==mn){var d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r[0]?(r[1]-r[2])/d+(r[1]<r[2]?6:0):mx===r[1]?(r[2]-r[0])/d+2:(r[0]-r[1])/d+4;h*=60}return [h,s*100,l*100]}

  function customPalette(c){
    var dark=lum(c)<.18, W='#ffffff', K='#000000', p={};
    var hsl=rgb2hsl(c), acc=dark?hue((hsl[0]+180)%360,Math.max(60,hsl[1]),62):hue((hsl[0]+180)%360,Math.max(70,hsl[1]),32);
    if(Math.abs(((hsl[0]+180)%360)-190)<70||hsl[1]<12)acc=dark?'#3fc6de':'#0090ad';
    if(dark){p={'--page':c,'--card':mix(c,W,.05),'--s0':mix(c,K,.25),'--s2':mix(c,W,.08),'--top':mix(c,W,.12),'--faint':mix(c,W,.12),'--lo':mix(c,W,.22),'--mid':mix(c,W,.4),'--sea':mix(c,K,.12),'--land':mix(c,W,.13),'--hull':mix(c,W,.2),'--hull2':mix(c,W,.13),'--metal':mix(c,W,.27),'--text':mix(c,W,.66),'--strong':mix(c,W,.94),'--muted':mix(c,W,.45),'--hi':mix(c,W,.84),'--acc':acc,'--acc-ink':mix(c,K,.6)}}
    else{p={'--page':c,'--card':mix(c,W,.55),'--s0':mix(c,K,.08),'--s2':mix(c,W,.3),'--top':mix(c,W,.8),'--faint':mix(c,K,.1),'--lo':mix(c,K,.24),'--mid':mix(c,K,.42),'--sea':mix(c,W,.45),'--land':mix(c,K,.07),'--hull':mix(c,W,.75),'--hull2':mix(c,K,.05),'--metal':mix(c,K,.16),'--text':mix(c,K,.66),'--strong':mix(c,K,.9),'--muted':mix(c,K,.46),'--hi':mix(c,K,.84),'--acc':acc,'--acc-ink':'#ffffff'}}
    return {tone:dark?'dark':'light',vars:p};
  }

  function clearCustom(){CUSTOM_KEYS.forEach(function(k){root.style.removeProperty(k)})}

  var state=load();
  function apply(s,quiet){
    s=s||state;state=s;
    var bg=s.bg||'auto';
    clearCustom();
    root.style.removeProperty('--bg-image');
    if(bg==='custom'&&s.color){var cp=customPalette(s.color);root.dataset.tone=cp.tone;for(var k in cp.vars)root.style.setProperty(k,cp.vars[k])}
    else if(bg==='image'){var img=loadImg();if(!img){bg='auto';s.bg='auto'}else{root.style.setProperty('--bg-image','url("'+img+'")');root.style.setProperty('--dim',String((s.dim==null?55:s.dim)/100));root.dataset.tone=s.imgTone||'dark'}}
    if(bg==='auto'){root.dataset.tone=mq.matches?'dark':'light'}
    else if(bg!=='custom'&&bg!=='image'){var pr=PRESETS.filter(function(p){return p.id===bg})[0];if(!pr){bg='auto';root.dataset.tone=mq.matches?'dark':'light'}else root.dataset.tone=pr.tone}
    root.dataset.bg=bg;
    if(!quiet)window.dispatchEvent(new CustomEvent('bgchange',{detail:{bg:bg,tone:root.dataset.tone}}));
  }
  apply(state,true);
  mq.addEventListener&&mq.addEventListener('change',function(){if((state.bg||'auto')==='auto')apply(state)});

  /* --- image helpers: downscale and measure brightness --- */
  function readImage(file,cb){
    var fr=new FileReader();
    fr.onload=function(){var im=new Image();im.onload=function(){
      var max=1920,sc=Math.min(1,max/Math.max(im.width,im.height)),w=Math.round(im.width*sc),h=Math.round(im.height*sc);
      var cv=document.createElement('canvas');cv.width=w;cv.height=h;var x=cv.getContext('2d');x.drawImage(im,0,0,w,h);
      var sm=document.createElement('canvas');sm.width=sm.height=24;var sx=sm.getContext('2d');sx.drawImage(im,0,0,24,24);
      var d=sx.getImageData(0,0,24,24).data,L=0;for(var i=0;i<d.length;i+=4)L+=(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2])/255;L/=d.length/4;
      var q=.82,url=cv.toDataURL('image/jpeg',q);
      while(url.length>1.6e6&&q>.4){q-=.12;url=cv.toDataURL('image/jpeg',q)}
      cb(url,L>.55?'light':'dark')};im.onerror=function(){cb(null)};im.src=fr.result};
    fr.onerror=function(){cb(null)};fr.readAsDataURL(file);
  }

  /* built-in photo-free backgrounds generated on the fly (no external files) */
  function genScene(kind){
    var w=1600,h=1000,cv=document.createElement('canvas');cv.width=w;cv.height=h;var x=cv.getContext('2d'),g;
    if(kind==='dusk'){g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0f1c3d');g.addColorStop(.55,'#c4567a');g.addColorStop(.78,'#f3a65a');g.addColorStop(1,'#2a1630');}
    else if(kind==='dawn'){g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#bfe3f2');g.addColorStop(.6,'#f6e2c6');g.addColorStop(1,'#d9b98f');}
    else if(kind==='storm'){g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#1c2530');g.addColorStop(.6,'#3b4b5c');g.addColorStop(1,'#11161c');}
    else {g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#04060c');g.addColorStop(.7,'#0b1f3a');g.addColorStop(1,'#123a5a');}
    x.fillStyle=g;x.fillRect(0,0,w,h);
    if(kind==='night'||kind==='storm'){for(var i=0;i<(kind==='night'?700:120);i++){x.fillStyle='rgba(255,255,255,'+(Math.random()*.8)+')';x.fillRect(Math.random()*w,Math.random()*h*.7,Math.random()<.1?2:1,Math.random()<.1?2:1)}}
    var sunY=kind==='dusk'?h*.66:kind==='dawn'?h*.5:h*.2;
    if(kind!=='storm'){var sg=x.createRadialGradient(w*.72,sunY,0,w*.72,sunY,kind==='night'?60:260);sg.addColorStop(0,kind==='night'?'rgba(230,240,255,.95)':'rgba(255,236,190,.95)');sg.addColorStop(kind==='night'?.25:.12,kind==='night'?'rgba(230,240,255,.85)':'rgba(255,220,150,.7)');sg.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=sg;x.fillRect(0,0,w,h)}
    /* mountain ranges (Alatau) */
    var layers=kind==='dawn'?['#a9b8c4','#7f93a3','#566a7a']:kind==='dusk'?['#6a3a5e','#47284a','#2a1630']:kind==='storm'?['#3a4652','#26303a','#141a20']:['#16324f','#0d2238','#060f1c'];
    layers.forEach(function(c,li){x.fillStyle=c;x.beginPath();var base=h*(.62+li*.1);x.moveTo(0,h);x.lineTo(0,base);
      for(var px=0;px<=w;px+=w/40){var n=Math.sin(px*.004+li*2)*60+Math.sin(px*.011+li)*35+Math.sin(px*.027+li*5)*14;x.lineTo(px,base-n-(li===0?120:li===1?60:10))}
      x.lineTo(w,h);x.fill()});
    /* snowcaps on far range */
    /* a freighter contrail */
    x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=2;x.beginPath();x.moveTo(w*.08,h*.42);x.quadraticCurveTo(w*.4,h*.12,w*.62,h*.18);x.stroke();
    return cv.toDataURL('image/jpeg',.85);
  }

  /* --- panel UI --- */
  function ui(){
    var fab=document.getElementById('bgFab'),panel=document.getElementById('bgPanel'),navBtn=document.getElementById('bgNav');
    if(!fab||!panel)return;
    var sw=panel.querySelector('.swatches'),color=panel.querySelector('#bgColor'),file=panel.querySelector('#bgFile'),drop=panel.querySelector('.drop'),dim=panel.querySelector('#bgDim'),dimRow=panel.querySelector('.range'),status=panel.querySelector('#bgStatus'),tones=panel.querySelectorAll('[data-tone-set]'),toneRow=panel.querySelector('.tone-row'),thumbs=panel.querySelector('.thumbs'),quick=panel.querySelector('.presets');
    sw.innerHTML=PRESETS.map(function(p){return '<button type="button" class="swatch" data-id="'+p.id+'" aria-pressed="false"><span class="pv" style="background:'+p.page+';--pv-card:'+p.card+';--pv-acc:'+p.acc+'"></span>'+p.name+'</button>'}).join('');
    ['#14213d','#1b4332','#3c1642','#5a189a','#7f5539','#e9edc9','#ffd6a5','#dbe7f0'].forEach(function(c){var b=document.createElement('button');b.type='button';b.style.background=c;b.title=c;b.setAttribute('aria-label','Цвет '+c);b.onclick=function(){set({bg:'custom',color:c})};quick.appendChild(b)});
    var SCENES=[['night','Ночные горы'],['dusk','Закат'],['dawn','Рассвет'],['storm','Перед грозой']];
    thumbs.innerHTML=SCENES.map(function(s){return '<button type="button" data-scene="'+s[0]+'" title="'+s[1]+'" aria-label="Фон: '+s[1]+'"></button>'}).join('');
    var genCache={};
    requestAnimationFrame(function(){thumbs.querySelectorAll('button').forEach(function(b){var k=b.dataset.scene;genCache[k]=genScene(k);b.style.backgroundImage='url('+genCache[k]+')'})});
    thumbs.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var k=b.dataset.scene,u=genCache[k]||genScene(k);if(saveImg(u))set({bg:'image',imgTone:k==='dawn'?'light':'dark',dim:k==='dawn'?35:40});else msg('Не удалось сохранить фон')});
    function msg(t){status.textContent=t||''}
    function sync(){
      var bg=state.bg||'auto';
      sw.querySelectorAll('.swatch').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.id===bg))});
      if(state.color)color.value=state.color;
      dimRow.hidden=bg!=='image';toneRow.hidden=bg!=='image';
      dim.value=state.dim==null?55:state.dim;
      tones.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.toneSet===(state.imgTone||'dark')))});
      fab.querySelector('.t').textContent='Фон: '+(bg==='custom'?'свой цвет':bg==='image'?'изображение':(PRESETS.filter(function(p){return p.id===bg})[0]||PRESETS[0]).name.toLowerCase());
    }
    function set(patch){var s={};for(var k in state)s[k]=state[k];for(var j in patch)s[j]=patch[j];apply(s);save(s);sync();msg('')}
    function open(v){panel.hidden=!v;fab.setAttribute('aria-expanded',String(v));if(navBtn)navBtn.setAttribute('aria-expanded',String(v));if(v)(panel.querySelector('[aria-pressed=true]')||panel.querySelector('button')).focus()}
    fab.addEventListener('click',function(){open(panel.hidden)});
    if(navBtn)navBtn.addEventListener('click',function(){open(panel.hidden)});
    panel.querySelector('.close').addEventListener('click',function(){open(false);fab.focus()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden){open(false);fab.focus()}});
    document.addEventListener('pointerdown',function(e){if(!panel.hidden&&!panel.contains(e.target)&&!fab.contains(e.target)&&!(navBtn&&navBtn.contains(e.target)))open(false)});
    sw.addEventListener('click',function(e){var b=e.target.closest('.swatch');if(b)set({bg:b.dataset.id})});
    color.addEventListener('input',function(){set({bg:'custom',color:color.value})});
    function takeFile(f){if(!f||!/^image\//.test(f.type)){msg('Выберите файл изображения');return}msg('Обработка…');
      readImage(f,function(url,tone){if(!url){msg('Не удалось прочитать файл');return}if(!saveImg(url)){msg('Файл слишком большой для сохранения');return}set({bg:'image',imgTone:tone,dim:state.dim==null?55:state.dim});msg('Фон установлен')})}
    file.addEventListener('change',function(){takeFile(file.files[0]);file.value=''});
    ['dragenter','dragover'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.add('over')})});
    ['dragleave','drop'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.remove('over')})});
    drop.addEventListener('drop',function(e){takeFile(e.dataTransfer.files[0])});
    dim.addEventListener('input',function(){state.dim=+dim.value;root.style.setProperty('--dim',String(state.dim/100));save(state)});
    tones.forEach(function(b){b.addEventListener('click',function(){set({imgTone:b.dataset.toneSet})})});
    panel.querySelector('#bgReset').addEventListener('click',function(){saveImg(null);state={};set({bg:'auto'})});
    sync();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ui);else ui();
  window.AACTheme={apply:apply,presets:PRESETS};
})();
