// Builds one page per project at public/work/<slug>/index.html, plus public/sitemap.xml.
// The project list is read from public/index.html, so that file stays the single place to edit.
// Run after changing projects:  node scripts/build-pages.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";

const SITE = "https://vizzmade.com";
const PUB = new URL("../public/", import.meta.url).pathname;
const home = readFileSync(PUB + "index.html", "utf8");

// Pull the projects array and the shared header/analytics markup out of the homepage.
const start = home.indexOf("const projects = [");
const end = home.indexOf("\n];", start) + 3;
const projects = new Function(home.slice(start, end) + "\nreturn projects;")().filter(p => !p.empty);
const between = (a, b) => home.slice(home.indexOf(a), home.indexOf(b, home.indexOf(a)) + b.length);
const header = between('<header class="top">', "</header>")
  .replace('<a href="/" aria-label="VIZZ home">', '<a href="/" aria-label="VIZZ home">')
  .replace('href="#work"', 'href="/#work"').replace('href="#inquiries"', 'href="/#inquiries"').replace('href="#brief"', 'href="/#brief"');
const ctaArt = between("<!-- Shared artwork", "</svg>");
const analytics = between("<!-- Google Analytics -->", "</script>\n<script>") + between("  window.dataLayer", "</script>");

const pad = n => String(n).padStart(2, "0");
const slug = p => p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const label = (p, i) => p.videos.length > 1 ? `No. ${pad(i + 1)}` : p.type;
const abs = src => src.startsWith("http") ? src : `${SITE}/${src}`;
const small = src => src.startsWith("covers/") ? "/" + src.replace("covers/", "covers/sm/") : src;
const esc = t => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const who = p => p.brand ? ["Brand", p.brand] : ["Client", p.client];
const iso = s => `PT${Math.floor(s / 60)}M${s % 60}S`;

rmSync(PUB + "work", { recursive: true, force: true });

for (const [n, p] of projects.entries()) {
  const s = slug(p), url = `${SITE}/work/${s}/`, [whoLabel, whoName] = who(p);
  const count = p.videos.length;
  const title = `${p.title} — ${p.type} by VIZZ`;
  const desc = `${p.title}: ${p.type.toLowerCase()}${count > 1 ? ` series of ${count} videos` : ""} for ${whoName}, ${p.year}. Made by VIZZ, AI video creator in Colombo, Sri Lanka.`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": p.videos.map((v, i) => ({
      "@type": "VideoObject",
      name: `${p.title}${count > 1 ? " " + label(p, i) : ""}`,
      description: desc,
      thumbnailUrl: abs(v.cover),
      uploadDate: v.date,
      duration: iso(v.seconds),
      embedUrl: `https://player.vimeo.com/video/${v.id}`,
      creator: { "@type": "Person", name: "VIZZ", url: SITE + "/" },
    })),
  };
  const others = projects.filter(o => o !== p);
  const more = [1, 2, 3].map(k => others[(n + k * 3) % others.length]);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="video.other">
