/* Search results overlay: keep suggestions above the animated header and charts.
   Uses the same existing search results element and original click handlers. */
(function(){
"use strict";
function setup(){
 const box=document.getElementById("searchResults");
 const input=document.getElementById("search");
 if(!box||!input||box.dataset.portalReady)return;
 box.dataset.portalReady="1";
 box.classList.add("search-results-portal");
 document.body.appendChild(box);
 let frame=0;
 function update(){
  frame=0;
  const rect=input.getBoundingClientRect();
  const visible=box.style.display!=="none"&&!!input.value.trim();
  if(!visible)return;
  const viewport=window.visualViewport;
  const vw=viewport?.width||window.innerWidth;
  const available=Math.max(180,vw-24);
  const width=Math.min(460,available);
  const left=Math.max(12,Math.min(rect.right-width,vw-width-12));
  const top=Math.min(rect.bottom+8,window.innerHeight-80);
  box.style.setProperty("left",left+"px","important");
  box.style.setProperty("top",top+"px","important");
  box.style.setProperty("width",width+"px","important");
  box.style.setProperty("max-height",Math.max(120,Math.min(420,window.innerHeight-top-18))+"px","important");
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 // The app replaces suggestion buttons as the user types.
 const observer=new MutationObserver(schedule);
 observer.observe(box,{childList:true,subtree:true});
 input.addEventListener("input",schedule);
 input.addEventListener("focus",schedule);
 window.addEventListener("resize",schedule,{passive:true});
 window.addEventListener("scroll",schedule,{passive:true,capture:true});
 window.visualViewport?.addEventListener("resize",schedule,{passive:true});
 window.visualViewport?.addEventListener("scroll",schedule,{passive:true});
 schedule();
 window.addEventListener("pagehide",()=>{observer.disconnect();if(frame)cancelAnimationFrame(frame)},{once:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})();