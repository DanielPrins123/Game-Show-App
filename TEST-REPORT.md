# Verification report — September 29, 2026

## September 29 follow-up

- 52 unit tests, strict typecheck, lint and production build passed.
- Presenter preview enlarged after removing the individual trivia answer buttons. Sequential reveal/hide/undo remain; grading retains its private answer card.
- Single-answer numbering and the audience answer counter are removed. Answer fills are neutral; intro host credits are smaller in both modes.
- Generated a transparent ivory/lavender version of the supplied Outspoken artwork and integrated it into the intro. Source artwork remains available.
- Automatic trivia timing: 180/240/300 seconds by answer count, 360 for the final. Presenter overrides survive navigation, timer reset and JSON result reload; explicit editor/import timing stays supported.
- Browser checks cover 4.5-minute custom timing, six-minute final default, timer synchronization, preview fit at 1366×768 and private grading.
- Team reveals now ascend in pitch, with muted medal accents by rank. Audience windows remain silent and undoing a trivia standings reveal makes no note.

## September 29 trivia revision

- TypeScript, ESLint, production build and 49 unit tests passed.
- Included September 29 source: 28 original slides, four rounds, 20 questions, four bonus point rules (10/10/10/30). Decorative source art is omitted from question slides; original source paragraphs remain in JSON. The source's FACEBOOK tag is kept in private notes. Regular points remain host-defined because the deck did not specify them.
- Dark charcoal/plum display and host design, separate game-mode selector, intro-only branding, no “Get ready” text. Feud preview is to the right.
- All 24 cards in both September trivia sets were checked at 1280×720 and 1920×1080, including dense prompts and ten-answer finals. Legacy prompts are laid out separately and paired where appropriate.
- Browser checks cover bundled library start, mode switching, private answer card during grading, drag reorder, apply-to-live edits, score preservation, arbitrary answer reveal/hide, reload and audience synchronization.
- Current question identity survives reordering/deleting a different card. Deleting the displayed card opens a title card with answers hidden. Edited answers are hidden again. Audience rendering keeps the last consistent deck/session pair during asynchronous deck loading.
- Unit coverage verifies the three score stops (before Round 3, before the last question and after it), frozen totals, manual scoring, individual-answer undo and text round-trip for explicit prompt items and paired answers.
- Existing browser regression passed for text import/editing, saved draft reload, result restore, score keyboard navigation and both BroadcastChannel/localStorage synchronization paths.
- Feud opening/written/finale controls still fit 1366×768 and 96-point finale persistence remains verified.

## September 25 update

- TypeScript, ESLint, production build and all 44 unit tests passed.
- Recorded laptop history reported missing Node typings after pulling. The old launcher skipped dependency installation whenever TypeScript already existed. A regression fixture now detects changed dependencies in that situation; the actual Windows Build Game launcher refreshed dependencies and built successfully. The exact laptop-local repair was not available in history or GitHub.
- Finale grades have no upper cap: 48/96-point browser entry, navigation and reload passed; 1,000-point result import/export passed unit coverage.
- Presenter opening, written question and finale fit 1366×768 with preview and sound visible. A 20-team event with five finalists passed the sequence checks.
- Host audio passed with no audience interaction; mute, reveal, strike and countdown behavior passed. Sounds use increased gain and a host test button. Venue acoustics and music balance require a speaker test at the event.
- Full browser regression passed, including original 16-question/82-answer parser fidelity, score snapshots, manual finale grading and localStorage synchronization fallback.

The sections below retain earlier detailed verification. The host-only sound routing and permanently visible presenter panels above supersede earlier audience-click and collapsed-panel behavior.

## September 17 baseline

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

Finale X reachability verified at 1366×768, 1024×768 and 390×844, both at the top and bottom of the page; clicking records a strike. The show-flow check verifies named round transitions and automatic timer start.

## Trivia text editor and light display — September 19, 2026

PowerPoint upload has been removed from the app workflow. The replacement supports text paste/preview/confirm, TXT and JSON, an autosaved editor draft, round/question creation and reordering, private answers, scoring/timer edits and a private display preview. Existing games/results remain compatible. A version-1 IndexedDB fixture successfully upgraded without losing its game.

All 42 unit tests pass when the supplied local reference file is available. Typecheck, lint and production build pass. Browser checks cover paste import, draft persistence after the saved indicator, legacy JSON, private answers, manual keyboard scoring, synchronization, reload and backup restoration. The full sample's 20 question layouts pass at 720p and 1080p. Additional geometry checks cover every round/title/question/answer screen and top-ten rankings, including clearance for the original Outspoken Entertainment logo. White intro, question and answer screens and the light presenter were visually inspected. One ranking/footer overlap was found and fixed. Family Feud's score keyboard behavior is included in the browser regression.

The September 18 notes below describe the former PowerPoint workflow; its source parser remains only for legacy compatibility tests.

## Trivia and keyboard score entry — September 18, 2026

Typecheck, ESLint, production build and 38 unit tests pass, including the locally supplied PowerPoint integration case. The 28-slide sample converts into 24 screens: four round cards and 20 questions with 37 answers. Its four bonus maximums are 10, 10, 10 and 30. Source paragraphs and slide provenance are retained; unspecified regular points remain for the host to decide. The original Family Feud parser still preserves all 16 supplied questions and 82 answers.

The new Edge browser test uploads the actual file through the production worker, requires review, checks answer privacy before reveal, timestamp timer start/pause, BroadcastChannel and storage-event synchronization, audience reload, manual grades, keyboard entry, saved date/venue, result JSON restoration and Family Feud's Enter-down score navigation. All 20 question layouts were checked at 1280×720 and 1920×1080. A quick follow-up run verified rapid text entry and restoration over modified scores after fixing an asynchronous controlled-input rollback. The final answer display and compact presenter were visually inspected. Pictures remain private until assigned; extracted decorative images are not automatically displayed.

