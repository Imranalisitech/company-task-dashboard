/* Group Task Center UI — presentation layer only, never writes task records. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const mk=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
let current="Overview",observer,updateQueued=false;
const items=[
["WORKSPACE",[
["Overview","▦","#6058dc"],["Tasks","▤","#3d79bc"],["Overdue tasks","⚠","#d94c4c"],["Reminders","♧","#db931b"],["Updates","🔔","#6651be"],["Requests","📨","#df8738"],["H.R.","♙","#a845c3"],["History","◷","#3675da"],["Download reports","↓","#24a770"],["Inbox","✉","#0b9a9e"]]],
["COMPANIES",[
["SiTech","✣","#356cc7"],["TradeWell","♢","#0aa696"],["Shadows","☂","#8050ce"],["Al-Kawashif","▥","#eb7733"],["General Tasks","▣","#66768d"]]],
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
 const panel=$("gtcOverview");panel.hidden=!isOverview;
 const toolbar=document.querySelector("#appShell main .toolbar");
 if(toolbar)toolbar.classList.toggle("gtc-section-hidden",!isTask);
 ["taskLists","hrManagement"].forEach(id=>{const e=$(id);if(e)e.classList.toggle("gtc-tasks-hidden",!isTask)});
 if(!isOverview&&!isTask){/* The original panels control their own visibility. */}
 const hist=$("historySection"),rem=$("remindersSection");
 if(isHistory){invoke("toggleRemindersPanel",false);invoke("toggleHistoryPanel",true)}
 else if(isReminder){invoke("toggleHistoryPanel",false);invoke("toggleRemindersPanel",true)}
 else{invoke("toggleHistoryPanel",false);invoke("toggleRemindersPanel",false)}
 const title=$("gtcPageTitle");if(title)title.textContent=label;
 document.querySelectorAll(".gtc-navitem").forEach(b=>b.classList.toggle("active",b.dataset.goto===label));
 if(label==="Overdue tasks"){$("statusFilter").value="Overdue";invoke("render")}
 if(label==="Tasks"&&$("statusFilter").value==="Overdue"){$("statusFilter").value="all";invoke("render")}
 if(label==="H.R."){const b=document.querySelector('#companyTabs [data-task-view="HR"]');if(b)b.click()}
 if(["SiTech","TradeWell","Shadows","Al-Kawashif","General Tasks"].includes(label)){
 const b=[...document.querySelectorAll("#companyTabs [data-company]")].find(b=>b.getAttribute("data-company")===label);if(b)b.click();
 }
 updateWidgets();
}
function activate(label){
 if(label==="Personal"){window.location.href="/personal.html";return}
 if(label==="Recycle Bin"){invoke("toggleRecycleBin");return}
 if(label==="Desktop app"){invoke("installDesktopApp");return}
 if(label==="Backup & Restore"){const btn=document.querySelector('[onclick^="downloadFullProjectBackup"]');if(btn)btn.click();return}
 if(label==="Company Links"){if(typeof window.openCompanyLinks==="function"){window.openCompanyLinks();return}const x=document.querySelector('[onclick*="CompanyLinks"]');if(x)x.click();else alert("Company links can be accessed from the existing dashboard settings.");return}
 if(label==="Updates"){invoke("toggleMasterActivity");updateCounts();return}
 if(label==="Requests"){invoke("toggleMasterRequests");updateCounts();return}
 if(label==="Inbox"){invoke("toggleMasterRequests");return}
 if(label==="Download reports"){nav("Tasks");const b=document.querySelector('[onclick="printAll()"]');if(b)b.scrollIntoView({block:"center"});return}
 nav(label);
}
function createSidebar(root){
 const aside=mk("aside","gtc-sidebar");aside.setAttribute("aria-label","Main navigation");
 const brand=mk("div","gtc-brand");const logo=mk("span","gtc-brand-icon","♢");const brandText=mk("span","gtc-brand-text");brandText.innerHTML="Group Task Center<small>Admin Dashboard</small>";brand.append(logo,brandText);aside.append(brand);
 items.forEach(([section,rows])=>{
 aside.append(mk("div","gtc-section-label",section));
 rows.forEach(([label,ico,color])=>{
 const b=mk("button","gtc-navitem");b.type="button";b.dataset.goto=label;b.title=label;
 const i=mk("span","gtc-ico",ico);i.style.setProperty("--ico",color);
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
 const title=mk("strong","gtc-page-title","Overview");title.id="gtcPageTitle";bar.append(title);
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

function row(parent,head,detail,right){const r=mk("div","gtc-row");const left=mk("div");left.append(mk("b","",head||""));if(detail)left.append(mk("div","",detail));const date=mk("span","gtc-date",right||"");r.append(left,date);parent.append(r)}
function updateWidgets(){
 updateCounts();
 const due=$("gtcDue"),recent=$("gtcRecent");if(!due||!recent)return;
 due.replaceChildren();recent.replaceChildren();
 const cards=[...document.querySelectorAll("#taskLists .task")].slice(0,100);
 const now=new Date();let shown=0;
 cards.forEach(card=>{
 if(shown>=6)return;
 const name=card.querySelector("p")?.textContent?.trim()||card.querySelector("b")?.textContent?.trim()||"Task";
 const meta=card.querySelector(".meta")?.textContent||"";
 const dateMatch=meta.match(/\d{4}-\d{2}-\d{2}/);
 if(!dateMatch)return;
 const date=new Date(dateMatch[0]+"T12:00:00");if(Number.isNaN(+date)||date>new Date(now.getTime()+7*86400000))return;
 row(due,name,meta.replace(/\s+/g," ").slice(0,100),date.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}));shown++;
 });
 if(!shown)row(due,"Open Tasks to view upcoming due dates","All reminders and tasks remain available in their sections","");
 const source=$("masterActivityItems");const entries=source?[...source.children].slice(0,5):[];
 entries.forEach(e=>{const txt=e.textContent.replace(/\s+/g," ").trim();if(txt)row(recent,txt.slice(0,110),"","")});
 if(!recent.children.length)row(recent,"Open History for recent task and reminder changes","Your saved activity remains available","");
}
function init(){
 if(!$("appShell")||!document.querySelector("#appShell main")||$("gtcOverview"))return;
 const root=$("appShell"),main=root.querySelector("main");
 createSidebar(root);createTopbar(root);createOverview(main);
 document.body.classList.add("gtc-ready");
 nav("Overview");
 const targets=[$("total"),$("overdue"),$("reminderCount"),$("masterActivityCount"),$("masterRequestCount"),$("taskLists"),$("masterActivityItems")].filter(Boolean);
 observer=new MutationObserver(()=>{if(updateQueued)return;updateQueued=true;setTimeout(()=>{updateQueued=false;updateWidgets()},180)});
 targets.forEach(e=>observer.observe(e,{childList:true,subtree:true,characterData:true}));
 window.setInterval(updateCounts,10000);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
