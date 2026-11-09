import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {viteSingleFile} from 'vite-plugin-singlefile';
export default defineConfig(({mode})=>({base:'./',publicDir:mode==='sourcecraft'?false:'public',plugins:[react(),...(mode==='sourcecraft'?[viteSingleFile()]:[])],define:mode==='sourcecraft'?{'import.meta.env.VITE_PACKED':'true'}:{},build:{target:'es2022',chunkSizeWarningLimit:6000},server:{watch:{ignored:['**/.playwright-cli/**','**/output/**','**/private-local/**']},host:'127.0.0.1',port:4188,strictPort:true,headers:{'Content-Security-Policy':"worker-src 'none'; frame-ancestors 'none';"}}}));
