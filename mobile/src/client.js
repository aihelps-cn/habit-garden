// Dependency injection keeps native credential behavior testable without a device.
export function createNativeClient({origin,http,storage}){
 const key='habit-session:'+origin;
 let queue=Promise.resolve();
 async function perform(path,method='GET',body){
  if(!path.startsWith('/')||path.startsWith('//'))throw Error('无效的接口路径');
  const session=await storage.get(key);
  const headers={'Content-Type':'application/json','X-Habit-Request':'1','X-Habit-Client':'native','Origin':origin};
  if(session)headers.Authorization='Bearer '+session;
  let response;
  try{
   response=await http.request({
    url:origin+'/api'+path,method,headers,
    ...(body===undefined?{}:{data:body}),
    responseType:'json',connectTimeout:15000,readTimeout:20000,disableRedirects:true
   });
  }catch{throw Error('暂时连接不上服务器，请检查网络后重试。登录状态已保留。')}
  const {status}=response;
  const data=typeof response.data==='string'?JSON.parse(response.data):response.data;
  if(status>=200&&status<300){
   if(['/auth/login','/auth/register','/password'].includes(path)){
    if(!/^[a-f0-9]{64}$/.test(data?.session_token||''))throw Error('服务器未返回手机端登录凭据，请先更新服务器');
    await storage.set(key,data.session_token);
    delete data.session_token;
   }
   if(path==='/auth/logout')await storage.remove(key);
  }else if(status===401&&session&&!['/auth/login','/auth/register'].includes(path)){
   await storage.remove(key);
  }
  return {status,data};
 }
 return (path,method,body)=>{
  // Serialize polling, logout and credential replacement so stale 401s cannot
  // erase a newly issued credential.
  const result=queue.then(()=>perform(path,method,body));
  queue=result.catch(()=>{});
  return result;
 };
}
