import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Config,Damage,freshCase,fieldText,validateCase} from '../src/model';
import {tableRows,tableValue} from '../src/tables';
import {exportCase,importCase} from '../src/case-file';
const cfg=JSON.parse(readFileSync('public/settings.json','utf8')) as Config;
const row=(part:string,patch:Partial<Damage>={}):Damage=>({id:part,part,formRow:part,text:'',side:'',damage:'',repair:true,replace:true,paint:true,mount:true,diagnostics:true,hours:'2',cost:'',damageKinds:['Вмятина','Скол'],...patch});
const hashes=JSON.parse(readFileSync('tests/original-backgrounds.json','utf8')) as Record<string,string>;
for(const [id,hash] of Object.entries(hashes))test('Исходный фон сохранён: '+id,()=>assert.equal(createHash('sha256').update(readFileSync('public/templates/'+id+'.pdf')).digest('hex'),hash));
for(const t of cfg.templates.filter(t=>Object.keys(hashes).includes(t.id)))test('Все строки исходной таблицы доступны: '+t.id,()=>{
 const fs=t.fields.filter(f=>f.type==='table'&&f.dataKey==='damages');const parts=[...new Set(fs.flatMap(f=>f.rowLabels||[]))];const c=freshCase(cfg,cfg.employees[0]);c.insurerId=t.insurerId;c.selected=[t.id];c.damages=parts.map(p=>row(p));
 for(const f of fs.filter(f=>f.rowLabels?.length)){const rows=tableRows(c,t,f);assert.equal(rows.length,f.rowLabels!.length);assert.ok(rows.every(r=>r.selected));}
 if(parts.length){c.damages=[row('',{formRow:undefined,text:'Старый текст'})];assert.throws(()=>tableRows(c,t,fs[0]),/выберите деталь/);}
});
test('Ренессанс: явные категории, отрицание в тексте не ставит галочку',()=>{assert.equal(tableValue({damage:'Вмятина отсутствует'},'damageKind','Вмятина'),'');assert.equal(tableValue({damageKinds:['Скол']},'damageKind','Вмятина'),'');assert.equal(tableValue({damageKinds:['Скол']},'damageKind','Скол'),'X');});
test('Стороны помещаются в исходные узкие клетки',()=>{assert.equal(tableValue({side:'Обе стороны'},'side'),'Л/П');assert.equal(tableValue({selected:true,side:'Правая'},'sideMark'),'П');assert.equal(tableValue({},'sideMark'),'');});
test('Правые примечания сохраняют описание и сторону, ручные примечания не теряются',()=>{const c=freshCase(cfg,cfg.employees[0]);const f=cfg.templates.find(t=>t.id==='sovcom-inspection')!.fields.find(f=>f.damageNotes)!;c.values[f.dataKey]='Уточнение';c.damages=[row('Дверь',{text:'Царапина',side:'Левая'})];assert.equal(fieldText(c,f),'Уточнение\nДверь; Левая; Царапина');});
test('Выбранная деталь допустима без необязательного описания',()=>{const c=freshCase(cfg,cfg.employees[0]);c.insurerId='sovcom';c.selected=['sovcom-inspection'];c.damages=[row('Дверь')];assert.ok(!validateCase(c,cfg).some(e=>e.includes('заполните строку')));});
test('Сохранение обращения сохраняет новые отметки и категории',()=>{const c=freshCase(cfg,cfg.employees[0]);c.insurerId='renessans';c.selected=['ren-inspection'];c.damages=[row('Капот')];assert.deepEqual(importCase(exportCase(c),cfg).damages,c.damages);const bad=JSON.parse(exportCase(c));bad.case.damages[0].damageKinds='X';assert.throws(()=>importCase(JSON.stringify(bad),cfg));});
test('РЕСО: исходные линии не превращаются в выдуманные колонки',()=>{const fs=cfg.templates.find(t=>t.id==='reso-inspection')!.fields.filter(f=>f.type==='table');assert.ok(fs.every(f=>f.columns!.every(c=>c.key==='partDamage')));});
test('РГС: колонка ремонта — отметка, а не трудоёмкость',()=>{const cols=cfg.templates.find(t=>t.id==='rgs-inspection')!.fields.flatMap(f=>f.columns||[]);assert.ok(cols.some(c=>c.key==='repair'));assert.ok(!cols.some(c=>c.key==='hours'));});
test('Ингосстрах: поддетали зеркала и омывателя доступны отдельно',()=>{const parts=cfg.templates.find(t=>t.id==='ingos-k-inspection')!.fields.flatMap(f=>f.rowLabels||[]);assert.equal(parts.length,72);assert.equal(new Set(parts).size,72);});
