import {Case,personType,roleSource,setPersonLink} from './model';

export default function People({c,onChange}:{c:Case;onChange:(c:Case)=>void}){
 const same=c.links.owner==='applicant';
 function type(role:string,value:string){let next={...c,values:{...c.values,[role+'.type']:value}};if(next.links.driver&&personType(next,next.links.driver)==='company')next=setPersonLink(next,'driver','');onChange(next);}
 const source=(role:string)=>roleSource(c,'driver')===roleSource(c,role)&&!!c.links.driver;
 return <section className="panel people-panel"><h2>Участники обращения</h2><div className="people-types"><label>Собственник<select value={personType(c,'owner')} onChange={e=>type('owner',e.target.value)}><option value="person">Физическое лицо</option><option value="company">Юридическое лицо</option></select></label>{!same&&<label>Заявитель<select value={personType(c,'applicant')} onChange={e=>type('applicant',e.target.value)}><option value="person">Физическое лицо</option><option value="company">Юридическое лицо</option></select></label>}</div>
 <label className="person-check"><input type="checkbox" checked={!same} onChange={e=>onChange(setPersonLink(c,'owner',e.target.checked?'':'applicant'))}/><span>Заявитель не совпадает с собственником</span></label>
 {same&&<p className="muted">Заполните сведения один раз — они появятся в полях заявителя и собственника.</p>}
 <div className="driver-links"><span>Водитель</span>{personType(c,'applicant')==='person'&&<label className="person-check"><input type="checkbox" checked={source('applicant')} onChange={e=>onChange(setPersonLink(c,'driver',e.target.checked?'applicant':''))}/><span>{same?'Совпадает с заявителем и собственником':'Совпадает с заявителем'}</span></label>}{!same&&personType(c,'owner')==='person'&&<label className="person-check"><input type="checkbox" checked={source('owner')} onChange={e=>onChange(setPersonLink(c,'driver',e.target.checked?'owner':''))}/><span>Совпадает с собственником</span></label>}{!c.links.driver&&<small>Если водитель — другой человек, заполните его данные отдельно.</small>}</div>
 </section>;
}
