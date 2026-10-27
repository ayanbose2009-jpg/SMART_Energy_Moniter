export const CATEGORIES=['Lighting','Cooling','Computing','Kitchen','Other'] as const;
export type Category=typeof CATEGORIES[number];
export interface Appliance{id:string;name:string;category:Category;watts:number;hoursPerDay:number;daysPerMonth:number}
export interface Settings{tariff:number;fixedCharge:number}
export type Page='overview'|'appliances'|'simulator'|'reports'|'settings';
