import {Appliance,Settings} from '../types';
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):lo;
export const round=(n:number,d=2)=>Math.round((n+Number.EPSILON)*10**d)/10**d;
type U=Pick<Appliance,'watts'|'hoursPerDay'|'daysPerMonth'>;
/** E (kWh) = W × h/day × days ÷ 1000 */
export const monthlyKwh=(a:U)=>clamp(a.watts,0,Infinity)*clamp(a.hoursPerDay,0,24)*clamp(a.daysPerMonth,0,31)/1000;
export const dailyKwh=(a:U)=>clamp(a.watts,0,Infinity)*clamp(a.hoursPerDay,0,24)/1000;
export const energyCost=(kwh:number,tariff:number)=>kwh*clamp(tariff,0,Infinity);
export const savedKwh=(watts:number,hoursReduced:number,days:number)=>clamp(watts,0,Infinity)*clamp(hoursReduced,0,24)*clamp(days,0,31)/1000;
export const enrich=(list:Appliance[],tariff:number)=>{
  const total=list.reduce((s,a)=>s+monthlyKwh(a),0);
  return list.map(a=>{const kwh=monthlyKwh(a);return {...a,kwh,daily:dailyKwh(a),cost:energyCost(kwh,tariff),share:total>0?kwh/total*100:0}});
};
export const totals=(list:Appliance[],s:Settings)=>{
  const kwh=list.reduce((t,a)=>t+monthlyKwh(a),0),cost=energyCost(kwh,s.tariff);
  return {kwh,cost,bill:cost+clamp(s.fixedCharge,0,Infinity),daily:list.reduce((t,a)=>t+dailyKwh(a),0)};
};
/** Hypothetical: cut the top 3 consumers' daily hours by 20%. */
export const potentialSavings=(list:Appliance[],tariff:number)=>{
  const top=[...list].sort((a,b)=>monthlyKwh(b)-monthlyKwh(a)).slice(0,3);
  const kwh=top.reduce((t,a)=>t+savedKwh(a.watts,a.hoursPerDay*0.2,a.daysPerMonth),0);
  return {kwh,cost:energyCost(kwh,tariff)};
};
export const validate=(f:{name:string;watts:number;hoursPerDay:number;daysPerMonth:number})=>{
  const e:Record<string,string>={};
  if(!f.name.trim())e.name='Enter an appliance name.';
  if(!Number.isFinite(f.watts)||f.watts<0)e.watts='Power must be 0 W or more.';
  if(!Number.isFinite(f.hoursPerDay)||f.hoursPerDay<0||f.hoursPerDay>24)e.hoursPerDay='Hours per day must be between 0 and 24.';
  if(!Number.isFinite(f.daysPerMonth)||f.daysPerMonth<0||f.daysPerMonth>31)e.daysPerMonth='Days per month must be between 0 and 31.';
  return e;
};
export const fmt=(n:number,d=2)=>n.toLocaleString('en-IN',{minimumFractionDigits:d,maximumFractionDigits:d});
export const inr=(n:number,d=2)=>'₹'+fmt(n,d);
