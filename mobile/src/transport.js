import {Capacitor,CapacitorHttp} from '@capacitor/core';
import {App} from '@capacitor/app';
import {Filesystem,Directory} from '@capacitor/filesystem';
import {SecureStorage} from '@aparajita/capacitor-secure-storage';
import {createNativeClient} from './client.js';
const nativeRequest=createNativeClient({
 origin:__API_ORIGIN__,http:CapacitorHttp,
 storage:{
  get:key=>SecureStorage.get(key,false,false),
  set:(key,value)=>SecureStorage.set(key,value,false,false),
  remove:key=>SecureStorage.remove(key,false)
 }
});
if(Capacitor.isNativePlatform()){
 App.addListener('appStateChange',({isActive})=>{if(isActive)document.dispatchEvent(new Event('habit-resume'))});
 App.addListener('backButton',()=>document.dispatchEvent(new Event('habit-back')));
}
export async function request(path,method,body){
 if(!Capacitor.isNativePlatform())throw Error('请在 iOS 或安卓 App 中打开；网页请使用服务器网址');
 return nativeRequest(path,method,body);
}

// ========== 应用内自动更新 ==========
let currentInfo=null;
export async function getCurrentVersion(){
 if(!Capacitor.isNativePlatform())return null;
 if(!currentInfo)currentInfo=await App.getInfo();
 return currentInfo;
}

export async function checkUpdate(){
 if(!Capacitor.isNativePlatform())return null;
 const info=await getCurrentVersion();
 const {data}=await nativeRequest('/version','GET');
 const currentCode=Number(info.build);
 const latestCode=Number(data.versionCode);
 if(latestCode>currentCode){
  return {...data,currentVersion:info.version,force:currentCode<Number(data.minVersionCode||0)};
 }
 return null;
}

export async function downloadAndInstallApk(apkUrl,onProgress){
 if(!Capacitor.isNativePlatform())throw Error('仅在安卓 App 中可用');
 const fileName='habit-garden-update.apk';
 const result=await Filesystem.downloadFile({
  path:fileName,
  url:apkUrl,
  directory:Directory.Cache,
  recursive:true,
  progress:onProgress?true:false
 });
 // 下载完成后调用原生插件安装
 const ApkInstaller=Capacitor.Plugins?.ApkInstaller;
 if(!ApkInstaller)throw Error('安装插件未就绪，请重启应用');
 const uri=result.uri||result.path;
 // Filesystem.downloadFile 返回的可能是 content:// 或 file:// URI
 // 需要获取实际文件路径传给安装器
 let filePath;
 if(uri?.startsWith('file://')){
  filePath=decodeURIComponent(uri.slice(7));
 }else if(uri?.startsWith('/')){
  filePath=uri;
 }else{
  // 通过 stat 获取真实路径
  const stat=await Filesystem.stat({path:fileName,directory:Directory.Cache});
  filePath=stat.uri?.startsWith('file://')?decodeURIComponent(stat.uri.slice(7)):stat.uri;
 }
 await ApkInstaller.installApk({filePath});
}
