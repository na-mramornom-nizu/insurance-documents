import {readFile,writeFile,access} from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import {Config,Template,validateConfig} from '../src/model';
const source=JSON.parse(await readFile('public/templates/catalog.json','utf8'));
const templates:Template[]=Array.isArray(source)?source:source.templates;
const cfg:Config={format:'insurance-documents',version:1,revision:1,updatedAt:new Date().toISOString(),employees:[{id:'admin',name:'Администратор',role:'admin',passwordHash:bcrypt.hashSync('123',10)},{id:'employee-2',name:'Сотрудник',role:'employee',passwordHash:bcrypt.hashSync('123',10)}],defaults:{'station.name':'ООО «Гриффин-Селект-Авто»','station.address':'','station.phone':'','staff.position':'','expert.organization':''},rules:{'applicant.name':{required:true,defaultValue:'',locked:false},'vehicle.vin':{required:false,defaultValue:'',locked:false},'document.date':{required:true,defaultValue:'',locked:false}},templates};
validateConfig(cfg);
try{await access('public/settings.json');console.log('settings.json уже существует; не перезаписан.');}catch{await writeFile('public/settings.json',JSON.stringify(cfg,null,2));console.log('Начальные настройки созданы.');}
