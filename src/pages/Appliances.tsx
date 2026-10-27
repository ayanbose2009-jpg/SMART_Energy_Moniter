import {useMemo,useState} from 'react';
import {Plus,Pencil,Trash2,Search} from 'lucide-react';
import {useStore} from '../lib/store';import {enrich,fmt,inr} from '../lib/calculations';import {Appliance,CATEGORIES} from '../types';
import {Card,Btn,Empty,inputCls} from '../components/common/ui';import ApplianceForm from '../components/appliances/ApplianceForm';
export default function Appliances(){
  const {appliances,settings,remove}=useStore();
  const [q,setQ]=useState('');const [cat,setCat]=useState('All');const [sort,setSort]=useState('kwh');const [form,setForm]=useState<Appliance|'new'|null>(null);
  const rows=useMemo(()=>enrich(appliances,settings.tariff).filter(r=>(cat==='All'||r.category===cat)&&r.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):sort==='cost'?b.cost-a.cost:b.kwh-a.kwh),[appliances,settings.tariff,q,cat,sort]);
  return <>
    <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-900">The starting appliances are illustrative sample values. Edit or delete them to match your home.</p>
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-52 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/><input aria-label="Search appliances" placeholder="Search appliances" className={`${inputCls} pl-9`} value={q} onChange={e=>setQ(e.target.value)}/></div>
      <select aria-label="Filter by category" className={`${inputCls} w-auto`} value={cat} onChange={e=>setCat(e.target.value)}><option>All</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
      <select aria-label="Sort by" className={`${inputCls} w-auto`} value={sort} onChange={e=>setSort(e.target.value)}><option value="kwh">Sort: consumption</option><option value="name">Sort: name</option><option value="cost">Sort: cost</option></select>
      <Btn onClick={()=>setForm('new')}><Plus size={16}/>Add appliance</Btn></div>
    {rows.length===0?<Empty title={appliances.length?'No matches':'No appliances yet'} text={appliances.length?'Try a different search or category.':'Add your first appliance to start estimating.'}>{!appliances.length&&<Btn onClick={()=>setForm('new')}><Plus size={16}/>Add appliance</Btn>}</Empty>:
    <Card className="overflow-x-auto !p-0"><table className="w-full min-w-[700px] text-sm"><thead className="border-b border-stone-200 text-left text-xs text-stone-500"><tr>{['Appliance','Category','Usage','Energy','Cost',''].map(h=><th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
      <tbody>{rows.map(r=><tr key={r.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50"><td className="px-4 py-3 font-medium">{r.name}</td>
        <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">{r.category}</span></td>
        <td className="px-4 py-3 text-stone-600">{r.watts} W · {r.hoursPerDay} h/day · {r.daysPerMonth} days</td>
        <td className="px-4 py-3 tabular-nums">{fmt(r.kwh)} kWh</td><td className="px-4 py-3 tabular-nums">{inr(r.cost)}</td>
        <td className="px-4 py-3 text-right"><button aria-label={`Edit ${r.name}`} className="rounded p-1.5 hover:bg-stone-200" onClick={()=>setForm(appliances.find(a=>a.id===r.id)!)}><Pencil size={15}/></button>
          <button aria-label={`Delete ${r.name}`} className="rounded p-1.5 text-red-600 hover:bg-red-50" onClick={()=>window.confirm(`Delete ${r.name}?`)&&remove(r.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></Card>}
    {form&&<ApplianceForm initial={form==='new'?undefined:form} onClose={()=>setForm(null)}/>}</>;
}
