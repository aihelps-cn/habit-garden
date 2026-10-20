import {readFile} from 'node:fs/promises';
import {validateOrigin} from './config.mjs';
import {buildMobile} from './bundle.mjs';
const root=new URL('../',import.meta.url);
let config;
try{config=JSON.parse(await readFile(new URL('config.json',root),'utf8'))}
catch{throw Error('请先复制 mobile/config.example.json 为 mobile/config.json，并填写服务器 HTTPS 域名')}
const origin=validateOrigin(config.apiOrigin);
await buildMobile(origin,new URL('www/',root));
console.log('Mobile assets built for '+origin);
