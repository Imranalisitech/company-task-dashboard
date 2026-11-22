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
/* Group Task Center UI — presentation layer only, never writes task records. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const mk=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
let current="Overview",observer,updateQueued=false;
const items=[
["WORKSPACE",[
["Overview","▦","#6058dc"],["Tasks","▤","#3d79bc"],["Overdue tasks","⚠","#d94c4c"],["Reminders","♧","#db931b"],["Updates","🔔","#6651be"],["Requests","📨","#df8738"],["History","◷","#3675da"],["Download reports","↓","#24a770"]]],
["COMPANIES",[
["SiTech","✣","#356cc7"],["TradeWell","♢","#0aa696"],["Shadows","☂","#8050ce"],["Al-Kawashif","▥","#eb7733"],["H.R.","♙","#a845c3"],["General Tasks","▣","#66768d"]]],
["APP",[["Desktop app","▱","#0c92bc"]]],
["PRIVATE & ADMIN",[["Personal","♙","#d7458b"],["Recycle Bin","▤","#718098"],["Company Links","↗","#765bd8"],["Backup & Restore","↓","#22a36b"]]]
];
function invoke(name,...args){if(typeof window[name]==="function"){window[name](...args);return true;}return false}
function nav(label){
 current=label;
 const isOverview=label==="Overview";
 const isReminder=label==="Reminders";
 const isHistory=label==="History";
 const isTask=!isOverview&&!isReminder&&!isHistory;
 const main=$("appShell")?.querySelector("main");
 if(main)main.classList.toggle("gtc-reminders-page",isReminder);
 if(main)main.classList.toggle("gtc-history-page",isHistory);
 const panel=$("gtcOverview");panel.hidden=!isOverview;
 const toolbar=document.querySelector("#appShell main .toolbar");
 if(toolbar)toolbar.classList.toggle("gtc-section-hidden",!isTask);
 ["taskLists","hrManagement"].forEach(id=>{const e=$(id);if(e)e.classList.toggle("gtc-tasks-hidden",!isTask)});
 if(!isOverview&&!isTask){/* The original panels control their own visibility. */}
 const hist=$("historySection"),rem=$("remindersSection");
 if(isHistory){invoke("toggleRemindersPanel",false);invoke("toggleHistoryPanel",true)}
 else if(isReminder){invoke("toggleHistoryPanel",false);invoke("toggleRemindersPanel",true);invoke("renderReminders") }
 else{invoke("toggleHistoryPanel",false);invoke("toggleRemindersPanel",false)}
 const title=$("gtcPageTitle");if(title)title.textContent=label;
 document.querySelectorAll(".gtc-navitem").forEach(b=>b.classList.toggle("active",b.dataset.goto===label));
 if(label==="Overdue tasks"){$("statusFilter").value="Overdue";invoke("render")}
 if(label==="Tasks"&&$("statusFilter").value==="Overdue"){$("statusFilter").value="all";invoke("render")}
 if(label==="H.R."){const b=document.querySelector('#companyTabs [data-task-view="HR"]');if(b)b.click()}
 if(["SiTech","TradeWell","Shadows","Al-Kawashif","General Tasks"].includes(label)){
 const b=[...document.querySelectorAll("#companyTabs [data-company]")].find(b=>b.getAttribute("data-company")===label);if(b)b.click();
 }
 if(isOverview)invoke("metrics");
 updateWidgets();
 if(isReminder)requestAnimationFrame(()=>$("remindersSection")?.scrollIntoView({block:"start"}));
 if(isHistory)requestAnimationFrame(()=>$("historySection")?.scrollIntoView({block:"start"}));
}
function activate(label){
 if(label==="Personal"){window.location.href="/personal.html";return}
 if(label==="Recycle Bin"){invoke("toggleRecycleBin");return}
 if(label==="Desktop app"){invoke("installDesktopApp");return}
 if(label==="Backup & Restore"){const btn=document.querySelector('[onclick^="downloadFullProjectBackup"]');if(btn)btn.click();return}
 if(label==="Company Links"){showCompanyLinks();return}
 if(label==="Updates"){invoke("toggleMasterActivity");updateCounts();return}
 if(label==="Requests"){invoke("toggleMasterRequests");updateCounts();return}
 if(label==="Download reports"){nav("Tasks");const b=document.querySelector('[onclick="printAll()"]');if(b)b.scrollIntoView({block:"center"});return}
 nav(label);
}
function showCompanyLinks(){
 let panel=$("gtcCompanyLinks");
 if(!panel){
  panel=mk("div","gtc-company-links");
  panel.id="gtcCompanyLinks";
  panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Linked company dashboards");
  const head=mk("div","gtc-company-links-head");
  head.append(mk("strong","","Employee company links"));
  const close=mk("button","gtc-secondary","✕ Close");close.type="button";close.addEventListener("click",()=>panel.hidden=true);
  head.append(close);panel.append(head);
  panel.append(mk("p","gtc-company-links-help","Click a company to open its employee dashboard. Use Copy Link to share its saved private access link."));
  const entries=[["SiTech","sitech"],["AlMakan Elevators & Escalators","almakan"],["Restaurants — Topaz, Kosheri & Jodah","restaurants"],["TradeWell","tradewell"],["Shadows","shadows"],["SSOMCO","ssomco"],["Al-Kawashif","al-kawashif"]];
  entries.forEach(([name,key])=>{
    const section=mk("div","gtc-link-entry gtc-link-entry-simple");
    const row=mk("div","gtc-link-entry-row");
    const link=mk("a","gtc-company-link gtc-company-link-direct",name+" ↗");
    link.target="_blank";link.rel="noopener noreferrer";link.setAttribute("aria-label","Open "+name+" employee dashboard");
    const copy=mk("button","gtc-secondary gtc-link-copy","Copy Link");copy.type="button";
    const status=mk("small","gtc-link-status");
    const tokenKey="company_private_access_"+key;
    const validToken=t=>/^[a-f0-9]{64}$/i.test(t);
    const stored=()=>{try{return localStorage.getItem(tokenKey)||""}catch(e){return ""}};
    const fullLink=()=>{
      const token=stored();
      if(!validToken(token))return null;
      const url=new URL("/company.html?company="+encodeURIComponent(key),location.origin);
      url.hash="access="+token;
      return url.href;
    };
    const refresh=()=>{
      const url=fullLink();
      copy.disabled=!url;
      if(url){link.href=url;link.removeAttribute("aria-disabled");link.classList.remove("gtc-link-missing");status.textContent="";}
      else {link.removeAttribute("href");link.setAttribute("aria-disabled","true");link.classList.add("gtc-link-missing");status.textContent="Private link missing on this device";}
    };
    link.addEventListener("click",e=>{
      // Prevent navigation if an older token was removed in another tab.
      const url=fullLink();if(!url){e.preventDefault();status.textContent="Private link missing on this device";return;}
      link.href=url;
    });
    copy.addEventListener("click",async()=>{
      const url=fullLink();if(!url){refresh();return;}
      try{await navigator.clipboard.writeText(url);status.textContent="Link copied";}
      catch(e){
        const field=document.createElement("textarea");field.value=url;field.style.position="fixed";field.style.opacity="0";document.body.append(field);
        field.select();const ok=document.execCommand("copy");field.remove();
        status.textContent=ok?"Link copied":"Copy unavailable on this device";
      }
    });
    row.append(link,copy);
    section.append(row,status);panel.append(section);
    // Populate fresh saved URLs every time the panel opens.
    section.refreshSavedLink=refresh;
    refresh();
  });
  document.body.append(panel);
 }
 panel.querySelectorAll(".gtc-link-entry").forEach(e=>e.refreshSavedLink?.());
 panel.hidden=false;
}
function openOverviewRecord(type,id){
 if(type==="task"){
   nav("Tasks");
   invoke("openSearchResult",id);
 }else if(type==="reminder"){
   nav("Reminders");
   invoke("openNotificationReminder",id);
 }
}
function createSidebar(root){
 const aside=mk("aside","gtc-sidebar");aside.id="gtcSidebar";aside.setAttribute("aria-label","Main navigation");
 const brand=mk("div","gtc-brand");const logo=mk("span","gtc-brand-icon","♢");const brandText=mk("span","gtc-brand-text");brandText.innerHTML="Group Task Center<small>Admin Dashboard</small>";brand.append(logo,brandText);aside.append(brand);
 items.forEach(([section,rows])=>{
 aside.append(mk("div","gtc-section-label",section));
 rows.forEach(([label,ico,color])=>{
 const b=mk("button","gtc-navitem");b.type="button";b.dataset.goto=label;b.title=label;
 const i=mk("span","gtc-ico");i.innerHTML=executiveLineIcon(label);
 const t=mk("span","gtc-label",label);b.append(i,t);
 if(["Tasks","Overdue tasks","Reminders","H.R.","Updates","Requests"].includes(label)||["SiTech","TradeWell","Shadows","Al-Kawashif","General Tasks"].includes(label)){
 const badge=mk("span","gtc-count","0");badge.dataset.count=label;b.append(badge);
 }
 b.addEventListener("click",()=>activate(label));aside.append(b);
 });
 });
 aside.append(mk("div","gtc-sidebarfoot","Signed in · Group Task Center"));
 root.prepend(aside);
}
function createTopbar(root){
 const bar=mk("div","gtc-topbar");
 const title=mk("strong","gtc-page-title","Overview");title.id="gtcPageTitle";bar.append(title);const toggle=mk("button","gtc-sidebar-toggle");toggle.type="button";toggle.id="gtcSidebarToggle";toggle.title="Show or hide side menu";toggle.setAttribute("aria-label","Toggle side menu");toggle.setAttribute("aria-controls","gtcSidebar");toggle.textContent="☰";toggle.addEventListener("click",()=>{document.body.classList.toggle("gtc-sidebar-collapsed");const open=!document.body.classList.contains("gtc-sidebar-collapsed");toggle.setAttribute("aria-expanded",String(open));try{localStorage.setItem("gtc_sidebar_collapsed_v1",String(!open))}catch(e){}});bar.append(toggle);try{if(localStorage.getItem("gtc_sidebar_collapsed_v1")==="true")document.body.classList.add("gtc-sidebar-collapsed")}catch(e){}toggle.setAttribute("aria-expanded",String(!document.body.classList.contains("gtc-sidebar-collapsed")));
 
 const search=document.querySelector("#appShell .toolbar .search-wrap");if(search)bar.append(search);
 const notification=mk("button","gtc-secondary","🔔");notification.title="Enable notifications";notification.addEventListener("click",()=>invoke("enableDesktopNotifications"));bar.append(notification);
 const reminder=mk("button","gtc-secondary","+ Reminder");reminder.addEventListener("click",()=>{nav("Reminders");invoke("openReminderEditor")});bar.append(reminder);
 const add=mk("button","gtc-primary","+ New task");add.addEventListener("click",()=>{nav("Tasks");invoke("newTask");const e=$("editor");if(e)e.scrollIntoView({behavior:"smooth",block:"start"})});bar.append(add);
 root.prepend(bar);
}
function createOverview(main){
 const overview=mk("section","gtc-overview");overview.id="gtcOverview";
 const summary=main.querySelector(".summary");if(summary)overview.append(summary);
 const charts=main.querySelector(".charts");if(charts){const company=charts.querySelector("#companyBars")?.closest(".chartbox"),donut=charts.querySelector("#donut")?.closest(".chartbox");
 if(company&&donut){charts.append(company,donut);}
 overview.append(charts);
 }
 const status=main.querySelector("#statusBars")?.closest(".chartbox");if(status){status.style.display="none";overview.append(status)}
 const grid=mk("div","gtc-widget-grid");
 const due=mk("section","gtc-widget");due.innerHTML="<h2>Due in the next 7 days (including overdue)</h2><div id='gtcDue'></div>";
 const recent=mk("section","gtc-widget");recent.innerHTML="<h2>Recent activity</h2><div id='gtcRecent'></div>";
 grid.append(due,recent);overview.append(grid);main.prepend(overview);
}
function updateCounts(){
 const metric={Tasks:$("total")?.textContent,"Overdue tasks":$("overdue")?.textContent,Reminders:$("reminderCount")?.textContent,Updates:$("masterActivityCount")?.textContent,Requests:$("masterRequestCount")?.textContent};
 Object.entries(metric).forEach(([k,v])=>{const e=document.querySelector('.gtc-count[data-count="'+k+'"]');if(e&&v!==undefined&&v!==null&&v!=="")e.textContent=v});
 // Read total records from the same in-memory task collection as the original
 // dashboard. Do not use visibleTasks() or active filters for company counts.
 const names=["SiTech","TradeWell","Shadows","Al-Kawashif","General Tasks"];
 let data;
 try{if(typeof tasks!=="undefined"&&Array.isArray(tasks))data=tasks;}catch(e){}
 names.forEach(name=>{
   const badge=document.querySelector('.gtc-count[data-count="'+name+'"]');if(!badge)return;
   if(!data){badge.textContent="—";return;}
   badge.textContent=String(data.filter(t=>(t.company||"SiTech")===name).length);
 });
 // H.R. is a category shared across companies, not its own company.
 const hr=document.querySelector('.gtc-count[data-count="H.R."]');
 if(hr&&data)hr.textContent=String(data.filter(t=>t.taskType==="HR"||t.category==="Employment, Recruitment & HR Documentation").length);
}

