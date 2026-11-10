import type {Case,Damage,Template} from './model';
const norm=(s:string)=>s.toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]/g,'');
export function notesRows(c:Case,t:Template,key='damages'):Damage[]{
 if(key!=='damages'||!t.fields.some(f=>f.damageNotes))return [];
 const tables=t.fields.filter(f=>f.type==='table'&&f.dataKey===key),fixed=tables.flatMap(f=>f.rowLabels||[]).map(norm);
 const free=tables.filter(f=>!f.rowLabels?.length),capacity=Math.max(0,...free.map(f=>(f.offset||0)+(f.maxRows||Math.floor(f.height/(f.rowHeight||16)))));
 const other=c.damages.filter(d=>d.formRow==='__additional__'||d.formRow==='__notes__'||fixed.length&&!fixed.includes(norm(d.formRow||d.part)));
 const remaining=other.filter(d=>d.formRow!=='__notes__');
 return c.damages.filter(d=>d.formRow==='__notes__'||(fixed.length?remaining.indexOf(d)>=capacity:c.damages.indexOf(d)>=capacity));
}
export function fullDamage(d:Damage){return [d.part,d.side,d.text??d.damage,...(['mount','repair','replace','paint','diagnostics'] as const).filter(k=>d[k]).map(k=>({mount:'снятие/установка',repair:'ремонт',replace:'замена',paint:'окраска',diagnostics:'диагностика'}[k])),d.hours?d.hours+' н/ч':'',d.cost?d.cost+' руб.':'',...(d.damageKinds||[])].filter(Boolean).join('; ');}
