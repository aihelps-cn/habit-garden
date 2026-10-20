export async function request(path,method,body){
 const response=await fetch('/api'+path,{
  method,credentials:'same-origin',
  headers:{'Content-Type':'application/json','X-Habit-Request':'1'},
  ...(body===undefined?{}:{body:JSON.stringify(body)})
 });
 let data;
 try{data=await response.json()}catch{throw Error('无法连接服务，请检查服务器和数据库是否已启动')}
 return {status:response.status,data};
}
