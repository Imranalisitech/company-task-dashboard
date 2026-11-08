const CACHE='company-tasks-shell-v1';
const SHELL=['/','/manifest.webmanifest','/icons/app-icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;if(req.mode==='navigate'){event.respondWith(fetch(req).then(res=>{caches.open(CACHE).then(c=>c.put('/',res.clone()));return res;}).catch(()=>caches.match('/')));return;}if(SHELL.includes(url.pathname))event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));});
