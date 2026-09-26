import * as tf from '@tensorflow/tfjs'; import '@tensorflow/tfjs-backend-wasm'; import fs from 'fs'; import os from 'os'; import pkg from '@spotify/basic-pitch';
const { BasicPitch } = pkg; const dir='node_modules/@spotify/basic-pitch/model/';
const handler={load:async()=>{const m=JSON.parse(fs.readFileSync(dir+'model.json'));const w=fs.readFileSync(dir+m.weightsManifest[0].paths[0]);return{modelTopology:m.modelTopology,format:m.format,weightSpecs:m.weightsManifest[0].weights,weightData:w.buffer.slice(w.byteOffset,w.byteOffset+w.byteLength)};}};
const be=process.argv[2]; await tf.setBackend(be); await tf.ready();
if(be==='wasm'){ const k=tf.getKernel('Fill','wasm'); tf.unregisterKernel('Fill','wasm');
  tf.registerKernel({...k, kernelFunc:(a)=>k.kernelFunc({...a, attrs:{...a.attrs, dtype:a.attrs.dtype ?? 'float32'}})}); }
const SR=22050, secs=+process.argv[3]; const x=new Float32Array(SR*secs); let s=1; for(let i=0;i<x.length;i++){s=(s*1664525+1013904223)>>>0; x[i]=0.3*Math.sin(2*Math.PI*110*i/SR)+0.05*(s/4294967296-0.5);}
const bp=new BasicPitch(tf.loadGraphModel(handler)); await bp.model; const t0=performance.now(); let frames=0;
await bp.evaluateModel(x,(f)=>{frames+=f.length;},()=>{});
const dt=(performance.now()-t0)/1000; console.log(`${be}: ${secs}s audio in ${dt.toFixed(1)}s => ${(secs/dt).toFixed(2)}x realtime; frames=${frames}; cpus=${os.cpus().length} ${os.cpus()[0].model}; simd=${tf.env().getBool('WASM_HAS_SIMD_SUPPORT')} mt=${tf.env().getBool('WASM_HAS_MULTITHREAD_SUPPORT')}`);
