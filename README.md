# Family Feud Game Night

A local, reusable survey-game app with private presenter controls, a TV board, a game editor, an event scorebook, and a live ranked leaderboard. The included game contains **4 rounds, 16 questions and 82 ranked answers**, copied from `REQUIREMENTS.txt`. Regular answers score **1 point**, bonus answers **2 points**. Survey counts never determine points.

## Start on Windows

1. Keep this folder together (or extract the ZIP first).
2. Double-click **Start Game.cmd**. The included production build opens at **http://127.0.0.1:4173/#/presenter**.
3. The launcher uses an installed Node.js, or the bundled Codex Node.js on this computer. On another computer, install Node.js 22 or newer once. No package installation is needed to run the included `dist` build.
4. Use **Stop Game.cmd** when finished. Your saved browser data remains.

There are no APIs, accounts, paid services, external fonts, or network assets. Once Node.js and this folder are present, play works without internet. Keep the local server running while playing. Do not open `dist/index.html` directly as a file.

## Two screens

1. Connect the TV to the laptop.
2. In Windows display settings, choose **Extend these displays** (Windows + P → Extend).
3. Open Presenter View on the laptop.
4. Click **Open Audience Display**.
5. Drag that new window onto the TV.
6. Click the board once to enable original synthesized sounds. Double-click the board, or press **F** in that window, for fullscreen.
7. Keep Presenter View on the laptop. Its connection indicator confirms the audience window is present.

Use the same browser profile and exact address for both windows. BroadcastChannel synchronizes them, with local-storage events as a fallback. Refreshing either window restores the live session. Timers use an absolute finish time, so a background window does not accumulate countdown drift.

**Single-screen / mirrored displays:** open only the audience board on the shared screen and use its keyboard shortcuts. No hidden answers, host instructions, editor tools, or shortcuts are rendered on the board. For Zoom or Teams, share only the Audience Display window.

## Presenter controls

Reveal any answer in any order. Select the answering team, then manually **Award** the question’s value, or enable **Auto-award**. Manual ±1 buttons support adjustments. Undo restores the previous live action, including a reveal and its automatic score. History keeps the last 60 actions.

- Repeated clicks on a revealed answer have no effect and no extra sound.
- Hiding an answer keeps the score. Hiding and revealing it again cannot auto-award it twice. Use **Undo** to reverse a mistaken scored reveal.
- **Reveal all** is a recap and awards no points. **Hide all** and **Reset question** do not erase already awarded points.
- Scores can go below zero for manual corrections.
- Previous/next preserve each question’s reveals and strikes. Changing questions resets the contestant timer to the question override or game default.
- **Show round title** displays a clean intermission card; press again to return to the question.
- More than eight answers use board pages of up to eight. Revealing an answer switches to its page; page buttons appear above the preview. Keys 1–8 always refer to the first eight ranked answers.
- **Session & saved games → Resume Game** keeps current progress. **Start New Session** confirms before replacing live progress with a fresh copy of the selected saved game.

| Key | Action |
| --- | --- |
| 1–8 | Reveal that ranked answer |
| T | Start, pause, resume timer |
| R | Reset timer for the next contestant |
| X / Z | Add / remove strike |
| N or Right / P or Left | Next / previous question |
| U | Undo |
| F | Fullscreen the focused game window; use in Audience Display for TV fullscreen |
| Escape | Close help or preview overlays; browser also exits fullscreen |

Shortcuts are disabled in inputs, selects, text areas, and editor/scorebook routes. Timer defaults to 20 seconds, with presets and custom values from 1–3600 seconds. The final five seconds turn red and trigger a warning tone; zero triggers a buzzer. Mute/volume are shared. Audio needs a click in the window where it plays. With an audience window connected, sound plays there; otherwise it plays in Presenter View. Gameplay still works when audio is blocked or muted.

## Scorebook and leaderboard

Click **Score entry ↗** from Presenter View to open a separate page without closing or changing the live game.

1. Enter event title, **date**, and **venue**.
2. Rename the teams or add as many teams as needed.
3. Enter each team’s points earned for each question (not survey counts). Blank means not entered; zero means no points.
4. The supplied game has automatic subtotals **after question 8** and **after question 15**, just before the final question. The final column is a running total throughout the night. A running total and rank also remain beside each team’s name while scrolling.
5. Click **Save result** to keep a dated event record. Draft edits also save automatically; save again to update the record.
6. **Open leaderboard ↗** shows teams sorted by total and updates as entries change. Ties share a rank (1, 1, 3).
7. Reopen past events under **Saved results**. Export the current result as JSON or CSV for backup or a spreadsheet.

