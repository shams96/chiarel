---
title: Ignore Google OAuth client-secret files in a public repo
author: Shams
date: 2026-11-06
branch: chore/gitignore-oauth-secrets
id: l-fd911f5a
scope: repo
status: active
src: agent
---

Decided (.gitignore): Google OAuth client-secret JSON files are ignored repo-wide (`client_secret*.json`, `*.apps.googleusercontent.com.json`). github.com/shams96/chiarel is PUBLIC, and two such files sat untracked and un-ignored in scripts/ of the main checkout, one `git add -A` away from being published.
Verified: git check-ignore matches both real filenames and nested variants; no tracked file matches the patterns; no such file appears in any branch's history.
Watch out: ignoring does not protect a secret that was already committed; the history scan found none. Keep the files outside the repo or in .env.local.
