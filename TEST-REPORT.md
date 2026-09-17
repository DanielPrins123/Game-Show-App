# Verification report

Tested locally on Windows with Node.js 24.19.0 and Microsoft Edge through Playwright. The browser checks run against the actual production build served by `scripts/server.mjs`, in isolated profiles.

## Automated checks

- TypeScript strict typecheck: **passed**.
- ESLint: **passed**.
- Vite production build: **passed**. All app assets are local.
- Vitest: **14 tests passed**, in three test files.
- Parser exact-content comparison: **4 rounds, 16 questions, 82 answers**, all supplied ranks, answer texts, survey counts and question point values matched the included original JSON.
- Parser coverage: original full text, Unicode/apostrophes/slashes/question marks, CRLF, Markdown bold, numbered answers, dividers, irregular spacing, two columns, bonus/regular labels, unknown-line warnings, quoted CSV and malformed input.
- Pure gameplay tests: nonsequential reveals; repeated reveal and hide/reveal protection; 1-point and 2-point scoring; undo; strikes; previous/next persistence; timestamp-based pause/resume, warning threshold, expiration and reset; recap behavior; live/editor separation.
- Score calculation tests: running totals, halfway snapshot, final snapshot, shared ranks, snapshot independence.

## Browser flows

`scripts/browser-test.mjs` verifies:

- Separate presenter/audience pages, display presence, reveal order **5, 1, 3**, and no unrevealed answer text or host controls in the audience DOM.
- Auto-scoring, hidden/re-revealed answer protection, strikes, undo, previous/next.
- Timer start, pause, resume, five-second visual warning, expiration and reset.
- Refreshing both presenter and audience, plus keyboard control from the audience.
- Scorebook date/venue persistence, question entries, halfway subtotal, pre-final subtotal, final/running totals, saved records, a synchronized leaderboard, and tied ranks.
- Pasting and importing the complete game, exporting/importing JSON, and suppression of shortcuts in editor inputs.
- BroadcastChannel-disabled local-storage-event fallback.
- No browser runtime or console errors.

`scripts/layout-test.mjs` verifies:

- **Every supplied question**, fully revealed, at **1280×720 and 1920×1080**.
- No text/tile overflow or off-screen footer in those checks.
- Presenter horizontal fit at **1366×768** and **390×844**.
- A 12-answer imported question: paginated board, reveal of answer 12 switches page, and page controls return to answers 1–8.

`scripts/score-reveal-test.mjs` verifies:

- Halfway and final checkpoints only.
- All team names and scores initially concealed on the score-show screen.
- **Bottom-to-top, one-team-at-a-time** reveal, followed by first place.
- Undo reveal, audience refresh, reveal-all, final totals, and fixed snapshots unaffected by later scorebook edits.
- No host controls on the score-show screen; screenshot at 1280×720 and 1920×1080.

Machine-readable results and screenshots are in `qa/`. PowerShell launcher scripts passed syntax parsing; the same dependency-free production server used by the launcher was run successfully. Physical TV placement and audible sound levels depend on your setup; the README explains the browser audio click requirement and Windows Extend mode.

## Issues fixed during verification

- Windows file-watch crash while a JSON export was being written: exclude QA artifacts from the development watcher; test final flows on the production server.
- Tight text line spacing detected in TV layout checks: increased line height and rechecked all questions at both sizes.
- Missing favicon console errors in the production server: added a local icon.
- Incomplete editor values could be lost when leaving the editor: persist an independent draft, while keeping valid saved games separate.
- Running score-sheet totals could scroll out of view: keep each total beside its sticky team name.
- Large answer sets: page the audience board instead of shrinking all answers into an unreadable grid.

## Practical limits

Browser storage is local to the exact origin/profile. Export backups when moving computers or clearing browser data. Both live windows must use the same browser profile/address. Audio can require a click in the audience window. Fullscreen must be initiated from the target display window. No physical projector or external screen-sharing service was available for hardware-level testing.
