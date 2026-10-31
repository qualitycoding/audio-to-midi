export interface PlayerStem { mono: Float32Array; sampleRate: number; gain: number; }

/** D-025/A-010: plays selected stems (or all, if none selected) in sync from a given offset. */
export class Player {
  private ctx: AudioContext | null = null;
  private sources: AudioBufferSourceNode[] = [];
  private gains: GainNode[] = [];
  private startedAtCtxTime = 0;
  private startedAtOffsetSec = 0;
  playing = false;
  lastStartLatencyMs: number | null = null;

  private ensureCtx(): AudioContext {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return this.ctx;
  }

  async play(stems: readonly PlayerStem[], indices: readonly number[], offsetSec: number): Promise<void> {
    this.stopInternal();
    const ctx = this.ensureCtx();
    if (ctx.state === 'suspended') {
      // Some browsers' resume() only resolves on a fresh user gesture and can hang indefinitely
      // in automated/headless contexts (observed: Firefox in CI). Race it so playback scheduling
      // is never blocked on it — nodes scheduled on a still-suspended context simply start once
      // it does resume.
      await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 500))]);
    }
    const t0 = performance.now();
    const use = indices.length ? indices : stems.map((_, i) => i);
    const when = ctx.currentTime + 0.05;
    for (const i of use) {
      const s = stems[i];
      const buf = ctx.createBuffer(1, s.mono.length, s.sampleRate);
      buf.copyToChannel(Float32Array.from(s.mono), 0);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const gain = ctx.createGain(); gain.gain.value = s.gain;
      src.connect(gain).connect(ctx.destination);
      src.start(when, Math.max(0, offsetSec));
      this.sources.push(src); this.gains.push(gain);
    }
    this.startedAtCtxTime = when;
    this.startedAtOffsetSec = offsetSec;
    this.playing = true;
    // Resolve once the first sample is actually due to play (best-effort latency measurement).
    const waitMs = Math.max(0, (when - ctx.currentTime) * 1000);
    await new Promise((r) => setTimeout(r, waitMs));
    this.lastStartLatencyMs = performance.now() - t0;
  }

  stop(): void {
    this.stopInternal();
    this.startedAtOffsetSec = 0;
  }

  private stopInternal(): void {
    for (const s of this.sources) { try { s.stop(); } catch { /* already stopped */ } }
    this.sources = []; this.gains = [];
    this.playing = false;
  }

  currentTimeSec(): number {
    if (!this.playing || !this.ctx) return this.startedAtOffsetSec;
    return this.startedAtOffsetSec + Math.max(0, this.ctx.currentTime - this.startedAtCtxTime);
  }
}
