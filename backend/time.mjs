// Business times are Asia/Shanghai (UTC+08:00), independent of the host timezone.
export const isoSql=d=>new Date(d).toISOString().slice(0,23).replace('T',' ');
export const sqlDate=d=>new Date(String(d).replace(' ','T')+'Z');
export const businessDay=(now=new Date())=>new Date(now.getTime()+8*3600000).toISOString().slice(0,10);
export const atShanghai=(day,time)=>new Date(`${day}T${time}:00+08:00`);
export const nextDay=day=>new Date(Date.parse(`${day}T00:00:00Z`)+86400000).toISOString().slice(0,10);
export function manualDeadline(now=new Date()) { const day=businessDay(now);return atShanghai(now>=atShanghai(day,'23:30')?nextDay(day):day,'23:30'); }
export function autoSubmitCutoff(now=new Date()){const day=businessDay(now);return now>=atShanghai(day,'22:00')?day:businessDay(new Date(now.getTime()-86400000));}
export const autoDeadline=day=>atShanghai(day,'23:30');
