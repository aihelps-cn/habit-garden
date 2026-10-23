import {request} from './transport.js';
export async function api(path,method='GET',body){
 const {status,data}=await request(path,method,body);
 if(status<200||status>=300){
  const error=Error(data?.error||'请求失败');error.status=status;throw error;
 }
 return data;
}

// 应用内自动更新（仅原生平台可用，web 端返回 null）
import * as transport from './transport.js';
export const checkUpdate = transport.checkUpdate || (async () => null);
export const downloadAndInstallApk = transport.downloadAndInstallApk || (async () => { throw Error('请在安卓 App 中更新'); });
