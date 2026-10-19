// Browser-only UI verification: all HTML/assets/API calls are intercepted in memory.
// No application server, database or Docker service is started.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let executablePath=process.env.CHROME_PATH;
if(!executablePath){try{await access(chrome);executablePath=chrome}catch{}}
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{}),args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1100}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
let signedIn=false,role='child';
const child={id:'11111111-1111-4111-8111-111111111111',name:'小朋友',avatar:'🌱',balance:0,auto_submit:true};
const parent={id:'22222222-2222-4222-8222-222222222222',name:'妈妈',avatar:'🌳'};
const task={id:'33333333-3333-4333-8333-333333333333',name:'阅读 20 分钟',icon:'📖',category:'学习成长',points:5,note:'在书里发现新世界'};
const reward={id:'44444444-4444-4444-8444-444444444444',name:'零花钱',icon:'💰',type:'cash',cost:10,note:'1 积分 = 1 元'};
const base={children:[child],child,day:'2026-10-19',timezone:'Asia/Shanghai',tasks:[task],rewards:[reward],checkins:[],orders:[],ledger:[],family:[parent],stats:{approved:0,today_points:0}};
const requests=[];
await context.route('**/*',async route=>{const req=route.request(),url=new URL(req.url());if(url.pathname.startsWith('/api')){requests.push({path:url.pathname,method:req.method(),body:req.postDataJSON()});let data={},status=200;const path=url.pathname;
if(path==='/api/state'){if(!signedIn){status=401;data={error:'请先登录'}}else data={...base,me:{...(role==='child'?child:parent),username:'tester',role,auto_submit:true}}}
else if(path==='/api/auth/register'||path==='/api/auth/login'){signedIn=true;role=req.postDataJSON().role||role;}
else if(path==='/api/auth/logout')signedIn=false;
else if(path.endsWith('/checkin'))base.checkins=[{id:'55555555-5555-4555-8555-555555555555',task_id:task.id,task_name:task.name,icon:task.icon,points:5,day:base.day,status:'draft',note:req.postDataJSON().note,created_at:'2026-10-19 12:00:00.000'}];
else if(path==='/api/checkins/submit'){base.checkins[0].status='pending';base.checkins[0].submission_mode='manual';base.checkins[0].review_deadline='2026-10-19 15:30:00.000';data={submitted:1};}
else if(path.endsWith('/review')){base.checkins[0].status='approved';child.balance=5;base.stats.approved=1;data={automatic:false};}
else if(path==='/api/family/invite')data={code:'ABCDEF0123456789',expires_at:'2026-10-20T12:00:00Z'};
else if(path.endsWith('/tasks'))base.tasks.push({...task,...req.postDataJSON(),id:'66666666-6666-4666-8666-666666666666'});
else if(path.endsWith('/rewards'))base.rewards.push({...reward,...req.postDataJSON(),id:'77777777-7777-4777-8777-777777777777'});
return route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});}
const file=url.pathname==='/'?'index.html':url.pathname.slice(1);if(!['index.html','app.js','art.js','style.css'].includes(file))return route.fulfill({status:404,body:''});return route.fulfill({status:200,contentType:file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html',body:await readFile(new URL('../dist/'+file,import.meta.url))});});
const act=a=>page.locator(`[data-action="${a}"]`);
const nav=p=>page.locator(`[data-action="nav"][data-page="${p}"]`).first();
const submit=async()=>{await page.locator('#modal-form [type="submit"]').click();await page.locator('.modal').waitFor({state:'detached'});};
try{
await page.goto('http://habit.test/');await page.locator('#auth-form').waitFor();
await page.screenshot({path:'/private/tmp/habit-garden-v2-login.png',fullPage:true});
await page.locator('[data-action="auth-tab"][data-mode="register"]').click();await page.locator('[data-action="auth-role"][data-role="child"]').click();
await page.locator('[name="name"]').fill('小朋友');await page.locator('[name="username"]').fill('child_test');await page.locator('[name="password"]').fill('password123');await page.locator('[name="repeat"]').fill('password123');await page.locator('#auth-form [type="submit"]').click();await page.locator('.habit').waitFor();
assert.equal(await act('add-task').count(),0);assert.equal(await act('adjust').count(),0);
await act('check').click();await page.locator('[name="note"]').fill('今天读完一本书');await submit();await page.locator('.habit-sub').filter({hasText:'待提交'}).waitFor();assert.equal(child.balance,0);
await act('submit-drafts').click();await submit();await page.locator('.habit-sub').filter({hasText:'待家长审核'}).waitFor();assert.equal(child.balance,0);
await page.screenshot({path:'/private/tmp/habit-garden-v2-child.png',fullPage:true});
await nav('family').click();await act('invite').click();await page.locator('.invite-code').waitFor();assert.match(await page.locator('.invite-code').innerText(),/ABCDEF/);await act('close').click();
await act('logout').click();role='parent';await page.locator('[name="username"]').fill('parent_test');await page.locator('[name="password"]').fill('password123');await page.locator('#auth-form [type="submit"]').click();await act('add-task').waitFor();
await nav('reviews').click();await act('approve').click();await submit();assert.equal(child.balance,5);
await nav('manage').click();await act('add-task').click();await page.locator('[name="name"]').fill('整理书桌');await page.locator('[name="icon"]').fill('🧹');await submit();assert.equal(base.tasks.length,2);
await act('add-reward').click();await page.locator('[name="name"]').fill('冰淇淋');await page.locator('[name="type"]').selectOption('reward');await submit();assert.equal(base.rewards.length,2);
await page.screenshot({path:'/private/tmp/habit-garden-v2-parent.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/private/tmp/habit-garden-v2-mobile.png',fullPage:true,animations:'disabled'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await act('menu').last().click();await nav('shop').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
assert.deepEqual(errors,[]);assert.equal(requests.find(r=>r.path==='/api/auth/register').body.role,'child');
console.log('PASS: offline browser UI — registration roles, child record/submit, no pre-approval points, parent approval, task/reward forms, invitation, desktop and mobile layout. API responses were mocked; no local server/database was started.');
}finally{await browser.close()}
