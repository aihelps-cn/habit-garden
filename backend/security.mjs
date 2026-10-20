import {randomBytes,scrypt as rawScrypt,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(rawScrypt);
export const digest=value=>createHash('sha256').update(value).digest('hex');
export const token=()=>randomBytes(32).toString('hex');
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64);return `scrypt:${salt}:${key.toString('hex')}`;}
export async function verifyPassword(password,stored){const [kind,salt,hex]=String(stored).split(':');if(kind!=='scrypt'||!salt||!hex)return false;const key=await scrypt(password,salt,64),expected=Buffer.from(hex,'hex');return key.length===expected.length&&timingSafeEqual(key,expected);}
export function cookieToken(header=''){const raw=header.split(';').map(s=>s.trim()).find(s=>s.startsWith('hg_session='))?.slice(11);return /^[a-f0-9]{64}$/.test(raw||'')?raw:null;}
export function bearerToken(header=''){return /^Bearer ([a-f0-9]{64})$/.exec(header)?.[1]||null;}
export const publicUser=u=>({id:u.id,name:u.name,username:u.username,avatar:u.avatar,role:u.role,auto_submit:!!u.auto_submit});
