# 💰 Expense Tracker — React Native Mobile App

A full-featured personal finance tracker built with **React Native**, designed as part of a **Fresher / Junior React Native + MERN Stack Developer Assessment**. The app allows users to record income and expenses, categorize transactions, view financial summaries, and gain smart insights into their spending habits — all with local, offline-first data persistence.

---

## 🧭 Project Status & Context for AI Agents

> **If you're a new session picking this up, read this paragraph and stop scrolling if you're in a hurry.**
> This is a React Native (Expo SDK 54 + expo-dev-client) expense tracker whose core app + 7 bonus
> features + Phase 1 (backend/auth/sync) are **built and live-tested**, including a confirmed
> end-to-end login on a real physical Android device. **All 6 planned phases are now code-complete**
> (Phase 2 Smart Import, Phase 3 AI Assistant, Phase 4 Goals, Phase 5 Health Score, Phase 6 What-If
> Simulator), 45/45 unit tests passing, `tsc`/bundle-export clean. **A real EAS dev-client build now
> succeeds** (`eas build --profile development --platform android`) after fixing two real bugs found
> via the build's own signed logs (not guessed): (1) the notification-listener library's nested
> `buildscript` block pinned a 2021-era Android Gradle Plugin, conflicting with this project's
> modern AGP — fixed via a `patch-package` patch; (2) an Android manifest merge conflict
> (`allowBackup` mismatch between the app and that same library) — fixed via a small custom Expo
> config plugin (`plugins/withAllowBackupOverride.js`). See [Dependency Notes](#dependency-notes)
> for both. **A real "Delete Transaction reappears after ~2 seconds" bug was found and fixed** during
> device testing — deletions were never actually pushed to the server (no tombstone), so the next
> sync silently resurrected them; fixed with a tombstone mechanism in `transactionStorage`/`goalStorage`
> + `syncService`, with regression tests in `src/services/__tests__/syncPayload.test.ts`. **The
> combined device-testing pass is now COMPLETE** — the user ran through Phases 2-6, the remaining
> device-only gaps, and Smart Import directly on the dev-client APK and confirmed **no remaining
> bugs**. A local
> backend-connectivity bug (phone couldn't reach `localhost`) was diagnosed and fixed
> by pointing `app.json`'s `apiBaseUrl` at the dev machine's LAN IP — **the user has confirmed login
> now succeeds
> end-to-end
> on their physical phone with this fix**. **A recruiter-ready standalone `preview` build (APK, no
> Metro/laptop dependency) has been produced and distributed via Firebase App Distribution**
> (routes install through the trusted Firebase App Tester app, avoiding a Play Protect block that
> made the raw `expo.dev` link effectively uninstallable on some devices). **The first distributed
> build crashed immediately on open** — root-caused via real `adb logcat` (not guessed) to a
> duplicate/mismatched `expo-font` version (`@expo/vector-icons`'s peer dependency resolved to
> `57.0.1` instead of deduping to the correct SDK54 `14.0.12` from `expo` itself), fixed via a
> `package.json` `overrides` entry, confirmed with a clean reinstall + `tsc`/`expo export`, then a
> real successful EAS rebuild redistributed via Firebase — **the app now opened past the crash, but
> login still failed** since `apiBaseUrl` was a private LAN IP. **The backend is now deployed
> publicly on Render's free tier** (`https://expense-tracker-6v8l.onrender.com`, backed by a free
> MongoDB Atlas cluster) — verified with a real register→login round trip against the live database,
> not just a health check. Two real Render deploy-config bugs were found and fixed along the way
> (wrong Root Directory, then a stale Start Command path) — see the Build Log's "Backend deployment"
> row. `apiBaseUrl` now points at the live Render URL, a new `preview` APK was built and
> redistributed via Firebase (same tester link). After that, a **visual/UX polish pass** was done:
> real branding (a navy/teal/blue theme derived from the user's logo, now wired into
> `icon.png`/`splash-icon.png`/the Android adaptive icon), gradient buttons/progress bars, press and
> loading micro-interactions (all via React Native's built-in `Animated` API — no
> `react-native-reanimated` added), smoother screen/tab transitions, and a navigation restructure
> moving AI Assistant/Goals/Health Score/What-If Simulator out of Settings into a new
> `InsightsHubScreen` reached from a Dashboard banner. **Code-complete, `tsc`/45 tests/bundle-export
> all clean — not yet rebuilt via EAS or device-tested**, since a visual change is worth reviewing
> before spending a build cycle. See the Build Log's "Visual/UX polish pass" row. Keep this whole
> section updated at the end of every work session so it always reflects true current state. Full
> details below; don't guess — re-verify anything stale before relying on it.
> before relying on it.

### Build log (phase by phase, with real verification status)

| Phase | What it is | Status |
|---|---|---|
| Core app | Splash, Dashboard, Add/Edit/List/Details, Search/Filter, Summary, AsyncStorage persistence | ✅ Live-tested (browser automation, real add/edit/delete/filter/sort flows, math hand-verified) |
| Bonus round 1 | Analytics (charts+insights), Budget, Dark/Light/System theme, Export/Import, PIN lock, Receipt attach | ✅ Live-tested. 2 real bugs found & fixed: category picker wasn't filtered by income/expense type; Analytics y-axis showed literal `"u20B9"` (JSX `\u` escape gotcha) |
| SDK downgrade | Expo SDK 57 → 54 for Expo Go device compatibility | ✅ Live-tested (`tsc`, bundle export, live app run). 1 real bug found & fixed: `expo-sharing` has no config plugin at this version — was breaking `expo export`/`expo start` |
| Device-only gaps | Camera capture, native `Alert.alert` dialogs, native date picker | ✅ **Fully device-tested.** Camera receipt capture, all `Alert.alert` confirmation dialogs (delete transaction, disable PIN, logout), and the native date picker all confirmed working on a real Android device as part of the combined device-testing pass. |
| **Phase 1** | Dev-client migration (`expo-dev-client`, required because Phase 2 needs a native module Expo Go can't load) + Backend (Node/Express/MongoDB, JWT auth) + Login/Register + offline-first sync (last-write-wins) + Sync Status badge | ✅ Live-tested end-to-end against a real running server (register→sync→verify via direct API call→kill server→offline edit→restart→auto-recover), plus 9 automated integration tests against a real in-memory MongoDB |
| **Phase 2** | Smart Transaction Import: Android notification listener (`react-native-android-notification-listener`), consent flow, regex parsing for Google Pay/PhonePe/Paytm, shared auto-categorization util, Review & Save screen, iOS fallback | ✅ **Device-tested and confirmed working** on the real dev-client APK (regex-tested 9/9 beforehand). |
| Dependency fix | `react-native-android-notification-listener`'s stale `react@^18` peer dependency (conflicted with this project's React 19) | ✅ Fixed via a scoped npm `overrides` entry in `package.json` (not `--legacy-peer-deps`) — verified safe by reading the library's source (zero actual runtime `react` imports) and verified working via a clean `node_modules`+lockfile reinstall (0 ERESOLVE errors), `tsc --noEmit` clean, `expo export --platform android` clean. Full reasoning in [Dependency Notes](#dependency-notes). |
| Dependency fix #2 | Real EAS dev-client build failed with "Gradle build failed with unknown error" — root-caused via the build's own signed log file (not guessed) to the notification-listener library's nested `buildscript` block pinning Android Gradle Plugin 4.2.1 (2021-era), conflicting with this project's modern AGP | ✅ Fixed via a `patch-package` patch (auto-applied on every install via `postinstall`), removing the redundant/incorrectly-placed `buildscript` block. Verified via a clean reinstall (patch auto-applies), `tsc`/tests clean. Full reasoning in [Dependency Notes](#dependency-notes). |
| Dependency fix #3 | After fixing #2, the same EAS build still failed — a **second, separate** real bug: an Android manifest merge conflict (`allowBackup="false"` in the library's manifest vs. `allowBackup="true"` in the app's) | ✅ Fixed via a small custom Expo config plugin (`plugins/withAllowBackupOverride.js`) adding `tools:replace="android:allowBackup"`, exactly as Android's own merger error suggested. **Confirmed by a real EAS build completing successfully end-to-end** (not just locally simulated). Full reasoning in [Dependency Notes](#dependency-notes). |
| Delete Transaction sync bug | Real bug found during device testing: deleting a transaction removed it from the list, but it silently reappeared ~2 seconds later | ✅ **Root-caused and fixed.** `transactionStorage.remove()` deleted the record entirely with no trace, so the next debounced sync never told the server about the deletion — the server's still-`deleted:false` copy came back down and overwrote local state. Fixed with a tombstone mechanism (`transactionStorage`/`goalStorage` — the identical bug existed for goal deletion too) feeding into `syncService`'s push payload; tombstones clear only after a confirmed successful sync (safe offline). Payload-building logic extracted into pure, unit-tested functions (`src/services/syncPayload.ts`, `src/services/__tests__/syncPayload.test.ts`) with an explicit regression test for this exact bug. |
| Local login connectivity fix | Physical device got "Couldn't reach the server" because `apiBaseUrl` was `http://localhost:4000`, which on a phone means the phone itself, not the dev machine | ✅ **Live-tested end-to-end, confirmed by the user.** Root cause: `apiBaseUrl` in `app.json` changed to the dev machine's LAN IP (`http://192.168.29.193:4000`); backend started via `npm run dev:memory`; confirmed reachable from the dev machine over LAN (`curl`/`Invoke-WebRequest` to `/health` returned `200 {"status":"ok"}`); Windows Firewall already had an inbound "Allow" rule for `node.exe` matching the active network profile, so no firewall change was needed. The user then confirmed **login actually succeeds end-to-end on their physical Android phone** with this fix applied. |
| Phase 3 — AI Financial Assistant (chat) | Rule-based/on-device chat: intent+keyword matching over `TransactionContext`/`BudgetContext` via a new `src/utils/aiAssistant.ts`, reusing existing `calculations.ts` functions — no external API/keys. New `AiAssistantScreen` (chat UI, suggested-question chips), reachable from the Insights hub (see below). | ✅ **Unit-tested (19/19) + browser-verified + device-tested and confirmed working.** 1 real bug found & fixed during earlier testing: "income vs expense" was matching the trend-compare pattern (`" vs "` + `"month"`) before reaching the income-vs-expense check — fixed by reordering/prioritizing the more specific check first. |
| Phase 4 — Financial Goals Planner | Manually-funded goals (name, icon, target amount/date, saved amount) reusing the Phase 1 backend `Goal` model/`/api/goals` endpoints — new `goalStorage`/`GoalContext` (mirrors `TransactionContext`), wired into `syncService`/`SyncContext`. New `src/utils/goalProgress.ts` (percent/remaining/on-track-or-behind status, pure + unit-tested). Screens: `GoalsScreen` (list+progress bars), `AddEditGoalScreen` (create/edit), `AddGoalContributionScreen` (add funds) — reachable from the Insights hub (see below). | ✅ **Unit-tested (6/6) + `tsc`/bundle-export clean + device-tested and confirmed working.** |
| Phase 5 — Financial Health Score | Rule-based 0–100 score from 4 weighted, independently-explainable factors (savings rate, budget adherence, spending consistency via coefficient-of-variation across recent months, goal progress) via new `src/utils/healthScore.ts` — factors with insufficient data (e.g. no budget set, no goals) are cleanly excluded and remaining weights renormalized, rather than guessed. New `HealthScoreScreen` (score card + per-factor breakdown), reachable from the Insights hub (see below). | ✅ **Unit-tested (7/7) + `tsc`/bundle-export clean + device-tested and confirmed working.** |
| Phase 6 — What-If Simulator | Pure client-side projection (no new context/storage) — new `src/utils/whatIfSimulator.ts` recomputes this month's totals with a hypothetical single-category spend adjustment (%) and/or extra monthly income applied, reusing `calculations.ts`/`goalProgress.ts`; reports projected balance/budget-usage/goal-ETA changes. New `WhatIfSimulatorScreen` (live-recomputing form + results), reachable from the Insights hub (see below). Nothing is ever persisted. | ✅ **Unit-tested (8/8) + `tsc`/bundle-export clean + device-tested and confirmed working.** |
| **Recruiter-ready build** | Standalone `preview`-profile APK (self-contained, JS bundle baked in — no Metro/laptop dependency, unlike the `development` profile) | ✅ **Built successfully and distributed via Firebase App Distribution.** Tester install link: [appdistribution.firebase.google.com/testerapps/...](https://appdistribution.firebase.google.com/testerapps/1:370095400849:android:0d82571df794f85efd9c30/releases/47bj3uigk5q38?utm_source=firebase-tools) — routes installation through the trusted "Firebase App Tester" app instead of a raw sideloaded APK, avoiding the aggressive Play Protect block that blocked direct installs from the raw `expo.dev` build link on some devices. See [Build & Deployment](#-build--deployment) for details. |
| Startup crash bug (`expo-font` duplicate) | Real bug found after distributing the first Firebase build: app crashed immediately on open (before the login screen rendered) on the tester's physical device | ✅ **Root-caused via real `adb logcat` (not guessed) and fixed.** Crash was `FATAL EXCEPTION`/`NoSuchMethodError: getDirectConverter` inside `expo-font`'s native `FontLoaderModule` at startup. Root cause: `npm ls` showed **two different `expo-font` versions** in the dependency tree — the correct SDK54 version (`14.0.12`, from `expo` itself) and a mismatched duplicate (`57.0.1`) pulled in via `@expo/vector-icons`'s peer dependency, which Android's native autolinking picked instead, linking incompatible native Kotlin code. Fixed with a `package.json` `overrides` entry pinning `expo-font` to `14.0.12` (same pattern as the existing notification-listener override), confirmed deduped via `npm ls`, verified with a clean reinstall + `tsc --noEmit` + `expo export --platform android`, then confirmed by a real successful EAS `preview` rebuild redistributed via Firebase App Distribution. Login itself still failed on this build (LAN-IP backend, separate issue) — fixed next. |
| Backend deployment (Render) | The app's `apiBaseUrl` pointed at a private LAN IP, so login/sync only worked on the developer's own Wi-Fi — unusable for a recruiter testing off-network | ✅ **Backend deployed live to Render's free tier** (`https://expense-tracker-6v8l.onrender.com`), backed by a free MongoDB Atlas M0 cluster. Root-caused two real deploy failures along the way (not guessed): (1) Render's Root Directory wasn't scoped to `server/`, so it tried to run the frontend's `index.ts` and hit an unrelated `expo` Node type-stripping error; (2) after fixing that, the Start Command still referenced a stale/incorrect path (`server/index.ts`, which doesn't exist) instead of `npm start` → `node src/index.js`. Verified end-to-end with a real register→login round trip against the live database (not just a `/health` check). `apiBaseUrl` updated in `app.json`, `preview` APK rebuilt and redistributed via Firebase App Distribution (same tester link). Code pushed to a new GitHub repo ([techWithKeerthana/expense-tracker](https://github.com/techWithKeerthana/expense-tracker)) so Render could deploy from it. |
| Visual/UX polish pass | Full feature testing complete; requested a recruiter-impressive branding/theme overhaul, micro-interactions, and moving the 4 advanced features out of Settings into a dedicated hub | ✅ **Code-complete, `tsc`/45 tests/bundle-export all clean.** New navy/teal/blue theme (`src/constants/theme.ts`), `expo-linear-gradient` dependency (verified no duplicate-version regression via `npm ls`, learning from the `expo-font` bug), gradient primary `Button` + press-scale animation, animated `ProgressBar` (used in `GoalsScreen`/`HealthScoreScreen`), new `Skeleton`/`SkeletonGroup` loading placeholders (`Dashboard`, `Goals`, `HealthScore`), `slide_from_right`/`shift` screen and tab transitions. New `InsightsHubScreen` holds AI Assistant/Goals/Health Score/What-If Simulator as cards, reached via a new gradient banner on `Dashboard` instead of a 6th bottom tab (crowding trade-off, see Tech Stack notes); `SettingsScreen` trimmed back to account/preferences/PIN/logout. **Real app icon/splash now wired in** from the user-supplied logo (`assets/icon.png`, `splash-icon.png`, `favicon.png`, `android-icon-foreground.png` — all the same full 1254×1254 lockup image; `assets/android-icon-background.png`/`android-icon-monochrome.png` are now unused/orphaned since there's no separately-cropped mark layer to isolate a proper Android adaptive-icon safe zone or a themed-icon monochrome silhouette without image-editing tools — the adaptive icon instead pairs the full logo with a matching navy `backgroundColor` (`#0B1220`), which looks close to seamless since the logo's own background is already that color). 45/45 unit tests still pass, no test changes needed (none of this touches business logic). **Not yet device-tested** — pending the user's final visual/navigation smoke test. |
| White-flash + transition variety fix | Device testing of the polish pass found a white screen flash when backing out of the 4 Insights feature screens, plus every screen using the same `slide_from_right` transition felt repetitive | ✅ **Root-caused (not guessed) and fixed, `tsc`/45 tests/bundle-export clean.** Verified every screen's `ScreenContainer`/`contentStyle` was already consistently navy — ruling out the user's own initial JS-styling theory — so the flash had to be the native Android Activity window's default (white) background briefly showing through during the transition frame, more perceptible specifically when popping back to the newly-added `InsightsHubScreen`. Fixed via the standard mechanism for this exact class of bug: `expo-system-ui`'s `SystemUI.setBackgroundColorAsync()`, called reactively in `ThemeContext` whenever the theme's background changes, wrapped in a try/catch so it can't crash a dev-client build that doesn't have the (new, native) module linked yet. Added `animation: 'fade_from_bottom'` as a per-screen override on the 5 Insights-related screens (native-stack's built-in, no new dependency) so they feel distinct from the rest of the app's standard `slide_from_right`. **Important caveat:** the white-flash fix needs a *new* dev-client build to actually take effect (it changes native module linking), unlike the transition-variety fix which is previewable immediately via the existing dev-client — flagged to the user before proceeding. |

> **All 6 phases are code-complete (45/45 unit tests passing, `tsc`/bundle-export clean), the EAS
> dev-client build succeeds, the combined device-testing pass is COMPLETE with no remaining bugs,
> and the backend is now live on the public internet** (not just a LAN IP) — see the last two Build
> Log rows above for the tester link and the live backend URL.

### Tech stack & architecture decisions
- **Expo SDK 54** (downgraded from 57 for Expo Go compatibility) + **expo-dev-client** (custom dev build required — Expo Go alone cannot load the Android notification listener native module used by Phase 2).
- Frontend state: React Context (no Redux) — `ThemeContext`, `TransactionContext`, `BudgetContext`, `GoalContext`, `AuthContext` (PIN lock, separate from account auth), `AccountContext` (login/register/JWT), `SyncContext`, `SmartImportContext`.
- Local storage: AsyncStorage via a `src/storage/*` service layer — always the on-device source of truth, screens never call AsyncStorage directly.
- Backend: Node/Express/MongoDB (Mongoose) in `/server`, JWT auth, bcrypt password hashing, per-user scoped REST endpoints.
- Sync strategy: deliberately simple **last-write-wins** by per-record timestamp (`updatedAt`/`clientUpdatedAt`) — no merge UI, no JWT refresh/revocation, receipts never uploaded (local file URIs aren't portable).
- Smart Import: notification text is parsed with hand-written regex (no AI/ML), gated behind explicit user opt-in + Android's Notification Access permission, and always requires human review (Review & Save screen) before anything is saved.
- AI Financial Assistant (Phase 3): rule-based/on-device, no external API or keys — `src/utils/aiAssistant.ts` does keyword/intent matching and reuses the existing `calculations.ts` functions over `TransactionContext`/`BudgetContext` data, surfaced via a chat-style `AiAssistantScreen`. Chosen over an external LLM API to stay consistent with the app's offline-first, no-secrets-to-manage architecture (full trade-off discussion preserved in project history).
- Testing: no test framework existed in the frontend before Phase 3 — added `tsx` as a dev dependency so `npm test` can run TypeScript unit tests via Node's built-in test runner (`node --import tsx --test`), matching the backend's plain `node:test` convention without needing Jest/React Native Testing Library.
- Financial Health Score (Phase 5): rule-based, no AI/ML — `src/utils/healthScore.ts` combines savings rate, budget adherence, spending consistency, and goal progress into one score, cleanly excluding (not guessing) factors without enough data yet.
- What-If Simulator (Phase 6): pure recalculation, no new context/storage/persistence — `src/utils/whatIfSimulator.ts` reuses `calculations.ts`/`goalProgress.ts` to project a hypothetical category-spend/income change onto this month's balance, budget usage, and goal ETAs.
- **Visual/UX polish pass** (branding, theme, navigation restructure): new brand palette (deep navy background, teal→blue gradient accent) in `src/constants/theme.ts` (`brand`, `gradients`, `shadow` exports), applied via `expo-linear-gradient` (new dependency) to the primary `Button` variant, `Dashboard`'s balance card, `ProgressBar`'s gradient mode, and `InsightsHubScreen`'s icon badges — no `react-native-reanimated` added, deliberately, to avoid repeating this project's history of real native-dependency bugs; all animation (button press-scale, `ProgressBar` fill-in, `Skeleton` pulse) uses React Native's built-in `Animated` API. Screen transitions use native-stack's `animation: 'slide_from_right'` and bottom-tabs v7's built-in `animation: 'shift'` — both built-in, no extra library.
- **Navigation restructuring:** AI Assistant, Financial Goals, Health Score, and What-If Simulator moved out of Settings into a new dedicated `InsightsHubScreen` (stack screen, not a 6th bottom tab — 6 tabs would crowd a phone-width tab bar; the user's own fallback of "a prominent card-based section on Dashboard" was used instead), reached via a new gradient banner on `DashboardScreen`. `SettingsScreen` is back to account/preferences/PIN/logout only.

### Exact commands to run everything locally, right now
```bash
# 1. Backend — from the repo root
cd server
npm install                # only needed once / after pulling new backend deps
npm run dev:memory         # ephemeral in-memory MongoDB, zero setup, prints "Server listening on port 4000"
# (alternative: cp .env.example .env, fill in a real MONGODB_URI, then npm run dev)

# 2. Frontend — from the repo root, in a separate terminal
npx expo start --dev-client
```
- **Current `apiBaseUrl`:** `https://expense-tracker-6v8l.onrender.com` (a live, publicly-reachable
  backend deployed on Render's free tier), configured in [app.json](app.json) →
  `expo.extra.apiBaseUrl`, read by [src/services/apiClient.ts](src/services/apiClient.ts). This
  works from anywhere with internet access — no LAN/dev-machine dependency anymore. Note: Render's
  free tier spins the service down after ~15 min of inactivity and takes ~30–60s to wake on the next
  request — the app's "Sync Status" badge will show `syncing`/`offline` briefly during that cold
  start, which is expected. For fully local development instead (e.g. offline-capable iteration
  without waiting on Render), point `apiBaseUrl` at your dev machine's LAN IP and run the backend
  locally via `npm run dev:memory` as shown above — just remember to switch it back before building
  a release APK.
- **The backend does not start automatically** with the Expo dev client — `npm run dev:memory` (or
  `npm run dev`) must be run manually every time you want to test login/sync locally.
- First time only, build the dev client: `npm install -g eas-cli && eas login && eas build --profile development --platform android`.
- To eliminate the LAN-IP/firewall friction entirely, deploy the backend to Render (free tier) — see
  [server/README.md](server/README.md#deploying-to-render-free-tier) — and point `apiBaseUrl` at that
  stable public URL instead.
- **Frontend unit tests:** `npm test` (runs `node --import tsx --test src/**/__tests__/*.test.ts`) —
  currently covers the Phase 3 AI Assistant's intent-matching and answer generation (19 tests), the
  Phase 4 goal-progress calculation logic (6 tests), the Phase 5 health-score calculation logic
  (7 tests), the Phase 6 what-if simulation logic (8 tests), and the sync tombstone/payload-building
  logic behind the Delete Transaction bug fix (5 tests), 45 total.

### Known limitations & honest caveats (consolidated from every phase)
- **Combined device-testing pass is in progress, run directly by the user** (not step-by-step with
  the agent) on a real dev-client APK built via a successful `eas build --profile development
  --platform android`. One real bug has already been found and fixed this way: the Delete
  Transaction sync/tombstone bug (see Build Log above). See
  [Combined Device-Testing Plan](#combined-device-testing-plan) for the full proposed order/scope —
  update each phase's Build Log row to ✅ as it's confirmed working on-device.
- **The AI Financial Assistant (Phase 3) understands a fixed set of keyword patterns, not free-form
  natural language** — it's rule-based by design (no external LLM/API), so phrasing outside its
  known patterns (spend-by-category, budget status, income vs. expense, highest category, trend
  comparison, average spend, transaction count, balance) falls back to a helpful "try asking..."
  message rather than a real answer. See `src/utils/aiAssistant.ts` and its tests for the exact
  supported patterns.
- **Financial Goals (Phase 4) are manually funded, not auto-linked to transactions** — there is no
  "tag a transaction to a goal" flow; the user explicitly adds/removes funds via "+ Add Funds", and
  progress/on-track-vs-behind status is computed by comparing % saved to % of the goal's timeline
  elapsed (`src/utils/goalProgress.ts`) — a simple heuristic, not a rigorous forecast.
- **The What-If Simulator (Phase 6) only adjusts one category at a time plus an extra-income amount,
  and never persists anything** — goal-completion projections use a simplifying assumption (any
  projected monthly balance change is split evenly across active goals as extra contribution) that's
  explicitly documented in `src/utils/whatIfSimulator.ts`; it's a rough estimate, not financial advice.
- **Smart Transaction Import notification text formats are unverified** — regex patterns for Google
  Pay/PhonePe/Paytm are based on commonly documented phrasing, not a live capture from a real device.
  Full disclosure and device-testing steps: [Smart Transaction Import (device testing guide)](#smart-transaction-import-device-testing-guide).
- **`react-native-android-notification-listener` is a stale, ~4-year-unmaintained library** — its
  peer-dependency conflict with React 19 is resolved via a `package.json` `overrides` entry, and two
  further real build-breaking bugs (a stale nested Android Gradle Plugin declaration, and an
  `allowBackup` manifest merge conflict) were found and patched. All three verified safe and
  confirmed by a real successful EAS build. Full reasoning: [Dependency Notes](#dependency-notes).
- **`@expo/vector-icons` can silently pull in a duplicate, mismatched `expo-font` version** — this
  caused a real startup crash (`NoSuchMethodError` in `expo-font`'s native `FontLoaderModule`,
  before the login screen even renders) on the first Firebase-distributed build, root-caused via
  real `adb logcat` output and fixed with a `package.json` `overrides` entry pinning `expo-font` to
  the SDK54-correct version (`14.0.12`). See the Build Log row above. Worth re-checking with
  `npm ls expo-font` after any future dependency upgrade, since `npx expo install --check` alone did
  **not** catch this (it only checks top-level version pins, not duplicate/un-deduped nested copies).
- **The backend is now deployed publicly on Render's free tier** (`https://expense-tracker-6v8l.onrender.com`)
  — `apiBaseUrl` no longer points at a private LAN IP, so login/sync works from any network, not just
  the developer's own Wi-Fi. Verified via a real register→login round trip against the live MongoDB
  Atlas-backed database (not just a health check). The only caveat: Render's free tier spins the
  service down after ~15 min of inactivity, causing a ~30–60s cold-start delay on the next request
  (the "Sync Status" badge will briefly show `syncing`/`offline`) — expected on the free tier, not a
  bug. See [Build & Deployment](#-build--deployment) for the live URL and redeploy instructions.
- Camera receipt capture, native `Alert.alert` confirmation dialogs, and the native date picker are
  **code-reviewed only, not device-tested** (no Android emulator/physical device was available during
  initial development) — see the full disclosure in [Assumptions & Limitations](#assumptions--limitations).
- No JWT refresh token or server-side revocation — a token is valid until it expires (default 7 days,
  `JWT_EXPIRES_IN`); logging out only clears it from the device.
- Sync conflict resolution is **last-write-wins only** (by timestamp) — no manual merge UI; receipt
  photos are never uploaded/synced (local file URIs aren't portable off-device).
- Smart Spending Insights and the (still unbuilt) Financial Health Score are intended to be
  **rule-based, not ML/AI** — no external AI API is currently wired into this project.
- Currency is assumed to be ₹ (INR) throughout; no multi-currency support.
- PIN lock is a basic local-access gate (5-attempt/30-second lockout), not full at-rest encryption of
  stored data.

---

## 📋 Table of Contents

- [Objective](#objective)
- [Core Features](#core-features)
- [Bonus Features (Recruiter-Impact Additions)](#bonus-features-recruiter-impact-additions)
- [Tech Stack](#tech-stack)
- [App Screens](#app-screens)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Build (expo-dev-client)](#development-build-expo-dev-client)
- [Backend Setup & Sync](#backend-setup--sync)
- [Smart Transaction Import (device testing guide)](#smart-transaction-import-device-testing-guide)
- [Combined Device-Testing Plan](#combined-device-testing-plan)
- [Dependency Notes](#dependency-notes)
- [Build & Deployment](#build--deployment)
- [Code Quality Standards](#code-quality-standards)
- [Assumptions & Limitations](#assumptions--limitations)
- [Deliverables Checklist](#deliverables-checklist)

---

## 🎯 Objective

This assessment evaluates practical React Native development skills, project structuring, problem-solving ability, and code quality. Evaluation is not just on whether the app *works*, but on how the codebase is organized, how forms and local persistence are handled, how application state is managed, and whether a complete mobile app is delivered within **48 hours**.

---

## ✅ Core Features

### 1. Splash Screen
Simple branded splash screen that auto-navigates to the main app after ~2 seconds.

### 2. Dashboard / Home Screen
Quick financial overview showing:
- Total balance
- Total income
- Total expenses
- Recent transactions list
- Values update automatically based on stored entries

### 3. Add / Edit Transaction Screen
Form to create or edit a transaction with fields:
- Title / Transaction Name *(required)*
- Amount *(required, numeric)*
- Type: Income or Expense *(required)*
- Category *(required)* — Salary, Food, Travel, Shopping, Bills, Entertainment, Other
- Date *(required)*
- Notes / Description *(optional)*
- Full field validation included

### 4. Transaction List Screen
Clean list view of all transactions showing Title, Amount, Type, Category, and Date, with:
- View full details
- Edit transaction
- Delete transaction

### 5. Transaction Details Screen
Full detail view (title, amount, type, category, date, notes) with edit/delete actions.

### 6. Search & Filter
- Search transactions by title
- Filter by type (Income / Expense)
- Filter by category
- *(Optional)* Filter by date range, sort by latest/oldest/highest amount

### 7. Summary Screen
- Total income
- Total expenses
- Current balance
- Number of transactions
- *(Optional)* Category breakdown / visual chart

### 8. Local Data Persistence
All data stored locally via **AsyncStorage** (or equivalent), persisting across app restarts.

---

## 🌟 Bonus Features (Recruiter-Impact Additions)

Beyond the required scope, the following 7 enhancements were added to elevate the app from a basic tracker into a portfolio-grade personal finance tool:

| # | Feature | Highlights |
|---|---------|-----------|
| 1 | **Smart Analytics Dashboard** | Expense breakdown by category, income vs. expense chart, monthly spending trend, highest spending category, average spending, transaction count |
| 2 | **Budget Management** | Set a monthly budget with live spent/remaining tracking, per-category budgets (Food, Shopping, Travel, etc.), and near-limit/exceeded warnings |
| 3 | **Smart Spending Insights** | Rule-based analytics engine that auto-generates insights (e.g. "You spent ₹1,250 more on Food this month", "Expenses decreased by 14%", "Shopping is your highest category") — no AI API required, fully explainable logic |
| 4 | **Dark Mode + Theme System** | Light / Dark / System Default modes via a reusable theme system (Settings → Appearance) — no hardcoded colors |
| 5 | **Export & Backup Transactions** | Export data as CSV/JSON, share/save the file, and re-import to restore — full Track → Export → Backup → Restore flow |
| 6 | **PIN App Lock** | First-time PIN creation, PIN entry to unlock, and Settings to enable/disable or change PIN — stored locally |
| 7 | **Receipt Attachment** | Attach a photo (camera or gallery) to any transaction, visible in the transaction details view |

> These are designed to visibly strengthen the submission against the assessment's own optional bonus list (charts, category summaries, dark mode, better UX) while remaining achievable within the 48-hour window.

---

## 🛠 Tech Stack

- **Framework:** React Native (Expo, SDK 54, expo-dev-client / EAS Dev Build)
- **Language:** TypeScript (strict mode)
- **Navigation:** React Navigation (Native Stack + Bottom Tabs)
- **State Management:** React Context API (Theme, Transactions, Budget, Auth/PIN, Account, Sync, SmartImport)
- **Local Storage:** AsyncStorage (wrapped in a `src/storage` service layer) — always the on-device source of truth
- **Backend:** Node.js + Express + MongoDB (Mongoose), JWT auth, see [server/README.md](server/README.md)
- **Offline Sync:** `@react-native-community/netinfo` connectivity detection + last-write-wins push/pull sync
- **Smart Transaction Import:** `react-native-android-notification-listener` (Android-only, requires expo-dev-client) + hand-written regex parsing
- **Forms & Validation:** React Hook Form + Zod
- **Charts:** react-native-chart-kit
- **Icons:** @expo/vector-icons
- **File Export/Share:** expo-file-system + expo-sharing + expo-document-picker
- **Image Picker (Receipts):** expo-image-picker
- **Secure PIN Storage:** expo-secure-store

---

## 📱 App Screens

1. Splash Screen
2. Login / Register Screens
3. Dashboard / Home Screen
4. Add / Edit Transaction Screen
5. Transaction List Screen
6. Transaction Details Screen
7. Summary Screen
8. Smart Analytics Dashboard *(bonus)*
9. Budget Management Screen *(bonus)*
10. Settings → Appearance (Theme) *(bonus)*
11. Settings → Export/Import Data *(bonus)*
12. PIN Lock / Create PIN Screen *(bonus)*
13. Settings → Smart Transaction Import (review detected UPI payments) *(bonus)*

---

## 📂 Project Structure

```
expense-tracker/
├── assets/                  # Images, fonts, icons, splash/logo
├── src/
│   ├── components/          # Reusable UI components (buttons, cards, inputs)
│   ├── screens/              # All screen components
│   │   ├── Splash/
│   │   ├── Dashboard/
│   │   ├── Transactions/
│   │   ├── Summary/
│   │   ├── Analytics/
│   │   ├── Budget/
│   │   └── Settings/
│   ├── navigation/           # React Navigation stacks/tabs
│   ├── context/               # Global state (theme, budget, transactions)
│   ├── storage/               # AsyncStorage service layer (CRUD abstraction)
│   ├── utils/                  # Formatters, validators, insight-generation logic
│   ├── constants/              # Categories, colors, theme tokens
│   └── types/                    # TypeScript types/interfaces
├── App.tsx
├── app.json
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`) or use `npx expo`
- **A custom dev client build (not Expo Go)** — see [Development Build (expo-dev-client)](#-development-build-expo-dev-client-not-expo-go) below. Required because this app uses native modules (Android notification listener) that Expo Go cannot support.

### Installation
```bash
git clone <repository-url>
cd expense-tracker
npm install
```

### Running the App
```bash
npx expo start
```
Scan the QR code with your installed **dev client** app (not the Expo Go app), or press `a` for Android emulator / `i` for iOS simulator.

---

## Development Build (expo-dev-client)

This project depends on native modules that **Expo Go cannot load** (currently the
Android notification listener planned for Smart Transaction Import). It uses
[`expo-dev-client`](https://docs.expo.dev/develop/development-builds/introduction/)
instead — a custom build of the app shell that behaves like Expo Go but includes
your native dependencies.

### One-time setup
```bash
npm install -g eas-cli
eas login
```

### Build a dev client and install it on your device
```bash
eas build --profile development --platform android
```
This uses the `development` profile already configured in `eas.json`
(`developmentClient: true`, internal APK distribution). When the build finishes,
EAS gives you a QR code / link — scan it or open the link on your Android device to
install the APK directly (no Play Store needed).

> First build takes several minutes on EAS's servers. Subsequent builds are only
> needed when you add/change a **native** module (not for plain JS/TS changes).

### Day-to-day development after that
```bash
npx expo start --dev-client
```
Open the installed dev client app on your device — it will connect to this Metro
server automatically (same network), or scan the QR code shown in the terminal.
From then on, all your JS/TS changes hot-reload instantly, same as Expo Go.

### If you don't want a native notification listener yet
You can keep using plain Expo Go for everything **except** the Smart Transaction
Import feature — all other features (backend sync, PIN lock, receipts, budgets,
analytics, etc.) work in Expo Go. Only build/install the dev client once you're
ready to test notification listening on a real device.

---

## Backend Setup & Sync

The app is **offline-first**: AsyncStorage on-device is always the source of truth,
and works fully without any backend or account. Logging in additionally backs up
and syncs your data to a small Node/Express/MongoDB API so it's available across
devices. Full backend docs (env vars, API reference, Render deployment steps):
**[server/README.md](server/README.md)**.

Quick start:
```bash
cd server
npm install
cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET
npm run dev
```
Or, to try it instantly with no MongoDB install (ephemeral, in-memory database):
```bash
cd server
npm install
npm run dev:memory
```

Point the app at your backend by editing `apiBaseUrl` in `app.json` → `expo.extra`
(defaults to `http://localhost:4000` for local development). On a physical device,
use your computer's LAN IP instead of `localhost` (e.g. `http://192.168.1.42:4000`),
since `localhost` on the phone refers to the phone itself.

### Sync model
- Every local transaction/budget carries its own last-modified timestamp.
- On sync, the server keeps whichever version (local or server) is newer —
  simple **last-write-wins**, no manual conflict resolution UI.
- A **Sync Status** badge (Dashboard) shows `Synced` / `Syncing…` / `Offline` / `Sync failed`.
- Receipt photos are local file URIs and are **not** uploaded/synced.

---

## Smart Transaction Import (device testing guide)

> ⏸️ **Testing status: in progress, paused at step 2/10.** Steps 1-2 below have passed on a real
> device (Enable toggle works cleanly; permission status correctly read "Not granted"). Testing was
> paused there because it was being run in plain **Expo Go**, which cannot load this feature's native
> module — the "Open Notification Access Settings" deep-link step needs the real dev-client APK to
> be meaningfully tested. **Resume from step 1** once a fresh `eas build --profile development
> --platform android` is installed (see [Development Build](#development-build-expo-dev-client)).

**Android only.** Reads incoming payment notifications from Google Pay, PhonePe, and Paytm to
suggest transactions — nothing is ever saved without you reviewing it first on the
Review & Save screen. Requires the [dev-client build](#development-build-expo-dev-client)
(Expo Go cannot load this native module) and Android's system-level Notification Access permission.

### ⚠️ Honest disclosure: what's verified vs. not
- **Code-reviewed, NOT device-tested:** the entire native notification-capture path (permission
  request/deep-link, the headless JS task receiving real notifications, end-to-end detection on
  a real device). This genuinely cannot be exercised in the sandbox this was built in — there's no
  Android device or UPI app available there.
- **Verified via source inspection** (not guessing): the library's exact JS API
  (`getPermissionStatus()`, `requestPermission()`, headless task registration) and its exact
  notification payload shape (`app`, `text`, `bigText`, `time`) were confirmed by reading
  `react-native-android-notification-listener`'s own Java source and `.d.ts`/`.js` files directly.
  Its AndroidManifest is self-contained (declares the `NotificationListenerService` itself), so no
  custom Expo config plugin was needed — also confirmed by reading the file, not assumed.
- **Regex-tested, NOT verified against real notifications:** the parsing patterns for Google Pay /
  PhonePe / Paytm text were run against 9 hand-written sample strings (all passing, two real regex
  bugs found and fixed this way — see repo history) — but those sample strings are based on commonly
  documented UPI notification phrasing, **not a live capture from a real device in this session**.
  Actual current notification text can differ by app version, bank, and language. This is exactly
  why the Review & Save screen exists: even a wrong/partial parse just pre-fills a normal editable
  form, it never silently creates a transaction.
- **Known compatibility risk:** `react-native-android-notification-listener`'s last real code
  release was ~4 years ago and its `package.json` still declares a `react@^18.0.0` peer dependency
  (this project uses React 19) — resolved via an npm `overrides` entry, see
  [Dependency Notes](#dependency-notes) for why this is safe. The library may still need patching
  or replacing if it doesn't build/run cleanly against current Android/React Native versions.

### What to test on your device, step by step
1. Build and install the dev client (see [Development Build](#development-build-expo-dev-client)), then `npx expo start --dev-client`.
2. In the app: **Settings → Smart Transaction Import**. Read the consent explanation, toggle
   **Enable Smart Import** on.
3. Tap **Open Notification Access Settings** — confirm it deep-links to Android's system
   "Notification access" settings screen (not just a generic settings page).
4. Grant access to this app in that screen, return to the app, and confirm the "Notification
   access" status changes from "Not granted" to **"Granted"**.
5. Make a real, small payment (or trigger a test payment/request) using each of:
   - **Google Pay** (package `com.google.android.apps.nbu.paisa.user`)
   - **PhonePe** (package `com.phonepe.app`)
   - **Paytm** (package `net.one97.paytm`)
6. Go back to **Settings → Smart Transaction Import** — a detected transaction should appear
   under "Detected Transactions" with an amount, a guessed merchant name, and a category.
   **Compare it against the actual notification text** (pull down the notification shade to see
   the original wording) — note any mismatch (this tells us which regex pattern needs adjusting).
7. Tap **Review** on a detected item — confirm it opens **Add Transaction** pre-filled with a
   "Detected from a payment notification" banner, editable fields, and requires an explicit
   **Add Transaction** tap to save (it must never save by itself).
8. Tap **Dismiss** on a different detected item — confirm it's removed from the list without
   creating a transaction.
9. Turn **Enable Smart Import** off — confirm no new detections appear after that, even if you
   make another payment.
10. Optional: force-close the app entirely, make a payment, then reopen the app — the
    notification listener runs as a background/headless service, so a detection should still
    appear even though the app wasn't in the foreground when the payment happened.

If step 6 shows garbled/incorrect merchant names or wrong amounts for your specific bank/app
version, that's expected given the disclosure above — let me know the actual notification text
(with amounts redacted if you prefer) and the regex patterns in
`src/utils/upiNotificationParser.ts` can be corrected to match.

---

## Combined Device-Testing Plan

All 6 phases are code-complete, unit-tested (45/45), and bundle-verified. **Step 1 is done** — a real
dev-client APK now builds successfully (after fixing two real Gradle/manifest bugs, see
[Dependency Notes](#dependency-notes)) and has been installed on the test device. **Steps 2-7 are in
progress**, being run directly by the user on that APK (not step-by-step with the agent) — the user
reports back only if something breaks. This is the proposed order, grouped so the
build/permission-heavy items happen first:

1. ✅ **Rebuild the dev-client APK** (`eas build --profile development --platform android`) — done;
   build succeeded after fixing the nested-buildscript AGP conflict and the `allowBackup` manifest
   merge conflict (see [Dependency Notes](#dependency-notes)).
2. **Phase 2 — Smart Transaction Import**: resume from step 1 of the
   [device testing guide](#smart-transaction-import-device-testing-guide) (currently paused at step
   2/10) — enable, grant permission, make real UPI payments in Google Pay/PhonePe/Paytm, review
   detected transactions.
3. **Device-only gaps carried over from earlier**: `Alert.alert` confirmation dialogs (delete
   transaction ✅ tested — found & fixed a real sync bug in the process; disable PIN, logout still
   to confirm) and the native date picker (Android modal / iOS inline) — quick checks, no new builds
   needed.
4. **Phase 3 — AI Financial Assistant**: resume from step 1/4 (open the screen, layout check), then
   try 2-3 suggested-question chips and a free-typed question, confirm keyboard behavior.
5. **Phase 4 — Financial Goals Planner**: create a goal, edit it, add funds via "+ Add Funds",
   confirm progress bar/status label (on-track/behind/overdue/completed) update correctly, delete a
   goal.
6. **Phase 5 — Financial Health Score**: open the screen with real data present (transactions,
   budget, goals from steps above) and confirm the score/band and per-factor breakdown render and
   make sense against that data.
7. **Phase 6 — What-If Simulator**: adjust a category percentage and extra income, confirm the
   projected balance/budget/goal-ETA figures update live and look correct against the real data.

Steps 2-7 all reuse the same populated account/data from earlier steps rather than starting fresh
each time, so goal/budget/health-score/what-if figures are checking against consistent real numbers.

---

## Dependency Notes

### `react-native-android-notification-listener` peer-dependency override
`package.json` contains:
```jsonc
"overrides": {
  "react-native-android-notification-listener": {
    "react": "$react"
  }
}
```
**Why this exists:** the library's own `package.json` declares `peerDependencies.react: "^18.0.0"`
(last touched ~4 years ago), which conflicts with this project's React 19 and makes a plain
`npm install` fail with an ERESOLVE error.

**Why it's safe:** this was verified, not assumed — the installed package has **no runtime
`dependencies` on `react` at all** (react only appears in its `peerDependencies`/`devDependencies`),
and a full source search of the installed package turned up **zero imports/requires of `react`**
anywhere in its code. It only calls React Native's own stable native-module APIs (`NativeModules`,
`NativeEventEmitter`, `AppRegistry.registerHeadlessTask`), which are unaffected by the React 18→19
change. The override simply tells npm "resolve this package's `react` peer dependency to whatever
version is already installed at the project root" instead of enforcing the library's stale range —
it changes nothing about the library's actual code.

If a future `npm install` reintroduces an ERESOLVE error here, first re-check whether a newer
version of the library has been released with an updated peer-dependency range before assuming the
override is still needed.

### `react-native-android-notification-listener` broken Gradle config (patched)
`patches/react-native-android-notification-listener+5.0.1.patch` (applied automatically via
`postinstall`: `patch-package`, a new dev dependency) removes a nested `buildscript { ... }` block
from the library's own `android/build.gradle` that pinned **Android Gradle Plugin 4.2.1** (from
~2021) and an unrelated `com.google.code.gson:gson` classpath entry.

**Why this exists:** a real EAS dev-client build (`eas build --profile development --platform
android`) failed with an opaque "Gradle build failed with unknown error." Reading the library's
`android/build.gradle` directly (not guessing) found a subproject `buildscript` block redeclaring
its own old AGP version — a well-known anti-pattern in old React Native library templates that
conflicts with the modern AGP version (8.x, resolved via the root project) this project actually
builds with.

**Why it's safe:** the removed `com.google.code.gson:gson` classpath entry was in the wrong place
anyway (`buildscript.dependencies` is for Gradle *plugins*, not app dependencies) — the library's
real `dependencies { implementation 'com.google.code.gson:gson:2.8.6' }` block (used by its actual
Java code) is untouched and still present. Verified via a clean `node_modules` + lockfile reinstall
that the patch auto-applies (`patch-package` logs `react-native-android-notification-listener@5.0.1
✔`), `tsc --noEmit` clean, and 45/45 unit tests passing.

If this library is ever upgraded or replaced, check whether the new version still has this same
nested-buildscript issue before assuming the patch is still needed (`patch-package` will fail loudly
on `npm install` if the patch no longer applies cleanly, which is a useful signal here).

### `react-native-android-notification-listener` `allowBackup` manifest merge conflict (patched)
Even after the Gradle plugin fix above, the EAS build still failed — a **second, separate** real bug.
`plugins/withAllowBackupOverride.js` (a small custom Expo config plugin, registered in `app.json` →
`plugins`) adds `tools:replace="android:allowBackup"` to the app's `<application>` manifest tag
during prebuild.

**Why this exists:** the actual Gradle error (found by fetching the build's signed log URL directly —
`eas build:view <id> --json` exposes a short-lived `logFiles` URL that doesn't require browser login,
unlike the Expo dashboard build page) was:
```
Manifest merger failed : Attribute application@allowBackup value=(true) from AndroidManifest.xml
is also present at [:react-native-android-notification-listener] AndroidManifest.xml value=(false).
Suggestion: add 'tools:replace="android:allowBackup"' to <application> element to override.
```
The library's own `AndroidManifest.xml` hard-codes `android:allowBackup="false"`, which conflicts
with this app's `allowBackup="true"` (Expo/RN's default) — Android's manifest merger refuses to pick
a winner automatically and fails the whole build.

**Why it's safe:** this only affects Android's Auto Backup feature (whether app data is included in
Android's automatic cloud backup) — this project already keeps its own explicit backup/restore rules
(`secure_store_backup_rules.xml` / `secure_store_data_extraction_rules.xml`, visible in the merged
manifest) for `expo-secure-store`, so `allowBackup="true"` with those explicit rules is intentional
and unaffected by this override; it simply tells the manifest merger "use the app's value, not the
library's" as Android's own error message suggested. Verified by running `expo prebuild` locally and
confirming the generated `android/app/src/main/AndroidManifest.xml` has both `xmlns:tools` declared
and `tools:replace="android:allowBackup"` present, then confirmed end-to-end with a real EAS build
that completed successfully.

**Both fixes together were confirmed** by a real `eas build --profile development --platform android`
completing successfully (not just locally simulated) — see the Build Log entry for the exact
resolution.

---

## 📦 Build & Deployment

### Live backend
**Public URL:** https://expense-tracker-6v8l.onrender.com — deployed on Render's free tier, backed by
a free MongoDB Atlas M0 cluster. Health check: `GET /health` → `{"status":"ok"}`. Verified with a
real register→login round trip against the live database (not just the health check). Repo deployed
from: [github.com/techWithKeerthana/expense-tracker](https://github.com/techWithKeerthana/expense-tracker)
(Render's Root Directory is set to `server`, Build Command `npm install`, Start Command `npm start`).

> **Cold starts:** Render's free tier spins the service down after ~15 min of inactivity and takes
> ~30–60s to wake on the next request — the app's "Sync Status" badge will briefly show
> `syncing`/`offline` during that window. This is expected on the free tier, not a bug.

### Latest recruiter-ready build
**Tester install link (Firebase App Distribution):** https://appdistribution.firebase.google.com/testerapps/1:370095400849:android:0d82571df794f85efd9c30/releases/47bj3uigk5q38?utm_source=firebase-tools

This is a standalone `preview`-profile APK (see below), now configured with `apiBaseUrl` pointing at
the **live public Render backend** above (no longer a private LAN IP), uploaded to **Firebase App
Distribution** and shared with a tester (`keerthanamgowda05@gmail.com`). **This is the third
distributed build** — the first crashed on open (`expo-font` duplicate, fixed), the second opened
fine but login failed (LAN-IP backend, now fixed). Login/sync should now work from any network.

> **Why Firebase App Distribution instead of the raw `expo.dev` build link:** installing a raw
> sideloaded APK directly (e.g. via the `expo.dev` build page) triggers an aggressive Google Play
> Protect block on some devices that offers no "Install anyway" option at all, making the app
> effectively uninstallable for testers. Firebase App Distribution routes installation through the
> **Firebase App Tester** app (a normal, Play Store-published app) — testers install that once, then
> install this app through it, without hitting the raw-APK Play Protect block. The old raw
> `expo.dev` build link (below, under "Generating the APK") still works for anyone comfortable
> tapping through the Play Protect warning themselves.
>
> **Re-distributing after a rebuild:** re-run `eas build -p android --profile preview`, download the
> new APK, then run:
> ```bash
> npx firebase-tools appdistribution:distribute <path-to-apk> \
>   --app "1:370095400849:android:0d82571df794f85efd9c30" \
>   --release-notes "<what changed>" \
>   --testers "keerthanamgowda05@gmail.com" \
>   --project expense-tracker-distribu-89fbe
> ```
> This prints a fresh tester link — update it here.

### Generating the APK (Expo)
```bash
eas build -p android --profile preview
```
_(Requires an `eas.json` build profile and an Expo account — `eas login` first.)_

This produces a standalone, self-contained **APK** (the JS bundle is baked in — it does **not**
require a laptop/Metro server running, unlike the `development` profile used during active
development). Use `preview`, not `production`, when you need a directly-installable file/link to
hand to someone else (e.g. a recruiter): `production` builds an **AAB** (Android App Bundle) meant
for Play Store submission, which isn't directly installable on a device without extra tooling.

> **Installing on a device you don't control (e.g. a recruiter's phone):** Android will show a
> **"Play Protect"/"Unrecognized app"** warning when installing this APK — this is normal and
> expected for **any** sideloaded Android app that isn't distributed through the Play Store, not a
> reflection of a problem with the app itself. Tap **"Install anyway"** (wording varies slightly by
> Android version) to proceed.

Alternatively, for a local build:
```bash
npx expo prebuild
cd android && ./gradlew assembleRelease
```

The generated APK will be available at:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 🧹 Code Quality Standards

- Meaningful naming conventions throughout
- Reusable, composable components
- Logical, feature-based folder structure
- No unnecessary code duplication
- Proper use of React hooks and state (no prop-drilling where Context fits better)
- Clear separation of UI, business logic, and storage layers

---

## ⚠️ Assumptions & Limitations

- All transaction/budget data is stored **locally on-device first** (AsyncStorage); a backend account
  gates access to the Dashboard (Login/Register screen) and enables optional cross-device backup/sync,
  but the device remains fully usable offline once logged in.
- Currency is assumed to be ₹ (INR) by default; not currently multi-currency.
- Smart Spending Insights use rule-based logic (month-over-month comparisons), not ML/AI.
- PIN lock is a basic local-access gate (with a 5-attempt / 30-second lockout), not full encryption of stored data.
- **Sync is intentionally simple last-write-wins** (by timestamp) — there is no merge UI for real conflicts,
  and receipt photos are never uploaded (local file URIs aren't portable off-device).
- The JWT auth has no refresh-token flow or server-side revocation list — a token is valid until it expires
  (`JWT_EXPIRES_IN`, default 7 days); logging out only clears it from the device.
- **Testing environment note:** this app was built and functionally verified by running it live via
  `npx expo start --web` in a browser (real AsyncStorage persistence, navigation, forms, charts, PIN
  lock lifecycle, budget warnings, theme switching, and CRUD flows were all clicked through and the
  underlying math/logic double-checked). The backend + sync flow (register, login, push/pull sync,
  offline/error states, logout) was also verified live against a real running Express server (backed by
  an ephemeral in-memory MongoDB for this test) — not just code review; see the project's development
  history for the exact steps. A physical Android device (with the dev client installed) has since
  become available and was used to verify some of the items below — status updated accordingly:
  - **Camera receipt capture** — ✅ **device-tested and confirmed working**: permission prompt,
    camera capture, thumbnail preview, and the permission-denied fallback message all verified on a
    real Android device.
  - **Native confirmation dialogs** (`Alert.alert` for delete transaction / disable PIN / logout — renders
    nothing in a browser) — ⚠️ still code-reviewed only, **not yet device-tested** (intentionally
    paused mid-session to prioritize Phase 3; resume before final submission).
  - **Native date picker** (`@react-native-community/datetimepicker` — has no web UI; Android uses a modal
    dialog, iOS uses an inline calendar with a "Done" button to dismiss it) — ⚠️ still code-reviewed
    only, **not yet device-tested** (same as above).
  - **Smart Transaction Import / notification listener** — fully implemented and regex-tested;
    device testing has **started but is paused at step 2/10** (Enable toggle + permission-status
    read both confirmed working) because the tester was running plain Expo Go instead of the
    required dev-client build. See the dedicated
    [Smart Transaction Import (device testing guide)](#smart-transaction-import-device-testing-guide)
    section for exact resume steps, and which notification formats were verified via source-code
    inspection vs. best-effort regex guesses.

---

## 📤 Deliverables Checklist


- [ ] Git repository link with complete source code
- [ ] APK file or downloadable APK link
- [ ] README.md with setup instructions, tech stack, assumptions, and APK build steps
- [ ] All core functional requirements implemented
- [ ] Bonus features implemented (as many as time allows)
- [ ] App tested on at least one physical device / emulator

---

## 📝 Evaluation Criteria (For Reference)

- App functionality and correctness
- React Native fundamentals
- Form handling and validation
- Local storage and state management
- Code quality and maintainability
- App structure, UI consistency, and delivery quality
- APK generation and repository completeness
