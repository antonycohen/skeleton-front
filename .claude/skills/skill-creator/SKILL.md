---
name: skill-creator
description: >
  Creates new Claude Code skills from scratch with best-practice structure.
  Use when user says "create a skill", "new skill", "build a skill",
  "make a skill", "help me build a skill", "skill for X",
  or asks to set up a reusable workflow for Claude.
argument-hint: [skill-topic]
---

# How to Create a Claude Code Skill

You are creating a new skill. Follow every step below sequentially. Do NOT skip steps.

---

## What Is a Skill?

A skill is a **folder** containing a `SKILL.md` file (and optional supporting files) that teaches Claude how to handle a specific repeatable task or workflow. Skills live under `.claude/skills/` in the project root.

### Folder Structure

```
.claude/skills/<skill-name>/
  SKILL.md              # Required - main instruction file
  references/           # Optional - documentation loaded on demand
  scripts/              # Optional - executable code (Python, Bash, etc.)
  assets/               # Optional - templates, fonts, icons, samples
```

---

## Step 1: Gather Requirements

Before writing anything, ask the user these questions using AskUserQuestion:

1. **Purpose**: What task should this skill automate or guide?
2. **Trigger phrases**: What would a user say to invoke this skill? (list 3-5 examples)
3. **Scope**: What should this skill NOT do? (prevents over-triggering)
4. **Category**: Which type best fits?
   - **Document/Asset Creation** — generating consistent outputs (code, docs, designs)
   - **Workflow Automation** — multi-step processes with validation gates
   - **MCP Enhancement** — workflow guidance on top of MCP tool access
5. **Model invocation**: Should this skill allow Claude to actively execute (default), or be reference-only (`disable-model-invocation: true`)?
6. **Arguments**: Does the skill accept arguments? If yes, what is the hint? (e.g., `[entity-name]`, `[url]`)

Do NOT proceed until you have answers for at least purpose and trigger phrases.

---

## Step 2: Choose a Skill Name

Derive the name from the purpose. Apply these rules:

### Naming Rules (ALL must pass)

| Rule | Valid | Invalid |
|------|-------|---------|
| Use kebab-case | `api-model-guide` | `Api_Model_Guide`, `apiModelGuide` |
| Lowercase only | `project-setup` | `Project-Setup` |
| No spaces | `data-pipeline` | `data pipeline` |
| No underscores | `code-review` | `code_review` |
| No reserved prefixes | `my-helper` | `claude-helper`, `anthropic-tool` |
| Descriptive and specific | `react-component-gen` | `helper`, `tool`, `stuff` |
| Folder name = frontmatter name | Both `skill-creator` | Folder `skill-maker` but name `skill-creator` |

---

## Step 3: Create the Folder

Create the skill folder at `.claude/skills/<skill-name>/`.

If the skill needs supporting files, also create subdirectories:

```bash
# Minimum
.claude/skills/<skill-name>/SKILL.md

# With optional directories
.claude/skills/<skill-name>/references/    # detailed docs, API references
.claude/skills/<skill-name>/scripts/       # validation scripts, automation
.claude/skills/<skill-name>/assets/        # templates, samples, config files
```

---

## Step 4: Write YAML Frontmatter

The frontmatter is the **most critical part**. It controls when Claude loads the skill.

### Required Format

```yaml
---
name: <skill-name>
description: >
  <What it does>. <Capabilities>.
  Use when user <trigger condition 1>, <trigger condition 2>,
  <trigger condition 3>, or <trigger condition 4>.
  Do NOT use for <negative trigger 1> or <negative trigger 2>.
---
```

### Frontmatter Fields

| Field | Required | Rules |
|-------|----------|-------|
| `name` | YES | kebab-case, must exactly match folder name |
| `description` | YES | Max 1024 chars. Must include WHAT + WHEN + NOT-WHEN. No XML tags. |
| `disable-model-invocation` | NO | Set to `true` for reference-only skills (no active execution) |
| `argument-hint` | NO | Hint shown to user, e.g. `[entity-name]`, `[url]` |
| `license` | NO | e.g. `MIT`, `Apache-2.0` |
| `compatibility` | NO | Environment requirements (1-500 chars) |
| `metadata` | NO | Custom key-value pairs: `author`, `version`, `mcp-server`, etc. |

