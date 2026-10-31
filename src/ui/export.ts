import { assignFrets } from '../core/fretting';
import { renderAsciiTab } from '../core/tabAscii';
import { renderMusicXml, type TabPart } from '../core/musicxml';
import { buildMidi } from '../core/midiExport';
import type { BeatGrid, StemExport } from '../core/types';
import type { StemState } from './state';

function timestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}`;
}

function download(bytes: BlobPart, filename: string, type: string): void {
  const blob = new Blob([bytes], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function frettedStems(stems: readonly StemState[]): { name: string; tuning: StemState['tuning'] }[] {
  return stems.filter((s) => s.kind === 'guitar' || s.kind === 'bass').map((s) => s);
}

export function exportMidi(stems: readonly StemState[], grid: BeatGrid): void {
  const use: StemExport[] = stems
    .filter((s) => s.kind !== 'unpitched')
    .map((s) => ({ name: s.name, kind: s.kind, notes: s.notes }));
  const bytes = buildMidi(use, grid);
  download(Uint8Array.from(bytes), `audio-to-midi-${timestamp()}.mid`, 'audio/midi');
}

export function exportAsciiTab(stems: readonly StemState[], grid: BeatGrid): void {
  const parts = frettedStems(stems);
  const blocks = parts.map((p) => renderAsciiTab(assignFrets(stems.find((s) => s.name === p.name)!.notes, p.tuning), p.tuning, grid, { title: p.name }));
  download(blocks.join('\n\n'), `audio-to-midi-${timestamp()}.txt`, 'text/plain');
}

export function exportMusicXml(stems: readonly StemState[], grid: BeatGrid): void {
  const parts: TabPart[] = frettedStems(stems).map((p) => ({
    name: p.name,
    tuning: p.tuning,
    tab: assignFrets(stems.find((s) => s.name === p.name)!.notes, p.tuning),
  }));
  const xml = renderMusicXml(parts, grid);
  download(xml, `audio-to-midi-${timestamp()}.musicxml`, 'application/vnd.recordare.musicxml+xml');
}
