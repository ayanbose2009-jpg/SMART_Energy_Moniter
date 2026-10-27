import {useState} from 'react';
import {useStore} from '../lib/store';import {Card,Btn,Field,inputCls} from '../components/common/ui';
export default function SettingsPage(){
  const {settings,setSettings,reset}=useStore();const [t,setT]=useState(String(settings.tariff));const [f,setF]=useState(String(settings.fixedCharge));const [confirm,setConfirm]=useState(false);
  const tn=Number(t),fn=Number(f),bad=t===''||f===''||!(tn>=0)||!(fn>=0);
  return <div className="max-w-xl space-y-6">
    <Card><h2 className="mb-4 font-semibold">Electricity charges</h2><div className="space-y-4">
      <Field label="Tariff (₹ per kWh)" error={t!==''&&!(tn>=0)?'Tariff must be 0 or more.':undefined}><input type="number" step="0.5" className={inputCls} value={t} onChange={e=>setT(e.target.value)}/></Field>
      <Field label="Monthly fixed charge (₹, optional)" error={f!==''&&!(fn>=0)?'Fixed charge must be 0 or more.':undefined}><input type="number" step="10" className={inputCls} value={f} onChange={e=>setF(e.target.value)}/></Field>
      <Btn disabled={bad} onClick={()=>{void setSettings({tariff:tn,fixedCharge:fn})}}>Save settings</Btn></div>
      <p className="mt-4 rounded-lg bg-stone-50 p-3 text-xs leading-relaxed text-stone-600">Enerwise uses one constant rate for every unit. It does not calculate slab-based tariffs, taxes, subsidies or other utility charges, so your actual bill may differ.</p></Card>
    <Card><h2 className="mb-1 font-semibold">Reset data</h2><p className="mb-3 text-sm text-stone-600">Restore the sample appliances and default tariff. Your current appliances and settings will be replaced.</p>
      {!confirm?<Btn variant="ghost" onClick={()=>setConfirm(true)}>Reset to sample data</Btn>:<div className="flex items-center gap-2"><span className="text-sm text-red-700">Are you sure?</span><Btn variant="danger" onClick={async()=>{await reset();setT('8');setF('0');setConfirm(false)}}>Yes, reset</Btn><Btn variant="ghost" onClick={()=>setConfirm(false)}>Cancel</Btn></div>}</Card></div>;
}
