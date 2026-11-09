import {Config,freshCase,changeScenario,stations} from '../src/model';
import {generate,openPDF,download} from '../src/pdf';
import JSZip from 'jszip';
export async function workspaceAudit(){
 const cfg:Config=await(await fetch('/settings.json')).json();const results=[];const files:Record<string,Uint8Array>={};
 for(const t of cfg.templates)for(let variant=0;variant<2;variant++){
  let c=changeScenario(freshCase(cfg,cfg.employees[0]),variant?'third-party':'windshield');c.insurerId=t.insurerId;c.selected=[t.id];
  Object.assign(c.values,{'applicant.name':'Тестовый клиент','owner.name':'Тестовый клиент','station.name':stations[variant],'staff.name':'Сотрудник','vehicle.vin':'XTA00000000000001'});
  const text='Передний бампер: царапины и трещина; требуется ремонт, затем окраска.';
  for(const key of ['damages','previousDamages'] as const)if(t.fields.some(f=>f.type==='table'&&f.dataKey===key))c[key]=[{id:'1',text,part:'',side:'',damage:'',repair:false,replace:false,paint:false,hours:'',cost:''}];
  try{const b=await generate(c,cfg,new Map());const doc=await openPDF(b);let extracted='';for(let p=1;p<=doc.numPages;p++){const page=await doc.getPage(p);const content=await page.getTextContent();extracted+=content.items.map(i=>'str'in i?i.str:'').join(' ');if(!variant&&t.fields.some(f=>f.type==='table'&&f.dataKey==='damages')){const cv=document.createElement('canvas');const vp=page.getViewport({scale:.5});cv.width=vp.width;cv.height=vp.height;await page.render({canvas:cv,viewport:vp}).promise;}}
   const flat=(s:string)=>s.replace(/\s/g,'');for(const [key,value] of [['station.name',stations[variant]],['event.description',String(c.values['event.description'])]])if(t.fields.some(f=>f.type==='text'&&f.dataKey===key)&&!flat(extracted).includes(flat(value)))throw Error('Текст не найден в PDF: '+key);
   if(c.damages.length&&!flat(extracted).includes(flat(text)))throw Error('Строка повреждения не найдена в PDF');await doc.dispose();results.push({id:t.id,variant,ok:true});if(!variant)files[t.id+'.pdf']=b;
  }catch(e){results.push({id:t.id,variant,ok:false,error:(e as Error).message});}
 }
 (window as any).workspaceAuditFiles=files;(window as any).workspaceAuditResults=results;return results;
}
export async function saveWorkspaceAudit(){const z=new JSZip();for(const [name,b]of Object.entries((window as any).workspaceAuditFiles as Record<string,Uint8Array>))z.file(name,b);z.file('results.json',JSON.stringify((window as any).workspaceAuditResults,null,2));download(await z.generateAsync({type:'uint8array'}),'workspace-audit-1.1.0.zip','application/zip');}