### Description Quality Rules (ALL must pass)

1. **MUST include WHAT**: Clearly state what the skill does in the first sentence
2. **MUST include WHEN (positive triggers)**: List specific phrases/keywords that should activate the skill. Use phrases the user would actually say.
3. **SHOULD include NOT-WHEN (negative triggers)**: Clarify what the skill should NOT be used for, to prevent over-triggering
4. **MUST be specific**: Avoid vague descriptions like "Helps with projects" or "Does useful things"
5. **MUST NOT contain XML tags**: No `<` or `>` characters anywhere in frontmatter (security restriction - frontmatter appears in system prompt)
6. **MUST NOT exceed 1024 characters**
7. **MUST include at least 3 trigger phrases**: Different ways a user might request this skill
8. **Trigger phrases MUST use natural language**: Write phrases as users would say them, not technical identifiers

### Good Description Examples

```yaml
# Good: specific what + multiple triggers + negative trigger
description: >
  Analyzes Figma design files and generates developer handoff documentation.
  Use when user uploads .fig files, asks for "design specs",
  "component documentation", or "design-to-code handoff".
  Do NOT use for general design discussions without a Figma file.

# Good: clear scope with natural triggers
description: >
  Creates and configures new API endpoint classes with TanStack Query hooks.
  Use when user says "add endpoint", "create API route", "new query hook",
  "wire up API", or asks to connect frontend to a backend resource.

# Good: workflow skill with clear boundaries
description: >
  Manages sprint planning workflows including task creation, estimation,
  and status tracking in Linear. Use when user mentions "sprint",
  "Linear tasks", "project planning", "create tickets", or "backlog grooming".
  Do NOT use for general project management discussions.
```

### Bad Description Examples (and why)

```yaml
# Bad: too vague, no triggers
description: Helps with projects.

# Bad: no trigger phrases
description: Creates sophisticated multi-page documentation systems with advanced formatting.

# Bad: too technical, not user-facing language
description: Implements the Project entity model with hierarchical relationships and polymorphic associations.

# Bad: contains XML (security violation)
description: Generates <html> templates for email campaigns.
```

---

## Step 5: Write the SKILL.md Body

The body contains the actual instructions. Follow this template structure:

### Template

```markdown
---
(frontmatter from Step 4)
---

# <Skill Title>

<1-2 sentence overview of what this skill does and why it exists.>

## Instructions

### Step 1: <First Major Step>
<Clear, actionable explanation of what to do.>

Example:
\`\`\`bash
<concrete command or code example>
\`\`\`
Expected output: <describe what success looks like>

### Step 2: <Second Major Step>
...

### Step N: <Final Step>
...

## Common Patterns

### <Pattern Name>
<When to use this pattern and how to implement it.>

## Examples

### Example 1: <Common Scenario>
**User says:** "<natural language request>"
**Actions:**
1. <step>
2. <step>
**Result:** <what gets created/changed>

### Example 2: <Edge Case>
...

## Troubleshooting

### Error: <Common error or issue>
**Cause:** <why it happens>
**Solution:** <how to fix it>

## Checklist

- [ ] <validation item 1>
- [ ] <validation item 2>
- [ ] ...
```

### Body Content Rules (ALL must pass)

