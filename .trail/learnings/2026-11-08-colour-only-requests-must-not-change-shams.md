---
title: Colour-only requests must not change heading sizes; PR 159 shrank three landing headings
author: Shams
date: 2026-11-08
branch: fix/restore-heading-sizes
cost: { minutes: 12, tokens: 106785 }
id: l-96708cea
scope: repo
status: active
src: agent
touches:
  - tests/focus-ladder-direction.test.tsx
  - app/admin/audit/page.tsx
  - app/admin/customers/page.tsx
  - app/admin/disputes/page.tsx
  - app/admin/founding100-credits/page.tsx
  - app/admin/login/LoginForm.tsx
  - "app/admin/orders/[id]/page.tsx"
  - app/admin/orders/page.tsx
  - app/admin/page.tsx
  - app/admin/subscribers/page.tsx
---

## Decided
Owner asked for colour changes only (2026-11-07). The statement h2 in components/home/HomeIntro.tsx stays text-mega, HomeFormulator stays Heading level=h4 as=h2, HomeJournal card title keeps md:text-h3; only text-ochre was added. tests/heading-standard.test.ts pins these exact classes.

## Tried and ruled out
Moving headings onto the text-h2 standard (PR 159) changed their size as well as colour: statement 81px to 44px, Formulator 20px to 44px, journal cards 28px to 20px on desktop. Owner rejected that.

## Watch out
When the request says colour, diff the className for size tokens before committing. The local dev server in this worktree has no DATABASE_URL, so a page render check can hang; verify against the built site or main checkout.
