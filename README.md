# VIZZ

Portfolio site for VIZZ: AI video commercials, brand films and motion.

Plain HTML, no build step. The site is the `public/` folder, deployed to Cloudflare by `wrangler.jsonc`: every push to `main` goes live automatically.

## Adding work

Projects live in the `projects` list near the bottom of `public/index.html`. Each project takes a title,
client, type, year, a short "about" text, a list of Vimeo video IDs (shown as No. 01, No. 02, ...)
and a cover image URL.

## Fonts

- Rubik Black (placeholder for the name), Instrument Serif: both SIL Open Font License, served from `public/fonts/`.

## Project pages

Every project also has its own page at `/work/<project>/` (for Google and for sharing one project).
These pages and `sitemap.xml` are generated from the `projects` list in `public/index.html`.
After adding or changing a project, run:

    node scripts/build-pages.mjs

then commit the updated `public/work/` folder and `public/sitemap.xml`.

