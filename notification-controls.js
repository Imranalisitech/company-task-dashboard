/* Shared notification permission/feedback controller.
   Browser notifications are supported only with a granted site permission and
   while the relevant dashboard page is active. Does not alter task data. */
(function(){
"use strict";
const targets="#dashboardNotificationButton, #personalNotificationButton, #headingNotifyButton, #companyNotifyButton";
let statusTimer=null;
function permission(){
 if(!("Notification" in window))return "unsupported";
 if(!window.isSecureContext)return "insecure";
 return Notification.permission;
}
function getStatus(){
 const p=permission();
 if(p==="granted")return {label:"🔔 Notifications enabled",title:"Notifications enabled for this browser. Click to send a test.",state:"enabled"};
 if(p==="denied")return {label:"🔕 Notifications blocked",title:"Notifications are blocked. Click for browser-settings instructions.",state:"blocked"};
 if(p==="unsupported")return {label:"🔕 Notifications unavailable",title:"This browser does not support notifications.",state:"unavailable"};
 if(p==="insecure")return {label:"🔕 Secure connection required",title:"Open the dashboard over HTTPS to enable notifications.",state:"unavailable"};
 return {label:"🔔 Enable notifications",title:"Click to allow notifications from this website.",state:"off"};
}
function refresh(){
 const s=getStatus();
 document.querySelectorAll(targets).forEach(button=>{
  if(button.id==="headingNotifyButton"||button.id==="companyNotifyButton")button.textContent=s.label;
  else button.textContent=s.state==="enabled"?"🔔 ✓":s.state==="blocked"?"🔕":"🔔";
  button.dataset.notifyState=s.state;
  button.setAttribute("aria-label",s.label.replace(/^[^A-Za-z]+/,""));
  button.setAttribute("aria-pressed",String(s.state==="enabled"));
  button.title=s.title;
 });
}
function statusMessage(message){
 let node=document.getElementById("dashboardNotificationFeedback");
 if(!node){node=document.createElement("div");node.id="dashboardNotificationFeedback";node.setAttribute("role","status");node.setAttribute("aria-live","polite");document.body.append(node);}
 node.textContent=message;node.hidden=false;node.classList.add("visible");
 clearTimeout(statusTimer);
 statusTimer=setTimeout(()=>{node.classList.remove("visible");node.hidden=true},6500);
}
function test(){
 try{
  const label=location.pathname.startsWith("/company")?"Company dashboard":location.pathname.startsWith("/personal")?"Personal dashboard":"Main dashboard";
  const note=new Notification("Notifications enabled ✓",{body:label+" · Test notification. Upcoming task and reminder alerts will appear while this page is open.",tag:"dashboard-notifications-test-"+Date.now()});
  note.onclick=()=>{try{window.focus()}catch(e){}note.close()};
  statusMessage("Notifications enabled. A test notification was sent.");
  return true;
 }catch(e){
  statusMessage("Permission is enabled, but a test notification could not be displayed. Check your browser and system notification settings.");
  return false;
 }
}
function enable(){
 const p=permission();
 if(p==="unsupported"){statusMessage("This browser does not support notifications. Use a supported browser.");refresh();return;}
 if(p==="insecure"){statusMessage("Notifications require the secure HTTPS dashboard link.");refresh();return;}
 if(p==="denied"){statusMessage("Notifications are blocked for this website. Open your browser's site settings (lock/tune icon next to the address), change Notifications to Allow, then reload.");refresh();return;}
 if(p==="granted"){refresh();test();return;}
 // Call permission request directly from the button click, before any await.
 try{
  const request=Notification.requestPermission();
  Promise.resolve(request).then(result=>{
   refresh();
   if(result==="granted")test();
   else statusMessage(result==="denied"?"Notifications were blocked. Allow them in browser site settings.":"Permission was not granted. Click the bell again to enable notifications.");
  }).catch(()=>{refresh();statusMessage("Could not request notifications. Check the browser permission settings.");});
 }catch(e){refresh();statusMessage("Could not request notifications. Check the browser permission settings.");}
}
window.dashboardNotificationControls={enable,refresh,statusMessage,test};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});else refresh();
window.addEventListener("focus",refresh);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh()});
try{navigator.permissions?.query({name:"notifications"}).then(p=>{p.onchange=refresh}).catch(()=>{})}catch(e){}
})();
