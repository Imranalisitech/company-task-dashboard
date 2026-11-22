function executiveLineIcon(label){
 const paths={
 "Overview":'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
 "Tasks":'<path d="M8 6h13M8 12h13M8 18h13"/><path d="m3 6 1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2"/>',
 "Overdue tasks":'<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/>',
 "Reminders":'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10M10 22h4"/>',
 "Updates":'<path d="M20 11.5a8 8 0 1 1-2-5.5M20 4v6h-6"/>',
 "Requests":'<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 7 9-7"/>',
 "History":'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
 "Download reports":'<path d="M12 3v12m-4-4 4 4 4-4M4 18v3h16v-3"/>',
 "SiTech":'<rect x="3" y="7" width="18" height="14"/><path d="M8 7V3h8v4M3 12h18"/>',
 "TradeWell":'<path d="M3 8h18v13H3zM8 8V4h8v4M3 13h18"/>',
 "Shadows":'<path d="M3 11 12 4l9 7v10H3zM9 21v-7h6v7"/>',
 "Al-Kawashif":'<path d="M5 21V3h14v18M2 21h20M9 7h2m3 0h2M9 12h2m3 0h2"/>',
 "H.R.":'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 "General Tasks":'<path d="M8 3h10l3 3v15H8zM3 8v13h14M11 11h7m-7 4h7"/>',
 "Desktop app":'<rect x="3" y="4" width="18" height="14" rx="1"/><path d="M8 22h8m-4-4v4"/>',
 "Personal":'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 "Recycle Bin":'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6M10 10v7m4-7v7"/>',
 "Company Links":'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/>',
 "Backup & Restore":'<path d="M4 5v6h6M4 11a8 8 0 1 1 2 6"/>'
 };
 return '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[label]||'<rect x="5" y="3" width="14" height="18"/><path d="M9 8h6m-6 4h6m-6 4h4"/>')+'</svg>';
}
/* Personal dashboard modern navigation: appearance only; does not alter private task storage. */
(()=>{"use strict";
const el=id=>document.getElementById(id);
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const menu=[
["WORKSPACE",[["Overview","▦","#6658dd"],["Tasks","▤","#3778bf"],["Overdue tasks","⚠","#d8444d"],["Reminders","♧","#dc9320"],["Updates","🔔","#7451c8"],["History","◷","#3675da"],["Download reports","↓","#2ba779"]]],
["PRIVATE & ADMIN",[["Personal","♙","#d7468f"],["H.R.","♙","#975bc4"],["Desktop app","▱","#1697bf"],["Sign out","⇥","#6e7c91"]]]
];
let page="Overview",obs,queued=false;
function call(name,...args){if(typeof window[name]==="function")return window[name](...args)}
function showPage(name){
 if(name==="Back to Master"){location.href="/";return}
 if(name==="Desktop app"){call("installDesktopApp");return}
 if(name==="Sign out"){call("signOut");return}
 if(name==="Updates"){call("toggleMasterActivity");return}
 if(name==="Download reports"){showPage("Tasks");document.querySelector('[onclick="printAll()"]')?.scrollIntoView({block:"center"});return}
 page=name;
 const overview=el("pdcOverview"),main=el("appShell")?.querySelector("main");
 if(overview)overview.hidden=name!=="Overview";
 if(main)main.classList.toggle("pdc-reminders",name==="Reminders");
 const toolbar=main?.querySelector(".toolbar");
 if(toolbar)toolbar.classList.toggle("pdc-hidden",!["Tasks","Overdue tasks","H.R."].includes(name));
 const list=el("taskLists"),hr=el("hrManagement");
 if(list)list.classList.toggle("pdc-hidden",!["Tasks","Overdue tasks","H.R."].includes(name));
 if(hr)hr.classList.toggle("pdc-hidden",!["Tasks","Overdue tasks","H.R."].includes(name));
 if(name==="History"){call("toggleRemindersPanel",false);call("toggleHistoryPanel",true)}
 else if(name==="Reminders"){call("toggleHistoryPanel",false);call("toggleRemindersPanel",true);call("renderReminders")}
 else{call("toggleHistoryPanel",false);call("toggleRemindersPanel",false)}
 if(name==="Tasks"){if(el("statusFilter"))el("statusFilter").value="all";const tab=document.querySelector('#companyTabs [data-company="All companies"]');tab?.click();call("render")}
 if(name==="Overdue tasks"){if(el("statusFilter"))el("statusFilter").value="Overdue";call("render")}
 if(name==="H.R."){document.querySelector('#companyTabs [data-task-view="HR"]')?.click()}
 if(name==="Overview")call("metrics");
 if(el("pdcTitle"))el("pdcTitle").textContent=name;
 document.querySelectorAll(".pdc-sidebar-link").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
 update();
 if(name==="Reminders")requestAnimationFrame(()=>el("remindersSection")?.scrollIntoView({block:"start"}));
}
function openTask(id){showPage("Tasks");call("openSearchResult",id)}
function openReminder(id){showPage("Reminders");call("openNotificationReminder",id)}
function addRow(host,label,description,date,click){
 const b=make("button","pdc-item");b.type="button";
 const detail=make("span","pdc-item-main");detail.append(make("strong","",label));
 if(description)detail.append(make("small","",description));
 b.append(detail,make("span","pdc-item-date",date||""));
 if(click)b.addEventListener("click",click);else b.disabled=true;
 host.append(b);
}
function update(){
 const totals={Tasks:el("total")?.textContent,"Overdue tasks":el("overdue")?.textContent,Reminders:el("reminderCount")?.textContent,Updates:el("masterActivityCount")?.textContent};
 for(const [name,count] of Object.entries(totals)){const node=document.querySelector('.pdc-count[data-count="'+name+'"]');if(node&&count!==undefined)node.textContent=count}
 const due=el("pdcDue"),activity=el("pdcActivity"),allTasks=el("pdcAllTasks");if(!due||!activity||!allTasks)return;
 due.replaceChildren();activity.replaceChildren();
 let ts=[];try{if(typeof tasks!=="undefined"&&Array.isArray(tasks))ts=tasks}catch(e){}
 allTasks.replaceChildren();
 ts.slice().sort((a,b)=>String(a.date||"9999").localeCompare(String(b.date||"9999"))).forEach(t=>{
   addRow(allTasks,t.task||"Personal task",[t.status||"Pending",t.assigned||""].filter(Boolean).join(" · "),String(t.date||"No date"),()=>openTask(t.id));
 });
 if(!ts.length)addRow(allTasks,"No personal tasks saved yet","Use + New task to add one","",null);
 const max=Date.now()+7*86400000;
 const upcoming=ts.filter(t=>t.date&&t.status!=="Completed"&&Number.isFinite(Date.parse(t.date))&&Date.parse(t.date)<max).sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,7);
 upcoming.forEach(t=>addRow(due,t.task||"Task",[t.company,t.division,t.assigned].filter(Boolean).join(" · "),String(t.date),()=>openTask(t.id)));
 if(!upcoming.length)addRow(due,"No outstanding tasks due in the next 7 days","","",null);
 let events=[];try{if(typeof masterActivityEvents==="function")events=masterActivityEvents().filter(e=>e.type!=="due").slice(0,7)}catch(e){}
 events.forEach(e=>addRow(activity,(e.type==="reminder"?"Reminder":"Task")+" updated — "+e.title,e.body,e.date?String(e.date).slice(0,10):"",()=>e.type==="reminder"?openReminder(e.id):openTask(e.id)));
 if(!events.length)addRow(activity,"No recent updates yet","","",null);
}
function init(){
 const shell=el("appShell"),main=shell?.querySelector("main");
 if(!main||el("pdcSidebar"))return;
 const aside=make("aside","gtc-sidebar pdc-sidebar");aside.id="pdcSidebar";aside.setAttribute("aria-label","Personal dashboard navigation");
 const brand=make("div","gtc-brand");brand.append(make("span","gtc-brand-icon","♢"));const brandTitle=make("span","gtc-brand-text");brandTitle.innerHTML="Personal Task Center<small>Private Dashboard</small>";brand.append(brandTitle);aside.append(brand);
 menu.forEach(([section,links])=>{aside.append(make("div","gtc-section-label",section));links.forEach(([name,icon,color])=>{
 const btn=make("button","gtc-navitem pdc-sidebar-link");btn.type="button";btn.dataset.page=name;btn.title=name;
 const img=make("span","gtc-ico");img.innerHTML=executiveLineIcon(name);btn.append(img,make("span","gtc-label",name));
 if(["Tasks","Overdue tasks","Reminders","Updates"].includes(name)){const count=make("span","gtc-count pdc-count","0");count.dataset.count=name;btn.append(count)}
 btn.addEventListener("click",()=>showPage(name));aside.append(btn);
 })});
 aside.append(make("div","gtc-sidebarfoot","Private personal workspace"));shell.prepend(aside);
 const top=make("div","gtc-topbar pdc-topbar");const title=make("strong","gtc-page-title","Overview");title.id="pdcTitle";top.append(title);const toggle=make("button","gtc-sidebar-toggle");toggle.type="button";toggle.id="pdcSidebarToggle";toggle.title="Show or hide side menu";toggle.setAttribute("aria-label","Toggle side menu");toggle.setAttribute("aria-controls","pdcSidebar");toggle.textContent="☰";toggle.addEventListener("click",()=>{document.body.classList.toggle("gtc-sidebar-collapsed");const open=!document.body.classList.contains("gtc-sidebar-collapsed");toggle.setAttribute("aria-expanded",String(open));try{localStorage.setItem("pdc_sidebar_collapsed_v1",String(!open))}catch(e){}});top.append(toggle);try{if(localStorage.getItem("pdc_sidebar_collapsed_v1")==="true")document.body.classList.add("gtc-sidebar-collapsed")}catch(e){}toggle.setAttribute("aria-expanded",String(!document.body.classList.contains("gtc-sidebar-collapsed")));
 
 const back=make("button","gtc-secondary pdc-back-master","↩ Back to Master");back.type="button";back.title="Return to the main dashboard";back.addEventListener("click",()=>{location.href="/"});top.append(back);
 const search=main.querySelector(".toolbar .search-wrap");if(search)top.append(search);
 const bell=make("button","gtc-secondary","🔔");bell.title="Enable notifications";bell.addEventListener("click",()=>call("enableDesktopNotifications"));
 const rem=make("button","gtc-secondary","+ Reminder");rem.addEventListener("click",()=>{showPage("Reminders");call("openReminderEditor")});
 const add=make("button","gtc-primary","+ New task");add.addEventListener("click",()=>{showPage("Tasks");call("newTask");el("editor")?.scrollIntoView({block:"start",behavior:"smooth"})});top.append(bell,rem,add);shell.prepend(top);
 const overview=make("section","gtc-overview pdc-overview");overview.id="pdcOverview";
 for(const selector of [".summary",".charts"]){const child=main.querySelector(selector);if(child)overview.append(child)}
 const breakdown=el("statusBars")?.closest(".chartbox");if(breakdown){breakdown.classList.add("pdc-breakdown");overview.append(breakdown)}
 const widgets=make("div","gtc-widget-grid pdc-widgets");const due=make("section","gtc-widget");due.innerHTML='<h2>Due in the next 7 days (including overdue)</h2><div id="pdcDue"></div>';const recent=make("section","gtc-widget");recent.innerHTML='<h2>Recent activity</h2><div id="pdcActivity"></div>';widgets.append(due,recent);overview.append(widgets);const all=make("section","gtc-widget pdc-alltasks");all.innerHTML='<h2>All Personal Tasks <small>— complete task list</small></h2><div id="pdcAllTasks"></div>';overview.append(all);main.prepend(overview);
 document.body.classList.add("gtc-ready","pdc-ready");
 showPage("Overview");
 const watched=[el("total"),el("overdue"),el("taskLists"),el("masterActivityCount"),el("reminderCount")].filter(Boolean);
 obs=new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;update()},220)});
 watched.forEach(node=>obs.observe(node,{childList:true,subtree:true,characterData:true}));
 window.setInterval(update,12000);
}
window.pdcNavigateReminders=()=>showPage("Reminders");
window.pdcNavigateTasks=()=>showPage("Tasks");
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
