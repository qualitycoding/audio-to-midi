import { mixToMono, validateDecoded } from './validate';

/** Wraps decodeAudioData in a Promise; Safari historically needs the callback form (C-014). */
export function decodeAudio(ctx: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const maybePromise = ctx.decodeAudioData(data, resolve, reject);
    // Some engines return a Promise AND invoke the callbacks; guard against double-settling by relying on Promise semantics only when present.
    if (maybePromise && typeof (maybePromise as Promise<AudioBuffer>).then === 'function') {
      (maybePromise as Promise<AudioBuffer>).then(resolve, reject);
    }
  });
}

export interface DecodedMono { mono: Float32Array; sampleRate: number; durationSec: number }

export async function decodeToMono(ctx: AudioContext, data: ArrayBuffer): Promise<DecodedMono> {
  const buf = await decodeAudio(ctx, data);
  validateDecoded(buf.duration);
  const channels: Float32Array[] = [];
  for (let c = 0; c < buf.numberOfChannels; c++) channels.push(buf.getChannelData(c));
  const mono = channels.length > 1 ? mixToMono(channels) : channels[0];
  return { mono, sampleRate: buf.sampleRate, durationSec: buf.duration };
}

/** Resample mono audio to 22050 Hz for basic-pitch (D-023 step 2). */
export async function resampleTo22050(mono: Float32Array, sampleRate: number): Promise<Float32Array> {
  if (sampleRate === 22050) return mono;
  const targetLen = Math.ceil((mono.length * 22050) / sampleRate);
  const offline = new OfflineAudioContext(1, targetLen, 22050);
  const buf = offline.createBuffer(1, mono.length, sampleRate);
  buf.copyToChannel(Float32Array.from(mono), 0);
  const src = offline.createBufferSource(); src.buffer = buf; src.connect(offline.destination); src.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0).slice(0, targetLen);
}
