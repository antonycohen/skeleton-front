Implement or fix a Linear issue.

## Instructions

Raw input: $ARGUMENTS

Parse the input: the first word is the Linear issue identifier (e.g. F-24). Everything after it is additional context/instructions from the user. If there is no additional context, proceed normally.

1. Fetch the Linear issue details using the Linear MCP tools (get_issue) to get the title, description, comments, and any linked issues
2. Analyze the issue to understand what needs to be done. If the user provided additional context, use it to guide your focus and approach.
3. Explore the relevant parts of the codebase to understand the current state
4. Implement the fix or feature following the project's architecture and conventions (see CLAUDE.md)
5. Verify the changes with Nx on the affected projects: `npx nx test <project>` (optionally `-- <spec-file-pattern>`), `npx nx typecheck <project>`, `npx nx lint <project>`; if UI text changed, also `node scripts/check-translations.mjs`
6. If any check fails, analyze the failure, fix the code, and re-run the tests. Retry up to 3 times. If tests still fail after 3 attempts, stop and ask the user for guidance.
7. Show a summary of what was changed and why
8. Ask the user if they want to commit (via /commit-issue) or if adjustments are needed