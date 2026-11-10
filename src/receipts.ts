import type {Case,Template} from './model';
const norm=(s:string)=>s.toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]/g,'');
export function orderedDocuments(c:Case,t:Template){const labels=t.fields.filter(f=>f.type==='table'&&f.dataKey==='documents'&&f.rowLabels?.length).sort((a,b)=>a.page-b.page||a.y-b.y||a.x-b.x).flatMap(f=>f.rowLabels!);const rank=(d:Case['documents'][number])=>{const name=d.kind?t.receiptMapping?.[d.kind]||d.name:d.name;const i=labels.findIndex(l=>norm(l)===norm(name));return i<0?labels.length:i;};return [...c.documents].sort((a,b)=>rank(a)-rank(b));}
// Canonical entries are mapped only to the exact printed document, never a similar legal act.
export function receiptRows(c:Case,t:Template):Record<string,unknown>[] {
 const labels=t.fields.filter(f=>f.type==='table'&&f.dataKey==='documents').flatMap(f=>f.rowLabels||[]);
 const rows=c.documents.filter(d=>d.present).map(d=>{const mapped=d.kind?t.receiptMapping?.[d.kind]:undefined;const name=mapped||d.name;return {...d,name,original:d.status==='Оригинал',copy:d.status==='Копия',present:true};});
 const result:Record<string,unknown>[]=[];
 for(const row of rows){const same=result.find(r=>norm(String(r.name))===norm(row.name));if(same&&row.kind&&same.kind&&same.status===row.status&&same.date===row.date&&same.pages===row.pages){same.kind=String(same.kind)+','+row.kind;continue;}if(same&&labels.some(l=>norm(l)===norm(row.name))){const original=c.documents.find(d=>d.id===row.id)!;result.push({...row,name:original.name});}else result.push(row);}
 return result;
}
