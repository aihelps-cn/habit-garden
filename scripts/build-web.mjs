import {cp,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
await mkdir(new URL('dist/',root),{recursive:true});
await cp(new URL('frontend/',root),new URL('dist/',root),{recursive:true});
console.log('Shared frontend copied to dist/.');
