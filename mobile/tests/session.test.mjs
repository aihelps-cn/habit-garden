import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createNativeClient} from '../src/client.js';
import {validateOrigin} from '../scripts/config.mjs';
const origin='https://garden.test',token='a'.repeat(64),replacement='b'.repeat(64);
function setup(){
 const values=new Map(),calls=[];
 const storage={get:async k=>values.get(k),set:async(k,v)=>values.set(k,v),remove:async k=>values.delete(k)};
 let response={status:200,data:{ok:true}},failure=false;
 const http={request:async options=>{calls.push(options);if(failure)throw Error('offline');return structuredClone(response)}};
 return {values,calls,storage,http,client:createNativeClient({origin,http,storage}),respond:r=>response=r,offline:()=>failure=true};
}
test('login survives client restart, keeps token out of UI result, and sends Bearer to the configured server',async()=>{
 const f=setup();f.respond({status:200,data:{ok:true,session_token:token}});
 const result=await f.client('/auth/login','POST',{username:'child',password:'test'});
 assert.equal(result.data.session_token,undefined);
 f.respond({status:200,data:{ok:true}});
 await createNativeClient({origin,http:f.http,storage:f.storage})('/state','GET');
 assert.equal(f.calls[1].headers.Authorization,'Bearer '+token);
 assert.equal(f.calls[1].url,origin+'/api/state');
 assert.equal(f.calls[1].disableRedirects,true);
});
test('offline failures preserve credentials and retry does not force a new login',async()=>{
 const f=setup();await f.storage.set('habit-session:'+origin,token);f.offline();
 await assert.rejects(()=>f.client('/state','GET'),/登录状态已保留/);
 assert.equal(f.values.get('habit-session:'+origin),token);
});
test('password change replaces current token; logout removes it only after server confirmation',async()=>{
 const f=setup();await f.storage.set('habit-session:'+origin,token);
 f.respond({status:200,data:{ok:true,session_token:replacement}});
 await f.client('/password','POST',{});assert.equal(f.values.get('habit-session:'+origin),replacement);
 f.respond({status:503,data:{error:'busy'}});await f.client('/auth/logout','POST',{});
 assert.equal(f.values.get('habit-session:'+origin),replacement);
 f.respond({status:200,data:{ok:true}});await f.client('/auth/logout','POST',{});
 assert.equal(f.values.size,0);
});
test('revocation clears native credentials; a mistyped login or server outage does not',async()=>{
 const f=setup();await f.storage.set('habit-session:'+origin,token);
 f.respond({status:401,data:{error:'bad password'}});await f.client('/auth/login','POST',{});
 assert.equal(f.values.size,1);
 f.respond({status:503,data:{error:'offline'}});await f.client('/state','GET');
 assert.equal(f.values.size,1);
 f.respond({status:401,data:{error:'revoked'}});await f.client('/state','GET');
 assert.equal(f.values.size,0);
});
test('queued credential change completes before subsequent polling',async()=>{
 const f=setup();f.respond({status:200,data:{ok:true,session_token:token}});
 await Promise.all([f.client('/auth/login','POST',{}),f.client('/state','GET')]);
 assert.equal(f.calls[1].headers.Authorization,'Bearer '+token);
});
test('production configuration rejects plaintext, credentials and placeholder origins',()=>{
 assert.equal(validateOrigin('https://garden.test/'),'https://garden.test');
 for(const value of ['http://garden.test','https://garden.example.com','https://u:p@garden.test','https://garden.test/api','https://garden.test?a=1','invalid']){
  assert.throws(()=>validateOrigin(value));
 }
});