Scorebook entries are deliberately separate from the presenter’s two-team scores. They are entered manually and never change live gameplay. For other games, the sheet calculates the halfway and pre-final checkpoints from that game’s question count. Start a new score sheet after starting a different live game.

### The big score reveal: halfway and final

In Scorebook, find **The big reveal** below the score sheet. Choose **Halfway** or **Final**, then **Prepare / reset reveal**. This freezes a snapshot of that checkpoint's scores. **Open score-show display** opens a separate TV window; drag it onto the TV, click once to enable sound, and double-click for fullscreen.

Click **Reveal next team ↑** for each team. The lowest-ranked team appears at the bottom first; work upward until first place is revealed last. Names and points remain hidden until their turn. **Undo reveal** conceals the most recent team again. **Reveal all teams** completes the reveal. Later score edits do not affect a prepared show until you prepare a new snapshot. The score-show screen has only these two checkpoints; the private sheet retains its additional pre-final subtotal.

## Editor and imports

The editor autosaves separately from the live session. Incomplete text is retained as an editor draft; only valid game content can be exported or used for a new session. Duplicate a game before changing it if you want to keep both versions. You can add, duplicate, delete and reorder rounds/questions, edit/reorder answers, set points and timers, and change team defaults. Deletions and restoring the original game require confirmation.

**Paste Questions:** paste round headings, question lines, and answers ending in counts. Markdown bold, blank lines, divider lines, numbered answers, and two columns separated by tabs or at least two spaces are supported. The deterministic parser runs entirely on your computer. It shows all parsed questions and flags every unrecognized nonblank line. Correct the original text and reparse, or expand the structured preview to correct its JSON before confirming. The original source remains saved even after import. The complete supplied text is in `src/data/original.txt`.

**JSON:** Export a complete version-1 game, then import it on another browser/computer. Import creates a new saved game with fresh IDs. Schema: `{version:1,id,title,timer,teams:[{name,color}],rounds:[{id,name,questions:[{id,text,bonus,points,timer?,answers:[{id,text,count}]}]}]}`. Answer array order defines rank. Reveals/scores are session state, not game content.

**TXT:** choose Import file, then Parse & preview. **CSV:** one answer per row; required columns are `round,question,answer,count`. Optional columns are `bonus,points,timer,rank`. Use standard double-quoted CSV cells for commas/quotes. Example:

```csv
round,question,bonus,points,timer,rank,answer,count
Round 1,Name something you take to a hotel.,false,1,20,1,Luggage,69
Round 1,Name something you take to a hotel.,false,1,20,2,Clothing / sleepwear,8
```

## Storage and backup

Games, editor drafts, the current session, pasted source, and scorebook records use separate versioned local-storage keys. Data belongs to this browser profile and origin, so the development port 5173 and launcher port 4173 have separate saves. Use the launcher address consistently. Clearing browser data removes these records; use JSON/CSV exports for backups. Private/incognito windows do not preserve data after closing. The app reports storage write failures visibly in host views.

## Development and verification

```text
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
node scripts/server.mjs
node scripts/browser-test.mjs
node scripts/layout-test.mjs
node scripts/score-reveal-test.mjs
```

This checkout also includes a pnpm lockfile; `pnpm install --frozen-lockfile` is supported. Browser checks use installed Microsoft Edge through Playwright. Run the production server on port 4173 before browser tests. For a different browser, change the test launch channel. Browser tests use isolated temporary profiles, so they do not alter your real saved game.

Architecture: `model.ts` validates content, `parser.ts` handles deterministic imports, `engine.ts` holds pure gameplay/timer transitions and undo, `store.ts` handles persistence/synchronization, and separate React components implement Presenter, Board, Editor, and Scores. Audio is synthesized locally with Web Audio; no copyrighted audio files are included. `scripts/server.mjs` is a dependency-free local production server. The app uses hash routes and a relative Vite base, so `dist` can also be served by a static host.

See `TEST-REPORT.md` and `qa/` for verification results and screenshots.
