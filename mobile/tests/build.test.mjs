import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildMobile} from '../scripts/bundle.mjs';
test('both native targets bundle the shared UI and native vault/HTTP adapter',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'habit-mobile-build-'));
 try{
  const output=pathToFileURL(dir+'/');
  await buildMobile('https://habit.test',output);
  const js=await readFile(new URL('app.js',output),'utf8'),html=await readFile(new URL('index.html',output),'utf8');
  assert.match(js,/habit\.test/);
  assert.match(js,/SecureStorage/);
  assert.match(js,/CapacitorHttp/);
  assert.doesNotMatch(js,/from ['"]@capacitor/);
  assert.match(html,/Content-Security-Policy/);
  assert.match(html,/src="\.\/app.js"/);
 }finally{await rm(dir,{recursive:true,force:true})}
});
