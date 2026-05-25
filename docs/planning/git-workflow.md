# Git Workflow — Media Asset Manager

> Version: 1.0
> Status: Draft
> Stage: 4 — Implementation Planning
> Last Updated: 2026-05-19

---

## 1. Overview

This is a solo project with AI-assisted development. The git workflow is intentionally lightweight — enough structure to maintain a clean history and safe rollback points without the overhead of a multi-developer process.

---

## 2. Branching Strategy

### Primary Branches

| Branch | Purpose |
|---|---|
| `main` | Stable, releasable code. Always reflects the latest approved state. |
| `dev` | Active development branch. Features are merged here first. |

### Feature Branches

Created from `dev` for each sprint or significant feature:

```
dev
 └── feature/drive-management
 └── feature/indexing-engine
 └── feature/thumbnail-generation
 └── feature/video-player
 └── feature/markers
 └── fix/fingerprint-null-edge-case
```

**Naming convention:**
- `feature/{short-description}` — new functionality
- `fix/{short-description}` — bug fixes
- `chore/{short-description}` — tooling, dependencies, config
- `docs/{short-description}` — documentation only

### Branch Lifecycle

```
1. Create: git checkout -b feature/drive-management dev
2. Develop: commit frequently with meaningful messages
3. Merge to dev: git checkout dev && git merge --no-ff feature/drive-management
4. Delete branch: git branch -d feature/drive-management
5. Merge dev to main at sprint completion or milestone
```

---

## 3. Commit Message Convention

Format: `<type>(<scope>): <description>`

### Types

| Type | When to use |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `chore` | Build, tooling, dependency changes |
| `docs` | Documentation changes only |
| `test` | Adding or updating tests |
| `refactor` | Code change that is not a fix or feature |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace — no logic change |

### Scopes (optional but recommended)

`drive`, `indexer`, `hasher`, `metadata`, `thumbnails`, `player`, `markers`, `tags`, `search`, `settings`, `db`, `ui`, `api`

### Examples

```
feat(drive): implement real-time drive connection detection
feat(indexer): add SHA256 partial hash fingerprinting
feat(player): add video timeline scrubber with marker overlay
fix(hasher): handle files smaller than 128KB correctly
fix(db): prevent orphan assets when drive removal is cancelled
chore(ffmpeg): bundle FFmpeg 7.1 static binaries for all platforms
docs(adr): add ADR-011 serialized indexing decision
test(hasher): add unit tests for partial hash boundary conditions
refactor(indexer): extract metadata extraction to dedicated module
```

### Body (optional)

For complex changes, add a body after a blank line:

```
feat(indexer): implement incremental re-index logic

Skip files where size and modification date match existing location
record. Files that pass the check still get a full partial hash
computed. All assets retain a populated fingerprint.

Refs: FR-15, ADR-004
```

---

## 4. Traceability in Commits

When a commit implements a requirement, reference it in the commit body:

```
feat(markers): implement in/out clip marker creation

Refs: FR-81, FR-82, FR-83, US-27
```

This maintains traceability between git history and the requirements documents.

---

## 5. Tagging Strategy

Tags mark significant versions:

```bash
# Development builds (after each sprint completion)
git tag v0.1.0 -m "Sprint 1 complete — project scaffolding"
git tag v0.2.0 -m "Sprint 2 complete — drive management"

# Release candidate
git tag v0.9.0 -m "Release candidate — all features complete"

# MVP release
git tag v1.0.0 -m "Version 1.0.0 — MVP release"

# Push tags
git push origin --tags
```

---

## 6. Merge Strategy

- Use `--no-ff` (no fast-forward) when merging feature branches to `dev` — preserves branch history
- Use fast-forward when merging `dev` to `main` at clean sprint boundaries
- Never rebase commits that have been pushed to remote

```bash
# Merge feature to dev (preserves branch history)
git checkout dev
git merge --no-ff feature/drive-management -m "merge: drive management feature"

# Merge dev to main at sprint completion
git checkout main
git merge dev
git push
```

---

## 7. Commit Frequency

- Commit at every logical unit of work — not at the end of a day
- Commits should compile and not break existing tests
- Use `git stash` for work-in-progress that is not ready to commit
- At minimum, commit at the end of every working session

---

## 8. .gitignore

Key entries (full file generated at project initialization):

```
# Rust
src-tauri/target/

# Node
node_modules/
.pnpm-store/

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/settings.json
.idea/

# Build output
dist/

# Runtime generated (never commit)
thumbnails/
*.db
logs/
```

Note: `*.db` ensures no library databases are accidentally committed. FFmpeg binaries are committed to `src-tauri/binaries/` and are explicitly tracked.

---

## 9. SDLC Stage Commits

At the completion of each SDLC stage, commit all documentation with a stage marker:

```bash
git add .
git commit -m "docs: complete Stage 4 - implementation planning approved"
git push
```

---

## 10. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft created during SDLC Stage 4 |