The existing Family Feud browser regression passes: opening/instructions, reveals, timer extension/undo, ten-team scoring, same-window ranked score shows, finale manual grading/strikes, persistence, original-game paste import and storage fallback. Browser tests use isolated profiles and do not change the host's saved event.

PowerPoint conversion is heuristic and deliberately requires review. It does not reproduce animations, master artwork or embedded media, and does not OCR image-only text. No physical projector or room audio system was available. The private source PowerPoint is not included in the repository.

### Full trivia score sheet verification

TypeScript, ESLint, production build and all 53 unit tests pass. The full-sheet browser test enters scores across all 20 supplied questions and verifies four round subtotals (15, 40, 65, 90), halftime (55), pre-final (190), and total (210). It checks Enter/Tab navigation, private answer selection without TV changes, reload persistence, CSV download, and no horizontal table overflow at 1366px. Visual evidence: qa/trivia-full-score-sheet.png.

The legacy-game browser regression also passes: import, timer, answer reveal, manual scores, dated saves, JSON restore, both audience synchronization channels and Feud score navigation. Unchanged full-deck geometry was not repeated for this score-sheet-only revision.

### Trivia show polish and timer cues

TypeScript, lint, production build and 54 unit tests pass. New timer/answer browser checks verify 60/30-second notices and one-shot warning sounds, final-ten-second ticks and overlay, +30 synchronization and countdown removal, hidden-answer board persistence, flip animation and hidden audience timer, and presenter-only audio. The existing timing check verifies seconds entry, custom duration persistence, reset, and 1366×768 presenter fit. Top-three colors and ascending score sounds are checked in the score-reveal browser test. Motion-reduced geometry checks inspect the complete supplied September 29 deck at 720p and 1080p.

### Softer theme and faster answer flips

Removed the intro tagline. Trivia uses warm charcoal and ivory instead of purple/blue/gold surfaces. Answer flips and their text reveal now take 240 ms instead of 500 ms, with reduced-motion behavior retained. TypeScript, lint, production build, presenter timing/layout and countdown/reveal browser checks pass. Intro and answer screenshots were visually inspected.

### Full-card time warnings

60/30-second warnings now animate from the clock area over a dimmed card and retreat after a brief hold. The final countdown covers the card until expiration, pause or extension. TypeScript, lint, build and the timer browser regression verify synchronized notices, dismissal, full-width countdown, sounds and +30 removal. Reduced-motion mode fades the warning instead of moving it.

### Standings scaling

TypeScript, lint and build pass. Browser checks cover 1, 2, 3, 5 and 10 trivia teams at 720p/1080p, full-width rows, four-digit totals, font scaling and distinct medal backgrounds. Feud standings are checked with 3 and 10 teams. Ascending reveal sound regression also passes.

### October set and high-contrast trivia — October 13, 2026

All 55 unit tests, TypeScript, ESLint and the production build pass. The October 12 deck is reconciled with the supplied host sheet (20 questions, 28 source slides, Mark Ruffalo restored, complete 13-song final with a 30-point scoring maximum). Isolated browser checks cover every card at 720p/1080p, private answers, full score entry and reload persistence. Intro and final-answer screenshots were visually inspected. Score-reveal checks verify ascending notes, no duplicate audience sound, silent undo, and uniform highlights. Standings scale for 1/2/3/5/10 teams; medal colors have been removed from both modes. This supersedes the earlier theme and medal-color notes.

### Light trivia theme — October 13
Replaced the green theme with white backgrounds, black text and coral accents across audience slides, presenter and scoring. Typecheck, lint, production build and all-card October browser layout/persistence checks pass at 720p/1080p. Intro inspected visually. Actual sunlight/projector conditions require a venue check.

### Light-theme contrast regression fix
Corrected inherited pale transition headings, round labels, answer-stage question text and secondary timer/score labels. Browser regression now includes question-title transitions and asserts at least 4.5:1 text contrast on all October round, transition, question and answer screens at 720p/1080p. Checks pass; transition screenshot visually inspected. Typecheck, lint and build pass.

### Stable question-and-answer layout
Questions with up to six answers show hidden boxes immediately, with larger question text and centered spacing. Reveals preserve question bounds and hide the clock; crowded questions use a dedicated answer view. Bonus transitions show their scoring field. Focused geometry/contrast checks cover both bundled decks at 720p/1080p, hidden answer privacy and unchanged question bounds on reveal. Updated countdown coverage for immediate hidden boxes. Typecheck, lint and build pass.

The broader editor/reorder/synchronization regression and countdown/sound browser checks also pass. Decorative turquoise, yellow and coral edges preserve white reading surfaces and black text.

### Bright standings and rank accents
Trivia standings use light backgrounds with black text and rank-based medal accents. Browser checks pass for 1/2/3/5/10 teams at 720p/1080p, including silver for the second of two teams. Two-team screenshot visually inspected. Question contrast/layout, typecheck, lint and build pass. Public October final wording shortened to 10 answers without changing accepted answers or scoring.

### Simplified timer controls
Presenter timer is a 0–600-second slider in 15-second increments with a single Start/Pause/Restart button. Sound controls are grouped below. Browser tests verify pause/resume, zero and ten-minute endpoints, step size, 270-second persistence, audience synchronization and 1366×768 fit. Existing countdown/sound checks pass using the + keyboard extension. Timing unit tests, typecheck, lint and production build pass.
