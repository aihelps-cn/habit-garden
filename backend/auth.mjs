import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {query,transaction} from './db.mjs';
import {hashPassword,verifyPassword,digest,token,cookieToken,bearerToken} from './security.mjs';
import {isoSql} from './time.mjs';
import {fail} from './domain.mjs';

const credentials=z.object({
 username:z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,40}$/,'账号须为 3～40 位英文、数字或下划线'),
 password:z.string().min(8,'密码至少 8 位').max(128)
});
export const COOKIE_LIFETIME=400*86400000;
const native=req=>req.get('X-Habit-Client')==='native';
export function mountAuth(app,pool,{secureCookies,authLimiter}){
 const cookieOptions={httpOnly:true,secure:secureCookies,sameSite:'strict',path:'/',maxAge:COOKIE_LIFETIME};
 async function newSession(c,userId){
  const value=token();
  await query(c,'INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,NULL)',[digest(value),userId]);
  return value;
 }
 function signedIn(req,res,value,status=200){
  // Native apps use their encrypted vault; browser credentials stay HttpOnly.
  if(native(req))return res.status(status).json({ok:true,session_token:value});
  res.cookie('hg_session',value,cookieOptions);
  return res.status(status).json({ok:true});
 }
 app.post('/api/auth/register',authLimiter,async(req,res)=>{
  const data=credentials.extend({name:z.string().trim().min(1).max(40),role:z.enum(['parent','child'])}).parse(req.body);
  const userId=randomUUID(),passwordHash=await hashPassword(data.password);
  const value=await transaction(pool,async c=>{
   await query(c,'INSERT INTO users (id,username,password_hash,name,role,avatar,created_at) VALUES (?,?,?,?,?,?,?)',[userId,data.username,passwordHash,data.name,data.role,data.role==='parent'?'🌳':'🌱',isoSql(new Date())]);
   return newSession(c,userId);
  });
  signedIn(req,res,value,201);
 });
 app.post('/api/auth/login',authLimiter,async(req,res)=>{
  const data=credentials.parse(req.body);
  const value=await transaction(pool,async c=>{
   const [user]=await query(c,'SELECT * FROM users WHERE username=? FOR UPDATE',[data.username]);
   if(!user||!await verifyPassword(data.password,user.password_hash))fail(401,'账号或密码不正确');
   return newSession(c,user.id);
  });
  signedIn(req,res,value);
 });
 app.use('/api',async(req,res,next)=>{
  const value=native(req)?bearerToken(req.get('Authorization')):cookieToken(req.get('Cookie'));
  if(!value)fail(401,'请先登录');
  const [user]=await query(pool,'SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND (s.expires_at IS NULL OR s.expires_at>?)',[digest(value),isoSql(new Date())]);
  if(!user)fail(401,'登录已失效，请重新登录');
  // Upgrade still-valid v2 sessions without reviving expired sessions.
  await query(pool,'UPDATE sessions SET expires_at=NULL WHERE token_hash=? AND expires_at IS NOT NULL',[digest(value)]);
  if(!native(req))res.cookie('hg_session',value,cookieOptions);
  req.user=user;req.sessionToken=value;next();
 });
 app.post('/api/auth/logout',async(req,res)=>{
  await query(pool,'DELETE FROM sessions WHERE token_hash=?',[digest(req.sessionToken)]);
  if(!native(req))res.clearCookie('hg_session',{...cookieOptions,maxAge:undefined});
  res.json({ok:true});
 });
 app.post('/api/password',authLimiter,async(req,res)=>{
  const data=z.object({current:z.string().max(128),password:z.string().min(8).max(128)}).parse(req.body);
  const passwordHash=await hashPassword(data.password);
  const value=await transaction(pool,async c=>{
   const [user]=await query(c,'SELECT * FROM users WHERE id=? FOR UPDATE',[req.user.id]);
   if(!user||!await verifyPassword(data.current,user.password_hash))fail(400,'当前密码不正确');
   await query(c,'UPDATE users SET password_hash=? WHERE id=?',[passwordHash,req.user.id]);
   await query(c,'DELETE FROM sessions WHERE user_id=?',[req.user.id]);
   return newSession(c,req.user.id);
  });
  signedIn(req,res,value);
 });
}
