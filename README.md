# takuin.com — rebuild

This is the full rebuilt site: all 339 restored posts and 2,454 historical
comments from the old WordPress archive (2006–2016), the four new pieces
from the relaunch (Step One, Ink That Tells A Truth, What Remains, Bird and
Water), the Archive, Start Here, What's This, and the six restored WordPress
pages (About, Contact, Subscribe, Interviews, Fasting Resources, The Past).

Every old post keeps its exact original URL, so existing backlinks from
other sites will keep working with no redirects needed.

Inline images from the old archive were intentionally removed rather than
left as broken links — most pointed to a defunct Flickr URL scheme or the
old WordPress host, and recovering them wasn't worth the effort for what
this site is now. Old posts read as text-only going forward.

## Getting this live — one-time setup

Cloudflare does not allow converting an existing direct-upload Pages
project (like `lifebeyond`) into a Git-connected one. So this is a new
project, then a domain move — not a settings change on the old one.

1. **GitHub — create the repo.** New repository (empty, no
   README/gitignore). On its page, click **"uploading an existing file"**
   and drag in *everything inside this folder* (not the folder itself —
   contents should sit at the repo's root). Commit to `main`.
2. **Cloudflare — create a new Pages project from that repo.** Workers &
   Pages → Create application → Pages → Connect to Git → authorize/select
   the new repo. Framework preset: None. Build command: leave blank.
   Build output directory: `/`. Deploy. Check the `*.pages.dev` preview
   URL it gives you before touching the domain.
3. **Move the domain over.** On the *new* project's Custom domains tab,
   add `takuin.com` and `www.takuin.com`. If Cloudflare says they're
   already in use, remove them from the old `lifebeyond` project's Custom
   domains tab first, then add them here.

After that, every future update is: drag the changed files into GitHub's
upload page again. Cloudflare redeploys the same project automatically —
no more domain-moving needed once this is done once.

## Required before comments work: D1 database + Turnstile

The comment system needs two things set up in the Cloudflare dashboard
that can't be done from a file upload:

1. **D1 database.** Create one (any name, e.g. `takuin-comments`), run
   `schema.sql` against it (the dashboard has a query editor, or use
   `wrangler d1 execute`), then bind it to the Pages project as `DB` in
   **Settings → Functions → D1 database bindings**.
2. **Turnstile widget.** Create one at **Turnstile** in the dashboard
   (any name, add `takuin.com` as the domain). Copy the **site key** into
   `templates/_comments.html` wherever `YOUR_TURNSTILE_SITE_KEY` appears
   (search-and-replace, then rebuild), and set the **secret key** as an
   environment variable named `TURNSTILE_SECRET` on the Pages project
   (Settings → Environment variables). Also set `IP_HASH_SALT` to any
   random string of your choosing.

Until this is done, historical comments (baked into every old post) still
display fine — only new comment submission needs the database and
Turnstile.

## What's not finished yet

- **8 unpublished drafts** from the old archive were intentionally left
  out of this build, pending your review.
- **Tagline / "What's This" copy** uses "Manufactured by Return" as a
  placeholder — swap the word if you want something else.
- **Bird and Water** uses a plain essay layout, same as "Ink That Tells A
  Truth" — no bespoke form was picked for it yet.
