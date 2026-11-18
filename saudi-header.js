/* Decorative Saudi flag motif: stationary Arabic inscription and sword on moving green field. */
(function(){
"use strict";
function mount(){
 const heads=document.querySelectorAll(".gtc-topbar");
 heads.forEach(header=>{
  if(header.querySelector(".saudi-flag-emblem"))return;
  const emblem=document.createElement("span");
  emblem.className="saudi-flag-emblem";emblem.setAttribute("aria-hidden","true");
  emblem.innerHTML='<svg viewBox="0 0 310 94" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><text x="155" y="39" fill="#ffffff" text-anchor="middle" direction="rtl" font-size="22">لا إله إلا الله محمد رسول الله</text><path d="M50 58Q150 62 267 57" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M50 58Q38 63 53 69L70 68" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M265 57L273 53" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
  header.prepend(emblem);
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
