Fetch from git, then rebase the current branch onto preprod and resolve any conflicts.

## Instructions

The user wants to rebase the current branch on top of the latest `preprod`.

1. Check the working tree with `git status`. If there are uncommitted changes, stash them with `git stash` (remember that you stashed, so you can pop them at the end).
2. Run `git fetch origin` (or `git fetch --all --prune`) to get the latest remote state.
3. Record the current branch name with `git rev-parse --abbrev-ref HEAD` so you can report it later.
4. Rebase the current branch onto the freshly fetched preprod: `git rebase origin/preprod`.
5. If the rebase reports conflicts:
   - Run `git status` to list the conflicting files.
   - For each conflicting file, read it, understand both sides of the conflict (`<<<<<<<` ours / `>>>>>>>` theirs), and resolve it by editing the file so the result is correct and coherent — keep both intents where they don't overlap, never blindly pick one side. Use the surrounding code and the intent of this branch's commits to decide.
   - After resolving a file, stage it with `git add <file>`.
   - Once all conflicts for the current step are resolved, continue with `git rebase --continue`. Repeat this conflict-resolution loop for every step the rebase stops on.
   - If a conflict is genuinely ambiguous and you cannot determine the correct resolution, stop and ask the user rather than guessing.
6. If you stashed changes in step 1, pop them with `git stash pop` once the rebase completes successfully (resolve any pop conflicts the same way).
7. Show the user the final `git status` and a short `git log --oneline -5` so they can confirm the branch is now on top of preprod. Summarize what conflicts (if any) were resolved and how.

Never run `git push` as part of this command — leave pushing to the user.
