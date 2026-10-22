'use strict';
(()=>{
 const uid='3e0d07fe19334fc1ac4d3cbe0ff8f516',art=document.querySelector('.hero-art'),frame=document.querySelector('#pudge-viewer');
 const status=document.querySelector('#model-status'),reset=document.querySelector('#model-reset'),retry=document.querySelector('#model-retry');
 let api,clips={},camera,ready=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,timeout,attempt=0,timers=[];
 const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
 function clearAction(){timers.forEach(clearTimeout);timers=[]}
 function play(clip,{loop=true,speed=1}={}){if(!api||!clip)return;api.setCurrentAnimationByUID(clip[0],err=>{if(err)return;api.setSpeed(speed);api.setCycleMode(loop?'loopOne':'one');api.seekTo(0);if(reduced)api.pause();else api.play()})}
 function idle(){art.dataset.playing='idle';play(clips.idle,{speed:.8})}
 function act(kind){if(!ready||reduced)return;clearAction();art.dataset.playing=kind;
  if(kind==='ult'){play(clips.ultStart||clips.ult,{loop:false,speed:1.3});later(()=>play(clips.ult,{speed:1.1}),350);later(idle,3200)}
  else if(kind==='hook'){play(clips.hook,{loop:false,speed:1.6});later(()=>play(clips.hookEnd,{loop:false,speed:1.5}),950);later(idle,1700)}
  else if(kind==='rot'){play(clips.rot||clips.idle);later(idle,2400)}
  else if(kind==='heap'){play(clips.spawn||clips.idle,{loop:false});later(idle,2100)}
  else if(kind==='pick'){play(clips.victory||clips.spawn||clips.idle,{loop:false});later(idle,3200)}
 }
 window.pudge3D={act,hook:()=>act('hook'),setReducedMotion(value){reduced=value;if(!ready)return;if(value){clearAction();idle();api.pause()}else api.play()}};
 function failure(message){status.textContent=message;retry.hidden=false}
 function load(){const thisAttempt=++attempt;ready=false;api=null;clips={};camera=null;clearAction();clearTimeout(timeout);art.classList.remove('model-ready','model-unavailable');reset.hidden=true;retry.hidden=true;status.textContent='Вызов героя… загрузка 3D';timeout=setTimeout(()=>{if(!ready)failure('Герой ещё загружается. CV и инвентарь уже доступны.')},35000);
 if(typeof Sketchfab==='undefined'){clearTimeout(timeout);art.classList.add('model-unavailable');failure('3D недоступно. Повторить вызов?');return}
 new Sketchfab(frame).init(uid,{autostart:1,preload:1,ui_infos:0,ui_controls:0,ui_stop:0,ui_hint:0,ui_animations:0,ui_sound:0,animation_autoplay:0,camera:0,
 success(viewer){if(thisAttempt!==attempt)return;api=viewer;viewer.addEventListener('viewerready',()=>{if(thisAttempt!==attempt)return;ready=true;clearTimeout(timeout);art.classList.add('model-ready');art.classList.remove('model-unavailable');reset.hidden=false;retry.hidden=true;status.textContent='3D ГЕРОЙ ГОТОВ · ВРАЩАЙТЕ МЫШЬЮ';viewer.setBackground({color:[17/255,24/255,25/255]});viewer.getCameraLookAt((err,value)=>{if(err)return;const target=value.target,position=value.position.map((v,i)=>target[i]+(v-target[i])*.40);camera={position,target};viewer.setCameraLookAt(position,target,.8)});
 viewer.getAnimations((err,list)=>{if(err||!list?.length)return;const exact=name=>list.find(c=>c[1].endsWith('|'+name));clips={idle:exact('pudge_idle'),hook:exact('pudge_meathook_start'),hookEnd:exact('pudge_meathook_end'),ultStart:exact('pudge_dismember_start'),ult:exact('pudge_dismember_mid'),rot:exact('@pudge_rot')||exact('hh_rot'),spawn:exact('pudge_spawn'),victory:exact('victory')};clips.idle??=list.find(c=>/idle/i.test(c[1]))||list[0];art.dataset.animationCount=String(list.length);art.dataset.hookAnimation=clips.hook?.[1]||'none';art.dataset.ultAnimation=clips.ult?.[1]||'none';art.dataset.idleAnimation=clips.idle[1];idle()});});viewer.start()},
 error(){if(thisAttempt!==attempt)return;clearTimeout(timeout);art.classList.add('model-unavailable');failure('Герой не загрузился. Проверьте соединение со Sketchfab.')}})}
 reset.addEventListener('click',()=>{clearAction();if(api&&camera)api.setCameraLookAt(camera.position,camera.target,reduced?0:.5);idle()});retry.addEventListener('click',load);
 document.addEventListener('visibilitychange',()=>{if(!api||!ready)return;if(document.hidden)api.pause();else if(!reduced)api.play()});load();
})();
