import {Config,Damage,freshCase,fieldText} from '../src/model';
import {generate,download,openPDF} from '../src/pdf';
import {tableRows,tableValue} from '../src/tables';
import JSZip from 'jszip';
const ids=['alfa-inspection','ren-inspection','ren-conclusion','sovcom-inspection','21-inspection','ingos-k-inspection','ingos-o-inspection','rgs-inspection','pari-inspection','reso-inspection'];
export async function originalTablesAudit(){
 const cfg:Config=await(await fetch('/settings.json')).json(),zip=new JSZip(),results=[];
 for(const t of cfg.templates.filter(t=>ids.includes(t.id)))for(const variant of ['blank','full','realistic']){
  const c=freshCase(cfg,cfg.employees[0]);c.insurerId=t.insurerId;c.selected=[t.id];c.values={};c.links={};
  for(const key of ['damages','previousDamages'] as const){const fs=t.fields.filter(f=>f.type==='table'&&f.dataKey===key);if(!fs.length||variant==='blank')continue;
   const parts=[...new Set(fs.flatMap(f=>f.rowLabels||[]))],cols=fs.flatMap(f=>f.columns||[]),capacity=Math.max(...fs.filter(f=>!f.rowLabels?.length).map(f=>(f.offset||0)+(f.maxRows||1)),0);
   const names=parts.length?(variant==='full'?parts:[parts[0],parts.at(-1)!]):Array.from({length:variant==='full'?capacity:2},(_,i)=>cols.some(c=>c.key==='part')?'Деталь '+(i+1):'');
   c[key]=names.map((part,i):Damage=>({id:String(i),formRow:parts.length?part:undefined,part,text:parts.length&&!cols.some(c=>c.key==='damage'&&!c.equals)?(variant==='realistic'?'Царапина':''):'Царапина '+(i+1),side:variant==='realistic'&&parts.length?'Правая':'',damage:'',damageKinds:[...new Set(cols.filter(c=>c.key==='damageKind').map(c=>c.equals!))],repair:true,replace:true,paint:true,mount:true,diagnostics:true,hours:'2',cost:''}));
  }
  try{const bytes=await generate(c,cfg,new Map(),{allowIncomplete:true});const expected=[];for(const f of t.fields){if(f.type==='table'){const rows=tableRows(c,t,f);for(const [i,row]of rows.entries()){let x=f.x;for(const col of f.columns||[]){const text=tableValue(row,col.key,col.equals);if(text)expected.push({page:f.page,x,y:f.y+i*(f.rowHeight||16),width:col.width,height:f.rowHeight||16,text});x+=col.width;}}}else if(f.damageNotes&&fieldText(c,f))expected.push({page:f.page,x:f.x,y:f.y,width:f.width,height:f.height,text:fieldText(c,f)});}
   const name=t.id+'-'+variant;zip.file(name+'.pdf',bytes);zip.file(name+'-expected.json',JSON.stringify(expected));const doc=await openPDF(bytes);for(let p=1;p<=doc.numPages;p++){const page=await doc.getPage(p),vp=page.getViewport({scale:1}),canvas=document.createElement('canvas');canvas.width=vp.width;canvas.height=vp.height;await page.render({canvas,viewport:vp}).promise;const content=await page.getTextContent();for(const cell of expected.filter(e=>e.page===p-1)){const items=content.items.filter((v:any)=>'str'in v&&v.transform[4]>=cell.x-2&&v.transform[4]<cell.x+cell.width&&vp.height-v.transform[5]>=cell.y-1&&vp.height-v.transform[5]<=cell.y+cell.height+2);const text=items.map((v:any)=>v.str).join(' ');const norm=(v:string)=>v.replace(/\s/g,'');if(!norm(text).includes(norm(cell.text)))throw Error('Cell mismatch '+JSON.stringify({cell,text}));}zip.file(name+'-'+(p-1)+'.png',canvas.toDataURL().split(',')[1],{base64:true});}await doc.dispose();results.push({id:t.id,variant,ok:true,checkedCells:expected.length});
  }catch(e){results.push({id:t.id,variant,ok:false,error:(e as Error).message});}
 }
 zip.file('results.json',JSON.stringify(results,null,2));download(await zip.generateAsync({type:'uint8array'}),'original-tables-1.3.0.zip','application/zip');return results;
}