1. **Instructions MUST be specific and actionable**: Every step must tell Claude exactly what to do. No vague directives like "validate things properly".
2. **Instructions MUST include concrete examples**: Show actual code, commands, or output for every non-trivial step.
3. **Error handling MUST be documented**: For every step that can fail, document what goes wrong and how to recover.
4. **References to bundled files MUST use explicit paths**: Write `references/api-patterns.md` not "the API patterns doc".
5. **Critical validations SHOULD use scripts**: When correctness matters, bundle a validation script in `scripts/` rather than relying on language interpretation.
6. **SKILL.md SHOULD stay under ~5000 words**: Move detailed documentation to `references/` and link to it. This keeps token usage low (progressive disclosure).
7. **DO NOT use ambiguous language**: Replace "make sure", "properly", "correctly" with specific criteria.
8. **DO include a checklist section**: A final validation checklist the user or Claude can run through before considering the skill complete.
9. **DO mark critical instructions explicitly**: Use `CRITICAL:` or `IMPORTANT:` prefixes for must-not-miss instructions.
10. **DO include at least 2 examples**: One common scenario and one edge case.
11. **DO include a troubleshooting section**: At least 3 common issues with causes and solutions.
12. **Steps MUST be numbered sequentially**: Use `### Step 1:`, `### Step 2:`, etc.
13. **Each step MUST have an expected outcome**: Describe what success looks like after completing the step.

---

## Step 6: Create Supporting Files (if needed)

### When to Create `references/`

Create reference files when:
- Detailed API documentation exceeds 500 words
- Style guides or coding standards need to be included
- External documentation needs to be bundled for offline access

Name files descriptively: `references/api-patterns.md`, `references/style-guide.md`

### When to Create `scripts/`

Create scripts when:
- Validation logic is complex and must be deterministic
- The skill orchestrates external tools or commands
- Data transformation is needed

Scripts should be self-contained and include usage comments at the top.

### When to Create `assets/`

Create assets when:
- Templates need to be copied/adapted (config files, boilerplate)
- Sample data is needed for examples
- Icons, fonts, or other binary assets are referenced

---

## Step 7: Validate the Skill

Run through this exhaustive validation checklist. Every item must pass.

### Folder Structure Validation

- [ ] Skill folder exists at `.claude/skills/<name>/`
- [ ] Folder name is kebab-case, lowercase, no spaces, no underscores
- [ ] Folder name does NOT start with `claude` or `anthropic`
- [ ] `SKILL.md` file exists (exact name, exact case: `S-K-I-L-L.md`)
- [ ] NO `README.md` file inside the skill folder (all docs go in SKILL.md or references/)
- [ ] Optional directories (`references/`, `scripts/`, `assets/`) only created if actually used

### Frontmatter Validation

- [ ] Frontmatter starts and ends with `---` delimiters
- [ ] `name` field is present and matches folder name exactly
- [ ] `name` field is kebab-case with no spaces or capitals
- [ ] `description` field is present
- [ ] Description includes WHAT the skill does (first sentence)
- [ ] Description includes WHEN to use it (trigger phrases)
- [ ] Description includes at least 3 different trigger phrases
- [ ] Description is under 1024 characters
- [ ] Description contains NO XML angle brackets (`<` or `>`)
- [ ] No field values contain XML angle brackets
- [ ] YAML syntax is valid (properly quoted strings, correct indentation)
- [ ] `argument-hint` uses square brackets if present (e.g., `[name]`)

### Body Content Validation

- [ ] Title heading (`# Title`) is present after frontmatter
- [ ] Overview paragraph explains the skill in 1-2 sentences
- [ ] Instructions section exists with numbered steps
- [ ] Each step has an actionable description (not vague)
- [ ] Each step includes a concrete example (code, command, or output)
- [ ] Each step describes expected outcome
- [ ] Error handling is documented for steps that can fail
- [ ] At least 2 examples section with user-says / actions / result format
- [ ] Troubleshooting section exists with at least 3 entries
- [ ] Checklist section exists at the end
- [ ] All references to bundled files use explicit relative paths
- [ ] No ambiguous language ("properly", "correctly", "make sure" without criteria)
- [ ] Critical instructions are marked with `CRITICAL:` or `IMPORTANT:`
- [ ] Total body is under ~5000 words (move excess to `references/`)

### Triggering Validation

Test mentally (or by asking Claude) that the skill would trigger for:
- [ ] Direct request: "Use the <skill-name> skill"
- [ ] Natural request using each trigger phrase from the description
- [ ] Paraphrased request using synonyms of the trigger phrases

