import {Case,Config,Field,chosen,isMarked,markKey,setMark,applicable} from './model';
import {labels} from './fields';

export default function Checks({c,config,onChange}:{c:Case;config:Config;onChange:(c:Case)=>void}){
 const templates=chosen(c,config),all=templates.flatMap(t=>t.fields.filter(f=>f.type==='check'&&applicable(c,f.dataKey)));
 if(!all.length)return null;
 const title=(f:Field)=>f.equals===undefined||f.legacyDataKey||f.label.endsWith('— '+f.equals?.toLowerCase())?f.label:(labels[f.dataKey]||f.label)+' — '+f.equals;
 return <section className="panel form-checks" id="form-checks"><h2>Отметки в бланках</h2><p className="muted">Отметьте нужные пункты. Они будут проставлены в PDF. Согласия отмечайте только со слов клиента; варианты «Да / Нет» исключают друг друга.</p>{templates.map((t,idx)=>{const fs=[...new Map(t.fields.filter(f=>f.type==='check'&&applicable(c,f.dataKey)).map(f=>[markKey(f),f])).values()];if(!fs.length)return null;return <details key={t.id} open={idx===0||fs.some(f=>isMarked(c,f))}><summary>{t.title}<small>{fs.filter(f=>isMarked(c,f)).length} из {fs.length} отмечено</small></summary><div className="checks-grid">{fs.map(f=><label className="form-check" key={markKey(f)}><input type="checkbox" checked={isMarked(c,f)} disabled={!!config.rules[f.dataKey]?.locked} onChange={e=>onChange(setMark(c,all,f,e.target.checked))}/><span>{title(f)}<small>Стр. {f.page+1}</small></span></label>)}</div></details>;})}</section>;
}
