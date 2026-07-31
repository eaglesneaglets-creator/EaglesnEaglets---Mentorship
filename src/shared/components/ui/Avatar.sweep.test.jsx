/**
 * Phase 32-03 — backsliding guard.
 *
 * Phase 32-02 created a single <Avatar>; 32-03 swept 20+ call sites onto it.
 * Nothing stops a future change from hand-rolling `name.charAt(0)` again, and
 * the failure is silent: the surface still renders, it just shows a letter where
 * everyone else shows a face. That is exactly the bug this phase set out to fix.
 *
 * So these tests read the source tree rather than rendering components. They are
 * lint rules expressed as tests — they fail loudly the moment a duplicate
 * implementation reappears.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Resolved from the vitest root, NOT `import.meta.url` — under the jsdom
// environment that is an http:// URL and `fileURLToPath` rejects it.
const SRC = join(process.cwd(), 'src');

/** Every .js/.jsx file under src/, excluding tests and node_modules. */
const sourceFiles = () => {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (/\.jsx?$/.test(entry) && !/\.test\.jsx?$/.test(entry)) {
        out.push(full);
      }
    }
  };
  walk(SRC);
  return out;
};

const FILES = sourceFiles();
const rel = (f) => relative(SRC, f).replace(/\\/g, '/');

/**
 * Files allowed to contain the canonical implementation itself.
 * `Avatar.jsx` renders it; `initials.js` defines it.
 */
const CANONICAL = ['shared/utils/initials.js', 'shared/components/ui/Avatar.jsx'];

describe('Avatar sweep guard (Phase 32-03)', () => {
  it('has exactly one getInitials implementation', () => {
    const offenders = FILES.filter((f) => {
      if (CANONICAL.includes(rel(f))) return false;
      return /(?:const|function)\s+getInitials\s*[=(]/.test(readFileSync(f, 'utf8'));
    }).map(rel);

    expect(
      offenders,
      `getInitials must only live in shared/utils/initials.js. Use <Avatar> instead of `
        + `re-deriving initials in: ${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('does not hand-roll initials from a name field in JSX', () => {
    // Matches `first_name?.charAt(0)`, `full_name.charAt(0)`, `name?.charAt(0)`
    // AND the bracket form `first_name?.[0]` — RoleSwitcher used the latter, which
    // is why the original 32-03 sweep missed it and stacked admins kept seeing
    // initials. Deliberately narrow: `status.charAt(0)` in StatusBadge is
    // capitalize logic, not an avatar, and must keep passing.
    const NAME_FIELD = '(?:first_name|last_name|full_name|user_full_name|name)';
    const pattern = new RegExp(`\\b${NAME_FIELD}\\??(?:\\.charAt\\(0\\)|\\??\\.\\[0\\]|\\[0\\])`);

    const offenders = FILES.filter((f) => {
      if (CANONICAL.includes(rel(f))) return false;
      return pattern.test(readFileSync(f, 'utf8'));
    }).map(rel);

    expect(
      offenders,
      `Render <Avatar user={...} /> instead of deriving initials by hand in: ${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('does not swap avatar fallbacks by mutating sibling DOM nodes', () => {
    // `e.target.nextSibling.style.display = 'flex'` reaches around React to show a
    // fallback. <Avatar> holds that in state. The KYC *document* viewer is exempt:
    // it previews an uploaded ID scan, not a person's avatar.
    const EXEMPT = ['pages/admin/AdminKYCDetailPage.jsx'];

    const offenders = FILES.filter((f) => {
      if (EXEMPT.includes(rel(f))) return false;
      return /nextSibling\.style\.display/.test(readFileSync(f, 'utf8'));
    }).map(rel);

    expect(
      offenders,
      `Let <Avatar> handle the broken-image fallback rather than mutating the DOM in: `
        + `${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('sanity-check: the scanner actually sees the source tree', () => {
    // Without this, a broken glob would make every test above vacuously pass.
    expect(FILES.length).toBeGreaterThan(100);
    expect(FILES.map(rel)).toContain('shared/components/ui/Avatar.jsx');
  });
});
