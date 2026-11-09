import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Config,freshCase} from '../src/model';
import {exportCase,importCase} from '../src/case-file';
const cfg=JSON.parse(readFileSync('public/settings.json','utf8')) as Config;
function fixture(){const c=freshCase(cfg,cfg.employees[0]);c.insurerId=cfg.templates[0].insurerId;c.selected=[cfg.templates[0].id];c.values['applicant.name']='Тестовый клиент';c.values['event.description']='Произвольный текст';c.damages=[{id:'d1',text:'Крыло: царапина, окраска',part:'',side:'',damage:'',hours:'',cost:'',repair:false,replace:false,paint:false}];c.previousDamages=structuredClone(c.damages);c.images.scheme='data:image/png;base64,aGVsbG8=';c.documents=[{id:'doc1',name:'Полис',status:'Копия',pages:'2',date:'2026-11-10',present:true}];return c;}
test('Файл обращения восстанавливает поля, ссылки, строки, документы и изображения',()=>{const c=fixture();c.links.driver='owner';assert.deepEqual(importCase(exportCase(c),cfg),c);});
test('Сохранение незавершённого обращения не требует обязательных полей',()=>{const c=fixture();c.values={};assert.equal(importCase(exportCase(c),cfg).values['event.scenario'],'ordinary');});
test('В файле обращения нет справочника сотрудников и хешей паролей',()=>{const saved=exportCase(fixture());assert.ok(!saved.includes('passwordHash'));assert.ok(!saved.includes('employees'));for(const e of cfg.employees)assert.ok(!saved.includes(e.passwordHash));});
test('Чужой, повреждённый файл и неизвестная версия отклоняются',()=>{for(const text of ['%PDF-1.7','{}','{bad',JSON.stringify({format:'insurance-case',version:2,case:fixture()})])assert.throws(()=>importCase(text,cfg));});
test('Отсутствующий или чужой шаблон не подменяется другим',()=>{const c=fixture();c.selected=['missing'];assert.throws(()=>importCase(exportCase(c),cfg),/нет одного из бланков/);});
test('Циклические ссылки ролей отклоняются',()=>{const c=fixture();c.links={owner:'driver',driver:'owner'};assert.throws(()=>importCase(exportCase(c),cfg));});
test('Изображения со внешним адресом и SVG отклоняются',()=>{for(const value of ['https://example.com/picture.png','data:image/svg+xml;base64,aA==']){const c=fixture();c.images.scheme=value;assert.throws(()=>importCase(exportCase(c),cfg));}});
test('Повторные идентификаторы строк и опасные ключи отклоняются',()=>{const c=fixture();c.damages.push(c.damages[0]);assert.throws(()=>importCase(exportCase(c),cfg));const d=JSON.parse(exportCase(fixture()));d.case.values=JSON.parse('{"__proto__":"x"}');assert.throws(()=>importCase(JSON.stringify(d),cfg));});
