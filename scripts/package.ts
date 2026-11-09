import {splitPack} from '../src/parts';
import {validateConfig} from '../src/model';
import {readFile,writeFile,readdir,mkdir,copyFile,stat,unlink} from 'node:fs/promises';
import JSZip from 'jszip';
import path from 'node:path';
await mkdir('dist',{recursive:true});
for(const dir of ['dist','output/sourcecraft']){for(const f of await readdir(dir).catch(()=>[]))if(/\.pack\.\d{3}\.(bin|txt)$/.test(f))await unlink(dir+'/'+f);}
const cfg=JSON.parse(await readFile('public/settings.json','utf8'));validateConfig(cfg);const templates=new JSZip();for(const t of cfg.templates)templates.file(t.file,await readFile('public/'+t.file));await writeFile('dist/templates.pack.zip',await templates.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:6}}));
const ocr=new JSZip();for(const f of ['core/tesseract-core-lstm.js','core/tesseract-core-lstm.wasm','rus.traineddata.gz','eng.traineddata.gz'])ocr.file('assets/ocr/'+f,await readFile('public/assets/ocr/'+f));await writeFile('dist/ocr.pack.zip',await ocr.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
const pdf=new JSZip();for(const f of ['regular.ttf','bold.ttf'])pdf.file('assets/'+f,await readFile('public/assets/'+f));for(const dir of ['cmaps','standard_fonts','pdf-wasm'])for(const f of await readdir('public/assets/'+dir))pdf.file('assets/'+dir+'/'+f,await readFile('public/assets/'+dir+'/'+f));await writeFile('dist/pdf.pack.zip',await pdf.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
await copyFile('public/settings.json','dist/settings.json');
await copyFile('public/favicon.svg','dist/favicon.svg');
await copyFile('public/LICENSES.txt','dist/LICENSES.txt');
for(const name of ['templates.pack','ocr.pack','pdf.pack'])for(const [file,bytes] of splitPack(name,new Uint8Array(await readFile('dist/'+name+'.zip'))))await writeFile('dist/'+file,bytes);
await mkdir('output/sourcecraft/.sourcecraft',{recursive:true});await writeFile('output/sourcecraft/.sourcecraft/sites.yaml','site:\n  ref: main\n');
for(const f of [...(await readdir('dist')).filter(f=>/\.pack\.(json|\d{3}\.txt)$/.test(f)),'index.html','settings.json','LICENSES.txt','favicon.svg']){const full=path.join('dist',f);if(!(await stat(full)).isDirectory())await copyFile(full,path.join('output/sourcecraft',f));}
for(const name of ['templates.pack.zip','ocr.pack.zip','pdf.pack.zip'])for(const dir of ['dist','output/sourcecraft'])await unlink(dir+'/'+name).catch(e=>{if(e.code!=='ENOENT')throw e;});
console.log('Пакет SourceCraft: output/sourcecraft. Тестовые обращения и исходные образцы не включены.');
