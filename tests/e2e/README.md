# E2E Tests — Playwright

Form-submission + cross-actor specs for Eagles & Eaglets workflows.
Companion to the read-only audit in [`PLAYWRIGHT_FINDINGS.md`](./PLAYWRIGHT_FINDINGS.md).

## First-time setup

```bash
cd Frontend/EagelsnEaglets

# 1. dotenv (Playwright config reads .env.test)
npm i -D dotenv

# 2. Install browsers (one-time, ~200 MB)
npx playwright install chromium

# 3. .env.test is already created (gitignored). Verify creds match your local DB.
cat .env.test
```

## Running

```bash
npm run e2e            # headless, all specs (CI mode)
npm run e2e:headed     # headed (browser visible) — config default
npm run e2e:ui         # interactive UI runner — best for debugging single test
npm run e2e:report     # open last HTML report (failures + traces + videos)

# Single spec
npx playwright test tests/e2e/01-mentor-upload-content-module.spec.ts

# Single test by name
npx playwright test -g "mentor creates a module"
```

## Preconditions

Tests are **idempotent** (timestamp-suffixed names) but assume real DB state:

| Spec | Requires |
|------|----------|
| 01 mentor module create | mentor logged in, has Nest with active program |
| 02 mentor PDF item attach | spec 01 ran (at least one module exists) |
| 03 mentor standalone assignment | mentor logged in |
| 04 mentor send message | at least one existing chat conversation |
| 05 admin approve KYC | pending KYC application in DB |
| 06 admin create badge | admin badge-management UI surface exists (skips if missing) |
| 07 admin create product | admin store + product modal |
| 08 mentee submit assignment | published assignment + mentee enrolled |
| 09 mentee take quiz | module with quiz published |
| 10 mentee nest post | mentee in active program |
| 11 mentee like/comment | at least one post in feed |
| 12 cross-actor approval | mentee with pending enrollment NOT yet approved |

Each spec calls `test.skip(...)` with a reason when its precondition is absent — no false failures.

## Architecture

```
tests/e2e/
├── playwright.config.ts          → root (Frontend/EagelsnEaglets/)
├── .env.test                     → root (gitignored)
├── helpers/
│   ├── auth.ts                   → uiLogin(role), expectLoggedIn(), logout()
│   ├── forms.ts                  → uniq(), uploadFile(), expectSuccessFeedback(), FIXTURES path
│   └── selectors.ts              → shared role/text query shortcuts
├── fixtures/
│   ├── sample.pdf                → minimal valid PDF
│   ├── sample.png                → 1x1 transparent PNG
│   ├── sample.mp4                → placeholder for video upload
│   └── sample.txt                → plain text content
├── screenshots/                  → on-failure screenshots (gitignored)
├── PLAYWRIGHT_FINDINGS.md        → read-only audit log
└── 01..12-*.spec.ts              → form-submission specs
```

## Conventions

1. **Login each test:** `beforeEach` runs `uiLogin(page, role)`. Slower than cached storageState but exercises auth surface continually.
2. **Idempotent names:** Use `uniq('Test Module')` → `Test Module 632845` to avoid uniqueness collisions on rerun.
3. **Skip-with-reason:** When precondition absent, `test.skip(true, 'Reason')` documents why instead of false-failing.
4. **Fallback selectors:** Most queries use `getByRole` + `getByText` + permissive regex. Brittle when copy changes; safer when DOM structure shifts.
5. **No data cleanup:** Tests create real rows. Run `python manage.py shell` periodic cleanup if dev DB pollutes.

## Adding new specs

```typescript
import { test, expect } from '@playwright/test';
import { uiLogin } from './helpers/auth';
import { uniq } from './helpers/forms';

test.describe('Role: action', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page, 'mentor'); // or mentee/admin
    });

    test('does the thing', async ({ page }) => {
        await page.goto('/path');
        // ...
        await expect(page.getByText(/success/i)).toBeVisible();
    });
});
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Missing creds for role=...` | Check `.env.test` exists and has all three role blocks |
| Tests time out on login | Confirm dev server on `http://localhost:5173` + backend on `:8000` |
| Browser doesn't open | Run `npx playwright install` to fetch chromium binary |
| Flaky on first headed run | Browser focus issues — keep window foreground OR use `--headed=false` |
| `Cannot find module 'dotenv'` | `npm i -D dotenv` |

## CI strategy (future)

For CI, switch to:
- `headless: true` (override in config or env)
- `workers: 4` (parallel)
- `retries: 1` (one retry for known flakes)
- `storageState` per role (cache login, 10x faster)
- Programmatic DB seed via `pytest --create-db` style fixtures
