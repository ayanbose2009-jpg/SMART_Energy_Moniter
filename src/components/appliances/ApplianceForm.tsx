import {useEffect,useState,FormEvent} from 'react';
import {X} from 'lucide-react';
import {Appliance,CATEGORIES,Category} from '../../types';
import {validate} from '../../lib/calculations';
import {Btn,Field,inputCls} from '../common/ui';
import {useStore} from '../../lib/store';
export default function ApplianceForm({initial,onClose}:{initial?:Appliance;onClose:()=>void}){
  const {add,update}=useStore();
  const [f,setF]=useState({name:initial?.name??'',category:(initial?.category??'Other') as Category,watts:String(initial?.watts??''),hoursPerDay:String(initial?.hoursPerDay??''),daysPerMonth:String(initial?.daysPerMonth??30)});
  const [err,setErr]=useState<Record<string,string>>({});
  useEffect(()=>{const k=(e:KeyboardEvent)=>e.key==='Escape'&&onClose();window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[onClose]);
  const set=(k:string)=>(e:{target:{value:string}})=>setF({...f,[k]:e.target.value});
  const submit=async(e:FormEvent)=>{e.preventDefault();
    const v={name:f.name.trim(),category:f.category,watts:f.watts===''?NaN:Number(f.watts),hoursPerDay:f.hoursPerDay===''?NaN:Number(f.hoursPerDay),daysPerMonth:f.daysPerMonth===''?NaN:Number(f.daysPerMonth)};
    const er=validate(v);setErr(er);if(Object.keys(er).length)return;
    const ok=await(initial?update({...v,id:initial.id}):add(v));if(ok)onClose();};
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <form onSubmit={submit} noValidate role="dialog" aria-modal="true" aria-label={initial?'Edit appliance':'Add appliance'} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{initial?'Edit appliance':'Add appliance'}</h2><button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-stone-500 hover:bg-stone-100"><X size={18}/></button></div>
      <Field label="Name" error={err.name}><input autoFocus className={inputCls} value={f.name} onChange={set('name')} placeholder="e.g. Ceiling fan"/></Field>
      <Field label="Category"><select className={inputCls} value={f.category} onChange={set('category')}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field>
      <Field label="Rated power (W)" error={err.watts}><input type="number" step="any" className={inputCls} value={f.watts} onChange={set('watts')}/></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Hours per day" error={err.hoursPerDay}><input type="number" step="0.5" className={inputCls} value={f.hoursPerDay} onChange={set('hoursPerDay')}/></Field>
        <Field label="Days per month" error={err.daysPerMonth}><input type="number" step="1" className={inputCls} value={f.daysPerMonth} onChange={set('daysPerMonth')}/></Field></div>
      <div className="flex justify-end gap-2"><Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn><Btn type="submit">{initial?'Save changes':'Add appliance'}</Btn></div>
    </form></div>;
}
