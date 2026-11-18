/* Display-only date formatting. Storage and native date inputs stay ISO. */
(function(){
 "use strict";
 const pad=n=>String(n).padStart(2,"0");
 function valid(y,m,d){const dt=new Date(y,m-1,d);return dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d;}
 function convert(value){
  if(value==null)return value;
  const str=String(value);
  // YYYY-MM-DD: from database and older rendered labels.
  let result=str.replace(/\b(20\d{2})-(\d{2})-(\d{2})\b/g,(v,y,m,d)=>
   valid(+y,+m,+d)?d+"-"+m+"-"+y:v);
  // Browser locale dates such as 11/18/2026, 12:49 AM.
  result=result.replace(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/g,(v,m,d,y)=>
   valid(+y,+m,+d)?pad(d)+"-"+pad(m)+"-"+y:v);
  // "18 Nov 2026" and "Nov 18, 2026" from date labels.
  const months={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
  result=result.replace(/\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(20\d{2})\b/gi,(v,d,name,y)=>{
   const m=months[name.slice(0,3).toLowerCase()];return valid(+y,m,+d)?pad(d)+"-"+pad(m)+"-"+y:v;
  });
  result=result.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(20\d{2})\b/gi,(v,name,d,y)=>{
   const m=months[name.slice(0,3).toLowerCase()];return valid(+y,m,+d)?pad(d)+"-"+pad(m)+"-"+y:v;
  });
  return result;
 }
 window.dashboardDateDisplay=convert;
 const avoid="script,style,textarea,select,option,input,pre,code,[contenteditable],.tasknotes,.reminder-latest-update p,.pdc-item-main small";
 const targets=".meta,.when,.reminder-due,.reminder-state,.reminder-latest-label,.reminder-latest-update,.gtc-date,.pdc-item-date,.pdc-item,.update-entry,.history-card,.history-jump,.task,.reminder-card,.master-activity-item,.company-status-row,.card.item,.updatebox,.sync-state,.foot,.notification,.chart-footnote";
 function eligible(node){
  const parent=node.parentElement;if(!parent||parent.closest(avoid))return false;
  if(parent.closest(targets))return true;
  if(parent.closest("#taskHistoryList,#remindersList,#taskLists,#pdcOverview,#gtcOverview,#list,#historySection"))return true;
  return false;
 }
 let running=false,pending=false;
 function run(){
  pending=false;
  if(running)return;
  running=true;
  try{
   const roots=["appShell","list"].map(id=>document.getElementById(id)).filter(Boolean);
   for(const root of roots){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while(node=walker.nextNode()){
     if(!eligible(node))continue;
     const old=node.nodeValue;
     if(!old||!/(20\d{2}-\d\d-\d\d|\d{1,2}\/\d{1,2}\/20\d{2}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b)/i.test(old))continue;
     const next=convert(old);if(next!==old)node.nodeValue=next;
    }
   }
  }finally{running=false}
 }
 function schedule(){if(pending||running)return;pending=true;requestAnimationFrame(run)}
 function setup(){
  const roots=["appShell","list"].map(id=>document.getElementById(id)).filter(Boolean);
  if(!roots.length)return;
  const observer=new MutationObserver(schedule);
  for(const root of roots)observer.observe(root,{subtree:true,childList:true,characterData:true});
  schedule();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});
 else setup();
})();
