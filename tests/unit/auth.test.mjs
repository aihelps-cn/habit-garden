import {test} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import supertest from 'supertest';
import {mountAuth} from '../../backend/auth.mjs';
import {digest,bearerToken} from '../../backend/security.mjs';

// A strict SQL adapter exercises HTTP/session behavior without a local MySQL.
// Real DDL and transactional locking remain covered by the integration suite.
function memoryPool(){
 const users=new Map(),sessions=new Map();
 const pool={users,sessions,getConnection:async()=>pool,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){},
  async execute(sql,args){
   let result=[];
   if(sql.startsWith('INSERT INTO users')){
    const [id,username,password_hash,name,role,avatar]=args;users.set(id,{id,username,password_hash,name,role,avatar});
   }else if(sql.startsWith('INSERT INTO sessions')){
    sessions.set(args[0],{user_id:args[1],expires_at:null});
   }else if(sql.startsWith('SELECT * FROM users WHERE username')){
    result=[...users.values()].filter(u=>u.username===args[0]);
   }else if(sql.startsWith('SELECT * FROM users WHERE id')){
    result=[users.get(args[0])].filter(Boolean);
   }else if(sql.startsWith('SELECT u.* FROM sessions')){
    const s=sessions.get(args[0]);if(s&&(s.expires_at===null||s.expires_at>args[1]))result=[users.get(s.user_id)];
   }else if(sql.startsWith('UPDATE sessions')){
    const s=sessions.get(args[0]);if(s)s.expires_at=null;
   }else if(sql.startsWith('DELETE FROM sessions WHERE token_hash')){
    sessions.delete(args[0]);
   }else if(sql.startsWith('DELETE FROM sessions WHERE user_id')){
    for(const [key,s] of sessions)if(s.user_id===args[0])sessions.delete(key);
   }else if(sql.startsWith('UPDATE users SET password_hash')){
    users.get(args[1]).password_hash=args[0];
   }else throw Error('Unexpected SQL: '+sql);
   return [result];
  }};
 return pool;
}
function setup(){
 const pool=memoryPool(),app=express();app.use(express.json());
 mountAuth(app,pool,{secureCookies:false,authLimiter:(req,res,next)=>next()});
 app.get('/api/probe',(req,res)=>res.json({id:req.user.id}));
 app.use((e,req,res,next)=>res.status(e.status||500).json({error:e.message}));
 return {pool,app};
}
const credentials={username:'child_test',password:'testPassword123',name:'孩子',role:'child'};
test('browser persists session, renews HttpOnly cookie, and logout invalidates replay',async()=>{
 const {app,pool}=setup(),agent=supertest.agent(app);
 const login=await agent.post('/api/auth/register').send(credentials).expect(201);
 assert.equal(login.body.session_token,undefined);
 const cookie=login.headers['set-cookie'][0];
 assert.match(cookie,/Max-Age=34560000/);assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);
 assert.equal([...pool.sessions.values()][0].expires_at,null);
 const probe=await agent.get('/api/probe').expect(200);assert.ok(probe.headers['set-cookie']);
 await agent.post('/api/auth/logout').send({}).expect(200);
 await supertest(app).get('/api/probe').set('Cookie',cookie.split(';')[0]).expect(401);
});
test('native token survives restart; cookie cannot authenticate a native request',async()=>{
 const {app,pool}=setup();
 const r=await supertest(app).post('/api/auth/register').set('X-Habit-Client','native').send(credentials).expect(201);
 const token=r.body.session_token;assert.match(token,/^[a-f0-9]{64}$/);assert.equal(r.headers['set-cookie'],undefined);
 assert.equal(pool.sessions.get(digest(token)).expires_at,null);
 await supertest(app).get('/api/probe').set('X-Habit-Client','native').set('Cookie','hg_session='+token).expect(401);
 await supertest(app).get('/api/probe').set('X-Habit-Client','native').set('Authorization','Bearer '+token).expect(200);
});
test('password change revokes all old devices and issues a replacement for this device',async()=>{
 const {app}=setup();
 const request=()=>supertest(app).post('/api/auth/login').set('X-Habit-Client','native').send(credentials);
 const a=await supertest(app).post('/api/auth/register').set('X-Habit-Client','native').send(credentials).expect(201);
 const b=await request().expect(200);
 const changed=await supertest(app).post('/api/password').set('X-Habit-Client','native').set('Authorization','Bearer '+a.body.session_token).send({current:credentials.password,password:'newPassword123'}).expect(200);
 for(const token of [a.body.session_token,b.body.session_token]){
  await supertest(app).get('/api/probe').set('X-Habit-Client','native').set('Authorization','Bearer '+token).expect(401);
 }
 await supertest(app).get('/api/probe').set('X-Habit-Client','native').set('Authorization','Bearer '+changed.body.session_token).expect(200);
 await request().expect(401);
});
test('valid legacy sessions are upgraded, expired sessions are never revived',async()=>{
 const {app,pool}=setup(),agent=supertest.agent(app);
 const r=await agent.post('/api/auth/register').send(credentials).expect(201);
 const session=[...pool.sessions.values()][0];session.expires_at='2000-01-01 00:00:00';
 await agent.get('/api/probe').expect(401);
 assert.equal(session.expires_at,'2000-01-01 00:00:00');
 session.expires_at='2100-01-01 00:00:00';
 await supertest(app).get('/api/probe').set('Cookie',r.headers['set-cookie'][0].split(';')[0]).expect(200);
 assert.equal(session.expires_at,null);
});
test('Bearer syntax rejects malformed credentials',()=>{
 assert.equal(bearerToken('Bearer '+'a'.repeat(64)),'a'.repeat(64));
 for(const v of [undefined,'Bearer bad','a'.repeat(64),'Bearer '+'a'.repeat(65)])assert.equal(bearerToken(v),null);
});
