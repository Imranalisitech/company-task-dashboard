/* Saudi heritage accent for the live dashboard clock. One different scene each page reload. */
(function(){
"use strict";
const motifs=[
 {id:"flag",name:"Saudi flag",icon:"🇸🇦",desc:"Saudi flag",kind:"flag"},
 {id:"coffee",name:"Arabic coffee",icon:"☕",desc:"Traditional Arabic coffee dallah",kind:"coffee"},
 {id:"palm",name:"Date palms",icon:"🌴",desc:"Date palm heritage",kind:"palm"},
 {id:"camel",name:"Desert caravan",icon:"🐪",desc:"Desert caravan",kind:"camel"},
 {id:"fort",name:"Historic fort",icon:"🏰",desc:"Traditional Arabian fort",kind:"fort"},
 {id:"lantern",name:"Heritage lantern",icon:"🏮",desc:"Traditional lantern",kind:"lantern"},
 {id:"crescent",name:"Arabian crescent",icon:"🌙",desc:"Traditional crescent and stars",kind:"crescent"}
];
function initialize(){
 const clock=document.getElementById("dashboardLiveClock");
 if(!clock||document.getElementById("heritageMotif"))return;
 let last=-1;try{last=Number(sessionStorage.getItem("gtc_heritage_last"));}catch(e){}
 if(!Number.isInteger(last)||last<0||last>=motifs.length)last=-1;
 const choices=motifs.map((_,i)=>i).filter(i=>i!==last);
 const next=choices[Math.floor(Math.random()*choices.length)];
 try{sessionStorage.setItem("gtc_heritage_last",String(next));}catch(e){}
 const item=motifs[next];
 const el=document.createElement("span");
 el.id="heritageMotif";el.className="heritage-motif heritage-"+item.kind;
 el.setAttribute("role","img");el.setAttribute("aria-label",item.desc);el.title=item.name+" · changes on page refresh";
 const symbol=document.createElement("span");
 symbol.className="heritage-symbol";symbol.textContent=item.icon;
 const tip=document.createElement("span");tip.className="heritage-label";tip.textContent=item.name;
 el.append(symbol,tip);
 clock.insertAdjacentElement("afterend",el);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>requestAnimationFrame(initialize));
else requestAnimationFrame(initialize);
})();