function row(parent,head,detail,right,onOpen){
 const r=mk(onOpen?"button":"div","gtc-row"+(onOpen?" gtc-row-link":""));
 if(onOpen){r.type="button";r.addEventListener("click",onOpen)}
 const left=mk("div");
 left.append(mk("b","",head||""));
 if(detail)left.append(mk("div","gtc-detail",detail));
 const date=mk("span","gtc-date",right||"");
 r.append(left,date);parent.append(r);
}

function updateWidgets(){
 updateCounts();
 const due=$("gtcDue"),recent=$("gtcRecent");if(!due||!recent)return;
 due.replaceChildren();recent.replaceChildren();
 // Use the saved task collection directly. The task list is filtered by
 // current company, status and H.R. and cannot supply Overview-wide data.
 let allTasks=[];
 try{if(typeof tasks!=="undefined"&&Array.isArray(tasks))allTasks=tasks;}catch(e){}
 const today=new Date();today.setHours(0,0,0,0);
 const ceiling=today.getTime()+7*86400000;
 const dueTasks=allTasks.filter(t=>{
   if(!t.date||t.status==="Completed")return false;
   const date=new Date(String(t.date).slice(0,10)+"T12:00:00");
   return Number.isFinite(+date)&&date.getTime()<ceiling+43200000;
 }).sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,7);
 dueTasks.forEach(t=>{
   const company=t.company||"SiTech";
   const detail=[company,t.division,t.assigned].filter(Boolean).join(" · ");
   const date=new Date(String(t.date).slice(0,10)+"T12:00:00");
   row(due,t.task||"Task",detail,date.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),()=>openOverviewRecord("task",t.id));
 });
 if(!due.children.length)row(due,"No outstanding tasks due within seven days","Check Tasks for other records","");
 // Draw actual master activity events, even when the notification popup is closed.
 let events=[];
 try{if(typeof masterActivityEvents==="function")events=masterActivityEvents().filter(x=>x.type!=="due");}catch(e){}
 events.slice(0,6).forEach(e=>{
   const descriptor=(e.type==="reminder"?"Reminder":"Task")+" updated — "+(e.title||"");
   row(recent,descriptor,e.body||"",e.date?new Date(e.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"}):"",()=>openOverviewRecord(e.type,e.id));
 });
 if(!recent.children.length)row(recent,"No recent task or reminder updates","New updates appear here automatically","");
}

function init(){
 if(!$("appShell")||!document.querySelector("#appShell main")||$("gtcOverview"))return;
 const root=$("appShell"),main=root.querySelector("main");
 createSidebar(root);createTopbar(root);createOverview(main);
 // Move the existing history panel into the dashboard content area. This
 // preserves original filters, pagination, PDF export and record handlers.
 const history=$("historySection");
 if(history&&history.parentElement!==main)main.prepend(history);
 const historyClose=history?.querySelector('button[onclick="toggleHistoryPanel(false)"]');
 if(historyClose){historyClose.setAttribute("onclick","");historyClose.addEventListener("click",()=>nav("Tasks"));}
 
 document.body.classList.add("gtc-ready");
 nav("Overview");
 const targets=[$("total"),$("overdue"),$("reminderCount"),$("masterActivityCount"),$("masterRequestCount"),$("taskLists"),$("masterActivityItems")].filter(Boolean);
 observer=new MutationObserver(()=>{if(updateQueued)return;updateQueued=true;setTimeout(()=>{updateQueued=false;updateWidgets()},180)});
 targets.forEach(e=>observer.observe(e,{childList:true,subtree:true,characterData:true}));
 window.setInterval(updateCounts,10000);
}
window.gtcNavigateReminders=()=>nav("Reminders");
window.gtcNavigateTasks=()=>nav("Tasks");
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
