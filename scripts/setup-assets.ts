import {mkdir,copyFile,cp,writeFile,access} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
await mkdir('public/assets/ocr',{recursive:true});
await copyFile(require.resolve('tesseract.js/dist/worker.min.js'),'public/assets/ocr/worker.min.js');
const core=path.dirname(require.resolve('tesseract.js-core/package.json'));
await cp(core,'public/assets/ocr/core',{recursive:true});
const pdf=path.dirname(require.resolve('pdfjs-dist/package.json'));
for(const [s,d] of [['cmaps','cmaps'],['standard_fonts','standard_fonts'],['wasm','pdf-wasm']])await cp(path.join(pdf,s),'public/assets/'+d,{recursive:true});
for(const lang of ['rus','eng']){const target=`public/assets/ocr/${lang}.traineddata.gz`;try{await access(target);continue;}catch{}const r=await fetch(`https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0_best_int/${lang}.traineddata.gz`);if(!r.ok)throw new Error('Cannot download '+lang);await writeFile(target,new Uint8Array(await r.arrayBuffer()));}
console.log('Local PDF and OCR assets ready.');
