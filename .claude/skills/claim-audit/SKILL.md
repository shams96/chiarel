---
name: claim-audit
description: Re-verifies a just-written completion summary against the actual codebase instead of trusting memory. Use this right after writing any summary that claims something is "done," "fixed everywhere," "site-wide," "applied to N files/pages," "no errors," or gives a specific count or scope — before letting that summary stand as the final answer. Especially important after a multi-file sweep, a "remove/fix X everywhere" request, or any claim the user could disprove with a single grep. Triggers on self-review requests too ("check your work," "did you actually do that everywhere," "audit what you just said").
---

# Claim audit

A summary is a set of factual claims about the repository's current state. Most of those claims are mechanically checkable — "24 files," "no console errors," "removed everywhere," "all pages return 200" are not opinions, they're assertions with a true/false answer sitting in the filesystem, the build output, or a running server. This skill closes the gap between what got said and what actually happened, by re-deriving each checkable claim from the source of truth instead of trusting the summary that was just written.

The failure mode this guards against: a scope decision gets made early ("just homepage and PDP"), the work matches that scope, and the summary correctly describes *what was done* — but the underlying rule (a lint ban, a "fix it everywhere" request, a stated invariant) was never actually scoped that way. Nothing in the diff is wrong; the claim just quietly narrowed itself over the course of the work. Re-running the check against the *whole* codebase, not just the files touched, is what catches this — a diff review alone won't, because the diff only shows the files that were already touched.

## When to run this

Right after writing a summary or final response that makes checkable claims — before sending it, or immediately after if it already went out. Also run it on request when the user asks to double-check, re-verify, or audit prior work. Skip it for summaries that only contain subjective claims ("looks cleaner," "reads better") — there's nothing here to mechanically check, and this skill has no opinion on taste.

## How to do it

### 1. Pull the checkable claims out of the summary

Re-read what was just written (or what the user pointed at) and list every claim that has a concrete, disprovable form. Concrete means: a number, a quantifier ("all," "every," "site-wide," "everywhere"), a state ("no errors," "clean," "passing"), or a named scope ("pages X and Y," "the shop grid").

Leave out anything that's actually an opinion or a judgment call — "this feels more premium," "better hierarchy" — those aren't this skill's job.

For each claim, write down what a false version of it would look like. If you can't picture the false version, it's not concrete enough to check — either sharpen it or drop it.

### 2. Check the quantifiers against the whole codebase, not the diff

This is the step that actually catches the failure mode above. Any claim containing "all," "every," "everywhere," "site-wide," or a specific count needs to be checked against a search scoped to the *entire relevant codebase* — not the files that were touched, not the files that were in scope for the immediate task. The files already touched will obviously satisfy the claim; that's not the check. The question is whether files *outside* today's working set also satisfy it.

Concretely: if the summary says a pattern was "removed" or "fixed," grep for that pattern (the literal string, the class name, the anti-pattern's signature) across the whole project, not just the edited files. If it returns zero hits outside what was already accounted for, the claim holds. If it returns hits, that's a real discrepancy — not a nitpick, the kind of thing a five-second grep from the user would have caught anyway.

If the original instruction that motivated the change (a style guide rule, a skill's stated ban, a user request like "get rid of X") didn't itself contain a scope limitation, treat the claim's scope as the *instruction's* scope, not the scope work happened to stop at. A rule that says "never do X" was never file-scoped just because the edits were.

### 3. Check the factual/state claims against real output

- "No console errors" / "no errors" → actually read console output or re-run the check that would surface one; don't infer it from the edit having gone through cleanly.
- "Pages return 200" / "renders" / "builds" → run the actual HTTP check, build, or typecheck. A file saving without a tool error is not the same claim as a page rendering without a runtime error.
- A specific count ("31 occurrences," "8 files") → re-run the exact search that produced the count, don't recall it.

Use the project's real tools for this — grep/ripgrep for pattern claims, curl or the browser tools for render claims, the project's build/typecheck/lint commands for correctness claims. Don't substitute a memory of having checked it earlier in the conversation; state can have changed, and the whole point is not trusting the earlier pass.

### 4. Report a discrepancy list, not a rewritten summary

Output format:

```
Checked: <N> claims
Confirmed: <list, one line each — claim → what verified it>
Discrepancies: <list, one line each — what was claimed vs. what's actually true, with the command/evidence>
```

If everything checks out, say so plainly in one line — don't pad it. If something doesn't check out, state the gap factually (claim vs. actual) and stop there; fixing it is a separate step the user should get to decide on, not something to silently patch and then re-claim as done.

Don't re-litigate claims that were already judgment calls (scope decisions the user explicitly approved, design opinions) — this is a factual audit, not a second design review.
