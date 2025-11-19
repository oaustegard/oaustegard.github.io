---
description: Generate a comprehensive PR description based on current changes
---

You are tasked with generating a comprehensive pull request description. Follow these steps:

1. Analyze the current branch and changes:
   - Run `git status` to see the current branch and state
   - Run `git log --oneline -10` to see recent commits
   - Run `git diff $(git merge-base HEAD origin/main)...HEAD` to see all changes since branching from main
   - If the diff is very large, focus on the key changes

2. Review the actual code changes:
   - Read the modified files to understand the implementation
   - Identify the main purpose and scope of changes
   - Note any important technical decisions or patterns used

3. Generate a PR description with the following format:

```markdown
## Summary
[2-3 sentences describing what this PR does and why]

## Changes
- [Bullet point list of specific changes made]
- [Be concrete and specific]
- [Focus on what changed, not how it was implemented]

## Test Plan
- [ ] [Specific testing steps that should be done]
- [ ] [Include both automated and manual testing]
- [ ] [Cover edge cases and potential issues]
```

Guidelines:
- Be concise but comprehensive
- Focus on the "what" and "why" rather than "how"
- Make the summary accessible to non-technical reviewers
- Ensure test plan is actionable and specific
- If there are breaking changes, call them out explicitly
- If there are migration steps needed, document them

Output the PR description in a code block so it can be easily copied.
