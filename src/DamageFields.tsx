import type {Damage,Field} from './model';
import {normalize} from './tables';

export function damageLayout(fields:Field[]){
 const parts=[...new Set(fields.flatMap(f=>f.rowLabels||[]))];
 const columns=fields.flatMap(f=>f.columns||[]);
 return {parts,columns,additional:parts.length>0&&fields.some(f=>!f.rowLabels?.length),split:columns.some(c=>c.key==='part')};
}
export default function DamageFields({row,fields,index,onChange,notes=false}:{row:Damage;fields:Field[];notes?:boolean;index:number;onChange:(row:Damage)=>void}){
 const {parts,columns,additional,split}=damageLayout(fields);
 const target=row.formRow||(parts.find(p=>normalize(p)===normalize(row.part))||(row.part&&additional?'__additional__':''));
 const keys=new Set(columns.map(c=>c.key));
 const kinds=[...new Set(columns.filter(c=>c.key==='damageKind'&&c.equals).map(c=>c.equals!))];
 return <div className="alfa-damage-fields">
  {parts.length>0&&<label>Деталь в бланке · строка {index+1}<select value={target} onChange={e=>onChange({...row,formRow:e.target.value,part:e.target.value.startsWith('__')?'':e.target.value})}>
   <option value="">Выберите строку исходной таблицы</option>{parts.map(part=><option key={part}>{part}</option>)}{additional&&<option value="__additional__">Другая деталь — дополнительные повреждения</option>}
  {notes&&<option value="__notes__">В примечания — нет подходящей строки</option>}</select></label>}
  {(target==='__notes__'||target==='__additional__'||!parts.length&&split)&&<label>Название детали<input value={row.part} onChange={e=>onChange({...row,part:e.target.value})} placeholder="Например: переднее левое крыло"/></label>}
  <div className="alfa-damage-options">
   {(keys.has('side')||parts.length>0)&&<label>Сторона<select value={row.side} onChange={e=>onChange({...row,side:e.target.value})}><option value="">Не указана / уже в названии</option><option>Левая</option><option>Правая</option><option>Обе стороны</option></select></label>}
   {(['mount','repair','replace','paint','diagnostics'] as const).filter(key=>keys.has(key)).map(key=><label className="person-check" key={key}><span>{{mount:'Снятие / установка',repair:'Ремонт',replace:'Замена',paint:'Окраска',diagnostics:'Диагностика'}[key]}</span><select aria-label={{mount:'Снятие / установка',repair:'Ремонт',replace:'Замена',paint:'Окраска',diagnostics:'Диагностика'}[key]} value={String(!!row[key])} onChange={e=>onChange({...row,[key]:e.target.value==='true'})}><option value="true">Да</option><option value="false">Нет</option></select></label>)}
   {(['hours','cost'] as const).filter(key=>keys.has(key)).map(key=><label key={key}>{key==='hours'?'Ремонт, нормо-часы':'Стоимость'}<input inputMode="decimal" value={row[key]} onChange={e=>onChange({...row,[key]:e.target.value})}/></label>)}
  </div>
  {kinds.length>0&&<fieldset className="damage-kinds"><legend>Характер повреждения — отметки в таблице</legend>{kinds.map(kind=><label className="person-check" key={kind}><span>{kind}</span><select aria-label={kind} value={String(row.damageKinds?.includes(kind)??false)} onChange={e=>onChange({...row,damageKinds:e.target.value==='true'?[...(row.damageKinds||[]),kind]:(row.damageKinds||[]).filter(k=>k!==kind)})}><option value="true">Да</option><option value="false">Нет</option></select></label>)}</fieldset>}
 </div>;
}
