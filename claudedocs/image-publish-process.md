# Replacing images on the live site

1. Put the new file in `public/assets/...` with the **same name** as the one it replaces.
2. From the repo folder (on any branch), run:

```
npm run publish:images
```

It lists what it found (replaced / new / deleted), commits only the replaced files on a
throwaway branch, opens a PR, waits for the required `check`, merges, then polls the live
URL until the served image is the new one. (The host's CDN re-encodes images, so it compares
decoded pixels against the previous version, not bytes.)

- `-- --dry-run` shows the list and changes nothing.
- `-- --include-new` also publishes brand-new files (they only matter if something references them).
- `-- public/assets/products/x.png ...` publishes exactly those files.
- Deleted files are never published automatically.

Why a command is needed: the site builds from GitHub `main`, so a file saved in the folder is
not live until it is merged and rebuilt (about 5-10 minutes).

Same-name swaps and caching: tested 2026-10-18 with a 3% brightness change on
`lip-gloss-bottle.png`. A fresh request got the new pixels right after the rebuild, so the
host serves the replaced file. Visitors whose browser already cached the old file may keep it:
the host's CDN still sends `Cache-Control: max-age=31536000` on /assets even though
`next.config.mjs` asks for `max-age=0, must-revalidate`, so the header is overridden upstream.
If a swap must reach returning visitors, change the filename (or add a version query) and
update the reference.

Keep files small (the site serves them as-is). The script warns above 1.5 MB.
