# Replacing images on the live site

1. Put the new file in `public/assets/...` with the **same name** as the one it replaces.
2. From the repo folder (on any branch), run:

```
npm run publish:images
```

It lists what it found (replaced / new / deleted), commits only the replaced files on a
throwaway branch, opens a PR, waits for the required `check`, merges, then polls the live
URL until the served file is byte-identical to yours.

- `-- --dry-run` shows the list and changes nothing.
- `-- --include-new` also publishes brand-new files (they only matter if something references them).
- `-- public/assets/products/x.png ...` publishes exactly those files.
- Deleted files are never published automatically.

Why a command is needed: the site builds from GitHub `main`, so a file saved in the folder is
not live until it is merged and rebuilt (about 5-10 minutes).

Why same-name swaps show up: `/assets/*` is served with `Cache-Control: public, max-age=0,
must-revalidate` (`next.config.mjs`), so browsers re-check on every load. Next's image
optimiser is off (`images.unoptimized`), so the file on disk is exactly what visitors get.
If the host's CDN ever caches past that header, the script's byte comparison will show it.

Keep files small (the site serves them as-is). The script warns above 1.5 MB.
