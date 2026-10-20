import {Capacitor,CapacitorHttp} from '@capacitor/core';
import {App} from '@capacitor/app';
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
