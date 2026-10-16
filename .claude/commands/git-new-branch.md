Create a new branch from preprod for a Linear issue.

## Instructions

The user wants to create a new branch for Linear issue: $ARGUMENTS

1. Fetch the Linear issue details using the Linear MCP tools (get_issue) to get the issue title and type
2. Run `git fetch` to get latest changes
3. Stash any uncommitted changes with `git stash`
4. Determine the branch prefix from the issue type/title:
   - `fix/` for bug fixes
   - `feat/` for features
   - `chore/` for maintenance
5. Create the branch name as: `<prefix>/<issue-ref>-<2-3-word-summary>` where the summary is derived from the issue title, lowercased, with dashes instead of spaces (e.g. `fix/F-26-update-profile-copy`)
6. Create the branch from `origin/preprod` without tracking: `git checkout -b <branch-name> origin/preprod --no-track`
7. If there were stashed changes, pop them with `git stash pop`
8. Show the user the resulting branch name and status
9. Based on the issue title, description, and any comments, explore the relevant parts of the codebase and present a short action plan summarizing what needs to be done to implement/fix this issue. Keep it concise (3-6 bullet points). This gives the user a preview of what the next `/do` command will tackle.