<meta property="og:site_name" content="VIZZ">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${abs(p.videos[0].cover)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#ffffff">
${analytics}
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/rubik-latin-900-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/instrument-serif-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<script src="/vimeo-player.min.js" defer></script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
@font-face{font-family:Name;src:url(/fonts/rubik-latin-900-normal.woff2) format("woff2");font-weight:900;font-display:block}
@font-face{font-family:"Instrument Serif";src:url(/fonts/instrument-serif-latin-400-normal.woff2) format("woff2");font-display:swap}
:root{--bg:#fff;--ink:#111;--muted:#6b6b6b;--line:#e6e6e6;--gutter:clamp(16px,3vw,40px);--side:max(var(--gutter),calc((100vw - 1400px) / 2))}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:400 20px/1.35 "Instrument Serif",Georgia,serif;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
img,iframe{display:block;width:100%}
.top{position:sticky;top:0;z-index:20;background:var(--bg);display:flex;align-items:center;justify-content:space-between;gap:24px;padding:clamp(14px,2vw,26px) var(--side)}
.top>a{display:block;margin-left:-8px}
.cta-art{display:block;width:auto;overflow:visible}
.nav-cta .cta-art{height:clamp(15px,1.6vw,21px)}
nav{align-items:center}
@media (max-width:600px){nav .nav-inq{display:none}}
@media (max-width:420px){nav .nav-work{display:none}.name{height:32px}}
.name{display:block;height:clamp(36px,3.6vw,46px);width:auto}
.name text{font:900 220px Name,Arial Black,sans-serif;letter-spacing:-4px}
nav{display:flex;gap:clamp(18px,2.4vw,32px);font-size:clamp(21px,2vw,27px)}
nav a:hover{text-decoration:underline}
main{padding:0 var(--side)}
h1{font-weight:400;font-size:clamp(40px,6vw,80px);line-height:1;margin:clamp(12px,3vw,40px) 0 20px}
.player{position:relative;aspect-ratio:16/9;background:#000;overflow:hidden}
.player img{height:100%;object-fit:cover}
.player iframe{position:absolute;inset:0;height:100%;border:0}
.player .go{position:absolute;inset:0;display:flex;align-items:flex-end;padding:18px;color:#fff;font-size:22px;background:linear-gradient(180deg,#0000 55%,#0007)}
.player .go span{display:flex;align-items:center;gap:10px}
.pi{width:12px;height:14px;fill:currentColor}
.cuts{display:flex;gap:6px;margin-top:14px;flex-wrap:wrap}
.cuts button{padding:4px 12px;border:1px solid var(--line);font-size:18px}
.cuts button[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
dl{display:grid;grid-template-columns:90px 1fr;gap:6px 16px;margin:24px 0 0;font-size:18px;max-width:420px}
dt{color:var(--muted)} dd{margin:0}
h2{font-weight:400;font-size:clamp(28px,3vw,40px);margin:clamp(56px,8vw,100px) 0 16px;border-top:1px solid var(--line);padding-top:24px}
.more{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.more a{position:relative;display:block;aspect-ratio:16/9;overflow:hidden;background:#f1f1f1}
.more img{height:100%;object-fit:cover}
.more span{position:absolute;left:14px;top:10px;color:#fff;font-size:22px;text-shadow:0 1px 8px #0008}
.contact{font-size:clamp(26px,3vw,40px);line-height:1.15;margin:clamp(56px,8vw,100px) 0 0}
.contact a{border-bottom:1px solid currentColor}
footer{display:flex;justify-content:space-between;padding:48px var(--side) 32px;font-size:15px;color:var(--muted)}
@media (max-width:760px){.more{grid-template-columns:minmax(0,1fr)}}
</style>
</head>
<body>
${ctaArt}
${header}
<main>
  <h1>${esc(p.title)}</h1>
  <div class="player" id="player"></div>
  ${count > 1 ? `<div class="cuts" id="cuts">${p.videos.map((_, i) => `<button data-i="${i}">${label(p, i)}</button>`).join("")}</div>` : ""}
  <dl><dt>${whoLabel}</dt><dd>${esc(whoName)}</dd><dt>Type</dt><dd>${p.type}</dd><dt>Year</dt><dd>${p.year}</dd></dl>

  <h2>More work</h2>
  <div class="more">
    ${more.map(o => `<a href="/work/${slug(o)}/"><img src="${small(o.videos[0].cover)}" alt="${esc(o.title)}, ${o.type.toLowerCase()} by VIZZ" loading="lazy"><span>${esc(o.title)}</span></a>`).join("\n    ")}
  </div>

  <p class="contact">let's get it made.<br><a href="/#inquiries">Start a project ↗</a> · <a href="mailto:hi@vizzmade.com">hi@vizzmade.com</a> · <a href="https://wa.me/94713417134">WhatsApp</a> · <a href="https://t.me/Viz0005">Telegram</a></p>
</main>
<footer><span>© ${new Date().getFullYear()} VIZZ</span><a href="/">All work →</a></footer>
<script>
// Videos for this page; the cover shows first and Vimeo only loads when someone presses play.
const videos = ${JSON.stringify(p.videos.map((v, i) => ({ id: v.id, cover: v.cover.startsWith("http") ? v.cover : "/" + v.cover, name: `${p.title} ${label(p, i)}` })))};
const player = document.getElementById("player");
const PLAY = '<svg class="pi" viewBox="0 0 11 13" aria-hidden="true"><path d="M0 0v13l11-6.5z"/></svg>';
let current = 0;
function show(i, autoplay) {
  current = i;
  document.querySelectorAll("#cuts button").forEach((b, k) => b.setAttribute("aria-pressed", k === i));
  const v = videos[i];
  if (!autoplay) {
    player.innerHTML = '<img src="' + v.cover + '" alt="' + v.name + ', by VIZZ"><button class="go" aria-label="Play ' + v.name + '"><span>' + PLAY + ' Play</span></button>';
    player.querySelector(".go").onclick = () => show(i, true);
    return;
  }
  gtag("event", "video_play", { project: ${JSON.stringify(p.title)}, video: v.name, video_id: v.id, page: "project" });
  player.innerHTML = '<iframe src="https://player.vimeo.com/video/' + v.id + '?autoplay=1&title=0&byline=0&portrait=0&dnt=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="' + v.name + '"></iframe>';
  if (!window.Vimeo) return;
  const vp = new Vimeo.Player(player.querySelector("iframe"));
  // Cut away just before the end, before Vimeo can show its "More from ..." screen.
  const done = () => { if (current === i && player.querySelector("iframe")) show(i < videos.length - 1 ? i + 1 : i, false); };
  vp.on("timeupdate", d => { if (d.duration && d.duration - d.seconds < 0.7) { vp.pause(); done(); } });
  vp.on("ended", done);
}
document.querySelectorAll("#cuts button").forEach(b => b.onclick = () => show(+b.dataset.i, true));
const start = Math.min(Math.max((parseInt(location.hash.slice(1), 10) || 1) - 1, 0), videos.length - 1);
show(start, false);
</script>
</body>
</html>
`;
  mkdirSync(`${PUB}work/${s}`, { recursive: true });
  writeFileSync(`${PUB}work/${s}/index.html`, html);
}

const today = new Date().toISOString().slice(0, 10);
const urls = [`${SITE}/`, ...projects.map(p => `${SITE}/work/${slug(p)}/`)];
writeFileSync(PUB + "sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
console.log(`Built ${projects.length} project pages and sitemap.xml`);
