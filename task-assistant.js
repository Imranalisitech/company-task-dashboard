/* Task Assistant: supported text commands, not an external LLM. */
(function(){
"use strict";
const $=s=>document.querySelector(s),pad=n=>String(n).padStart(2,"0");
function localDate(n=0){const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function day(text){
 let m=text.match(/\b(20\d{2})-(\d\d?)-(\d\d?)\b/);if(m)return m[1]+"-"+pad(m[2])+"-"+pad(m[3]);
 m=text.match(/\b(\d\d?)[-/](\d\d?)[-/](20\d{2})\b/);if(m)return m[3]+"-"+pad(m[2])+"-"+pad(m[1]);
 return /\btomorrow\b/i.test(text)?localDate(1):/\btoday\b/i.test(text)?localDate(0):"";
}
function time(text){
 let m=text.match(/\b(?:at\s*)?(\d{1,2})(?::([0-5]\d))?\s*(am|pm)\b/i);
 if(m){const h=+m[1];if(h<1||h>12)return "";return pad(h%12+(m[3].toLowerCase()==="pm"?12:0))+":"+pad(m[2]||"00")}
 m=text.match(/\bat\s+([01]?\d|2[0-3]):([0-5]\d)\b/i);return m?pad(m[1])+":"+m[2]:"";
}
const mappings=[["AlMakan Elevators & Escalators","SiTech","AlMakan Elevators & Escalators"],["SSOMCO","Shadows","SSOMCO"],["Topaz","SiTech","Topaz"],["Kosheri","SiTech","Kosheri"],["Jodah","SiTech","Jodah"],["General Tasks","General Tasks",""],["Al-Kawashif","Al-Kawashif",""],["TradeWell","TradeWell",""],["Shadows","Shadows",""],["SiTech","SiTech",""]];
function company(text,isPersonal){
 if(isPersonal)return {company:"Personal",division:"General"};
 const found=mappings.find(m=>text.toLowerCase().includes(m[0].toLowerCase()));
 return found?{company:found[1],division:found[2]}:null;
}
function trimCompany(text){
 for(const [name] of mappings){
 const safe=name.replace(/[^a-z0-9 ]/gi,"\\$&");
 text=text.replace(new RegExp("\\b(?:for|in|under|company)\\s+"+safe+"\\b","ig")," ");
 }
 return text;
}
function parse(input,isPersonal){
 const raw=input.trim();let m;
 if(/^(help|commands|examples|what can you do)\??$/i.test(raw))return {type:"help"};
 if((m=raw.match(/^(?:show|open|list|view)\s+(?:all\s+)?(overdue|pending|completed|in progress|all)\s+tasks?$/i)))return {type:"filter",status:m[1]==="all"?"all":m[1]==="in progress"?"In Progress":m[1]==="overdue"?"Overdue":m[1]==="completed"?"Completed":"Pending"};
 if(/^(?:show|open|list)\s+(?:my\s+)?reminders?$/i.test(raw))return {type:"page",label:"Reminders"};
 if(/^(?:show|open|list)\s+history$/i.test(raw))return {type:"page",label:"History"};
 if((m=raw.match(/^(?:find|search(?: for)?|look for)\s+(.+)$/i)))return {type:"search",query:m[1].trim()};
 if((m=raw.match(/^(?:open|show|view)\s+task\s*#?(\d+)$/i)))return {type:"open",id:+m[1]};
 if((m=raw.match(/^(?:mark|set|change)\s+task\s*#?(\d+)\s+(?:status\s*)?(?:to|as|is)?\s*(complete|completed|done|in progress|pending)$/i)))return {type:"setStatus",id:+m[1],status:/complete|done/i.test(m[2])?"Completed":/progress/i.test(m[2])?"In Progress":"Pending"};
 if((m=raw.match(/^assign\s+task\s*#?(\d+)\s+to\s+(.+)$/i)))return {type:"assign",id:+m[1],assigned:m[2].trim()};
 if((m=raw.match(/^(?:add\s+(?:an?\s+)?update|update|add\s+note)\s+(?:to\s+)?task\s*#?(\d+)\s*[:\-]\s*(.+)$/i)))return {type:"update",id:+m[1],text:m[2].trim()};
 if((m=raw.match(/^move\s+task\s*#?(\d+)\s+to\s+(.+)$/i))){
 if(isPersonal||/personal/i.test(m[2]))return {type:"error",message:"Moving tasks to or from Personal requires the original Move Tasks workflow."};
 const target=company(m[2],false);return target?{type:"move",id:+m[1],...target,confirm:true}:{type:"error",message:"Please specify a recognized destination company."};
 }
 if((m=raw.match(/^delete\s+task\s*#?(\d+)$/i)))return isPersonal?{type:"error",message:"To delete a Personal task, use its existing Delete control. I will not bypass its confirmation."}:{type:"delete",id:+m[1],confirm:true};
 if(/^(?:create|add|make)\s+(?:a\s+|new\s+)?task\b/i.test(raw)){
 let rest=raw.replace(/^(?:create|add|make)\s+(?:a\s+|new\s+)?task\s*[:\-]?\s*/i,"");
 const d=day(rest),co=company(rest,isPersonal);
 const assign=rest.match(/\bassigned\s+to\s+([^,;]+?)(?=\s+(?:due|for|on|company)\b|$)/i);if(assign)rest=rest.replace(assign[0]," ");
 rest=trimCompany(rest).replace(/\b(?:due\s+(?:on\s+)?|by\s+|on\s+)?(?:today|tomorrow|20\d{2}-\d\d?-\d\d?|\d\d?[-/]\d\d?[-/]20\d{2})\b/gi," ");
 rest=rest.replace(/^[\s:,;-]+|[\s:,;-]+$/g,"").replace(/\s{2,}/g," ");
 if(!rest)return {type:"error",message:"Please include a task description."};
 if(!d)return {type:"error",message:"A due date is required. Example: Create task follow up with supplier for SiTech due 25-11-2026"};
 if(!co)return {type:"error",message:"Please include the company, such as 'for SiTech'."};
 return {type:"createTask",title:rest.replace(/^to\s+/i,""),date:d,assigned:assign?.[1]?.trim()||"",...co};
 }
 if(/^(?:create|add|set|make)\s+(?:a\s+|new\s+)?reminder\b|^remind\s+me\b/i.test(raw)){
 let rest=raw.replace(/^(?:create|add|set|make)\s+(?:a\s+|new\s+)?reminder\s*[:\-]?\s*|^remind\s+me\s+(?:to\s+)?/i,"");
 const d=day(rest),t=time(rest),co=company(rest,isPersonal);
 if(!d||!t)return {type:"error",message:"Reminder requires a date and time. Example: Remind me to call supplier tomorrow at 10 AM for SiTech"};
 if(!co)return {type:"error",message:"Please include the company, such as 'for SiTech'."};
 rest=trimCompany(rest).replace(/\b(?:due\s+|on\s+|at\s+)?(?:today|tomorrow|20\d{2}-\d\d?-\d\d?|\d\d?[-/]\d\d?[-/]20\d{2})\b/ig," ").replace(/\b(?:at\s+)?(?:\d\d?:\d\d\s*(?:am|pm)?|\d\d?\s*(?:am|pm))\b/ig," ").replace(/^[\s:,;-]+|[\s:,;-]+$/g,"").replace(/\s{2,}/g," ");
 if(!rest)return {type:"error",message:"Please include a reminder description."};
 return {type:"createReminder",title:rest.replace(/^to\s+/i,""),datetime:d+"T"+t,...co};
 }
 return {type:"error",message:"I can't perform that command yet. Type Help to see supported commands."};
}

/* Flexible local intent resolution. Keeps a strict whitelist of permitted actions,
   never interprets unknown text as a write. All writes pass the authenticated bridge. */
function normalizeSentence(text){
 let t=String(text||"").trim().replace(/[؟?!。]+$/g,"").replace(/\s+/g," ");
 t=t.replace(/^(?:(?:hey|hello|hi)\s+)?(?:(?:assistant|chatgpt|ai)\s*,?\s*)?(?:(?:please|kindly)\s+)?/i,"");
 t=t.replace(/^(?:(?:could|would|can|will)\s+you\s+(?:please\s+)?)/i,"");
 t=t.replace(/^(?:(?:i\s+(?:would\s+)?(?:like|need|want)\s+(?:you\s+)?to\s+))/i,"");
 t=t.replace(/^(?:(?:just|now)\s+)/i,"");
 t=t.replace(/\bthe\s+task\s+(?:number|id)\s*#?\s*(\d+)\b/gi,"task $1");
 t=t.replace(/\btask\s+(?:number|id)\s*#?\s*(\d+)\b/gi,"task $1");
 t=t.replace(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,(_,dayName)=>nextWeekday(dayName,true));
 t=t.replace(/\bthis\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,(_,dayName)=>nextWeekday(dayName,false));
 t=t.replace(/\bin\s+(\d+)\s+days?\b/gi,(_,n)=>localDate(Math.min(+n,365)));
 t=t.replace(/\bday\s+after\s+tomorrow\b/gi,localDate(2));
 return t;
}
function nextWeekday(dayName,nextWeek){
 const days=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
 const target=days.indexOf(dayName.toLowerCase()),now=new Date();
 let delta=(target-now.getDay()+7)%7;if(delta===0||nextWeek)delta+=7;
 return localDate(delta);
}
function interpreted(text,isPersonal){
 const normalized=normalizeSentence(text);
 let result=parse(normalized,isPersonal);
 if(result.type!=="error")return result;
 const t=normalized.toLowerCase();let m,action="";
 // Navigation, task lookup and natural questions.
 if(/(?:what(?:'s| is| are)?|show me|display|bring up|list|check|which|any)\b/.test(t)&&/(?:task|work|item|job)/.test(t)&&!/\bstatus\b/.test(t)){
  const status=/overdue|late|past due|behind|delayed/.test(t)?"Overdue":/pending|not started|waiting/.test(t)?"Pending":/ongoing|in progress|being worked/.test(t)?"In Progress":/finished|completed|done/.test(t)?"Completed":"all";
  return {type:"filter",status};
 }
 if(/(?:where|find|locate|search|look up|look for|track|check on)\b/.test(t)){
  const query=normalized.replace(/^(?:where\s+(?:is|are)|find|locate|search(?:\s+for)?|look\s+(?:up|for)|track|check\s+on)\s*(?:the\s+)?(?:task\s+)?/i,"").trim();
  if(query)return {type:"search",query};
 }
 if(/reminders?|notifications?/i.test(t)&&/(?:show|open|display|bring|list|see|check)\b/i.test(t))return {type:"page",label:"Reminders"};
 if(/\bhistory|activity\s+log\b/i.test(t)&&/(?:show|open|display|see|check|review)\b/.test(t))return {type:"page",label:"History"};
 if(/\boverview|dashboard|home\b/.test(t)&&/(?:show|open|display|go|return|back|see)\b/.test(t))return {type:"page",label:"Overview"};
 // Extract an explicit task ID before inferring any update or deletion.
 const tid=(normalized.match(/(?:task|#|number)\s*#?\s*(\d{1,10})\b/i)||[])[1];
 const id=tid?Number(tid):null;
 if(id&&/^(?:what|which|tell|check|show|how)/i.test(t)&&/\bstatus\b/.test(t))return {type:"taskStatus",id};
 if(id){
  if(/\b(?:delete|remove|erase|trash|discard)\b/i.test(t))return isPersonal?{type:"error",message:"For Personal task deletion, please use its original Delete button."}:{type:"delete",id,confirm:true};
  if(/\b(?:move|transfer|reassign\s+to\s+company|switch\s+to\s+company)\b/i.test(t)){
   if(/personal/i.test(t)||isPersonal)return {type:"error",message:"Moving tasks to or from Personal must use the existing Move Tasks workflow."};
   const target=company(t.replace(/\btask\s*#?\d+/gi,""),false);
   return target?{type:"move",id,...target,confirm:true}:{type:"error",message:"Please tell me the destination company."};
  }
  if(/\b(?:assign|assigned|assignment|give|allocate|delegate|hand over)\b/i.test(t)){
   m=normalized.match(/\b(?:to|assigned\s+to|for)\s+([a-z][\w .'-]+)\s*$/i);
   if(m&&m[1].trim())return {type:"assign",id,assigned:m[1].trim()};
  }
  const status=/\b(?:completed|finished|done|closed|resolved|complete)\b/.test(t)?"Completed":/\b(?:in progress|ongoing|working|started)\b/.test(t)?"In Progress":/\b(?:pending|waiting|not started|reopen|reopened)\b/.test(t)?"Pending":null;
  if(status&&/\b(?:change|set|update|mark|make|finish|complete|close|reopen|start|put|status|task)\b/.test(t))return {type:"setStatus",id,status};
  if(/\b(?:note|comment|update|remarks?|progress)\b/.test(t)){
   m=normalized.match(/\b(?:note|comment|update|say|that|remarks?)\s*(?:to|for|on|about|is|:|-)?\s*(.+)$/i);
   if(m&&m[1]&&!/^(?:the\s+)?task/i.test(m[1]))return {type:"update",id,text:m[1].trim()};
  }
  if(/(?:open|show|view|go to|take me to|bring up|pull up)/i.test(t))return {type:"open",id};
 }
 // New task, various English phrasings.
 if(/\b(?:task|to-do|todo|work item|action item)\b/.test(t)&&/\b(?:create|make|add|put|record|register|log|start|set up|write|need|want|new)\b/.test(t)){
  const prepared=normalized.replace(/^.*?\b(?:create|make|add|put|record|register|log|start|set up|write down|need|want)\b/i,"Create")
   .replace(/\b(?:to-do|todo|work item|action item)\b/i,"task")
   .replace(/\b(create)\s+(?:me\s+)?(?:a\s+|another\s+|new\s+)?(?!task\b)/i,"$1 task ");
  result=parse(prepared,isPersonal);
  if(result.type!=="error")return result;
  return result;
 }
 // Reminders, flexible sentences.
 if(/\b(?:remind|reminder|alert|notify|notification)\b/.test(t)&&/\b(?:create|make|add|put|set|give|need|want|remind|alert|notify)\b/.test(t)){
  let prepared=normalized.replace(/^.*?\b(?:remind|reminder|alert|notify|create|make|add|put|set|need|want)\b/i,"Remind me to ");
  prepared=prepared.replace(/^Remind me to\s+(?:me\s+)?(?:a\s+)?(?:reminder|notification|alert)\s+(?:to\s+)?/i,"Remind me to ");
  result=parse(prepared,isPersonal);
  if(result.type!=="error")return result;
 }
 // Arabic navigation and common status wording on voice transcription.
 if(/[\u0600-\u06ff]/.test(normalized)){
  if(/(?:المهام|المهمة)/.test(normalized)&&/(?:متأخرة|متاخره)/.test(normalized))return {type:"filter",status:"Overdue"};
  if(/(?:المهام|المهمة)/.test(normalized)&&/(?:مكتملة|منتهية)/.test(normalized))return {type:"filter",status:"Completed"};
  if(/(?:تذكير|التذكيرات)/.test(normalized)&&/(?:افتح|عرض|اعرض)/.test(normalized))return {type:"page",label:"Reminders"};
  if(/(?:السجل|التاريخ)/.test(normalized)&&/(?:افتح|عرض|اعرض)/.test(normalized))return {type:"page",label:"History"};
 }
 return result;
}

const state={open:false,busy:false,pending:null};
function post(message,who="assistant"){
 const feed=$("#assistantMessages");if(!feed)return;
 const box=document.createElement("div");box.className="assistant-msg "+who;box.textContent=message;feed.append(box);feed.scrollTop=feed.scrollHeight;
}
function toast(message,ok=true){
 document.getElementById("assistantToast")?.remove();
 const b=document.createElement("div");b.id="assistantToast";b.className="assistant-toast "+(ok?"success":"error");b.setAttribute("role","status");b.textContent=(ok?"✓ ":"⚠ ")+message;document.body.append(b);
 setTimeout(()=>{b.classList.add("leaving");setTimeout(()=>b.remove(),300)},6500);
}
function navigate(name){
 const personal=document.body.classList.contains("pdc-ready");
 const s=personal?'.pdc-sidebar-link[data-page="'+name+'"]':'.gtc-navitem[data-goto="'+name+'"]';
 $(s)?.click();
}
function openTask(id){
 navigate("Tasks");if(typeof window.openSearchResult==="function")window.openSearchResult(id);
}
function filter(status){
 navigate(status==="Overdue"?"Overdue tasks":"Tasks");
 if(status!=="Overdue"){const select=$("#statusFilter");if(select){select.value=status;select.dispatchEvent(new Event("change"))}}
 post("Showing "+(status==="all"?"all tasks":status+" tasks")+".");
 toast((status==="all"?"All":status)+" tasks displayed.");
}
function search(q){
 const data=window.dashboardAssistantBridge?.snapshot();
 if(!data?.ready){post("Your task data isn't connected yet.");return}
 const query=q.toLowerCase().replace(/^task\s*#?/i,"");
 const results=data.tasks.filter(t=>[t.id,t.title,t.status,t.company,t.division,t.assigned,t.notes].some(v=>String(v||"").toLowerCase().includes(query))).slice(0,8);
 if(!results.length){post("No matching tasks were found.");return}
 post("Found "+results.length+" matching tasks. Click any result to open it.");
 const feed=$("#assistantMessages");
 for(const t of results){const b=document.createElement("button");b.className="assistant-result";b.type="button";b.textContent="#"+t.id+" · "+t.title.slice(0,80)+" ("+t.status+")";b.addEventListener("click",()=>openTask(t.id));feed.append(b)}
 feed.scrollTop=feed.scrollHeight;
}
function help(){
 post("Supported commands:\n• Show overdue tasks\n• Find salary card\n• Open task 2030\n• Create task follow up with supplier for SiTech due 25-11-2026\n• Remind me to call supplier tomorrow at 10 AM for SiTech\n• Mark task 2030 completed\n• Assign task 2030 to Ahmad\n• Add update to task 2030: contacted supplier\n• Move task 2030 to TradeWell (confirmation required)\n• Delete task 2030 (confirmation required on Master)\n\nTry natural wording or use the microphone in English or Arabic. I understand common alternatives, but unsupported requests need manual action or a secure AI integration.");
}
function setBusy(b){state.busy=b;$("#assistantInput").disabled=b;$("#assistantSend").disabled=b}
async function perform(action){
 setBusy(true);
 try{
  const result=await window.dashboardAssistantBridge.execute(action);
  post(result.message);toast(result.message);
  if(result.taskId)openTask(result.taskId);
  else if(result.reminderId){navigate("Reminders");if(typeof window.openNotificationReminder==="function")window.openNotificationReminder(result.reminderId)}
 }catch(e){const msg="Not completed: "+(e?.message||"The database action failed");post(msg);toast(msg,false)}
 finally{setBusy(false)}
}
function confirmAction(action){
 state.pending=action;
 post(action.type==="delete"?"Move task #"+action.id+" to the Recycle Bin?":"Move task #"+action.id+" to "+action.company+"? Please confirm.");
 const holder=document.createElement("div");holder.className="assistant-confirm";
 const yes=document.createElement("button"),no=document.createElement("button");yes.textContent="Confirm";no.textContent="Cancel";yes.type="button";no.type="button";
 yes.addEventListener("click",async()=>{holder.remove();const accepted=state.pending;state.pending=null;if(accepted)await perform(accepted)});
 no.addEventListener("click",()=>{holder.remove();state.pending=null;post("Cancelled. No changes made.")});
 holder.append(yes,no);$("#assistantMessages").append(holder);
 $("#assistantMessages").scrollTop=$("#assistantMessages").scrollHeight;
}
async function submit(query){
 if(state.busy)return;
 if(state.pending){
  if(/^(yes|confirm|proceed|go ahead|okay|ok|نعم|تأكيد)$/i.test(query.trim())){$(".assistant-confirm button:first-child")?.click();return}
  if(/^(no|cancel|stop|لا|إلغاء)$/i.test(query.trim())){$(".assistant-confirm button:last-child")?.click();return}
  post("Please confirm or cancel the previous action first.");return
 }
 post(query,"user");
 const bridge=window.dashboardAssistantBridge;
 if(!bridge){post("The assistant action service is not ready. Refresh the page.");return}
 const action=interpreted(query,bridge.personal);
 switch(action.type){
 case "help":help();return;
 case "error":post(action.message);return;
 case "filter":filter(action.status);return;
 case "page":navigate(action.label);post(action.label+" opened.");toast(action.label+" opened.");return;
 case "search":search(action.query);return;
 case "taskStatus":{const row=bridge.snapshot().tasks.find(t=>t.id===action.id);post(row?"Task #"+row.id+" is "+row.status+"; due "+(row.due||"not specified")+".":"Task #"+action.id+" was not found.");return;}
 case "open":{const rows=bridge.snapshot().tasks;if(rows.some(t=>t.id===action.id)){openTask(action.id);post("Task #"+action.id+" opened.");toast("Task #"+action.id+" opened.");}else post("Task #"+action.id+" was not found.");return;}
 default:if(action.confirm)confirmAction(action);else await perform(action);
 }
}
function init(){
 if(!document.getElementById("appShell")||$("#assistantLauncher"))return;
 const root=document.createElement("div");root.className="task-assistant-root";
 const launcher=document.createElement("button");launcher.type="button";launcher.id="assistantLauncher";launcher.innerHTML='<span class="assistant-spark">✦</span> <span>AI Task Assistant</span>';launcher.setAttribute("aria-expanded","false");
 const panel=document.createElement("section");panel.id="assistantPanel";panel.hidden=true;panel.setAttribute("aria-label","Task Assistant");
 const head=document.createElement("header");head.className="assistant-head";head.innerHTML='<span class="assistant-avatar">✦</span><span><strong>Task Assistant</strong><small>Secure command mode</small></span>';
 const close=document.createElement("button");close.type="button";close.textContent="×";close.setAttribute("aria-label","Close chat");head.append(close);
 const feed=document.createElement("div");feed.id="assistantMessages";feed.className="assistant-messages";feed.setAttribute("aria-live","polite");
 const quick=document.createElement("div");quick.className="assistant-quick";
 for(const [label,command] of [["Overdue","Show overdue tasks"],["Find tasks","Find supplier"],["Help","Help"]]){
  const b=document.createElement("button");b.type="button";b.textContent=label;b.addEventListener("click",()=>submit(command));quick.append(b);
 }
 const form=document.createElement("form");form.className="assistant-form";
 const input=document.createElement("input");input.id="assistantInput";input.type="text";input.placeholder="Ask about your tasks…";input.autocomplete="off";input.maxLength=500;
 const send=document.createElement("button");send.type="submit";send.textContent="Send";send.id="assistantSend";
 const mic=document.createElement("button");mic.type="button";mic.id="assistantMic";mic.className="assistant-mic";mic.textContent="🎙";mic.setAttribute("aria-label","Speak a task command");mic.title="Speak instead of typing";
 const language=document.createElement("select");language.id="assistantVoiceLang";language.className="assistant-language";language.setAttribute("aria-label","Speech language");
 [["en-US","English"],["ar-SA","العربية"]].forEach(([value,label])=>{const opt=document.createElement("option");opt.value=value;opt.textContent=label;language.append(opt)});
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 let listening=false,recognizer=null;
 if(!Recognition){mic.disabled=true;mic.title="Speech recognition is not available in this browser or desktop wrapper";}
 else{
  mic.addEventListener("click",()=>{
   if(listening){recognizer?.stop();return}
   if(state.busy){post("Please wait until the current action finishes.");return}
   try{
    recognizer=new Recognition();recognizer.lang=language.value;recognizer.interimResults=true;recognizer.continuous=false;recognizer.maxAlternatives=1;
    let finished=false;
    recognizer.onstart=()=>{listening=true;mic.classList.add("listening");mic.textContent="●";mic.setAttribute("aria-label","Stop listening");mic.title="Listening — click to stop"};
    recognizer.onresult=e=>{
     let interim="",final="";
     for(let i=e.resultIndex;i<e.results.length;i++){
      const item=e.results[i];if(item.isFinal)final+=item[0].transcript;else interim+=item[0].transcript;
     }
     input.value=final||interim;
     if(final.trim()&&!finished){finished=true;const said=final.trim();input.value="";submit(said)}
    };
    recognizer.onerror=e=>{const detail=e.error==="not-allowed"?"Microphone access was denied. Allow access in the browser or Windows settings.":e.error==="network"?"Speech service was unavailable. Please type your command.":"Voice recognition: "+e.error;post(detail);};
    recognizer.onend=()=>{listening=false;mic.classList.remove("listening");mic.textContent="🎙";mic.setAttribute("aria-label","Speak a task command");mic.title="Speak instead of typing";recognizer=null};
    recognizer.start();
   }catch(e){post("Voice input could not start: "+(e.message||String(e)))}
  });
 }
 form.append(input,language,mic,send);form.addEventListener("submit",e=>{e.preventDefault();const text=input.value.trim();if(text){input.value="";submit(text)}});
 panel.append(head,feed,quick,form);
 const voiceNote=document.createElement("small");voiceNote.className="assistant-voice-note";voiceNote.textContent="Voice recognition depends on your browser and may use its speech service.";panel.append(voiceNote);root.append(panel,launcher);document.body.append(root);
 const toggle=show=>{state.open=show;panel.hidden=!show;launcher.setAttribute("aria-expanded",String(show));if(show)input.focus()};
 launcher.addEventListener("click",()=>toggle(!state.open));close.addEventListener("click",()=>toggle(false));
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&state.open)toggle(false)});
 post("Hello! I can search, create and update tasks and reminders using your signed-in account. Type Help for examples. Moves and deletions require confirmation.");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
