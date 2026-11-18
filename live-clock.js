/* Group Task Center — live local clock adjacent to page heading. */
(function(){
"use strict";
function mount(){
 const title=document.getElementById("gtcPageTitle")||document.getElementById("pdcTitle");
 if(!title||document.getElementById("dashboardLiveClock"))return;
 const clock=document.createElement("div");
 clock.id="dashboardLiveClock";
 clock.className="dashboard-live-clock";
 clock.setAttribute("role","timer");
 clock.setAttribute("aria-label","Current date and local time");
 clock.innerHTML='<span class="dlc-led" aria-hidden="true"></span><span class="dlc-clock-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg></span><span class="dlc-readout"><span id="dlcTime" class="dlc-time">--:--:--</span><span id="dlcDate" class="dlc-date">-- -- ----</span></span>';
 title.insertAdjacentElement("afterend",clock);
 const time=clock.querySelector("#dlcTime"),date=clock.querySelector("#dlcDate");
 const formatter=new Intl.DateTimeFormat("en-GB",{weekday:"short"});
 const pad=x=>String(x).padStart(2,"0");
 function tick(){
  const d=new Date();
  let hour=d.getHours();
  const ampm=hour>=12?"PM":"AM";
  hour=hour%12||12;
  time.textContent=pad(hour)+":"+pad(d.getMinutes())+":"+pad(d.getSeconds())+" "+ampm;
  date.textContent=formatter.format(d)+" · "+pad(d.getDate())+"-"+pad(d.getMonth()+1)+"-"+d.getFullYear();
  clock.dataset.second=d.getSeconds()%2===0?"even":"odd";
 }
 tick();
 const interval=window.setInterval(tick,1000);
 window.addEventListener("pagehide",()=>window.clearInterval(interval),{once:true});
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)tick()});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
