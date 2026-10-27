import {ReactNode,useState} from 'react';
import {LayoutDashboard,Plug,TrendingDown,FileText,Settings as Cog,Menu,X,CheckCircle2} from 'lucide-react';
import {Page} from '../../types';
import {useStore} from '../../lib/store';
const NAV:{id:Page;label:string;icon:ReactNode;desc:string}[]=[
{id:'overview',label:'Overview',icon:<LayoutDashboard size={18}/>,desc:'Your estimated monthly electricity use at a glance.'},
{id:'appliances',label:'Appliances',icon:<Plug size={18}/>,desc:'Add, edit and organise the appliances you use.'},
{id:'simulator',label:'Savings Simulator',icon:<TrendingDown size={18}/>,desc:'Explore “what if” usage changes without touching your data.'},
{id:'reports',label:'Reports',icon:<FileText size={18}/>,desc:'Appliance-wise energy, cost and share for this month.'},
{id:'settings',label:'Settings',icon:<Cog size={18}/>,desc:'Tariff, fixed charge and data options.'}];
const Logo=()=><svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="10" fill="#10b981"/><path d="M19 6 9 19h7l-2 9 10-13h-7z" fill="#0e2e22"/></svg>;
export default function Shell({page,go,children}:{page:Page;go:(p:Page)=>void;children:ReactNode}){
  const [open,setOpen]=useState(false);const {toast}=useStore();const cur=NAV.find(n=>n.id===page)!;
  const nav=<nav aria-label="Main" className="mt-8 space-y-1">{NAV.map(n=><button key={n.id} onClick={()=>{go(n.id);setOpen(false)}} aria-current={page===n.id?'page':undefined}
    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${page===n.id?'bg-emerald-500/15 font-medium text-white':'text-emerald-100/70 hover:bg-white/5 hover:text-white'}`}>{n.icon}{n.label}</button>)}</nav>;
  const side=<div className="flex h-full flex-col bg-forest-900 p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2.5 text-white"><Logo/><span className="text-lg font-semibold tracking-tight">Enerwise</span></div>
    <button className="text-white lg:hidden" onClick={()=>setOpen(false)} aria-label="Close menu"><X size={20}/></button></div>{nav}
    <p className="mt-auto text-xs leading-relaxed text-emerald-100/50">Software-only estimates. Not a live meter reading.</p></div>;
  return <div className="min-h-screen lg:pl-64">
    <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{side}</aside>
    {open&&<div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-black/40" onClick={()=>setOpen(false)}/><div className="absolute inset-y-0 left-0 w-64">{side}</div></div>}
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-stone-200 bg-cream/90 px-4 py-3 backdrop-blur sm:px-8">
      <button className="rounded-lg p-2 hover:bg-stone-200/60 lg:hidden" onClick={()=>setOpen(true)} aria-label="Open menu"><Menu size={20}/></button>
      <div><h1 className="text-lg font-semibold leading-tight text-stone-900">{cur.label}</h1><p className="text-xs text-stone-500">{cur.desc}</p></div></header>
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-8">{children}</main>
    <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-50">{toast&&<div className="flex items-center gap-2 rounded-lg bg-forest-900 px-4 py-2.5 text-sm text-white shadow-lg"><CheckCircle2 size={16} className="text-emerald-400"/>{toast}</div>}</div></div>;
}
