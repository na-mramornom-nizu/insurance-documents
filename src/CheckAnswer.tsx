import {Case,Config,Field,isMarked,markKey,setMark} from './model';
import {labels} from './fields';
export function checkAnswer(c:Case,f:Field,fields:Field[]){
 const siblings=fields.filter(x=>x.type==='check'&&x.dataKey===f.dataKey),yes=siblings.find(x=>['Да','Есть'].includes(x.equals||'')),no=siblings.find(x=>x.equals==='Нет');
 if(yes&&no)return isMarked(c,yes)?'yes':isMarked(c,no)?'no':'';
 if(isMarked(c,f))return 'yes';return c.values[markKey(f)]===false?'no':'';
}
export function answerCheck(c:Case,f:Field,fields:Field[],answer:string){
 const siblings=fields.filter(x=>x.type==='check'&&x.dataKey===f.dataKey),yes=siblings.find(x=>['Да','Есть'].includes(x.equals||'')),no=siblings.find(x=>x.equals==='Нет');
 if(yes&&no){let next=setMark(setMark(c,fields,yes,false),fields,no,false);return answer?setMark(next,fields,answer==='yes'?yes:no,true):next;}
 if(answer)return setMark(c,fields,f,answer==='yes');
 const next=setMark(c,fields,f,false),values={...next.values};delete values[markKey(f)];return {...next,values};
}
export default function CheckAnswer({c,f,fields,config,onChange}:{c:Case;f:Field;fields:Field[];config:Config;onChange:(c:Case)=>void}){
 const paired=fields.some(x=>x.dataKey===f.dataKey&&x.equals==='Нет')&&fields.some(x=>x.dataKey===f.dataKey&&['Да','Есть'].includes(x.equals||''));
 const label=paired?(labels[f.dataKey]||f.label).replace(/\s*[—–-]\s*(да|нет|есть)$/i,''):f.equals!==undefined&&!f.label.toLowerCase().includes(f.equals.toLowerCase())?f.label+' — '+f.equals:f.label;
 return <fieldset className="answer-field"><legend>{label}</legend><div className="answer-options" role="radiogroup" aria-label={label}>{[['yes','Да'],['no','Нет'],['','Не указано']].map(([value,title])=><label key={value} className={checkAnswer(c,f,fields)===value?'active':''}><input type="radio" name={f.id+'-answer'} value={value} checked={checkAnswer(c,f,fields)===value} disabled={!!config.rules[f.dataKey]?.locked} onChange={()=>onChange(answerCheck(c,f,fields,value))}/>{title}</label>)}</div></fieldset>;
}
