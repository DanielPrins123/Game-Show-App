# Family Feud Game Night

A local React + TypeScript + Vite browser app for Daniel Prins’s written-answer game nights, supporting **any number of teams (at least two)**, private hosting, an audience screen, an editor, saved results and an optional timed finale.

The source files preserve all **4 rounds, 16 questions and 82 answers**, including wording, rankings, counts and original points. Live play uses **15 written questions**, followed by the timed finale. Original Q16 is now a finale option with its lowest-ranked answer omitted (six remain). Original regular answers earn **1 point**, original bonus answers **2 points**. The separate timed finale earns **4 points** per correct answer. Survey counts never determine team points.

## Start or update on Windows

1. On the laptop, use GitHub Desktop → **Fetch origin**, then **Pull origin** if offered.
2. Install Node.js 22 or newer once, including npm.
3. Double-click **Start Game.cmd**. A missing or outdated build is rebuilt automatically. First setup installs dependencies and needs internet; subsequent play works offline.
4. Open `http://127.0.0.1:4173/#/presenter`. Refresh older game tabs after updating.
5. **Build Game.cmd** forces a rebuild. **Stop Game.cmd** stops the background server.

Keep the project folder together. Do not open `dist/index.html` as a file. The launcher uses installed Node.js or the available Codex bundled runtime. GitHub transfers program files, **not browser saves**: use game JSON and result JSON exports to move content/results between computers.

## Intro → instructions → questions

Only the **presenter** has buttons. A new session starts on an audience welcome logo with **“With your host, Daniel Prins.”** No answers, menus or buttons appear on the TV.

- **Start show / opening logo:** show the welcome screen while setting up teams, venue and sound.
- **2 · Show brief instructions:** explain the written-answer format.
- **3 · Begin questions:** show the first round/question title card. **Show question** opens the board and starts its timer automatically.

Revisiting this sequence preserves the current question/reveals and pauses its running timer until you return.

## Laptop and TV

1. Connect the TV; press **Windows + P → Extend**.
2. Keep Presenter on the laptop. Click **Open Audience Display** once and drag that window onto the TV.
3. Click the audience screen once for sound; double-click or press **F** for fullscreen.
4. Keep both windows in the same browser profile and at the same address/port.
5. Scores replace the board **inside the existing TV window**. Closing scores restores the board and fullscreen without dragging another window.

BroadcastChannel synchronizes windows, with localStorage events as a fallback. The host shows connection status. Hidden answers and unrevealed standings are absent from the audience DOM. Share only the audience window when streaming.

## Written rounds

All teams discuss and write the requested number of answers, then bring sheets to the host. Grade everyone in **Score entry / teams**, then reveal the board in any order. The TV shows neither strikes nor head-to-head team scores during these rounds.

Default time is **3 minutes for 1–3 answers, 4 minutes for 4–6, 5 minutes for 7+** when using the standard four-minute game setting. Explicit question timers and custom game settings are respected. Choose 3/4/5 minutes or custom seconds. Existing unused default 20-second timers migrate to four minutes; active timers are preserved.

**+30 seconds** adds exactly 30 seconds, with a gold audience notice and chime. The host sees an extension count; extensions can be repeated or undone. **All sheets in · end early** stops the timer. Zero never advances the question automatically.

The timestamp-based clock shows minutes:seconds, warns at **30 seconds**, and buzzes with a **TIME’S UP** visual at zero. Background tabs do not slow the timer. **Reveal all** is a recap; written scores are entered manually using the question’s indicated points. Navigation preserves reveals; Undo restores gameplay actions.

Four minutes × 15 questions is 60 minutes before grading, reveals and breaks. End early when everyone submits to aim for 7:30–7:45 from a 6:00 start; the app does not impose a schedule.

## Scorebook, records and reveals

**Score entry / teams** uses the current host tab. **Back to presenter** returns without changing the TV.

Enter the event title/date/venue and all team names. Enter points per written question: blank means ungraded, zero means no points. Team names retain a running total and position while scrolling. Ties rank **1, 1, 3**.

The live sheet has a halfway subtotal after question 8. **Written total** includes all 15 questions. **Timed bonus** is separate; the final running total includes both. **Save result** keeps a dated record; save again at the end. JSON export/import transfers a complete result. CSV export works in spreadsheets. Saved records/imports are snapshots, while the active sheet’s linked finale points update automatically without being repeatedly added.

For the audience reveal choose:

- **Halfway:** first half of written questions.
- **Before timed finale:** all written questions, excluding timed bonus.
- **Final:** written points plus timed bonus.

Click **Show scores on TV**, then **Reveal next team ↑**. Teams appear from bottom to top, first place last. **Undo reveal** hides the most recent team; **Reveal all teams** finishes. A snapshot freezes scores for that show; later grading edits require a fresh snapshot. **Close scores · return to game** restores the question and resumes its timer. Ten rows fit at 16:9.

Leaderboard is a separate private running ranking. The audience reveal is controlled from the scorebook or presenter.

## Optional timed finale

Set up the team roster in Scorebook. The finale controls are integrated into the main Presenter question panel. Eleven six-answer boards are available (ten sourced boards and the adapted original Q16); each turn starts at 60 seconds. Four points per answer is the suggested grading rule, up to 24. You enter the grade yourself.

