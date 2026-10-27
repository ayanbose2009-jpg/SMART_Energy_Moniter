import {useState} from 'react';
import {Page} from './types';
import {useStore} from './lib/store';
import Shell from './components/layout/Shell';
import {Btn,Card} from './components/common/ui';
import Overview from './pages/Overview';import Appliances from './pages/Appliances';import SavingsSimulator from './pages/SavingsSimulator';import Reports from './pages/Reports';import SettingsPage from './pages/Settings';
export default function App(){
  const [page,setPage]=useState<Page>('overview');const {loading,error,retry}=useStore();
  return <Shell page={page} go={setPage}>{loading?<p role="status" className="py-20 text-center text-stone-500">Loading your data…</p>:error?
    <Card className="mx-auto max-w-lg text-center"><h2 className="font-semibold">Can’t reach the Enerwise backend</h2><p className="mt-2 text-sm text-stone-600">Start it in a second terminal: <code className="rounded bg-stone-100 px-1">cd backend; uvicorn main:app --port 8000</code></p><Btn className="mt-4" onClick={retry}>Try again</Btn></Card>:
    page==='overview'?<Overview go={setPage}/>:page==='appliances'?<Appliances/>:page==='simulator'?<SavingsSimulator/>:page==='reports'?<Reports/>:<SettingsPage/>}</Shell>;
}