Test that the skill would NOT trigger for:
- [ ] Unrelated requests outside the skill's scope
- [ ] Requests matching the negative triggers in the description

### Integration Validation

- [ ] If scripts exist, they are executable and include usage comments
- [ ] If references exist, they are linked from SKILL.md body
- [ ] If MCP tools are used, the skill documents which servers are required

---

## Skill Design Patterns

When writing the SKILL.md body, choose the pattern that best fits the skill's purpose:

### Pattern 1: Sequential Workflow Orchestration

For multi-step processes that must happen in order.

```
Step 1 -> Validate -> Step 2 -> Validate -> Step 3 -> Done
```

Key elements:
- Explicit step ordering with numbered steps
- Validation gate after each step (check before proceeding)
- Rollback instructions if a step fails
- Dependencies between steps clearly stated

### Pattern 2: Multi-MCP Coordination

When the skill coordinates across multiple MCP servers or external services.

Key elements:
- Clear phase separation (Phase 1: fetch from MCP-A, Phase 2: transform, Phase 3: push to MCP-B)
- Data passing between phases documented
- Validation before moving to next phase
- Error handling per MCP server

### Pattern 3: Iterative Refinement

When output quality improves with iteration.

```
Generate -> Validate -> Refine -> Repeat until quality threshold met
```

Key elements:
- Initial generation step
- Quality criteria defined explicitly
- Refinement loop with max iterations
- Exit condition (what "good enough" looks like)

### Pattern 4: Context-Aware Tool Selection

When the same outcome uses different tools depending on context.

Key elements:
- Decision criteria (file type, size, purpose, environment)
- Tool selection matrix
- Fallback options if primary tool fails

### Pattern 5: Domain-Specific Intelligence

When the skill embeds specialized knowledge beyond tool access.

Key elements:
- Domain rules and constraints documented
- Compliance or best-practice checks
- Audit trail of decisions made
- References to authoritative sources

---

## Troubleshooting Skill Creation

### Skill doesn't load when it should (under-triggering)
**Cause:** Description is too narrow or missing trigger phrases the user actually uses.
**Solution:** Add more keyword variations and natural-language trigger phrases. Ask Claude "When would you use the <skill-name> skill?" to see what it understands.

### Skill loads for unrelated queries (over-triggering)
**Cause:** Description is too broad or missing negative triggers.
**Solution:** Add "Do NOT use for..." clauses. Be more specific about the skill's scope. Consider narrowing the first sentence.

### Inconsistent results when skill is used
**Cause:** Instructions are too vague or missing error handling.
**Solution:** Replace ambiguous language with specific criteria. Add validation steps. Use scripts for deterministic checks.

### "Could not find SKILL.md" error
**Cause:** File is named `skill.md`, `Skill.md`, `SKILL.MD`, or something other than exactly `SKILL.md`.
**Solution:** Rename to exactly `SKILL.md` (case-sensitive, no variations).

### "Invalid frontmatter" error
**Cause:** Missing `---` delimiters, unclosed quotes in YAML, or invalid YAML syntax.
**Solution:** Check that frontmatter starts and ends with `---` on their own lines. Ensure multi-line strings use `>` or `|` block scalars.

### "Invalid skill name" error
**Cause:** Name contains spaces, capitals, underscores, or reserved prefixes.
**Solution:** Convert to kebab-case. Remove any `claude` or `anthropic` prefix.

### Skill is slow or degrades Claude's responses
**Cause:** SKILL.md is too long, loading too much context.
**Solution:** Move detailed docs to `references/` subdirectory. Keep SKILL.md under ~5000 words. Reference files are only loaded when Claude navigates to them (progressive disclosure).

### MCP tool calls fail inside the skill
**Cause:** MCP server not connected, auth expired, or wrong tool name.
**Solution:** Test MCP tools independently first. Document required MCP servers in the skill's compatibility or metadata fields.

---

## Final Output

After completing all steps, present to the user:

1. The file tree of what was created
2. The full SKILL.md content
3. Confirmation that all validation checks pass
4. Suggestion to test the skill with 2-3 sample prompts
