'use strict';
(()=>{
 const uid='3e0d07fe19334fc1ac4d3cbe0ff8f516';
 const art=document.querySelector('.hero-art'), frame=document.querySelector('#pudge-viewer');
 const status=document.querySelector('#model-status'),reset=document.querySelector('#model-reset'),retry=document.querySelector('#model-retry');
 let api=null,idle=null,cast=null,camera=null,ready=false,casting=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,timeout,returnTimer,attempt=0;
 const play=(clip,loop=true)=>{if(!api||!clip)return;api.setCurrentAnimationByUID(clip[0],err=>{if(err)return;api.setCycleMode(loop?'loopOne':'one');api.seekTo(0);if(reduced)api.pause();else api.play()})};
 window.pudge3D={
  hook(){if(!ready||reduced||!cast)return;casting=true;clearTimeout(returnTimer);play(cast,false);returnTimer=setTimeout(()=>{casting=false;play(idle)},Math.min(5000,Math.max(1000,cast[2]*1000)))},
  setReducedMotion(value){reduced=value;if(api&&ready){if(value){clearTimeout(returnTimer);casting=false;play(idle);api.pause()}else api.play()}}
 };
 function failure(message){status.textContent=message;retry.hidden=false;}
 function load(){
  const thisAttempt=++attempt;ready=false;api=null;idle=null;cast=null;camera=null;casting=false;clearTimeout(timeout);clearTimeout(returnTimer);art.classList.remove('model-ready','model-unavailable');retry.hidden=true;reset.hidden=true;status.textContent='Загружаем 3D-Пуджа…';
  timeout=setTimeout(()=>{if(!ready)failure('3D ещё загружается. Резюме уже работает.')},35000);
  if(typeof Sketchfab==='undefined'){art.classList.add('model-unavailable');clearTimeout(timeout);failure('Просмотрщик 3D недоступен. Попробуйте ещё раз.');return;}
  const client=new Sketchfab(frame);
  client.init(uid,{autostart:1,preload:1,ui_infos:0,ui_controls:0,ui_stop:0,ui_hint:0,ui_watermark_link:1,ui_animations:0,ui_sound:0,animation_autoplay:0,camera:1,
   success(viewer){if(thisAttempt!==attempt)return;api=viewer;viewer.addEventListener('viewerready',()=>{
    if(thisAttempt!==attempt)return;ready=true;clearTimeout(timeout);retry.hidden=true;reset.hidden=false;art.classList.remove('model-unavailable');art.classList.add('model-ready');status.textContent='Живая 3D-модель · потяните, чтобы вращать';
    viewer.setBackground({color:[16/255,22/255,21/255]});
    viewer.getCameraLookAt((err,value)=>{if(err)return;const target=value.target;const position=value.position.map((v,i)=>target[i]+(v-target[i])*.30);camera={position,target};viewer.setCameraLookAt(position,target,0)});
    viewer.getAnimations((err,clips)=>{if(err||!clips?.length)return;idle=clips.find(c=>/[@|]idle$|[@|]pudge_idle$/i.test(c[1]))||clips.find(c=>/idle/i.test(c[1])&&!/loadout|ti10|arcana|injur/i.test(c[1]))||clips[0];cast=clips.find(c=>/[|]pudge_meathook_start$/i.test(c[1]))||clips.find(c=>/[@|](pudge_)?(meat_)?hook$/i.test(c[1]))||clips.find(c=>/hook/i.test(c[1])&&!/end|loop|die|death|loadout|dendi|ti10/i.test(c[1]))||clips.find(c=>/cast[_ ]?1|ability[_ ]?1/i.test(c[1]));art.dataset.animationCount=String(clips.length);art.dataset.hookAnimation=cast?.[1]||'none';art.dataset.idleAnimation=idle[1];play(idle)});
   });viewer.start();
  },error(){if(thisAttempt!==attempt)return;art.classList.add('model-unavailable');clearTimeout(timeout);failure('Не удалось открыть 3D. Проверьте соединение со Sketchfab.')}});
 }
 reset.addEventListener('click',()=>{if(api&&camera)api.setCameraLookAt(camera.position,camera.target,reduced?0:.6);casting=false;clearTimeout(returnTimer);play(idle)});
 retry.addEventListener('click',load);
 document.addEventListener('visibilitychange',()=>{if(!api||!ready)return;if(document.hidden)api.pause();else if(!reduced)api.play()});
 load();
})();
