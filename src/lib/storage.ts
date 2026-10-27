import {Appliance,Settings} from '../types';
export const SAMPLE:Appliance[]=[
{id:'s1',name:'Ceiling fan',category:'Cooling',watts:75,hoursPerDay:10,daysPerMonth:30},
{id:'s2',name:'Laptop',category:'Computing',watts:65,hoursPerDay:6,daysPerMonth:30},
{id:'s3',name:'LED bulbs (4)',category:'Lighting',watts:36,hoursPerDay:6,daysPerMonth:30},
{id:'s4',name:'Refrigerator',category:'Kitchen',watts:150,hoursPerDay:8,daysPerMonth:30},
{id:'s5',name:'Air conditioner',category:'Cooling',watts:1200,hoursPerDay:4,daysPerMonth:20},
{id:'s6',name:'Water heater',category:'Other',watts:2000,hoursPerDay:0.5,daysPerMonth:30}];
export const DEFAULT_SETTINGS:Settings={tariff:8,fixedCharge:0};
export function load<T>(key:string,fallback:T):T{try{const r=localStorage.getItem(key);return r?JSON.parse(r) as T:fallback}catch{return fallback}}
export function save(key:string,v:unknown){try{localStorage.setItem(key,JSON.stringify(v))}catch{/* storage unavailable */}}
