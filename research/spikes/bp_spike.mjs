// R6 spike: basic-pitch accuracy on synthesized Karplus-Strong fixtures (22050 Hz mono)
import * as tf from '@tensorflow/tfjs';
import fs from 'fs';
import pkg from '@spotify/basic-pitch';
const { BasicPitch, outputToNotesPoly, addPitchBendsToNoteEvents, noteFramesToTime } = pkg;
const SR = 22050, dir = 'node_modules/@spotify/basic-pitch/model/';
const handler = { load: async () => { const m = JSON.parse(fs.readFileSync(dir+'model.json'));
  const w = fs.readFileSync(dir+m.weightsManifest[0].paths[0]);
  return { modelTopology: m.modelTopology, format: m.format, generatedBy: m.generatedBy, convertedBy: m.convertedBy,
    weightSpecs: m.weightsManifest[0].weights, weightData: w.buffer.slice(w.byteOffset, w.byteOffset+w.byteLength) }; } };
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}}
function ks(buf, start, midi, dur, amp, r){ // Karplus-Strong pluck
  const f=440*2**((midi-69)/12), N=Math.round(SR/f); const d=new Float32Array(N).map(()=>r()*2-1);
  const s0=Math.round(start*SR), n=Math.round(dur*SR); let i=0;
  for(let k=0;k<n && s0+k<buf.length;k++){ const a=d[i], b=d[(i+1)%N]; d[i]=0.996*0.5*(a+b); buf[s0+k]+=amp*a*(k>n-400?(n-k)/400:1); i=(i+1)%N; } }
function score(ref, est, tol=0.05){ const used=new Set(); let tp=0;
  for(const r of ref){ const j=est.findIndex((e,ix)=>!used.has(ix)&&e.pitchMidi===r.midi&&Math.abs(e.startTimeSeconds-r.t)<=tol); if(j>=0){used.add(j);tp++;} }
  const p=tp/Math.max(est.length,1), rc=tp/ref.length; return {tp, ref:ref.length, est:est.length, P:+p.toFixed(3), R:+rc.toFixed(3), F1:+(p+rc?2*p*rc/(p+rc):0).toFixed(3)}; }
async function run(name, ref, len){ const r=rng(42), buf=new Float32Array(Math.round(len*SR));
  for(const n of ref) ks(buf,n.t,n.midi,n.d,0.5,r);
  const bp=new BasicPitch(tf.loadGraphModel(handler)); const fr=[],on=[],ct=[]; const t0=Date.now();
  await bp.evaluateModel(buf,(f,o,c)=>{fr.push(...f);on.push(...o);ct.push(...c);},()=>{});
  const notes=noteFramesToTime(addPitchBendsToNoteEvents(ct,outputToNotesPoly(fr,on,0.5,0.3,5)));
  console.log(name, JSON.stringify(score(ref,notes)), `infer ${((Date.now()-t0)/1000).toFixed(1)}s for ${len}s audio`);
  return notes; }
await tf.setBackend('cpu');
// mono melody, guitar range E2..E5
const mono=[]; let t=0.25; for(let k=0;k<24;k++){ mono.push({t, midi:40+((k*7)%37), d:0.35}); t+=0.5; }
await run('mono-guitar', mono, t+1);
// chords: triads & 7ths, guitar voicings
const chords=[[40,47,52,55,59,64],[45,52,57,61,64],[43,47,50,55,59,67],[50,57,62,66],[40,47,52,56,59,64],[45,52,55,60,64]];
const pol=[]; t=0.25; for(const c of chords){ for(const m of c) pol.push({t,midi:m,d:1.2}); t+=1.5; }
await run('poly-chords', pol, t+1);
// low range: 8-string F#1 and 7-string bass F#0..B0 region
const low=[18,19,20,21,23,28,30,33].map((m,k)=>({t:0.25+k*1.0,midi:m,d:0.8}));
const n=await run('low-bass', low, 9.5);
console.log('low detected pitches:', n.map(x=>x.pitchMidi).join(','));
