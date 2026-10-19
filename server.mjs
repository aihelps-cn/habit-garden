import {createPool,migrate} from './backend/db.mjs';
import {createApp} from './backend/app.mjs';
import {runScheduled} from './backend/domain.mjs';
const pool=createPool();
await migrate(pool);
const origin=process.env.PUBLIC_ORIGIN||'http://localhost:8080';
if(!['http:','https:'].includes(new URL(origin).protocol))throw Error('PUBLIC_ORIGIN must be an HTTP(S) origin');
const app=createApp(pool,{origin,secureCookies:process.env.COOKIE_SECURE!=='false',trustProxy:Number(process.env.TRUST_PROXY||0)});
const server=app.listen(Number(process.env.PORT||8080),'0.0.0.0',()=>console.log('Habit Garden listening on port',process.env.PORT||8080));
let running=false,stopping=false;
async function tick(){if(running||stopping)return;running=true;try{const result=await runScheduled(pool);if(result.submitted||result.approved)console.log('Scheduled review',result);}catch(e){console.error('Scheduled review failed; will retry:',e.code||e.message);}finally{running=false;}}
await tick();const timer=setInterval(tick,30000);
async function shutdown(){if(stopping)return;stopping=true;clearInterval(timer);server.close(async()=>{while(running)await new Promise(r=>setTimeout(r,50));await pool.end();process.exit(0)});setTimeout(()=>process.exit(1),25000).unref();}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
