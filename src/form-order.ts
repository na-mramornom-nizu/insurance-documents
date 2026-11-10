import {Case,Field,Template,applicable,inputKey,roleSource,markKey} from './model';
import {labels} from './fields';
export type FormEntry={field:Field;kind:'text'|'check'|'table'|'image';page:number};
// Read the printed page from top to bottom; fields on the same line go left to right.
export function orderedEntries(c:Case,t:Template):FormEntry[]{
 const sorted=[...t.fields].sort((a,b)=>a.page-b.page||a.y-b.y||a.x-b.x);
 const rows:Field[][]=[];for(const f of sorted){const last=rows.at(-1);if(last&&last[0].page===f.page&&Math.abs(last[0].y-f.y)<=3)last.push(f);else rows.push([f]);}
 const seen=new Set<string>(),result:FormEntry[]=[];
 for(const original of rows.flatMap(row=>row.sort((a,b)=>a.x-b.x))){
  if(!applicable(c,original.dataKey))continue;
  let f={...original};const kind=f.type;
  if(kind==='text'){let key=inputKey(f.dataKey);const role=key.split('.')[0],source=roleSource(c,role);if(source!==role)key=source+key.slice(role.length);f={...f,dataKey:key,label:labels[key]||f.label};}
  let id=kind==='check'?markKey(f):kind+':'+f.dataKey;
  if(kind==='check'&&['Да','Нет','Есть'].includes(f.equals||'')){const pair=t.fields.filter(x=>x.type==='check'&&x.dataKey===f.dataKey);if(pair.some(x=>x.equals==='Нет')&&pair.some(x=>['Да','Есть'].includes(x.equals||'')))id='pair:'+f.dataKey;}
  if(seen.has(id))continue;seen.add(id);result.push({field:f,kind,page:original.page});
 }
 return result;
}
