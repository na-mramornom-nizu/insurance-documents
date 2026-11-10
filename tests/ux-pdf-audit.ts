import {Config,freshCase,changeScenario,stations,setMark} from '../src/model';
import {generate,openPDF,download} from '../src/pdf';
import JSZip from 'jszip';
export async function uxPdfAudit(){
 const cfg:Config=await(await fetch('/settings.json')).json();const results=[];const files:Record<string,Uint8Array>={};
 for(const t of cfg.templates)for(let variant=0;variant<2;variant++){
  let c=changeScenario(freshCase(cfg,cfg.employees[0]),variant?'third-party':'windshield');c.insurerId=t.insurerId;c.selected=[t.id];
  Object.assign(c.values,{'applicant.name':'Тестовый клиент','owner.name':'Тестовый клиент','station.name':stations[variant],'staff.name':'Сотрудник','vehicle.vin':'XTA00000000000001'});
  c.links.driver='applicant';c.values['applicant.address']=t.id==='ingos-o-statement'?'Город Примерный, улица Длинная Примерная, дом 123, корпус 4, квартира 56. Адрес для проверки переноса полного значения без выделения компонентов.':'Город, улица, д. 1, кв. 2';c.values['applicant.email']='test@example.org';if(variant)c.values['vehicle.vin']='VIN-12345678901234567890';const checks=t.fields.filter(f=>f.type==='check');for(const f of checks)c=setMark(c,checks,f,true);const text=t.id==='alfa-inspection'?'Трещина ветрового стекла.':'Передний бампер: царапины и трещина; требуется ремонт, затем окраска.';
  for(const key of ['damages','previousDamages'] as const)if(t.fields.some(f=>f.type==='table'&&f.dataKey===key))c[key]=[{id:'1',text,formRow:t.id==='alfa-inspection'?t.fields.find(f=>f.rowLabels?.length)!.rowLabels![9]:undefined,part:t.id==='alfa-inspection'?t.fields.find(f=>f.rowLabels?.length)!.rowLabels![9]:'',side:'',damage:'',repair:false,replace:false,paint:false,hours:'',cost:''}];
  try{const b=await generate(c,cfg,new Map());const doc=await openPDF(b);let extracted='';for(let p=1;p<=doc.numPages;p++){const page=await doc.getPage(p);const content=await page.getTextContent();extracted+=content.items.map(i=>'str'in i?i.str:'').join(' ');if(!variant&&t.fields.some(f=>f.type==='table'&&f.dataKey==='damages')){const cv=document.createElement('canvas');const vp=page.getViewport({scale:.5});cv.width=vp.width;cv.height=vp.height;await page.render({canvas:cv,viewport:vp}).promise;}}
   const flat=(s:string)=>s.replace(/\s/g,'');for(const [key,value] of [['applicant.address',String(c.values['applicant.address'])],['station.name',stations[variant]],['event.description',String(c.values['event.description'])]])if(t.fields.some(f=>f.type==='text'&&f.dataKey===key)&&!flat(extracted).includes(flat(value)))throw Error('Текст не найден в PDF: '+key);
   if(c.damages.length&&!flat(extracted).includes(flat(text)))throw Error('Строка повреждения не найдена в PDF');await doc.dispose();results.push({id:t.id,variant,ok:true});if(!variant)files[t.id+'.pdf']=b;
  }catch(e){results.push({id:t.id,variant,ok:false,error:(e as Error).message});}
 }
 (window as any).uxPdfAuditFiles=files;(window as any).uxPdfAuditResults=results;return results;
}
export async function saveUxPdfAudit(){const z=new JSZip();for(const [name,b]of Object.entries((window as any).uxPdfAuditFiles as Record<string,Uint8Array>))z.file(name,b);z.file('results.json',JSON.stringify((window as any).uxPdfAuditResults,null,2));download(await z.generateAsync({type:'uint8array'}),'ux-pdf-audit-1.2.0.zip','application/zip');}
