# VIZZ

Portfolio site for VIZZ: AI video commercials, brand films and motion.

Plain HTML, no build step. The site is the `public/` folder, deployed to Cloudflare by `wrangler.jsonc`: every push to `main` goes live automatically.

## Adding work

Projects live in the `projects` list near the bottom of `public/index.html`. Each project takes a title,
client, type, year, a short "about" text, a list of Vimeo video IDs (shown as No. 01, No. 02, ...)
and a cover image URL.

## Fonts

- Rubik Black (placeholder for the name), Instrument Serif: both SIL Open Font License, served from `public/fonts/`.
