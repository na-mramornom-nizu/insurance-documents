import type {Damage} from './model';

export default function AlfaDamageFields({row,parts,index,onChange}:{row:Damage;parts:string[];index:number;onChange:(row:Damage)=>void}){
 const target=row.formRow||(parts.includes(row.part)?row.part:row.part?'__additional__':'');
 return <div className="alfa-damage-fields">
  <label>Деталь в акте · строка {index+1}<select value={target} onChange={e=>onChange({...row,formRow:e.target.value,part:e.target.value==='__additional__'?'':e.target.value})}>
   <option value="">Выберите строку исходной таблицы</option>{parts.map(part=><option key={part}>{part}</option>)}<option value="__additional__">Другая деталь — дополнительные повреждения</option>
  </select></label>
  {target==='__additional__'&&<label>Название дополнительной детали<input value={row.part} onChange={e=>onChange({...row,part:e.target.value})}/></label>}
  <div className="alfa-damage-options"><label>Сторона<select value={row.side} onChange={e=>onChange({...row,side:e.target.value})}><option value="">Не указана / не требуется</option><option>Левая</option><option>Правая</option><option>Обе стороны</option></select></label>
  {(['repair','replace','paint'] as const).map((key,i)=><label className="person-check" key={key}><input type="checkbox" checked={row[key]} onChange={e=>onChange({...row,[key]:e.target.checked})}/><span>{['Ремонт','Замена','Окраска'][i]}</span></label>)}</div>
 </div>;
}