1. Select any team and question, then **Open selected team & question**. The question stays hidden until **Start 60-second turn**.
2. Reveal answers as you judge them. Reveals never change the score. Three strikes, all six reveals or time running out stops the turn.
3. Enter **Finale points** in Presenter or the **Timed bonus** column in Scorebook. The number replaces that team’s grade, so retries cannot double-count points.
4. Use **Previous bonus / Next bonus**, or select any team and board. Revisiting an attempt restores its answers and strikes with the timer paused.
5. **Reset this turn · 60 seconds** clears answers and strikes for another chance. The entered grade remains until you edit it. Undo also works.
6. **Return to written rounds** works at any time. Show final standings and save the dated result when ready.

The board bank contains scenario questions without Steve Harvey references. Source counts and answer rankings are preserved; prompts are shortened. Similar response distributions help selection but cannot guarantee identical difficulty. See BONUS-SOURCES.md.

## Keyboard and sound

| Key | Action |
| --- | --- |
| 1–8 | Reveal ranked answer |
| T | Start / pause / resume |
| R | Reset regular timer |
| + | Add 30 seconds in written rounds |
| X | Finale wrong answer only |
| U | Undo gameplay |
| N / Right; P / Left | Next / previous written question |
| F | Fullscreen focused window |
| Space during score show | Next team reveal |
| Escape during score show | Return to game; browser may also exit fullscreen |

Shortcuts do not fire in text fields. Opening sequence controls are private host buttons. Mute/volume synchronize. Original local Web Audio sounds: short soft answer/score bing, rounded wrong-answer tone, warning ping, gentle expiry tone and extension tone. There are no downloaded show recordings or external assets. Click the audience window once to enable sound. Gameplay works when audio is muted/blocked.

## Editor and importing games

Editor autosaves separately from live play. Add/reorder rounds/questions/answers, edit points/timers and team defaults, or duplicate games. Start a new session to apply a saved game; save event results first because live progress/finale resets.

**Paste Questions** parses locally and deterministically. Supported: round headings, questions, count-ending answer lines, Markdown emphasis, numbered answers, divider lines and two columns separated by tabs or multiple spaces. Review errors/preview before confirming. Full original text: `src/data/original.txt`.

**JSON game import/export:** version-1 game content with team defaults. Imports receive fresh IDs. **TXT:** loads into paste preview. **CSV:** one answer per row, required columns `round,question,answer,count`; optional `bonus,points,timer,rank`. Quote cells containing commas/quotes.

```csv
round,question,answer,count,points,rank
Round 1,Name something you take to a hotel.,Luggage,69,1,1
Round 1,Name something you take to a hotel.,Clothing / sleepwear,8,1,2
```

Game JSON is content, result JSON is scores/date/venue/bonus totals, browser session is live progress. Browser saves are not synced by GitHub. Keep the same browser/profile/address during an event and export backups. Storage failures display an alert.

## Development

```text
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
node scripts/server.mjs
npm run test:browser
```

Browser tests require port 4173 and installed Microsoft Edge. Vite’s runner config loader avoids an esbuild parent-folder access issue in Windows sandboxes. Dependencies and `dist` are not committed; the launcher builds cloned updates. See `TEST-REPORT.md` and `qa/` for validation.

## Audience readability update

The audience board now uses a much larger timer and larger question, answer and standings text. The opening format screen summarizes four rounds, fifteen written questions, regular/bonus points and the timed finale. It adapts to edited game contents. The presenter alone controls the sequence.

Answer and team score reveals share a short, soft bing. Under presenter sound settings, **Answer & score reveal sound** can be set to **Silent** without muting timer alerts. Quiet ticks during the final 10 seconds can be switched off separately.

Live progress and score entry save automatically. Closing and reopening the same browser/profile at the same address restores them; a running timer continues against the clock. Save result stores a separate dated result, and Export JSON backs up scores for transfer. If an update retires an active finale question, its earned points are retained and that turn is closed; written play resumes paused.

## Follow the show with Next

**Next** progresses through the current title card and question, then the next title card. Opening the question starts its timer automatically. After Q8, Next opens halfway standings in the same presenter panel and audience window. Continue leads to Q9. After Q15, Next opens written standings, then the finalist selection and timed turns. Next team finishes the current turn and prepares the next selected finalist; after the last finalist it opens final results. Reveals remain one at a time from bottom to top. Manual navigation and retry controls remain available.

Written play supports any number of teams (at least two); the finale has **at most five finalists**. Select all teams when there are five or fewer, use Top 3, or choose individual teams. Resolve any ties by adjusting the selected teams yourself. The lineup is saved with the session. Other teams remain in final standings.

Core controls fit a 1366×768 host screen. Audience preview and sound settings expand on demand. Existing live 16-question score drafts are archived under Saved results before conversion to 15 written columns; saved historical results remain unchanged.

The scorebook, editor, result imports/exports and private leaderboard retain all teams, with no ten-team limit. Audience standings show only the top ten and label the full event team count. The finale remains capped at five selected teams. Twenty-team totals and JSON validation are tested.
