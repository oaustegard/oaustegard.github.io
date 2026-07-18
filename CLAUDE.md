@AGENTS.md

## PR lifecycle in Claude sessions

The user merges PRs promptly — often while the session is still active. After
presenting a PR for the user to merge, assume that on the next turn you most
likely need a NEW PR: check the PR's state before pushing anything. If it has
been merged, do not stack commits on the old branch/PR — restart the working
branch from the latest `origin/main` (rebasing any not-yet-merged commits onto
it) and open a fresh PR for the follow-up work.
