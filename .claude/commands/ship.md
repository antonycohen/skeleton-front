---
description: One-shot ship a working change - branch from preprod, commit, push, open PR, wait for CI (auto-fix if red), then squash-and-merge when green and the CI code review is clean
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, Skill
---

Ship the current working-tree changes end to end: create a branch, commit, push, open a PR, drive CI to green (fixing failures), and squash-merge — with no Linear issue involved.

`$ARGUMENTS` (all optional):
- A short free-text summary of the change (used for the branch name, commit subject, and PR title). If omitted, derive it from the diff.
- `--base <branch>` to override the PR base branch (default: `preprod`).
- `--type <fix|feat|chore>` to force the conventional-commit type (otherwise infer from the diff).

## Authorization & guardrails (read first)

- **Invoking `/ship` is the explicit go-ahead for the whole commit → push → merge pipeline.** You do not need to ask again before each individual git step — running this command authorizes the sequence. (This is the one place the usual "ask before every commit/push" rule is satisfied up front.)
- **Hard stops** — halt and report to the user, do NOT force or work around, if any of these occur:
  - The working tree has **no changes** to ship.
  - The current branch is already `main` or `preprod` at the time changes need committing AND there are uncommitted changes you'd otherwise strand (branch off first — see step 1).
  - The PR is **not mergeable due to conflicts** (`mergeable == CONFLICTING`, or `mergeStateStatus` is `DIRTY`/`BEHIND` in a way that needs a manual rebase/merge). Stop — the user resolves conflicts.
  - CI is still failing after **2** fix attempts, or a failure is flaky/infra rather than a real code defect.
  - When the repository has an automated **CI code review** (a `Claude Code Review` workflow posting its feedback as a PR comment — not part of the skeleton's default CI), it flagged one or more **critical or major** issues on the current head commit. Do NOT merge — report the findings and hand back to the user (see step 6). Only a clean review or minor/nit-level feedback may merge.
  - Required reviews/approvals or branch protection block the merge for a reason you cannot satisfy.
- **Never** force-push, rewrite history, or use `git add -A` / `git add .`. Stage only files changed in this conversation/working session.
- If the change isn't already verified locally, verify it before pushing (`npx nx typecheck <project>`, `npx nx lint <project>`, `npx nx test <project>` where a test target exists) — don't rely on CI to catch a compile break you could catch in seconds.

## 1. Create the branch (mirrors /git-new-branch, no Linear issue)

- `git fetch origin`
- Determine the summary and `<type>` (`fix`/`feat`/`chore`) from `$ARGUMENTS` or, if absent, from `git status` + `git diff` of the working changes.
- Branch name: `<type>/<2-3-word-kebab-summary>` (lowercase, dashes; e.g. `feat/logo-fill-color`). Ensure it doesn't already exist.
- **Do NOT stash.** `git checkout -b <branch-name> origin/preprod --no-track` carries your uncommitted (tracked *and* untracked) working changes onto the new branch automatically, as long as they don't conflict with `origin/preprod` — which for fresh work they won't. Stashing here is both unnecessary and dangerous: a `git stash push -- <paths>` that names an untracked file errors out and stashes nothing, and a follow-up bare `git stash pop` then pops an unrelated **pre-existing** stash, corrupting the tree. Never pair a stash with a pop you didn't personally create this run.
- Run the checkout: `git checkout -b <branch-name> origin/preprod --no-track`.
  - Only if that checkout is *refused* because a working change genuinely conflicts with `origin/preprod`, stop and tell the user — do not try to stash around it.
- If you were already on a suitable feature branch (not `main`/`preprod`) with the changes committed or present, you may skip creating a new one — use judgement, but never commit straight onto `main`/`preprod`.

## 2. Commit (mirrors /commit-issue, no Linear issue → no issue id in the subject)

- Check `git status` first. Identify which changes belong to **this** work (what you modified this session) versus **unrelated** pre-existing edits in the working tree.
- **Leave unrelated changes alone** — do not stage or commit them. Stage only files you changed for this work, with explicit `git add <file>...`. Never `git add -A`/`.` (it would sweep in unrelated or sensitive files like `.env`).
- **Split into separate commits when the change covers separate concerns.** If the work spans more than one concern (e.g. a production fix + a config change, or two independent features), make one focused commit per concern rather than one mega-commit — stage and commit each group separately. A single cohesive change stays one commit.
- Each commit message:
  ```
  <type>: <short description of that commit's concern>

  <optional 1-3 line body explaining the why, if not obvious>
  ```
  followed by the session's standard `Co-Authored-By: Claude ... <noreply@anthropic.com>` trailer.
- If any unrelated changes remain uncommitted in the working tree, that's fine — note it so they don't get pushed by surprise (they won't be committed, but flag their presence to the user).
- Show the resulting `git log` / `git show --stat` for the commit(s) you made.

## 3. Push & open the PR

- Push and set upstream: `git push -u origin <branch-name>`.
- Determine base: `--base` value if given, else `preprod`.
- Open the PR with `gh pr create --base <base> --title "<type>: <summary>" --body "<body>"`.
- PR body: a concise "What/Why" summary of the change, ending with:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  ```
- Capture and report the PR URL/number.

## 4. Wait for CI

- Block on the checks: `gh pr checks --watch` (falls through when all checks complete). The default CI (`.github/workflows/ci.yml` → `_checks.yml`) reports `checks / lint-test` and `checks / typecheck`. If a `Claude Code Review` workflow is configured, this also waits on it, so once it returns the review comment has been posted and is ready to read in step 6.
- When it returns, read the rollup: `gh pr checks --watch=false` (or `gh pr view --json statusCheckRollup`).
- Note: the `Claude Code Review` check succeeding means the review **ran**, not that it found nothing — a green rollup does NOT imply a clean review. The critical/major gate in step 6 reads the review comment itself.
- If all required checks **pass** → go to step 6.
- If any check **fails** → go to step 5.

## 5. Fix CI, then loop — max 2 attempts

- Pull the failing logs: `gh run view <run-id> --log-failed`. Find the concrete failing step (typecheck, lint, test, build).
- Reproduce locally with the matching Nx target (`npx nx typecheck <project>`, `npx nx lint <project>`, `npx nx test <project>`, `npx nx build <project>`, or `npx nx affected -t <target>`), apply the minimal correct fix per `CLAUDE.md`, and re-run locally until green.
- Commit (`fix(ci): <what>` + the `Co-Authored-By` trailer) and push to the same branch.
- Return to step 4 to re-watch CI.
- **Stop after 2 fix attempts** with no green — report what's still failing and hand back to the user. Also stop immediately if the failure looks flaky/infra rather than a real defect.

## 6. Gate on the CI code review, verify mergeability, then squash-and-merge

**First, gate on the automated CI code review** (skip this gate when no `Claude Code Review` workflow ran on the PR). The `Claude Code Review` workflow posts its feedback as a PR comment; because it re-runs on every push, a fix from step 5 produces a fresh review, so always read the review for the **current head commit**.

- Fetch the latest review comment: `gh pr view <pr> --json headRefOid,comments`. Pick the most recent comment authored by the review bot (the Claude Code Review action — a bot/app author, not a human reviewer). If the review check completed in step 4 but no review comment is visible yet, wait briefly and re-fetch **once** before proceeding.
- Read the findings and classify the highest severity present:
  - **Critical** — breaks functionality, security/auth/permission holes, data loss or corruption, crashes, or anything the review calls a blocker / "must fix".
  - **Major** — a significant correctness, performance, or design defect the review flags as important (a real logic error, a broken contract, a missing critical test) — not merely stylistic.
  - **Minor / nit** — style, naming, small optional suggestions. Non-blocking.
- **If any critical or major issue is present → STOP. Do not merge.** Quote the flagged findings back to the user and hand off so they can address them (re-running `/ship` after the fix re-triggers the review) or explicitly waive the gate. Proceed to merge only when the review is clean or contains only minor/nit feedback.
- If you are genuinely unsure whether a finding is major vs minor, treat it as blocking and ask the user rather than merging.

**Then verify mergeability and merge:**

- Re-check mergeability right before merging:
  `gh pr view --json mergeable,mergeStateStatus,reviewDecision`.
- If `mergeable == CONFLICTING` (or `mergeStateStatus` indicates conflicts / needs manual rebase) → **STOP**. Report the conflict and let the user resolve it. Do not attempt an automatic rebase/merge.
- If reviews/branch protection block the merge → stop and report; don't try to bypass.
- Otherwise squash-and-merge and clean up the remote branch:
  `gh pr merge --squash --delete-branch`
- Confirm the merge landed (`gh pr view --json state,mergedAt`).

## 7. Report

Summarize: branch name, commit(s), PR URL, CI outcome (including any fixes applied), the CI code-review verdict (clean / minor-only / blocked on critical-or-major, with the findings if blocked), and the final merge result — or, if you stopped at a guardrail, exactly which one and what the user needs to do next.
