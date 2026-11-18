/* Decorative technology illustrations for Group Task Center side navigation.
   Self-contained SVG artwork; no external images, analytics, network calls or task-data changes. */
(function(){
  "use strict";
  const scenes=[
    {name:"Digital circuits",kind:"circuit"},
    {name:"Cloud computing",kind:"cloud"},
    {name:"Data center",kind:"server"},
    {name:"Artificial intelligence",kind:"chip"},
    {name:"Cybersecurity",kind:"shield"},
    {name:"World network",kind:"globe"},
    {name:"Robotics",kind:"robot"},
    {name:"Satellite communications",kind:"satellite"},
    {name:"Smart city",kind:"city"},
    {name:"Analytics",kind:"chart"},
    {name:"Fiber optics",kind:"fiber"},
    {name:"Database infrastructure",kind:"database"},
    {name:"Mobile networks",kind:"mobile"},
    {name:"Automation",kind:"gear"},
    {name:"Digital innovation",kind:"lightbulb"},
    {name:"Quantum computing",kind:"quantum"}
  ];
  const cyan="#6de9ff",blue="#76a8ff",mint="#6ef0ce",soft="#d5edff";
  function image(kind,index){
    let shape="";
    const line=(p,color=cyan,width=3)=>'<path d="'+p+'" stroke="'+color+'" stroke-width="'+width+'" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    const rect=(x,y,w,h,rx=4,color=soft,opacity=".64")=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+color+'" fill-opacity="'+opacity+'"/>';
    const circ=(x,y,r,color=cyan)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+color+'"/>';
    switch(kind){
      case "circuit":
        shape='<rect x="83" y="77" width="112" height="92" rx="13" stroke="'+cyan+'" fill="#58c6ff14" stroke-width="4"/>'+
          rect(107,100,62,47,7,blue,".2")+line("M120 77V38H64M159 77V27H220M195 125H251V70M83 128H35V176M118 169V205H72M169 169V205H232",mint,4)+
          [ [64,38],[220,27],[251,70],[35,176],[72,205],[232,205] ].map(p=>circ(p[0],p[1],5)).join("")+
          rect(120,113,37,23,4,mint,".6");
        break;
      case "cloud":
        shape='<path d="M80 156H207c58 0 51-69 9-78-13-52-91-54-116-10-57-12-83 31-70 66 7 15 22 22 50 22Z" fill="#7edcff24" stroke="'+cyan+'" stroke-width="4"/>'+
          line("M91 195V171M139 195V164M187 195V170",mint,4)+
          [91,139,187].map(x=>circ(x,207,9,blue)).join("")+
          rect(110,94,72,14,6,soft,".55")+rect(110,118,53,11,5,soft,".45");
        break;
      case "server":
        shape=[54,104,154].map((y,i)=>'<rect x="48" y="'+y+'" width="191" height="43" rx="8" fill="#538cdf22" stroke="'+(i===1?mint:cyan)+'" stroke-width="3"/>'+
          [77,92,107].map(x=>circ(x,y+21,4,mint)).join("")+
          rect(136,y+15,79,12,5,blue,".4")).join("")+
          line("M144 197V222H214",mint,3)+circ(217,222,5);
        break;
      case "chip":
        shape='<rect x="71" y="54" width="150" height="145" rx="17" stroke="'+cyan+'" stroke-width="4" fill="#82adff1a"/>'+
          '<rect x="99" y="84" width="94" height="86" rx="11" stroke="'+mint+'" stroke-width="3" fill="#50b9e725"/>'+
          [79,110,141,172].map(y=>line("M48 "+y+"H71M221 "+y+"h24",blue,4)).join("")+
          [107,141,175].map(x=>line("M"+x+" 30v24M"+x+" 199v23",blue,4)).join("")+
          line("M123 134l14 14 30-34",mint,5);
        break;
      case "shield":
        shape='<path d="M145 24 239 65v72c0 56-49 93-94 111-50-24-94-58-94-111V65Z" fill="#42b2d622" stroke="'+cyan+'" stroke-width="4"/>'+
          '<rect x="101" y="126" width="88" height="73" rx="12" fill="#a3f8e830" stroke="'+mint+'" stroke-width="3"/>'+
          line("M121 127v-24c0-40 50-40 50 0v24",mint,5)+circ(146,161,8,soft)+line("M146 167v16",soft,4);
        break;
      case "globe":
        shape='<circle cx="145" cy="135" r="103" stroke="'+cyan+'" stroke-width="4" fill="#59a7ff12"/>'+
          '<ellipse cx="145" cy="135" rx="46" ry="103" fill="none" stroke="'+mint+'" stroke-width="3"/>'+
          '<ellipse cx="145" cy="135" rx="103" ry="36" fill="none" stroke="'+blue+'" stroke-width="3"/>'+
          line("M43 135h204M145 32v206",cyan,3)+
          [[72,88],[213,103],[105,190],[192,181],[146,56]].map(p=>circ(p[0],p[1],6,mint)).join("");
        break;
      case "robot":
        shape='<rect x="92" y="53" width="116" height="94" rx="19" stroke="'+cyan+'" stroke-width="4" fill="#76adff24"/>'+
          rect(112,84,28,17,6,mint,".9")+rect(161,84,28,17,6,mint,".9")+
          line("M134 119h33M150 53V29",mint,4)+circ(150,23,9,mint)+
          '<rect x="64" y="160" width="173" height="72" rx="22" fill="#67b1d926" stroke="'+blue+'" stroke-width="4"/>'+
          line("M66 178H30v29M236 178h32v29M133 178v37M162 178v37",cyan,4)+
          circ(30,213,7,blue)+circ(268,213,7,blue);
        break;
      case "satellite":
        shape='<path d="m116 116 56-55 49 49-57 56Z" fill="#7dd9ff30" stroke="'+cyan+'" stroke-width="4"/>'+
          '<path d="M105 116 49 61 20 91l56 55ZM222 104l52 50-29 30-55-50Z" fill="#73b5fa25" stroke="'+blue+'" stroke-width="4"/>'+
          line("M109 139l-45 39m120-57 37 44",mint,4)+
          '<path d="M39 198q95-94 191-11M17 226q115-111 257-14" stroke="'+mint+'" stroke-opacity=".75" stroke-width="3" fill="none"/>';
        break;
      case "city":
        shape='<path d="M22 223V132h53v91M75 223V66h58v157M133 223V104h50v119M183 223V37h69v186M252 223v-83h25v83" stroke="'+cyan+'" stroke-width="4" fill="#66a4f21b"/>'+
          [ [41,153],[41,181],[95,91],[95,119],[95,147],[95,175],[151,129],[151,158],[207,65],[231,65],[207,98],[231,98],[207,132],[231,132],[207,164],[231,164] ].map(p=>rect(p[0],p[1],10,12,2,mint,".6")).join("")+
          line("M10 226h280",blue,4);
        break;
      case "chart":
        shape='<rect x="32" y="48" width="238" height="179" rx="14" fill="#81b5ff17" stroke="'+cyan+'" stroke-width="4"/>'+
          line("M57 187h190M57 187V77",blue,3)+
          [[74,153,31],[122,124,60],[170,98,86],[218,70,114]].map(p=>'<rect x="'+p[0]+'" y="'+p[1]+'" width="24" height="'+p[2]+'" rx="4" fill="'+mint+'" opacity=".68"/>').join("")+
          line("M71 128l52-25 50 7 56-46",cyan,5)+[ [71,128],[123,103],[173,110],[229,64] ].map(p=>circ(p[0],p[1],5,soft)).join("");
        break;
      case "fiber":
        shape=Array.from({length:10},(_,i)=>{
          const y=36+i*22;
          return '<path d="M18 '+(y+16)+' C100 '+(y-65)+' 181 '+(y+71)+' 277 '+(y-23)+'" fill="none" stroke="'+(i%3===0?mint:i%2?cyan:blue)+'" stroke-opacity=".72" stroke-width="'+(i%3===0?4:2)+'"/>';
        }).join("")+
          [[36,156],[218,70],[176,191],[89,43]].map(p=>circ(p[0],p[1],7,soft)).join("");
        break;
      case "database":
        shape='<ellipse cx="148" cy="58" rx="92" ry="29" fill="#7cbaff36" stroke="'+cyan+'" stroke-width="4"/>'+
          '<path d="M56 58v146c0 37 184 37 184 0V58" fill="#7cbaff14" stroke="'+cyan+'" stroke-width="4"/>'+
          '<path d="M56 110c0 39 184 39 184 0M56 158c0 39 184 39 184 0" fill="none" stroke="'+mint+'" stroke-width="3"/>'+
          [ [85,98],[85,146],[85,193] ].map(p=>circ(p[0],p[1],6,mint)).join("");
        break;
      case "mobile":
        shape='<rect x="88" y="21" width="116" height="210" rx="20" stroke="'+cyan+'" stroke-width="4" fill="#76a2e124"/>'+
          rect(106,54,80,118,8,blue,".18")+line("M128 37h34M136 208h20",mint,4)+
          '<path d="M58 77q-28 36 0 73M234 77q28 36 0 73M43 62q-46 53 0 107M248 62q47 53 0 107" stroke="'+mint+'" stroke-opacity=".8" stroke-width="4" fill="none"/>'+
          circ(145,117,23,cyan);
        break;
      case "gear":
        shape='<circle cx="146" cy="135" r="71" stroke="'+cyan+'" stroke-width="19" stroke-dasharray="19 14" fill="none"/>'+
          '<circle cx="146" cy="135" r="40" stroke="'+mint+'" stroke-width="9" fill="#6fc9dd25"/>'+
          '<circle cx="146" cy="135" r="14" fill="'+soft+'"/>'+
          line("M47 64h34M215 205h37M68 206l21-22M213 51l-15 18",blue,4);
        break;
      case "lightbulb":
        shape='<path d="M146 34C61 34 62 139 111 174c8 6 11 23 12 30h49c1-7 4-24 12-30 48-35 48-140-38-140Z" fill="#8acfff23" stroke="'+cyan+'" stroke-width="4"/>'+
          line("M121 210h49M125 220h42M136 233h21M131 170l-12-48m53 48 12-48M118 122l28 13 40-20",mint,4)+
          [[54,53],[239,57],[43,133],[251,142],[148,9]].map(p=>circ(p[0],p[1],5,soft)).join("");
        break;
      case "quantum":
        shape='<circle cx="146" cy="132" r="17" fill="'+mint+'"/>'+
          '<ellipse cx="146" cy="132" rx="110" ry="43" fill="none" stroke="'+cyan+'" stroke-width="4" transform="rotate(30 146 132)"/>'+
          '<ellipse cx="146" cy="132" rx="110" ry="43" fill="none" stroke="'+blue+'" stroke-width="4" transform="rotate(-30 146 132)"/>'+
          '<ellipse cx="146" cy="132" rx="110" ry="43" fill="none" stroke="'+mint+'" stroke-width="4" transform="rotate(90 146 132)"/>'+
          circ(60,77,10,soft)+circ(235,84,10,mint)+circ(145,240,8,blue);
    }
    const dots=Array.from({length:20},(_,i)=>'<circle cx="'+((i*67+index*11)%300)+'" cy="'+((i*43+index*19)%270)+'" r="'+(i%3===0?2:1)+'" fill="'+(i%3===0?mint:cyan)+'" opacity=".25"/>').join("");
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 270" preserveAspectRatio="xMidYMid meet">'+
      '<defs><radialGradient id="glow"><stop stop-color="#31b9dd" stop-opacity=".26"/><stop offset="1" stop-color="#31b9dd" stop-opacity="0"/></radialGradient></defs>'+
      '<rect width="300" height="270" fill="url(#glow)"/>'+dots+
      '<g transform="translate(0 2)">'+shape+'</g></svg>';
  }
  function mount(sidebar){
    if(!sidebar||sidebar.querySelector(".gtc-tech-backdrop"))return;
    const backdrop=document.createElement("div");
    backdrop.className="gtc-tech-backdrop";
    backdrop.setAttribute("aria-hidden","true");
    const first=document.createElement("img");
    const second=document.createElement("img");
    for(const el of [first,second]){el.alt="";el.draggable=false;el.decoding="async";el.className="gtc-tech-image";}
    first.classList.add("is-visible");
    backdrop.append(first,second);
    sidebar.prepend(backdrop);
    const pictures=scenes.map((scene,i)=>"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(image(scene.kind,i)));
    const order=scenes.map((_,i)=>i);
    for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
    let index=0,visible=0,previous=-1;
    function advance(){
      if(!sidebar.isConnected)return;
      if(index>=order.length){index=0;for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}if(order[0]===previous)[order[0],order[order.length-1]]=[order[order.length-1],order[0]];}
      const next=order[index++],imgs=[first,second],hidden=imgs[1-visible];
      hidden.src=pictures[next];
      hidden.classList.add("is-visible");
      imgs[visible].classList.remove("is-visible");
      visible=1-visible;previous=next;
    }
    first.src=pictures[order[index++]];previous=order[0];
    const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(!reduced){
      const interval=window.setInterval(()=>{if(!document.hidden)advance()},11000);
      window.addEventListener("pagehide",()=>window.clearInterval(interval),{once:true});
    }
  }
  function start(){
    const sidebar=document.querySelector(".gtc-sidebar");
    if(sidebar){mount(sidebar);return;}
    const observer=new MutationObserver(()=>{
      const added=document.querySelector(".gtc-sidebar");
      if(added){observer.disconnect();mount(added);}
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();