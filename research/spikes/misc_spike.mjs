import { Chord, Note } from 'tonal'; import tm from '@tonejs/midi'; const { Midi } = tm;
const toN = a => a.map(m => Note.pitchClass(Note.fromMidi(m)));
for (const c of [[40,47,52,55,59,64],[45,52,57,61,64],[43,47,50,55,59,67],[50,57,62,66],[45,52,55,60,64],[40,43,47,50],[36,40,43,46]])
  console.log(toN(c).join(' '), '=>', JSON.stringify(Chord.detect(toN(c), {assumePerfectFifth:true})), '| with bass order:', JSON.stringify(Chord.detect([...new Set(toN(c))])));
console.log('fromMidi 18:', Note.fromMidi(18), 'freq', Note.freq('F#0').toFixed(3), ' fromMidi 108:', Note.fromMidi(108));
const midi = new Midi(); midi.header.setTempo(97.5); midi.header.timeSignatures.push({ticks:0,timeSignature:[7,8]});
for (let k=0;k<8;k++){ const tr=midi.addTrack(); tr.name='stem'+k; tr.channel=k===7?8:k; tr.addNote({midi:18+k, time:0.5+k*0.1, duration:0.25, velocity:0.8}); }
const bytes = midi.toArray(); const back = new Midi(bytes);
console.log('SMF bytes', bytes.length, 'format', back.header.ppq, 'ppq; tracks', back.tracks.length, 'tempo', back.header.tempos[0].bpm, 'ts', JSON.stringify(back.header.timeSignatures[0].timeSignature), 'note0 time', back.tracks[0].notes[0].time.toFixed(4), 'midi', back.tracks[0].notes[0].midi);
console.log('header bytes:', Buffer.from(bytes.slice(0,14)).toString('hex'));
