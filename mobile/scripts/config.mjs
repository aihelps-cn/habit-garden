export function validateOrigin(value){
 let url;
 try{url=new URL(value)}catch{throw Error('请设置有效的 apiOrigin，例如 https://garden.your-domain.com')}
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)
  throw Error('手机端 apiOrigin 必须是 HTTPS 来源，不能包含路径、账号、查询参数或片段');
 if(url.hostname==='example.com'||url.hostname.endsWith('.example.com'))
  throw Error('请把示例域名替换为你的真实服务器域名');
 return url.origin;
}
