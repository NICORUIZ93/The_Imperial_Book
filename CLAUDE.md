# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The_Imperial_Book is a Spanish-language academy for cloud/dev learning. The official product is an
Angular app (`web/`) that renders 14 curriculum tracks (236 modules, 983 topics) authored as
Markdown lessons in `web/public/content/<track>/modulo-N.md`. Progress is stored client-side in
`localStorage` — there are no quizzes, XP, or badges. Each specialization track has an integrator
project; `RutaFlow` (`examples/rutaflow/`) is a cross-cutting logistics project that ties tracks
together, and `Fundamentos` prepares the base track.

A large fraction of the repo is not app code: `scripts/` contains Python validators/auditors that
enforce editorial and structural invariants between the Angular track definitions
(`web/src/app/tracks/*.track.ts`) and the Markdown content directories, plus `docs/*.json` reports
these scripts generate/check.

## First step for any repo exploration

Read `docs/repo-graph.md` (or `docs/repo-graph.json` for tooling) before grepping/globbing the
repo — it's a generated index of files, symbols, imports, and headings meant to replace repeated
exploration. Regenerate it after structural changes:

```bash
python3 scripts/build_repo_graph.py
python3 scripts/build_repo_graph.py --check   # verify it's in sync (CI-equivalent)
```

## Commands

Angular app (run from `web/`):

```bash
npm ci
npm start                       # ng serve, http://localhost:4200
npm run build --silent          # ng build
npm test -- --watch=false       # unit tests (Karma/Jasmine)
npm run e2e                     # playwright test (full learning journeys)
```

Single unit test / single e2e test:

```bash
cd web && npx ng test --watch=false --include='**/course-data.spec.ts'
cd web && npx playwright test e2e/academy.spec.ts -g "test name"
```

Repository-wide validation (Python, run from repo root, requires no venv setup beyond stdlib):

```bash
./scripts/validate.sh
```

This single entrypoint chains: an inline Node check (tracks ↔ content dir module-count parity,
required Mermaid diagrams in cloud modules) + `validate_pedagogy.py`, `validate_curriculum.py`,
`validate_official_sources.py`, `validate_official_learning_paths.py`,
`validate_floci_official_curriculum.py`, `validate_code_quality.py`, `validate_rutaflow.py`,
`validate_requested_master_topics.py`, `validate_learning_priorities.py`, plus `--check` runs of
the audit/build scripts (`audit_topic_learning_quality.py`, `audit_seven_step_methodology.py`,
`audit_code_visual_quality.py`, `build_editorial_backlog.py`, `build_web_topic_index.py`,
`build_prerequisite_graph.py`, `build_repo_graph.py`). Run this before committing changes that
touch track definitions, Markdown lessons, or `docs/*.json`.

Official source freshness check (expires after 120 days, also runs monthly in CI regardless of
changes):

```bash
python3 scripts/validate_official_sources.py
```

Local infra for hands-on AWS/Azure/GCP examples — either `floci-cli` (`floci start` / `floci stop`
/ `floci doctor`) or `docker compose up -d` (ports 4566/4577/4588; StackPort UI on 8080). See
README.md for full commands.

CI (`.github/workflows/ci.yml`) runs: `npm ci` → `npm run build` → `npm test` → Playwright install
+ `npm run e2e` → `./scripts/validate.sh` → `python3 scripts/fix_lessons.py` (mojibake/text-quality scan
over docs, scripts and the Angular app source).

## Architecture

**Track data flow.** Each track's metadata (modules, topics, ordering) is defined in
`web/src/app/tracks/<track>.track.ts` and aggregated in `web/src/app/course-data.ts` (the most
connected file in the app — imported by nearly everything). The actual lesson prose lives
separately as Markdown in `web/public/content/<track>/modulo-N.md` and is fetched/rendered at
runtime by `content.service.ts` (using `marked`). These two representations (TS module metadata vs.
Markdown files) must stay in exact 1:1 count correspondence per track — this is what
`scripts/validate.sh`'s inline Node check enforces, and why adding/removing a module requires
touching both the track file and its content directory.

**Reading path.** Routing (`app.routes.ts`) sends users through `catalog/course-catalog.ts` (track
picker) → `course/course-shell.ts` (per-track shell, sidebar, progress) →
`course/lesson-viewer.ts` (renders one module's Markdown, table of contents, project bootstrap
callouts). `progress.service.ts` persists completion to `localStorage`. `command-palette.ts` +
`topic-index.service.ts` provide cross-track search over topic titles.

**Editorial quality pipeline (Python, `scripts/`).** A set of `audit_*.py` scripts read the
Markdown content and score topics against editorial contracts defined in `docs/editorial-contract.md`
and `docs/METODOLOGIA-DE-APRENDIZAJE.md` (concrete outcome, exact file/folder, commented code,
runnable command, an intentional failure + diagnosis, a small student exercise, a RutaFlow
increment). Their JSON output feeds human-readable reports in `docs/` (e.g.
`topic-learning-quality.md`/`.json`, `code-visual-quality.md`/`.json`,
`seven-step-methodology.md`/`.json`, `editorial-backlog.md`). These are measurements, not content
generators — a topic appearing in the index/UI does not mean it satisfies the editorial contract;
the audits measure the real Markdown separately. When editing lesson content, re-run the relevant
`audit_*.py --check` (or the full `validate.sh`) rather than assuming the catalog entry is
sufficient.

**Code standard.** `docs/ESTANDAR-DE-CODIGO.md` defines the cross-language code standard every
lesson's example code must follow (correctness, clarity, cohesion, visible dependencies, explicit
errors, verifiability, simplicity — Clean Code/SOLID applied with judgment, not dogmatically).
Apply this standard to example code across `examples/{node,python,java,go,rust}/` and inline
lesson code blocks.

**`examples/`** holds standalone runnable snippets per language (Node, Python, Java, Go, Rust)
demonstrating AWS-style operations against the local Floci stack, plus `examples/rutaflow/` for the
cross-track integrator project. These are referenced from lessons but are not part of the Angular
build.
