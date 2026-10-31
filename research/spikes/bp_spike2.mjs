import * as tf from '@tensorflow/tfjs'; import fs from 'fs'; import pkg from '@spotify/basic-pitch';
const { BasicPitch, outputToNotesPoly, addPitchBendsToNoteEvents, noteFramesToTime } = pkg;
const SR=22050, dir='node_modules/@spotify/basic-pitch/model/';
const handler={load:async()=>{const m=JSON.parse(fs.readFileSync(dir+'model.json'));const w=fs.readFileSync(dir+m.weightsManifest[0].paths[0]);return{modelTopology:m.modelTopology,format:m.format,weightSpecs:m.weightsManifest[0].weights,weightData:w.buffer.slice(w.byteOffset,w.byteOffset+w.byteLength)};}};
function rng(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;}}
function ks(buf,start,midi,dur,amp,r){const f=440*2**((midi-69)/12),N=Math.round(SR/f);const d=new Float32Array(N).map(()=>r()*2-1);const s0=Math.round(start*SR),n=Math.round(dur*SR);let i=0;for(let k=0;k<n&&s0+k<buf.length;k++){const a=d[i],b=d[(i+1)%N];d[i]=0.996*0.5*(a+b);buf[s0+k]+=amp*a*(k>n-400?(n-k)/400:1);i=(i+1)%N;}}
function score(ref,est,tol=0.05){const used=new Set();let tp=0;for(const r of ref){const j=est.findIndex((e,ix)=>!used.has(ix)&&e.pitchMidi===r.midi&&Math.abs(e.startTimeSeconds-r.t)<=tol);if(j>=0){used.add(j);tp++;}}const p=tp/Math.max(est.length,1),rc=tp/ref.length;return{P:+p.toFixed(3),R:+rc.toFixed(3),F1:+(p+rc?2*p*rc/(p+rc):0).toFixed(3),est:est.length};}
await tf.setBackend('cpu');
const mono=[];let t=0.25;for(let k=0;k<24;k++){mono.push({t,midi:40+((k*7)%37),d:0.35});t+=0.5;}
const r=rng(42),buf=new Float32Array(Math.round((t+1)*SR));for(const n of mono)ks(buf,n.t,n.midi,n.d,0.5,r);
const bp=new BasicPitch(tf.loadGraphModel(handler));const fr=[],on=[],ct=[];
await bp.evaluateModel(buf,(f,o,c)=>{fr.push(...f);on.push(...o);ct.push(...c);},()=>{});
fs.writeFileSync('mono_out.json',JSON.stringify({fr,on,ct}));
for(const [o,f,ml] of [[0.5,0.3,5],[0.6,0.4,11],[0.7,0.5,11],[0.5,0.3,11]]){
 const notes=noteFramesToTime(addPitchBendsToNoteEvents(ct,outputToNotesPoly(fr,on,o,f,ml)));
 console.log(`onset=${o} frame=${f} minLen=${ml}`,JSON.stringify(score(mono,notes)));}
const notes=noteFramesToTime(addPitchBendsToNoteEvents(ct,outputToNotesPoly(fr,on,0.5,0.3,5)));
const fp=notes.filter(e=>!mono.some(r=>r.midi===e.pitchMidi&&Math.abs(e.startTimeSeconds-r.t)<=0.05));
console.log('FP intervals vs nearest ref (semitones):',fp.map(e=>{const r=mono.reduce((a,b)=>Math.abs(b.t-e.startTimeSeconds)<Math.abs(a.t-e.startTimeSeconds)?b:a);return `${e.pitchMidi-r.midi}@${(e.startTimeSeconds-r.t).toFixed(2)}s`;}).join(' '));
