import {request} from './transport.js';
export async function api(path,method='GET',body){
 const {status,data}=await request(path,method,body);
 if(status<200||status>=300){
  const error=Error(data?.error||'请求失败');error.status=status;throw error;
 }
 return data;
}
