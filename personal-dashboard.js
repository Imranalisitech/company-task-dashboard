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
 const img=make("span","gtc-ico",icon);img.style.setProperty("--ico",color);btn.append(img,make("span","gtc-label",name));
 if(["Tasks","Overdue tasks","Reminders","Updates"].includes(name)){const count=make("span","gtc-count pdc-count","0");count.dataset.count=name;btn.append(count)}
 btn.addEventListener("click",()=>showPage(name));aside.append(btn);
 })});
 aside.append(make("div","gtc-sidebarfoot","Private personal workspace"));shell.prepend(aside);
 const top=make("div","gtc-topbar pdc-topbar");const title=make("strong","gtc-page-title","Overview");title.id="pdcTitle";top.append(title);
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
