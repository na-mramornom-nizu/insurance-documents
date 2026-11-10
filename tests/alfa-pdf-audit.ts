import {Config,Case,Damage,freshCase} from '../src/model';
import {generate,download,openPDF} from '../src/pdf';
import JSZip from 'jszip';
export async function alfaAudit(){
 const cfg:Config=await(await fetch('/settings.json')).json(),t=cfg.templates.find(t=>t.id==='alfa-inspection')!,parts=t.fields.find(f=>f.rowLabels?.length)!.rowLabels!;const zip=new JSZip(),results=[];
 const make=(rows:Damage[])=>{const c=freshCase(cfg,cfg.employees[0]);c.insurerId='alfa';c.selected=[t.id];c.values={};c.links={};c.damages=rows;return c;};
 const row=(part:string,i:number):Damage=>({id:String(i),formRow:part,part,text:'Повреждение '+String(i+1).padStart(2,'0'),side:'',damage:'',repair:i%3===0,replace:i%3===1,paint:i%3===2,hours:'',cost:''});
 const cases:[string,Case][]=[['blank',make([])],['all-rows',make([...parts.map(row),...[0,1,2].map(i=>({...row('__additional__',i+39),part:'Датчик '+(i+1)}))])],['realistic',make([row(parts[1],0),{...row(parts[17],1),text:'Вмятина, царапины',side:'Левая',repair:true,paint:true,replace:false},{...row('__additional__',2),part:'Кронштейн',text:'Трещина'}])]];
 for(const [name,c] of cases){const bytes=await generate(c,cfg,new Map(),{allowIncomplete:true});zip.file(name+'.pdf',bytes);const doc=await openPDF(bytes);const p=await doc.getPage(1),vp=p.getViewport({scale:1.3}),canvas=document.createElement('canvas');canvas.width=vp.width;canvas.height=vp.height;await p.render({canvas,viewport:vp}).promise;zip.file(name+'.png',canvas.toDataURL().split(',')[1],{base64:true});const text=(await p.getTextContent()).items.map(v=>'str'in v?v.str:'').join(' ');if(name==='all-rows')for(let i=1;i<=42;i++)if(!text.includes('Повреждение '+String(i).padStart(2,'0')))throw Error('Missing row '+i);results.push({name,pages:doc.numPages,ok:true});await doc.dispose();}
 zip.file('results.json',JSON.stringify(results,null,2));download(await zip.generateAsync({type:'uint8array'}),'alfa-audit-1.2.1.zip','application/zip');return results;
}
