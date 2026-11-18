/* Secure, command-scoped task assistant bridge. Uses the dashboard's existing authenticated Supabase client and RLS. */
(function(){
"use strict";
const personal=location.pathname.endsWith("/personal.html");
const table=personal?"personal_tasks":"company_tasks";
const remTable=personal?"personal_reminders":"company_reminders";
function err(msg){throw new Error(msg)}
const clean=x=>String(x??"").trim().slice(0,4000);
function dateValid(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const [y,m,d]=s.split("-").map(Number);const dt=new Date(y,m-1,d);return dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d;}
function ensureDate(s){if(!dateValid(s))err("Please provide a valid date (DD-MM-YYYY).");return s;}
function companyInfo(company,division){
 if(personal)return {company:"Personal",division:division||"General"};
 const list=Object.keys(structure);
 const match=list.find(c=>c.toLowerCase()===String(company||"").toLowerCase());
 if(!match)err("Please choose a known company: "+list.join(", "));
 if(division&&(structure[match]||[]).length && !(structure[match]||[]).some(d=>d.toLowerCase()===String(division).toLowerCase()))
  err("Unknown subdivision for "+match+".");
 return {company:match,division:division||""};
}
async function authorized(){
 if(!cloudReady)err("The dashboard is not connected. Sign in and wait until your tasks load.");
 const {data,error}=await cloud.auth.getUser();
 if(error||!data?.user)err("Please sign in before using assistant actions.");
 return data.user;
}
async function sync(){
 await loadCloudData();
}
async function fetchTask(id){
 const {data,error}=await cloud.from(table).select("*").eq("id",Number(id)).maybeSingle();
 if(error)err(error.message);if(!data||data.payload?.deletedAt)err("This task was not found.");
 return data;
}
async function updateTask(id,patch,description){
 await authorized();if(!Number.isSafeInteger(Number(id))||Number(id)<=0)err("Please supply a valid task number.");
 const dbRow=await fetchTask(id);
 const current=dbRow.payload||{id:dbRow.id,task:dbRow.task,company:dbRow.company,division:dbRow.division,status:dbRow.status,assigned:dbRow.assigned,date:dbRow.due_date};
 const next={...current,...patch};
 if(description){next.updates=[...(current.updates||[]),{date:new Date().toLocaleString(),text:description,status:next.status,images:[]}]}
 const update={payload:next,task:clean(next.task),company:next.company||dbRow.company,status:next.status||"Pending",assigned:next.assigned||"",division:next.division||"",due_date:dateValid(next.date)?next.date:null,updated_at:new Date().toISOString()};
 let query=cloud.from(table).update(update).eq("id",Number(id));
 if(dbRow.updated_at)query=query.eq("updated_at",dbRow.updated_at);
 const {data,error}=await query.select("id").maybeSingle();
 if(error)err("Could not save changes: "+error.message);
 if(!data)err("The task was changed elsewhere or permission was denied. Refresh and retry.");
 await sync();return {message:"Task #"+id+" updated and saved.",taskId:Number(id)};
}
async function createTask(input){
 await authorized();
 const name=clean(input.title);if(!name)err("Task description is required.");
 const date=ensureDate(input.date);
 const c=companyInfo(input.company|| (personal?"Personal":null),input.division);
 const type=input.taskType==="HR"?"HR":"General";
 const {data:recent,error:lookupError}=await cloud.from(table).select("id").order("id",{ascending:false}).limit(1);
 if(lookupError)err(lookupError.message);
 let nextId=Math.max(0,Number(recent?.[0]?.id)||0)+1;
 for(let attempt=0;attempt<2;attempt++){
 const payload={id:nextId,createdAt:Date.now(),task:name,category:type==="HR"?"Employment, Recruitment & HR Documentation":"General",date,status:"Pending",priority:"Medium",taskType:type,assigned:clean(input.assigned||""),notes:clean(input.notes||""),company:c.company,division:c.division,reminder:null,updates:[]};
 const {data,error}=await cloud.from(table).insert({id:nextId,task:name,company:c.company,division:c.division,status:"Pending",assigned:payload.assigned,due_date:date,payload}).select("id").maybeSingle();
 if(!error&&data){await sync();return {message:"Task #"+nextId+" created and saved.",taskId:nextId};}
 if(error?.code==="23505"){nextId++;continue}
 err("Task creation failed: "+(error?.message||"No database confirmation"));
 }
 err("A simultaneous task creation caused an ID conflict. Please retry.");
}
async function createReminder(input){
 await authorized();
 const name=clean(input.title),when=clean(input.datetime);
 if(!name)err("Reminder title is required.");
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(when)||Number.isNaN(Date.parse(when)))err("Enter the reminder date and time.");
 const company=companyInfo(input.company|| (personal?"Personal":null),input.division);
 const id="r"+Date.now()+"-"+Math.random().toString(36).slice(2,8);
 const payload={id,createdAt:Date.now(),title:name,at:when,text:clean(input.notes||""),images:[],done:false,statusOverride:null,criticality:"Medium",updates:[],company:company.company,division:company.division};
 const {data,error}=await cloud.from(remTable).insert({id,title:name,reminder_at:new Date(when).toISOString(),company:company.company,division:company.division,done:false,payload}).select("id").maybeSingle();
 if(error||!data)err("Reminder creation failed: "+(error?.message||"No database confirmation"));
 await sync();return {message:"Reminder created and saved.",reminderId:id};
}
async function deleteTask(id){
 if(personal)err("Personal task deletion must be completed using the original Delete control for now.");
 await authorized();
 const row=await fetchTask(id);
 const p={...(row.payload||{}),deletedAt:new Date().toISOString()};
 const {data,error}=await cloud.from(table).update({payload:p,updated_at:new Date().toISOString()}).eq("id",Number(id)).eq("updated_at",row.updated_at).select("id").maybeSingle();
 if(error||!data)err("Deletion was not saved: "+(error?.message||"Record was modified elsewhere"));
 await sync();return {message:"Task #"+id+" moved to the Recycle Bin.",taskId:null};
}
async function execute(action){
 switch(action.type){
 case "createTask":return createTask(action);
 case "createReminder":return createReminder(action);
 case "setStatus":return updateTask(action.id,{status:action.status},"Status changed to "+action.status+" through Task Assistant");
 case "assign":return updateTask(action.id,{assigned:clean(action.assigned)},"Assigned to "+clean(action.assigned)+" through Task Assistant");
 case "setDueDate":return updateTask(action.id,{date:ensureDate(clean(action.date))},"Due date changed to "+clean(action.date)+" through Task Assistant");
 case "update":return updateTask(action.id,{},"Assistant update: "+clean(action.text));
 case "move":{
 const c=companyInfo(action.company,action.division);
 return updateTask(action.id,c,"Moved to "+c.company+(c.division?" / "+c.division:"")+" through Task Assistant");
 }
 case "delete":return deleteTask(action.id);
 default:err("Unsupported command");
 }
}
function snapshot(){
 if(!cloudReady)return {ready:false,tasks:[],reminders:[],personal};
 return {ready:true,personal,
  tasks:tasks.map(t=>({id:Number(t.id),title:t.task||"",status:t.status||"Pending",company:t.company||"",division:t.division||"",due:t.date||"",assigned:t.assigned||"",notes:t.notes||""})),
  reminders:standaloneReminders.map(r=>({id:r.id,title:r.title||"",done:!!r.done,when:r.at||"",company:r.company||""}))};
}

/* Optional server-side GPT interpretation. API key is never sent to the browser. */
async function assistantRequest(method,payload){
 const {data,error}=await cloud.auth.getSession();
 if(error||!data?.session?.access_token)return {available:false};
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),18000);
 try{
  const response=await fetch(SUPABASE_URL+"/functions/v1/task-assistant-intent",{
   method,signal:controller.signal,
   headers:{"Authorization":"Bearer "+data.session.access_token,"apikey":SUPABASE_KEY,"Content-Type":"application/json"},
   ...(method==="POST"?{body:JSON.stringify(payload)}:{})
  });
  if(!response.ok)return {available:false,error:"AI provider is not configured or available."};
  return await response.json();
 }catch(e){return {available:false,error:"AI language service is currently unavailable."}}
 finally{clearTimeout(timeout)}
}
async function aiStatus(){return assistantRequest("GET",null)}
async function interpret(message,context){
 return assistantRequest("POST",{
  message:String(message).slice(0,500),context:Array.isArray(context)?context.slice(-5):[],
  localNow:new Date().toString(),personal
 });
}

window.dashboardAssistantBridge=Object.freeze({execute,snapshot,personal,aiStatus,interpret});
})();
