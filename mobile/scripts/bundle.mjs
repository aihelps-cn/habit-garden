import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {validateOrigin} from './config.mjs';

export async function buildMobile(apiOrigin,output){
 const origin=validateOrigin(apiOrigin);
 const root=new URL('../',import.meta.url),frontend=new URL('../../frontend/',import.meta.url);
 await mkdir(output,{recursive:true});
 await build({
  entryPoints:[fileURLToPath(new URL('app.js',frontend))],
  outfile:fileURLToPath(new URL('app.js',output)),bundle:true,format:'esm',target:['safari15','chrome100'],
  define:{__API_ORIGIN__:JSON.stringify(origin)},
  plugins:[{name:'native-transport',setup(b){
   b.onResolve({filter:/^\.\/transport\.js$/},()=>({path:fileURLToPath(new URL('src/transport.js',root))}));
  }}]
 });
 for(const name of ['index.html','style.css'])await copyFile(new URL(name,frontend),new URL(name,output));
 let html=await readFile(new URL('index.html',output),'utf8');
 html=html.replace('<title>',`<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ${origin}; object-src 'none'; base-uri 'self'; form-action 'none'; frame-src 'none'"><title>`);
 await writeFile(new URL('index.html',output),html);
}
