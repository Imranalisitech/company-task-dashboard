/* Presentation-only animated waves. No task or database changes. */
(function(){
"use strict";
function init(){
 const shell=document.getElementById("appShell");
 if(!shell||document.getElementById("gtcAmbientBackground"))return;
 const main=shell.querySelector(":scope > main");if(!main)return;
 const layer=document.createElement("div");
 layer.id="gtcAmbientBackground";layer.className="gtc-ambient-background";
 layer.setAttribute("aria-hidden","true");
 layer.innerHTML='<div class="gtc-ambient-cloud gtc-ambient-cloud-a"></div>'+
 '<div class="gtc-ambient-cloud gtc-ambient-cloud-b"></div>'+
 '<div class="gtc-ambient-cloud gtc-ambient-cloud-c"></div>'+
 '<div class="gtc-ambient-scroll">'+
 '<svg class="gtc-ambient-wave" viewBox="0 0 1500 900" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">'+
 '<defs><linearGradient id="gtcWaveA" x1="0" x2="1" y1="0" y2="0">'+
 '<stop offset="0%" stop-color="#77badb" stop-opacity="0"/><stop offset="45%" stop-color="#79cddd" stop-opacity=".55"/>'+
 '<stop offset="72%" stop-color="#8b87e9" stop-opacity=".4"/><stop offset="100%" stop-color="#7ab8dc" stop-opacity="0"/></linearGradient>'+
 '<linearGradient id="gtcWaveB" x1="0" x2="1" y1="0" y2="0">'+
 '<stop offset="0%" stop-color="#4ac9aa" stop-opacity="0"/><stop offset="50%" stop-color="#54bda8" stop-opacity=".45"/>'+
 '<stop offset="100%" stop-color="#7faee2" stop-opacity="0"/></linearGradient></defs>'+
 '<g class="gtc-ambient-wave-sweep">'+
 '<path d="M-90 250 C180 60 320 450 650 235 S1160 80 1610 310" stroke="url(#gtcWaveA)" stroke-width="75" opacity=".20" fill="none"/>'+
 '<path d="M-80 280 C210 100 350 470 690 260 S1200 140 1590 340" stroke="url(#gtcWaveA)" stroke-width="3" opacity=".5" fill="none"/>'+
 '<path d="M-110 550 C210 350 440 700 740 500 S1240 380 1620 620" stroke="url(#gtcWaveB)" stroke-width="95" opacity=".15" fill="none"/>'+
 '<path d="M-120 570 C190 390 430 720 740 520 S1210 400 1630 625" stroke="url(#gtcWaveB)" stroke-width="2" opacity=".45" fill="none"/>'+
 '<path d="M-80 795 C280 615 410 930 750 750 S1310 650 1610 825" stroke="url(#gtcWaveA)" stroke-width="4" opacity=".3" fill="none"/>'+
 '<circle cx="385" cy="365" r="4" fill="#66b9d5" opacity=".4"/>'+
 '<circle cx="940" cy="400" r="5" fill="#6cc5b9" opacity=".35"/>'+
 '</g></svg></div>';
 shell.insertBefore(layer,main);
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
 let previous=window.scrollY||0,target=0,current=0,frame=0;
 function animate(){
  frame=0;
  if(reduced.matches)return;
  current+=(target-current)*.16;
  layer.style.setProperty("--gtc-wave-scroll",current.toFixed(2)+"px");
  if(Math.abs(target-current)>.2)frame=requestAnimationFrame(animate);
 }
 function scroll(){
  if(reduced.matches)return;
  const y=window.scrollY||0;
  const delta=Math.max(-110,Math.min(110,y-previous));
  previous=y;
  target=Math.max(-38,Math.min(38,target*.65-delta*.7));
  if(!frame)frame=requestAnimationFrame(animate);
 }
 window.addEventListener("scroll",scroll,{passive:true});
 window.addEventListener("pagehide",()=>{window.removeEventListener("scroll",scroll);if(frame)cancelAnimationFrame(frame)},{once:true});
 if(reduced.addEventListener)reduced.addEventListener("change",()=>{if(reduced.matches){target=current=0;layer.style.setProperty("--gtc-wave-scroll","0px");if(frame)cancelAnimationFrame(frame);frame=0;}});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();