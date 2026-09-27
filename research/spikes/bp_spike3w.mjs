import * as tf from '@tensorflow/tfjs'; import '@tensorflow/tfjs-backend-wasm'; import fs from 'fs'; import pkg from '@spotify/basic-pitch';
const { BasicPitch, outputToNotesPoly, addPitchBendsToNoteEvents, noteFramesToTime } = pkg;
const SR=22050, dir='node_modules/@spotify/basic-pitch/model/';
const handler={load:async()=>{const m=JSON.parse(fs.readFileSync(dir+'model.json'));const w=fs.readFileSync(dir+m.weightsManifest[0].paths[0]);return{modelTopology:m.modelTopology,format:m.format,weightSpecs:m.weightsManifest[0].weights,weightData:w.buffer.slice(w.byteOffset,w.byteOffset+w.byteLength)};}};
function rng(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;}}
function ks(buf,start,midi,dur,amp,r){const f=440*2**((midi-69)/12),N=Math.round(SR/f);const d=new Float32Array(N).map(()=>r()*2-1);const s0=Math.round(start*SR),n=Math.round(dur*SR);let i=0;for(let k=0;k<n&&s0+k<buf.length;k++){const a=d[i],b=d[(i+1)%N];d[i]=0.996*0.5*(a+b);buf[s0+k]+=amp*a*(k>n-400?(n-k)/400:1);i=(i+1)%N;}}
function score(ref,est,tol=0.05){const used=new Set();let tp=0;for(const r of ref){const j=est.findIndex((e,ix)=>!used.has(ix)&&e.pitchMidi===r.midi&&Math.abs(e.startTimeSeconds-r.t)<=tol);if(j>=0){used.add(j);tp++;}}const p=tp/Math.max(est.length,1),rc=tp/ref.length;return{P:+p.toFixed(3),R:+rc.toFixed(3),F1:+(p+rc?2*p*rc/(p+rc):0).toFixed(3)};}
await tf.setBackend(process.argv[2]); await tf.ready();
if(process.argv[2]==='wasm'){ const k=tf.getKernel('Fill','wasm'); tf.unregisterKernel('Fill','wasm'); tf.registerKernel({...k, kernelFunc:(a)=>k.kernelFunc({...a, attrs:{...a.attrs, dtype:a.attrs.dtype ?? 'float32'}})}); } const bp=new BasicPitch(tf.loadGraphModel(handler));
async function out(ref,len,seed){const r=rng(seed),buf=new Float32Array(Math.round(len*SR));for(const n of ref)ks(buf,n.t,n.midi,n.d,0.5,r);const fr=[],on=[],ct=[];await bp.evaluateModel(buf,(f,o,c)=>{fr.push(...f);on.push(...o);ct.push(...c);},()=>{});return{fr,on,ct};}
const sets={};
// held-out mono: different seed, random walk, variable durations 0.18-0.6s
{const r=rng(7);const m=[];let t=0.2,p=52;for(let k=0;k<30;k++){p=Math.max(40,Math.min(76,p+Math.floor(r()*11)-5));const d=0.18+r()*0.42;m.push({t,midi:p,d});t+=d+0.05;}sets['mono-heldout']=[m,t+1,99];}
{const chords=[[40,47,52,55,59,64],[45,52,57,61,64],[43,47,50,55,59,67],[50,57,62,66],[40,47,52,56,59,64],[45,52,55,60,64]];const p=[];let t=0.25;for(const c of chords){for(const m of c)p.push({t,midi:m,d:1.2});t+=1.5;}sets['poly-chords']=[p,t+1,42];}
{const r=rng(11);const chords=[[42,49,54,57],[35,42,47,50,54],[30,37,42,46,49,54],[47,54,59,62,66],[38,45,50,54]];const p=[];let t=0.3;for(const c of chords){for(const m of c)p.push({t,midi:m,d:0.9});t+=1.1;}sets['poly-8str-heldout']=[p,t+1,5];}
for(const [name,[ref,len,seed]] of Object.entries(sets)){const {fr,on,ct}=await out(ref,len,seed);
 for(const [o,f,ml] of (name.startsWith('mono')?[[0.7,0.5,11]]:[[0.5,0.3,5]])){const notes=noteFramesToTime(addPitchBendsToNoteEvents(ct,outputToNotesPoly(fr,on,o,f,ml)));console.log(name,`o=${o} f=${f} min=${ml}`,JSON.stringify(score(ref,notes)));}}
