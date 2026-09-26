#!/usr/bin/env python3
"""Mechanical cold-read checks (3.6 step 2 / Phase 5.1). Exit 1 on any problem."""
import re, json, glob, os, sys
docs = {p: open(p).read() for p in ['HANDOFF.md'] + glob.glob('plan/*.md') + glob.glob('premortem/*.md') + ['tests/INDEX.md', 'research/QUESTIONS.md']}
alltext = '\n'.join(docs.values()) + json.dumps(json.load(open('research/claims.json')))
defined = {
 'S': set(re.findall(r'^### (S-\d{3})', docs['plan/PLAN.md'], re.M)),
 'T': set(re.findall(r'^\| (T-\d{3}) ', docs['tests/INDEX.md'], re.M)),
 'D': set(re.findall(r'\*\*(D-\d{3})\*\*|\((D-\d{3})\)|^## (D-\d{3})|^\| (DR-\d{2}) ', docs['plan/DECISIONS.md'], re.M)),
 'C': {c['id'] for c in json.load(open('research/claims.json'))},
 'A': set(re.findall(r'^\| (A-\d{3}) ', docs['plan/ASSUMPTIONS.md'], re.M)),
 'G': set(re.findall(r'^## (G-\d{3})', docs['plan/GATES.md'], re.M)),
 'R': set(re.findall(r'^\| (R-\d{3}) ', docs['premortem/RISK_REGISTER.md'], re.M)),
 'SC': set(re.findall(r'^\| (SC-\d+) ', docs['plan/PLAN.md'], re.M)),
}
defined['D'] = {x for t in defined['D'] for x in (t if isinstance(t, tuple) else (t,)) if x}
defined['D'] |= set(re.findall(r'(D-\d{3})', docs['plan/DECISIONS.md']))  # decisions defined inline in the interface table
problems = []
for kind, pat in [('S', r'S-\d{3}'), ('T', r'T-\d{3}'), ('C', r'C-\d{3}'), ('A', r'A-\d{3}'), ('G', r'G-\d{3}'), ('R', r'R-\d{3}'), ('SC', r'SC-\d+')]:
    for ref in sorted(set(re.findall(r'\b' + pat + r'\b', alltext))):
        if ref not in defined[kind] and not (kind == 'G' and ref == 'G-001'):
            problems.append(f'undefined {kind} reference {ref}')
for ref in sorted(set(re.findall(r'\bDR-\d{2}\b', alltext))):
    if ref not in docs['plan/DECISIONS.md']: problems.append('undefined ' + ref)
# every T in INDEX maps to an SC; every SC has a test
for line in docs['tests/INDEX.md'].splitlines():
    m = re.match(r'^\| (T-\d{3}) .*\| (SC-[^|]*|all) \|$', line)
    if line.startswith('| T-') and not m: problems.append('T without SC: ' + line[:40])
for sc in defined['SC']:
    if not re.search(r'^\| ' + sc + r' \| T-', docs['plan/TRACEABILITY.md'], re.M): problems.append('SC without test row: ' + sc)
# paths referenced must exist or be declared as a step output / generated
created = ' '.join(re.findall(r'- Outputs: (.*)', docs['plan/PLAN.md'])) + ' GATE-G-002.md GATE-G-003.md DEVIATIONS.md BLOCKED.md TEST_CHALLENGE.md RED_BASELINE.md OPERATIONS-LOG.md ci-red.log .checkpoints/impl-state.json perf/results public/ dist playwright-report'
for p in sorted(set(re.findall(r'`((?:src|tests|plan|research|premortem|scripts|perf|public|\.github)/[\w./*\-{},]+)`', alltext))):
    base = p.split('{')[0].rstrip('*').rstrip('/')
    if p in docs['plan/PROFILE.md']: continue  # listed as N/A
    if not (glob.glob(p) or os.path.exists(base) or base in created or any(base.startswith(c.strip(',')) for c in created.split())):
        problems.append('missing path ' + p)
# N/A artifacts must not be required
for na in ['math/', 'figures/SPEC.md', 'manuscript/', 'research/NOVELTY.md']:
    if na in docs['plan/PLAN.md'] or na in docs['HANDOFF.md']: problems.append('N/A artifact required: ' + na)
# every step has all template fields
for block in re.split(r'^### ', docs['plan/PLAN.md'], flags=re.M)[1:]:
    for f in ['Tier', 'Profile', 'Depends on', 'Inputs', 'Actions', 'Outputs', 'Evidence produced', 'Done when', 'Checkpoint', 'On failure', 'Gate', 'Relevant decisions/claims']:
        if f'- {f}:' not in block: problems.append(f'{block[:5]} missing field {f}')
print(json.dumps({k: len(v) for k, v in defined.items()}))
print('\n'.join(problems) or 'NO PROBLEMS'); sys.exit(1 if problems else 0)
