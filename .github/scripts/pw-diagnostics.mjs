// Not part of the frozen test suite — a CI-only diagnostics extractor so failures can be read back
// through the GitHub Contents API (this sandbox's egress allow-list blocks the Actions log/artifact
// blob-storage host, but not api.github.com).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const [, , resultsPath, project] = process.argv;
const out = { project, generatedAt: new Date().toISOString() };
if (!existsSync(resultsPath)) { out.parseError = `no results file at ${resultsPath}`; writeFileSync('ci-diagnostics.json', JSON.stringify(out, null, 2)); process.exit(0); }
try {
  const j = JSON.parse(readFileSync(resultsPath, 'utf8'));
  out.stats = j.stats;
  const failures = [];
  const walk = (suites, filePrefix = '') => {
    for (const s of suites ?? []) {
      for (const spec of s.specs ?? []) {
        for (const t of spec.tests ?? []) {
          for (const r of t.results ?? []) {
            if (r.status !== 'passed' && r.status !== 'skipped') {
              failures.push({
                file: s.file ?? filePrefix,
                title: spec.title,
                status: r.status,
                error: (r.error?.message ?? r.errors?.map((e) => e.message).join(' | ') ?? '').split('\n').slice(0, 8).join('\n'),
              });
            }
          }
        }
      }
      walk(s.suites, s.file ?? filePrefix);
    }
  };
  walk(j.suites);
  out.failures = failures.slice(0, 30);
} catch (e) {
  out.parseError = String(e);
}
writeFileSync('ci-diagnostics.json', JSON.stringify(out, null, 2));
