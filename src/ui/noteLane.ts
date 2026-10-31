import type { NoteEvent } from '../core/types';
import type { Viewport } from '../core/viewport';
import { groupSimultaneous, labelSimultaneous } from '../core/chord';
import { midiToName } from '../core/notes';

export interface LabelledEvent { timeSec: number; label: string; }

/** Groups simultaneous notes into chord/note labels, in onset order. Single notes get their plain name. */
export function computeLabels(notes: readonly NoteEvent[]): LabelledEvent[] {
  const groups = groupSimultaneous(notes);
  return groups.map((g) => ({
    timeSec: g[0].startSec,
    label: g.length >= 2 ? labelSimultaneous(g.map((n) => n.midi)) : midiToName(g[0].midi),
  }));
}

export function renderNoteLane(el: HTMLElement, labels: readonly LabelledEvent[], viewport: Viewport): void {
  el.textContent = '';
  const toSec = viewport.startSec + viewport.widthPx * viewport.secPerPx;
  for (const l of labels) {
    if (l.timeSec < viewport.startSec || l.timeSec >= toSec) continue;
    const px = (l.timeSec - viewport.startSec) / viewport.secPerPx;
    const span = document.createElement('span');
    span.className = 'note-label';
    span.dataset.testid = 'note-label';
    span.style.left = `${px}px`;
    span.textContent = l.label;
    el.appendChild(span);
  }
}
