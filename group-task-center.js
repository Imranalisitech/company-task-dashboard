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
  head.append(mk("strong","","Employee company access links"));
  const close=mk("button","gtc-secondary","✕ Close");close.type="button";close.addEventListener("click",()=>panel.hidden=true);
  head.append(close);panel.append(head);
  panel.append(mk("p","gtc-company-links-help","The employee links require their original private access code. Add each existing private link once, then use Open or Copy for employees. Codes are stored in this browser only, not in public website code."));
  const entries=[["SiTech","sitech"],["AlMakan Elevators & Escalators","almakan"],["Restaurants — Topaz, Kosheri & Jodah","restaurants"],["TradeWell","tradewell"],["Shadows","shadows"],["SSOMCO","ssomco"],["Al-Kawashif","al-kawashif"]];
  entries.forEach(([name,key])=>{
    const section=mk("div","gtc-link-entry");
    section.append(mk("strong","",name));
    const row=mk("div","gtc-link-entry-row");
    const input=mk("input","gtc-link-input");input.type="url";input.placeholder="Paste the original private employee link";input.autocomplete="off";input.setAttribute("aria-label",name+" private link");
    const save=mk("button","gtc-secondary","Save link");save.type="button";
    const open=mk("button","gtc-secondary","Open");open.type="button";
    const copy=mk("button","gtc-secondary","Copy");copy.type="button";
    const status=mk("small","gtc-link-status");
    const tokenKey="company_private_access_"+key;
    const base=()=>new URL("/company.html?company="+encodeURIComponent(key),location.origin);
    const validToken=t=>/^[a-f0-9]{64}$/i.test(t);
    const stored=()=>{try{return localStorage.getItem(tokenKey)||""}catch(e){return ""}};
    const fullLink=()=>{
      const token=stored();
      if(!validToken(token))return null;
      const url=base();url.hash="access="+token;return url.href;
    };
    const refresh=()=>{
      const ready=!!fullLink();open.disabled=!ready;copy.disabled=!ready;
      status.textContent=ready?"Private link saved — ready to open or copy":"Private access link not saved on this device";
      input.placeholder=ready?"Paste a different private link to replace":"Paste the original private employee link";
    };
    save.addEventListener("click",()=>{
      try{
        const parsed=new URL(input.value.trim());
        const company=parsed.searchParams.get("company")||(parsed.pathname.endsWith("/almakan.html")?"almakan":null);
        const token=parsed.hash.slice(1).replace(/^access=/,"");
        if(parsed.origin!==location.origin||!["/company.html","/almakan.html"].includes(parsed.pathname)||company!==key||!validToken(token)){
          status.textContent="Invalid link for "+name+". Paste the full original private company link.";return;
        }
        localStorage.setItem(tokenKey,token);
        input.value="";refresh();
      }catch(e){status.textContent="Please paste a complete company link, including its access code.";}
    });
    open.addEventListener("click",()=>{const url=fullLink();if(url)window.open(url,"_blank","noopener,noreferrer")});
    copy.addEventListener("click",async()=>{const url=fullLink();if(!url)return;try{await navigator.clipboard.writeText(url);status.textContent="Private employee link copied";}catch(e){status.textContent="Copy unavailable in this desktop application; use Open to access the link.";}});
    row.append(input,save,open,copy);
    section.append(row,status);panel.append(section);refresh();
  });
  document.body.append(panel);
 }
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
