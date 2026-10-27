import {useMemo,useState} from 'react';
import {Zap,IndianRupee,Plug,PiggyBank,Plus,TrendingDown,Lightbulb} from 'lucide-react';
import {useStore} from '../lib/store';import {enrich,totals,potentialSavings,fmt,inr} from '../lib/calculations';
import {Card,Stat,Btn,Empty} from '../components/common/ui';import {EnergyBar,Donut} from '../components/charts/Charts';import ApplianceForm from '../components/appliances/ApplianceForm';import {Page} from '../types';
export default function Overview({go}:{go:(p:Page)=>void}){
  const {appliances,settings}=useStore();const [view,setView]=useState<'month'|'day'>('month');const [adding,setAdding]=useState(false);
  const rows=useMemo(()=>enrich(appliances,settings.tariff).sort((a,b)=>b.kwh-a.kwh),[appliances,settings.tariff]);
  const t=totals(appliances,settings);const sv=potentialSavings(appliances,settings.tariff);
  const period=new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'});
  const insights:string[]=[];
  if(rows[0]&&t.kwh>0){insights.push(`${rows[0].name} is your largest estimated consumer at ${fmt(rows[0].share,0)}% of monthly energy. Check its usage assumptions first.`);
    insights.push(`As a hypothetical, using your top three appliances 20% less could save about ${fmt(sv.kwh)} kWh (${inr(sv.cost)}) a month, where that doesn’t affect essential needs.`);
    const cool=rows.filter(r=>r.category==='Cooling').reduce((s,r)=>s+r.share,0);if(cool>=30)insights.push(`Cooling accounts for ${fmt(cool,0)}% of your energy. Thermostat settings and maintenance are worth reviewing, but comfort and safety come first.`);}
  return <>
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-semibold text-stone-900">Welcome to Enerwise</h2><p className="text-sm text-stone-500">Reporting period: {period} · estimates from the appliances you entered</p></div>
      <div className="flex gap-2"><Btn onClick={()=>setAdding(true)}><Plus size={16}/>Add appliance</Btn><Btn variant="ghost" onClick={()=>go('simulator')}><TrendingDown size={16}/>Explore savings</Btn></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={<Zap size={16}/>} label="Monthly energy" value={`${fmt(t.kwh)} kWh`} sub={`${fmt(t.daily)} kWh per day`}/>
      <Stat icon={<IndianRupee size={16}/>} label="Estimated bill" value={inr(t.bill)} sub={`Energy ${inr(t.cost)} + fixed ${inr(settings.fixedCharge)}`}/>
      <Stat icon={<Plug size={16}/>} label="Appliances" value={String(appliances.length)} sub="Tracked in this browser"/>
      <Stat icon={<PiggyBank size={16}/>} label="Potential savings" value={inr(sv.cost)} sub="Hypothetical: top 3 used 20% less"/></div>
    {rows.length===0||t.kwh===0?<Empty title="Nothing to chart yet" text="Add an appliance with a power rating and usage hours to see your breakdown."><Btn onClick={()=>setAdding(true)}><Plus size={16}/>Add appliance</Btn></Empty>:<>
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Energy by appliance</h3>
        <div className="flex rounded-lg border border-stone-200 p-0.5 text-sm" role="group" aria-label="Chart period">{(['month','day'] as const).map(v=><button key={v} onClick={()=>setView(v)} aria-pressed={view===v} className={`rounded-md px-3 py-1 ${view===v?'bg-forest-800 text-white':'text-stone-600'}`}>{v==='month'?'Monthly':'Daily'}</button>)}</div></div>
        <EnergyBar data={rows.map(r=>({name:r.name,value:view==='month'?r.kwh:r.daily}))} unit={view==='month'?'kWh/month':'kWh/day'}/></Card>
      <Card className="lg:col-span-2"><h3 className="mb-3 font-semibold">Share of total energy</h3><Donut data={rows.map(r=>({name:r.name,value:r.kwh}))}/></Card></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><h3 className="mb-4 font-semibold">Highest consumers</h3><ol className="space-y-3">{rows.slice(0,5).map((r,i)=><li key={r.id}><div className="mb-1 flex justify-between text-sm"><span>{i+1}. {r.name}</span><span className="tabular-nums text-stone-500">{fmt(r.kwh)} kWh · {inr(r.cost)}</span></div><div className="h-2 rounded-full bg-stone-100"><div className="h-2 rounded-full bg-emerald-600" style={{width:`${r.share}%`}}/></div></li>)}</ol></Card>
      <Card><h3 className="mb-4 flex items-center gap-2 font-semibold"><Lightbulb size={16} className="text-amber-600"/>Insights</h3><ul className="space-y-3 text-sm text-stone-700">{insights.map((s,i)=><li key={i} className="border-l-2 border-emerald-500 pl-3">{s}</li>)}</ul></Card></div></>}
    {adding&&<ApplianceForm onClose={()=>setAdding(false)}/>}</>;
}
