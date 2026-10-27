import {Download} from 'lucide-react';
import {useStore} from '../lib/store';import {enrich,totals,fmt,inr} from '../lib/calculations';import {exportCsv} from '../lib/exportCsv';
import {Card,Btn,Empty} from '../components/common/ui';
export default function Reports(){
  const {appliances,settings,notify}=useStore();const rows=enrich(appliances,settings.tariff).sort((a,b)=>b.kwh-a.kwh);const t=totals(appliances,settings);
  const period=new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'});
  return <>
    <Card><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Period summary · {period}</h2>
      <p className="text-sm text-stone-600">{appliances.length} appliances · {fmt(t.kwh)} kWh · energy cost {inr(t.cost)} · estimated bill {inr(t.bill)} at ₹{settings.tariff}/kWh</p></div>
      <Btn disabled={!appliances.length} onClick={()=>{exportCsv();notify('CSV export started.')}}><Download size={16}/>Export CSV</Btn></div></Card>
    {rows.length===0?<Empty title="No data to report" text="Add appliances to generate a report."/>:
    <Card className="overflow-x-auto !p-0"><table className="w-full min-w-[640px] text-sm"><thead className="border-b border-stone-200 text-left text-xs text-stone-500"><tr>{['Appliance','Energy (kWh/month)','Cost (₹)','Share'].map(h=><th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
      <tbody>{rows.map(r=><tr key={r.id} className="border-b border-stone-100"><td className="px-4 py-3 font-medium">{r.name}</td><td className="px-4 py-3 tabular-nums">{fmt(r.kwh)}</td><td className="px-4 py-3 tabular-nums">{inr(r.cost)}</td>
        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-2 w-24 rounded-full bg-stone-100"><div className="h-2 rounded-full bg-emerald-600" style={{width:`${r.share}%`}}/></div><span className="tabular-nums">{fmt(r.share,1)}%</span></div></td></tr>)}
        <tr className="bg-stone-50 font-semibold"><td className="px-4 py-3">Total</td><td className="px-4 py-3 tabular-nums">{fmt(t.kwh)}</td><td className="px-4 py-3 tabular-nums">{inr(t.cost)}</td><td className="px-4 py-3">100%</td></tr></tbody></table></Card>}
    <Card><h3 className="font-semibold">History</h3><p className="mt-1 text-sm text-stone-600">Enerwise doesn’t have historical records yet, so no trend chart is shown. To build a history, export a CSV at the end of each month and keep the files together to compare later.</p></Card></>;
}
