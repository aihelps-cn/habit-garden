import mysql from 'mysql2/promise';
import {readFile} from 'node:fs/promises';
export function createPool(env=process.env){for(const key of ['DB_HOST','DB_USER','DB_PASSWORD','DB_NAME'])if(!env[key])throw Error(`Missing ${key}`);return mysql.createPool({host:env.DB_HOST,port:Number(env.DB_PORT||3306),user:env.DB_USER,password:env.DB_PASSWORD,database:env.DB_NAME,charset:'utf8mb4',timezone:'Z',dateStrings:true,connectionLimit:10,supportBigNumbers:true,bigNumberStrings:false,decimalNumbers:true});}
export async function query(db,sql,args=[]){return (await db.execute(sql,args))[0]}
export async function transaction(pool,fn){const c=await pool.getConnection();try{await c.beginTransaction();const result=await fn(c);await c.commit();return result}catch(e){await c.rollback();throw e}finally{c.release()}}
export async function migrate(pool){const c=await pool.getConnection();try{const [lock]=await query(c,"SELECT GET_LOCK('habit_garden_schema_v2',30) AS acquired");if(lock.acquired!==1)throw Error('Could not obtain schema lock');const sql=await readFile(new URL('./schema.sql',import.meta.url),'utf8');for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await c.query(statement);
const [column]=await query(c,"SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='sessions' AND COLUMN_NAME='expires_at'");
if(column?.IS_NULLABLE==='NO')await c.query('ALTER TABLE sessions MODIFY expires_at DATETIME(3) NULL');
const [balanceCheck]=await query(c,"SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND CONSTRAINT_TYPE='CHECK' AND CONSTRAINT_NAME='balance_nonnegative'");
if(balanceCheck)await c.query('ALTER TABLE users DROP CHECK balance_nonnegative');
}finally{await c.query("SELECT RELEASE_LOCK('habit_garden_schema_v2')");c.release();}}
