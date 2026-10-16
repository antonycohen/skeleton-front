Commit current changes for a Linear issue.

## Instructions

The user wants to commit staged/unstaged changes for a Linear issue.

Issue identifier: $ARGUMENTS

If no issue identifier is provided (empty or blank), reuse the issue identifier from the most recent `/do` command in this conversation.

1. Fetch the Linear issue details using the Linear MCP tools (get_issue) to get the issue title and description
2. Stage only the files that were modified during this conversation using `git add <file>...`. Do NOT use `git add -A` or `git add .` — this avoids accidentally staging pre-existing changes, sensitive files like `.env`, or unrelated modifications.
3. Commit with a message following this format:
   ```
   <type>(<issue-identifier>): <short description based on issue title>
   ```
   Where `<type>` is `fix`, `feat`, or `chore` based on the issue content.
4. Show the user the commit log and ask if they want to push.