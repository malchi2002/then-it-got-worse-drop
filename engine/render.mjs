import puppeteer from 'puppeteer-core'; import http from 'http'; import fs from 'fs'; import path from 'path';
const ENG='/home/claude/engine'; const [,, vid, mode, a, b] = process.argv;
const types={'.js':'text/javascript','.html':'text/html','.json':'application/json','.woff2':'font/woff2'};
const srv=http.createServer((q,s)=>{let u=decodeURIComponent(q.url.split('?')[0]); let f=u.startsWith('/videos/')?path.join(ENG,u):path.join(ENG,'web',u); if(!fs.existsSync(f)){s.writeHead(404);return s.end();} s.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(s);});
await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
const br=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:900000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await br.newPage(); await p.setViewport({width:540,height:960});
p.on('console',m=>{const t=m.text(); if(!t.includes('GPU stall')&&!t.includes('404')) console.log('PAGE',t)}); p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(`http://localhost:${port}/index.html?v=${vid}`); await p.waitForFunction('window.allReady',{timeout:120000});
console.log(JSON.stringify(await p.evaluate(()=>window.shotList())));
const vd=path.join(ENG,'videos',vid);
if(mode==='stills'){ fs.mkdirSync(vd+'/stills',{recursive:true}); for(const t of a.split(',').map(Number)){ const d=await p.evaluate(t=>window.frame(t),t); fs.writeFileSync(`${vd}/stills/s_${t}.jpg`,Buffer.from(d.split(',')[1],'base64')); } }
else { const fd=vd+'/frames'; fs.mkdirSync(fd,{recursive:true}); const f0=+a, f1=+b; const t0=Date.now(); for(let f=f0; f<f1; f++){ const d=await p.evaluate(t=>window.frame(t),f/30); fs.writeFileSync(`${fd}/f${String(f).padStart(5,'0')}.jpg`,Buffer.from(d.split(',')[1],'base64')); if(f%200==0) console.log('frame',f,((Date.now()-t0)/(f-f0+1)).toFixed(0),'ms/f'); } }
await br.close(); srv.close();
