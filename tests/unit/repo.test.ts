// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
/** T-031 — SC-15 (README + Apache-2.0 licence, A-003). Green at freeze by design: satisfied by the planning commit on main. */
describe('T-031 repository documents', () => {
  it('LICENSE is the Apache License 2.0 text', () => { const l = readFileSync('LICENSE', 'utf8'); expect(l).toMatch(/Apache License\s+Version 2\.0, January 2004/); expect(l).toContain('END OF TERMS AND CONDITIONS'); });
  it('README names the project and the licence', () => { const r = readFileSync('README.md', 'utf8'); expect(r).toMatch(/^# audio-to-midi/m); expect(r).toMatch(/Apache License, Version 2\.0/); });
  it('package.json declares Apache-2.0', () => { expect(JSON.parse(readFileSync('package.json', 'utf8')).license).toBe('Apache-2.0'); });
});
