# Verification report — September 17, 2026

Tested on Windows with Node.js 24.19.0 and Microsoft Edge through Playwright, using isolated browser profiles against the production build on port 4173. User browser data was not used by the tests.

## Passed

- Strict TypeScript typecheck and ESLint.
- Vite production build (Windows launcher also verified in the preceding build).
- **30 unit tests in five files**.
- Full original paste-parser fidelity: **4 rounds, 16 questions, 82 answers**, all wording/ranks/counts and original point values. Original JSON, TXT and REQUIREMENTS.txt have no changes.
- Parser cases include Markdown, Unicode, CRLF, numbered answers, spacing, two columns, quoted CSV, malformed input and unknown-line warnings.
- Timestamp timers, adaptive defaults, exact extensions, pause/resume, undo, and a regression test for missing optional fields after JSON persistence.
- Ten sourced finale boards plus the supplied Q16 adaptation, six answers each, descending survey counts, distinct source links and 4-point/60-second rules.
- Finale readiness/pause locks, manual grading, 3-strike end, all-six end, late-answer rejection, same-team retries, per-team/per-question attempt recovery and undo of termination.
- Score arithmetic, tied ranks, halfway/before-finale/final snapshots and idempotent finale point merging.
- Opening sequence pauses/restores a running question timer.

## End-to-end browser checks

`scripts/browser-test.mjs` and `qa/browser-results.json`:

- Intro logo → brief instructions → questions in the same audience window; hidden answers are not exposed.
- No visible audience controls; written TV has no head-to-head scores or strikes.
- Presenter/audience connection, nonsequential answer reveals, +30 notice and undo, timer pause, audience refresh.
- Ten-team scorebook, date/venue record saving, no extra window on Score entry.
- One-at-a-time bottom-to-top reveal, frozen snapshot during grading edits, 720p/1080p ten-row geometry.
- Return to exactly the same revealed board and paused timer; same two browser windows throughout.
- Finale question hidden before start, selected team displayed, manual grades with no automatic awards, three strikes and undo, refresh/recovery.
- Separate next team/board, all-six reveals followed by a manual 24-point grade; scorebook reload does not duplicate points.
- Before-finale excludes timed points; final includes them and ranks the resulting totals.
- Result JSON export/import preserves bonus points as a snapshot.
- Timestamp expiry recovery locks late answers and shows TIME’S UP. The test shortens the stored deadline to exercise expiry quickly; the actual turn duration remains 60 seconds.
- Full original text paste → 16-question/82-answer preview → import.
- Synchronization with BroadcastChannel disabled, using localStorage events.
- No browser runtime/console errors.

`scripts/layout-test.mjs` and `qa/layout-results.json`:

- All 15 live written questions, fully revealed, fit at 1280×720 and 1920×1080.
- No original question/tile overflow or off-screen footer.
- Presenter fits horizontally at 1366×768 and 390×844.
- Twelve-answer imported board paginates, and revealing answer 12 selects its page.

`scripts/audio-test.mjs` and `qa/audio-results.json`:

- Audience opening screen has no form controls.
- Native Web Audio uses identical short sine bings for answer/team reveals, a brief sine wrong-answer tone, quiet final-ten-second ticks and an expiry tone. Tests inspect frequency, waveform and duration.
- Mute suppresses playback; Silent suppresses both answer and team reveal tones.
- Countdown ticks and TIME’S UP appear at expiry; extension restores time without changing questions.

Screenshots include the intro with Daniel Prins, instructions, ten-team standings at two resolutions, finale timeout, final results, original long boards, and desktop/mobile presenter layouts. Selected screenshots were visually inspected.

## Fixes found during this build

- Removed hardcoded two-team audience scoring and moved strikes to the timed finale.
- Made score reveals replace the board rather than opening a second TV popup.
- Made undo explicitly restore optional fields absent from persisted JSON; otherwise an extension count could survive undo.
- Made late answer processing check the timestamp before awarding, even if background expiry processing has not run yet.
- Replaced additive finale imports with a stable per-event/per-team points lookup.
- Reduced ten-team reveal typography/padding so all standings fit without clipping.
- Added automatic Windows build on a fresh checkout/source update, and Vite runner config loading for this sandbox.

## Practical limits

No physical TV/projector or room speaker system was available. Web Audio scheduling was verified, not venue acoustics. Click the audience window once to enable sound and enter fullscreen there. Browser saves belong to the exact origin/profile, not the Git repository; export backups to transfer them. Finale sources are fan transcripts, not independently checked against episode video, and equal maximum points do not guarantee equal difficulty.

## Readability and flexible finale regression checks

`scripts/readability-test.mjs` checks all eleven fully revealed finale boards at 720p/1080p, including long answers and the enlarged footer. A small footer text overflow was found and fixed. It also verifies manual grades, switching questions for the same team, returning to an earlier paused attempt, resetting to 60 seconds, leaving an unfinished finale and editing bonus points in Scorebook. Grades and reset state survive reload. Migration from a retired board preserves earned points. Original 16-question data is unchanged.

The opening format screen and enlarged audience board were visually inspected. Sounds were checked through Web Audio instrumentation; room loudness remains adjustable with the volume control.

## Show sequence and finalist limit

`scripts/show-flow-test.mjs` verifies title-card privacy, automatic timer start on Show question, halfway progression after Q8, pre-finale progression after Q15, selected team turns and automatic final standings. Main written and finale controls fit 1366×768. The original Q16 becomes a six-answer finale option. Old 16-question score drafts retain a backup with their original scores. A twenty-team event is limited to five selected finalists; the host controls tie decisions. Unit tests enforce the five-team selection cap and cover persisted lineup undo.

The scorebook, editor, result imports/exports and private leaderboard retain all teams, with no ten-team limit. Audience standings show only the top ten and label the full event team count. The finale remains capped at five selected teams. Twenty-team totals and JSON validation are tested.
