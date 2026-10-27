import {createContext,useContext,useEffect,useState,useCallback,ReactNode} from 'react';
import {Appliance,Settings} from '../types';
interface Ctx{appliances:Appliance[];settings:Settings;toast:string;loading:boolean;error:boolean;retry:()=>void;notify:(m:string)=>void;
  add:(a:Omit<Appliance,'id'>)=>Promise<boolean>;update:(a:Appliance)=>Promise<boolean>;remove:(id:string)=>Promise<void>;setSettings:(s:Settings)=>Promise<boolean>;reset:()=>Promise<void>}
const C=createContext<Ctx>(null!);
export const useStore=()=>useContext(C);
async function api<T>(path:string,method='GET',body?:unknown):Promise<T>{
  const r=await fetch('/api'+path,{method,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
  if(!r.ok){let m='Request failed.';try{const d=(await r.json()).detail;m=typeof d==='string'?d:Array.isArray(d)?d.map((x:{msg:string})=>x.msg).join(' '):m}catch{/* no body */}throw new Error(m)}
  return (r.status===204?undefined:await r.json()) as T;
}
export function StoreProvider({children}:{children:ReactNode}){
  const [appliances,setA]=useState<Appliance[]>([]);const [settings,setS]=useState<Settings>({tariff:8,fixedCharge:0});
  const [toast,setT]=useState('');const [loading,setL]=useState(true);const [error,setE]=useState(false);
  const notify=useCallback((m:string)=>{setT(m);setTimeout(()=>setT(''),2500)},[]);
  const load=useCallback(()=>{setL(true);setE(false);
    Promise.all([api<Appliance[]>('/appliances'),api<Settings>('/settings')]).then(([a,s])=>{setA(a);setS(s)}).catch(()=>setE(true)).finally(()=>setL(false))},[]);
  useEffect(load,[load]);
  const run=async(fn:()=>Promise<void>,ok:string)=>{try{await fn();notify(ok);return true}catch(e){notify((e as Error).message);return false}};
  const v:Ctx={appliances,settings,toast,loading,error,retry:load,notify,
    add:a=>run(async()=>{const n=await api<Appliance>('/appliances','POST',a);setA(p=>[...p,n])},'Appliance added.'),
    update:a=>run(async()=>{const n=await api<Appliance>('/appliances/'+a.id,'PUT',a);setA(p=>p.map(x=>x.id===n.id?n:x))},'Appliance updated.'),
    remove:async id=>{await run(async()=>{await api('/appliances/'+id,'DELETE');setA(p=>p.filter(x=>x.id!==id))},'Appliance deleted.')},
    setSettings:s=>run(async()=>{setS(await api<Settings>('/settings','PUT',s))},'Settings saved.'),
    reset:async()=>{await run(async()=>{const r=await api<{appliances:Appliance[];settings:Settings}>('/reset','POST');setA(r.appliances);setS(r.settings)},'Sample data restored.')}};
  return <C.Provider value={v}>{children}</C.Provider>;
}
