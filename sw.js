// App shell service worker. Always fetch current HTML from the network.
// Company data and authentication must never be served from an old cached page.
const CACHE='company-tasks-static-v2';
self.addEventListener('install',event=>{event.waitUntil(self.skipWaiting());});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('company-tasks-')).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||request.mode==='navigate')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(!(/^\/icons\//.test(url.pathname)||/\.webmanifest$/.test(url.pathname)))return;
 event.respondWith((async()=>{
  try{
   const response=await fetch(request,{cache:'no-store'});
   if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone()).catch(()=>{});}
   return response;
  }catch(e){
   const cached=await caches.match(request);
   if(cached)return cached;
   throw e;
  }
 })());
});