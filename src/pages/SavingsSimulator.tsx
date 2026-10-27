import {useEffect,useState} from 'react';
import {useStore} from '../lib/store';import {monthlyKwh,energyCost,savedKwh,fmt,inr,round} from '../lib/calculations';
import {Card,Btn,Empty,Field,inputCls} from '../components/common/ui';import {EnergyBar} from '../components/charts/Charts';
export default function SavingsSimulator(){
  const {appliances,settings,update}=useStore();const [id,setId]=useState(appliances[0]?.id??'');const a=appliances.find(x=>x.id===id)??appliances[0];
  const [h,setH]=useState(a?round(a.hoursPerDay*0.8,1):0);
  useEffect(()=>{if(a)setH(round(a.hoursPerDay*0.8,1))},[a?.id]);
  if(!a)return <Empty title="No appliances to simulate" text="Add an appliance first, then come back to try usage changes."/>;
  const T=settings.tariff,ph=Math.min(h,a.hoursPerDay),base=monthlyKwh(a),prop=monthlyKwh({...a,hoursPerDay:ph});
  const dBase=a.watts*a.hoursPerDay/1000,dProp=a.watts*ph/1000;
  const cards=[['Daily energy',`${fmt(dBase)} → ${fmt(dProp)} kWh`,`${fmt(dBase-dProp)} kWh saved`],['Monthly energy',`${fmt(base)} → ${fmt(prop)} kWh`,`${fmt(base-prop)} kWh saved`],['Monthly cost',`${inr(energyCost(base,T))} → ${inr(energyCost(prop,T))}`,`${inr(energyCost(base-prop,T))} saved`]];
  return <>
    <Card><div className="grid gap-4 sm:grid-cols-2"><Field label="Appliance"><select className={inputCls} value={a.id} onChange={e=>setId(e.target.value)}>{appliances.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
      <Field label={`Proposed usage: ${fmt(ph,1)} h/day (current ${a.hoursPerDay} h/day)`}><input type="range" className="mt-2 w-full accent-emerald-600" min={0} max={Math.max(a.hoursPerDay,0.5)} step={0.5} value={ph} onChange={e=>setH(Number(e.target.value))}/></Field></div>
      <p className="mt-3 text-xs text-stone-500">Your saved appliance data is not changed unless you choose “Apply to appliance”.</p></Card>
    <div className="grid gap-4 sm:grid-cols-3">{cards.map(([l,v,s])=><Card key={l}><div className="text-sm text-stone-500">{l}</div><div className="mt-2 text-lg font-semibold tabular-nums">{v}</div><div className="mt-1 text-sm text-emerald-700">{s}</div></Card>)}</div>
    <div className="grid gap-4 lg:grid-cols-2"><Card><h3 className="mb-3 font-semibold">Baseline vs proposed</h3><EnergyBar data={[{name:'Current',value:base},{name:'Proposed',value:prop}]} unit="kWh/month"/>
      <Btn className="mt-3" variant="ghost" disabled={ph===a.hoursPerDay} onClick={()=>window.confirm(`Set ${a.name} to ${ph} h/day permanently?`)&&update({...a,hoursPerDay:ph})}>Apply to appliance</Btn></Card>
      <Card><h3 className="mb-1 font-semibold">Hypothetical scenarios</h3><p className="mb-3 text-xs text-stone-500">Examples for {a.name}, not guaranteed savings.</p>
        <table className="w-full text-sm"><thead className="text-left text-xs text-stone-500"><tr><th className="py-2">Scenario</th><th>Hours cut/day</th><th>kWh/month</th><th>Cost/month</th></tr></thead><tbody>
        {[['Conservative',0.1],['Moderate',0.25],['Ambitious',0.5]].map(([n,p])=>{const r=a.hoursPerDay*(p as number),k=savedKwh(a.watts,r,a.daysPerMonth);return <tr key={n as string} className="border-t border-stone-100"><td className="py-2 font-medium">{n}</td><td>{fmt(r,1)}</td><td>{fmt(k)}</td><td>{inr(energyCost(k,T))}</td></tr>})}</tbody></table>
        <div className="mt-4 rounded-lg bg-stone-50 p-3 text-xs leading-relaxed text-stone-600"><b>Assumptions:</b> constant rated power while running, a flat tariff of ₹{T}/kWh, {a.daysPerMonth} operating days per month, and fixed charges unchanged. Reduce usage only where it is safe and doesn’t affect essential lighting, cooling or other needs.</div></Card></div></>;
}
