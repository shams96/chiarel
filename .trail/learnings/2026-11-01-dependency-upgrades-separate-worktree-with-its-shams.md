---
title: "Dependency upgrades: separate worktree with its own node_modules; two audit items need Next 16"
author: Shams
date: 2026-11-01
branch: chore/security-upgrades
id: l-c1a1be38
scope: repo
status: active
src: agent
touches:
  - package.json
  - package-lock.json
---

## Decided
`package.json` and `package-lock.json`: Next and eslint-config-next 15.5.28 (fixes the critical Image Optimization RCE and Server Actions DoS advisories), nodemailer 10.3.1, postcss 8.5.32, plus `npm audit fix` transitive bumps. The site was never exposed to the Next advisories in practice: `images.unoptimized` makes `/_next/image` return 404 and the app has no server actions.

## Tried and ruled out
Reusing the redesign worktree's `node_modules` through a junction: an `npm install` there would rewrite the shared folder and change the other branch's dependencies, so the upgrade ran in its own worktree with its own `npm ci`. `npm audit fix --force` was not used: it jumps to Next 16.

## Watch out
`npm audit` still lists the postcss 8.4.31 copy bundled inside Next 15 (build-time only); only Next 16 clears it. Removing a worktree that has a `node_modules` junction: delete the junction first (`[System.IO.Directory]::Delete`), never `rm -r` through it.
