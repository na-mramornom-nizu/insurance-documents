import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Config,freshCase,validateConfig} from '../src/model';
import {answerCheck,checkAnswer} from '../src/CheckAnswer';
import {exportCase,importCase} from '../src/case-file';
const cfg=JSON.parse(readFileSync('public/settings.json','utf8')) as Config;
const fields=cfg.templates.find(t=>t.id==='sovcom-statement')!.fields;
const keys=Array.from({length:5},(_,i)=>`extra.sovcom-statement.consent${44+i}`);
test('Пять согласованных ответов нового обращения имеют значение Да',()=>{
 const c=freshCase(cfg,cfg.employees[0]);
 for(const key of keys)assert.equal(checkAnswer(c,fields.find(f=>f.dataKey===key)!,fields),'yes');
 assert.equal(c.values['extra.consent'],undefined);
});
test('Выбор Нет и Не указано сохраняется при повторном открытии файла',()=>{
 let c=freshCase(cfg,cfg.employees[0]);c.insurerId='sovcom';c.selected=['sovcom-statement'];
 c=answerCheck(c,fields.find(f=>f.dataKey===keys[0])!,fields,'no');
 c=answerCheck(c,fields.find(f=>f.dataKey===keys[1])!,fields,'');
 const restored=importCase(exportCase(c),cfg);
 assert.equal(checkAnswer(restored,fields.find(f=>f.dataKey===keys[0])!,fields),'no');
 assert.equal(checkAnswer(restored,fields.find(f=>f.dataKey===keys[1])!,fields),'');
 assert.equal(checkAnswer(restored,fields.find(f=>f.dataKey===keys[2])!,fields),'yes');
});
test('Ранее сохранённые пустые ответы не заменяются значениями по умолчанию',()=>{
 const c=freshCase(cfg,cfg.employees[0]);c.insurerId='sovcom';c.selected=['sovcom-statement'];
 for(const key of keys)delete c.values[key];
 const restored=importCase(exportCase(c),cfg);
 for(const key of keys)assert.equal(checkAnswer(restored,fields.find(f=>f.dataKey===key)!,fields),'');
});
test('Дополнительные названия Альфа используют размер исходного текста, даты не меняются',()=>{
 const rows=cfg.templates.find(t=>t.id==='alfa-inventory')!.fields.filter(f=>f.dataKey==='documents'&&!f.rowLabels);
 assert.equal(rows.length,5);
 for(const f of rows){assert.equal(f.columns!.find(c=>c.key==='name')!.fontSize,11.04);assert.equal(f.columns!.find(c=>c.key==='receiptText')!.fontSize,undefined);assert.equal(f.fontSize,7);}
});
test('Некорректный размер шрифта колонки отклоняется при импорте шаблона',()=>{
 for(const size of [0,-1,73,NaN]){const copy=structuredClone(cfg);copy.templates.find(t=>t.id==='alfa-inventory')!.fields.find(f=>f.type==='table')!.columns![0].fontSize=size;assert.throws(()=>validateConfig(copy));}
 validateConfig(cfg);
});
