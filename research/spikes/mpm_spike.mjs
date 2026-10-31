// Spike: McLeod pitch method (pitchy) for low-register fundamentals incl. sub-A0 (F#0 = MIDI 18)
import { PitchDetector } from 'pitchy';
const SR=44100;
function rng(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;}}
function ks(midi,dur,r){const f=440*2**((midi-69)/12),N=Math.round(SR/f);const d=new Float32Array(N).map(()=>r()*2-1);const n=Math.round(dur*SR),out=new Float32Array(n);let i=0;for(let k=0;k<n;k++){const a=d[i],b=d[(i+1)%N];d[i]=0.998*0.5*(a+b);out[k]=a;i=(i+1)%N;}return out;}
for (const W of [4096, 8192]) { const det=PitchDetector.forFloat32Array(W); const r=rng(3); let ok=0, rows=[];
  for (const m of [18,19,20,21,23,26,28,30,33,35,40]) { const x=ks(m,1.0,r); const est=[];
    for(let s=Math.round(0.1*SR); s+W<x.length-Math.round(0.2*SR); s+=W/2){ const [f,c]=det.findPitch(x.subarray(s,s+W),SR); if(c>0.9) est.push(69+12*Math.log2(f/440)); }
    est.sort((a,b)=>a-b); const med=est.length?est[est.length>>1]:NaN; const good=Math.abs(med-m)<0.5; ok+=good; rows.push(`${m}->${isNaN(med)?'none':med.toFixed(2)}${good?'':'✗'}`); }
  console.log(`window ${W} (${(W/SR*1000).toFixed(0)} ms): ${ok}/11 correct | ${rows.join(' ')}`); }
