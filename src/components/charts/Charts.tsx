import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,PieChart,Pie,Cell,Legend} from 'recharts';
import {fmt} from '../../lib/calculations';
export const PALETTE=['#047857','#10b981','#b45309','#f59e0b','#475569','#84cc16','#0f766e','#a16207'];
type D={name:string;value:number};
export function EnergyBar({data,unit}:{data:D[];unit:string}){
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{top:8,right:8,left:0,bottom:0}}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4"/><XAxis dataKey="name" tick={{fontSize:12}} interval={0}/>
    <YAxis tick={{fontSize:12}} label={{value:unit,angle:-90,position:'insideLeft',fontSize:12}}/>
    <Tooltip formatter={(v:unknown)=>[`${fmt(Number(v))} ${unit}`,'Energy']}/><Bar dataKey="value" fill="#059669" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div>;
}
export function Donut({data}:{data:D[]}){
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart>
    <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>{data.map((_,i)=><Cell key={i} fill={PALETTE[i%PALETTE.length]}/>)}</Pie>
    <Tooltip formatter={(v:unknown)=>`${fmt(Number(v))} kWh/month`}/><Legend iconType="circle" wrapperStyle={{fontSize:12}}/></PieChart></ResponsiveContainer></div>;
}
