/* Group Task Center — overview KPI shortcuts. Display/navigation only. */
(function(){
"use strict";
const icons={
 total:'<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/>',
 done:'<circle cx="12" cy="12" r="9"/><path d="m7.5 12 3 3 6-6"/>',
 progress:'<path d="M12 3a9 9 0 1 1-9 9" /><path d="M12 3v4M12 3H8"/>',
 pending:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 overdue:'<path d="M10.3 4.6 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v5M12 17h.01"/>',
 rate:'<circle cx="12" cy="12" r="9"/><path d="M12 3v9h9"/><path d="M12 12 6.5 19"/>'
};
const definitions=[
  {id:"total",filter:"all",symbol:"total",label:"All tasks"},
  {id:"done",filter:"Completed",symbol:"done",label:"Completed tasks"},
  {id:"progress",filter:"In Progress",symbol:"progress",label:"In-progress tasks"},
  {id:"pending",filter:"Pending",symbol:"pending",label:"Pending tasks"},
  {id:"overdue",filter:"Overdue",symbol:"overdue",label:"Overdue tasks"},
  {id:"rate",filter:"Completed",symbol:"rate",label:"Completed tasks and completion rate"}
];
function routeToTasks(){
 if(document.body.classList.contains("pdc-ready")&&typeof window.pdcNavigateTasks==="function")window.pdcNavigateTasks();
 else if(typeof window.gtcNavigateTasks==="function")window.gtcNavigateTasks();
 else document.querySelector('.gtc-navitem[data-goto="Tasks"],.pdc-sidebar-link[data-page="Tasks"]')?.click();
}
function applyFilter(def){
 // Use original dashboard controls; never mutate the underlying records.
 routeToTasks();
 const search=document.getElementById("search");
 if(search&&search.value){search.value="";search.dispatchEvent(new Event("input",{bubbles:false}));}
 // Clicking the existing All companies tab also resets any H.R. or subdivision view.
 const all=document.querySelector('#companyTabs [data-company="All companies"]');
 if(all)all.click();
 const select=document.getElementById("statusFilter");
 if(select){select.value=def.filter;select.dispatchEvent(new Event("change",{bubbles:false}));}
 // The Overview uses the full record set; the task view should now use this one filter.
 if(def.filter==="Overdue"){
  const overdue=document.querySelector('.gtc-navitem[data-goto="Overdue tasks"],.pdc-sidebar-link[data-page="Overdue tasks"]');
  overdue?.click();
 }
 const list=document.getElementById("taskLists");
 if(list){
  const scroll=()=>list.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  requestAnimationFrame(scroll);
 }
}
function activate(metric,def){
 metric.classList.add("kpi-pressed");
 setTimeout(()=>metric.classList.remove("kpi-pressed"),280);
 applyFilter(def);
}
function setup(){
 const root=document.querySelector('#gtcOverview .summary,#pdcOverview .summary');
 if(!root)return;
 for(const def of definitions){
  const value=document.getElementById(def.id);
  const card=value?.closest(".metric");
  if(!card||!root.contains(card)||card.dataset.kpiReady==="true")continue;
  card.dataset.kpiReady="true";
  card.dataset.kpiType=def.symbol;
  card.setAttribute("role","button");
  card.setAttribute("tabindex","0");
  card.setAttribute("aria-label","Show "+def.label);
  card.setAttribute("title","Click to view "+def.label.toLowerCase());
  // Prevent the legacy overdue inline handler from filtering a hidden list.
  card.removeAttribute("onclick");card.removeAttribute("onkeydown");
  const badge=document.createElement("span");
  badge.className="kpi-icon";
  badge.setAttribute("aria-hidden","true");
  badge.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+icons[def.symbol]+'</svg>';
  card.append(badge);
  card.addEventListener("click",()=>activate(card,def));
  card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();activate(card,def)}});
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})();
