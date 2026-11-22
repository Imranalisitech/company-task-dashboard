/* Executive Signature: isolated report renderer. Input records are passed from dashboard. */
(function(){
"use strict";
const escapeHtml=(v)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dateText=v=>{if(!v)return "—";const d=new Date(String(v).length===10?String(v)+"T12:00:00":v);return Number.isFinite(d.getTime())?d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):String(v)};
const status=t=>String(t.status||"Pending");
const overdue=t=>{if(!t.date||status(t)==="Completed")return false;const d=new Date(String(t.date).slice(0,10)+"T12:00:00"),now=new Date();now.setHours(0,0,0,0);return Number.isFinite(+d)&&d<now};
const reminderDone=r=>!!r.done||r.statusOverride==="completed";
function printReport(input){
 const tasks=Array.isArray(input?.tasks)?input.tasks:[];
 const reminders=Array.isArray(input?.reminders)?input.reminders:[];
 const total=tasks.length,completed=tasks.filter(t=>status(t)==="Completed").length,inProgress=tasks.filter(t=>status(t)==="In Progress").length,pending=tasks.filter(t=>status(t)!=="Completed"&&status(t)!=="In Progress").length,late=tasks.filter(overdue).length;
 const rate=total?Math.round(completed/total*100):0;
 const remDone=reminders.filter(reminderDone).length,remPending=reminders.length-remDone,remRate=reminders.length?Math.round(remDone/reminders.length*100):0;
 const scope=String(input.scope||"All companies");
 const kind=String(input.kind||"Current selection");
 const groups=new Map();
 tasks.forEach(t=>{const company=String(t.company||"SiTech");if(!groups.has(company))groups.set(company,[]);groups.get(company).push(t)});
 const cells=[["Total tasks",total],["Completed",completed],["In progress",inProgress],["Pending",pending],["Overdue tasks",late],["Completion rate",rate+"%"]];
 const cardHtml=cells.map(([label,value],i)=>'<div class="erp-kpi '+(i===4?"erp-overdue":i===5?"erp-rate":"")+'"><div class="erp-n">'+escapeHtml(value)+'</div><div class="erp-kpi-label">'+escapeHtml(label)+'</div></div>').join("");
 /* Inline SVG bars print in color even when browser background graphics are disabled. */
 const bars=[...groups.entries()].map(([name,rows])=>{
  const done=rows.filter(t=>status(t)==="Completed").length;
  const percent=Math.round(done/rows.length*100),width=Number((done/rows.length*200).toFixed(2));
  const bar='<svg class="erp-bar-svg" viewBox="0 0 200 12" preserveAspectRatio="none" role="img" aria-label="'+percent+'% completed"><rect x="0" y="1" width="200" height="10" rx="2" fill="#ECE5DA"/><rect x="0" y="1" width="'+width+'" height="10" rx="2" fill="#7359BC"/></svg>';
  return '<div class="erp-bar-row"><span>'+escapeHtml(name)+'</span>'+bar+'<strong>'+percent+'%</strong></div>';
 }).join("")||'<p class="erp-empty">No tasks in selection</p>';
 /* Status ring is proportional to real selected records: teal=completed, violet=in progress, ochre=pending. */
 const circumference=2*Math.PI*43;
 const donutParts=[{value:completed,color:"#188C80"},{value:inProgress,color:"#7359BC"},{value:pending,color:"#C78A37"}];
 let used=0;
 const donutSegments=donutParts.map(part=>{
  if(!total||!part.value)return "";
  const len=part.value/total*circumference,offset=-used;
  used+=len;
  return '<circle cx="50" cy="50" r="43" fill="none" stroke="'+part.color+'" stroke-width="14" stroke-dasharray="'+len.toFixed(3)+' '+circumference.toFixed(3)+'" stroke-dashoffset="'+offset.toFixed(3)+'" transform="rotate(-90 50 50)"/>';
 }).join("");
 const donutSvg='<svg class="erp-donut-svg" viewBox="0 0 100 100" role="img" aria-label="'+rate+'% completed, '+inProgress+' in progress, '+pending+' pending"><circle cx="50" cy="50" r="43" fill="none" stroke="#ECE5DA" stroke-width="14"/>'+donutSegments+'<text x="50" y="56" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="bold" fill="#1F1A16">'+rate+'%</text></svg>';
 const taskRows=tasks.map((t,i)=>'<tr><td>'+(i+1)+'</td><td><strong>'+escapeHtml(t.task||"Task")+'</strong><small>'+escapeHtml([t.company,t.division,t.assigned].filter(Boolean).join(" · "))+'</small></td><td>'+escapeHtml(status(t))+'</td><td class="'+(overdue(t)?"erp-red":"")+'">'+escapeHtml(dateText(t.date))+'</td></tr>').join("");
 const reminderRows=reminders.map((r,i)=>'<tr><td>'+(i+1)+'</td><td><strong>'+escapeHtml(r.title||"Reminder")+'</strong><small>'+escapeHtml([r.company,r.division,r.text].filter(Boolean).join(" · "))+'</small></td><td>'+ (reminderDone(r)?"Completed":"Pending")+'</td><td>'+escapeHtml(dateText(r.at||r.date))+'</td></tr>').join("");
 const id="executivePrintReport";
 document.getElementById(id)?.remove();
 const report=document.createElement("section");report.id=id;
 report.innerHTML='<div class="erp-head"><div><div class="erp-overline">GROUP TASK CENTER · MANAGEMENT REPORT</div><h1>Task &amp; Reminder Performance</h1><p>'+escapeHtml(scope)+' · '+escapeHtml(kind)+'</p></div><div class="erp-issued">ISSUED<br><b>'+escapeHtml(new Date().toLocaleString("en-GB"))+'</b></div></div>'+
 '<div class="erp-kpis">'+cardHtml+'</div>'+
 '<div class="erp-charts"><section class="erp-card"><h2>Company-wise completion</h2>'+bars+'</section>'+
 '<section class="erp-card"><h2>Overall completion</h2><div class="erp-donutrow">'+donutSvg+'<div class="erp-legend"><p><i style="background:#188C80"></i> Completed <b>'+completed+'</b></p><p><i style="background:#7359BC"></i> In progress <b>'+inProgress+'</b></p><p><i style="background:#C78A37"></i> Pending <b>'+pending+'</b></p></div></div></section></div>'+
 '<section class="erp-rem-summary"><div><strong>'+reminders.length+'</strong><span>Total reminders</span></div><div><strong>'+remDone+'</strong><span>Completed reminders</span></div><div><strong>'+remPending+'</strong><span>Outstanding reminders</span></div><div><strong>'+remRate+'%</strong><span>Reminder completion</span></div></section>'+
 '<section class="erp-table-section"><h2>Task detail <small>'+total+' record(s)</small></h2><table><thead><tr><th>#</th><th>Task / company</th><th>Status</th><th>Due date</th></tr></thead><tbody>'+ (taskRows||'<tr><td colspan="4">No tasks match this selection.</td></tr>')+'</tbody></table></section>'+
 '<section class="erp-table-section"><h2>Reminder detail <small>'+reminders.length+' record(s)</small></h2><table><thead><tr><th>#</th><th>Reminder / company</th><th>Status</th><th>Due date</th></tr></thead><tbody>'+(reminderRows||'<tr><td colspan="4">No reminders match this selection.</td></tr>')+'</tbody></table></section>'+
 '<footer>GROUP TASK CENTER · Executive Signature · Figures calculated from records included in this report</footer>';
 document.body.append(report);
 document.body.classList.add("executive-printing");
 const clean=()=>{document.body.classList.remove("executive-printing");document.getElementById(id)?.remove();window.removeEventListener("afterprint",clean)};
 window.addEventListener("afterprint",clean);
 try{window.print()}catch(e){clean();throw e}

}
window.executivePrintReport=printReport;
})();
