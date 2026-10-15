// Builds every projects/<slug>/project.md into projects/<slug>/page.html
// and regenerates the project cards in index.html between the PROJECTS markers.
//
//   npm run build
//
const fs = require("fs");
const path = require("path");
const { Marked } = require("marked");

const ROOT = path.resolve(__dirname, "..");
const PROJECTS_DIR = path.join(ROOT, "projects");
const INDEX = path.join(ROOT, "index.html");
const START = "<!-- PROJECTS:START -->";
const END = "<!-- PROJECTS:END -->";
const PROTO_START = "<!-- PROTOTYPES:START -->";
const PROTO_END = "<!-- PROTOTYPES:END -->";

// A project tagged "Prototype" (genre, type or card_tags) goes in the Prototypes section of the homepage.
const isPrototype = (p) =>
  [p.genre, p.type, ...[].concat(p.card_tags || [])].some((t) => /\bprototype\b/i.test(String(t ?? "")));

const VIDEO_EXT = /\.(mp4|mov|webm|m4v)$/i;

// Front-matter field -> Font Awesome icon on the project page, in display order.
const TAG_FIELDS = [
  ["team", "fa-people-group"],
  ["engine", "fa-gear"],
  ["genre", "fa-puzzle-piece"],
  ["type", "fa-user-gear"],
  ["platform", "fa-computer"],
  ["role", "fa-user"],
  ["award", "fa-star"],
];

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const slugify = (s) =>
  String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Reads the settings block at the top of project.md:
//   ---
//   title: My Game
//   card_tags: [Godot, PC]
//   ---
// Supports "key: value" lines, [a, b] lists, quotes, numbers, true/false and # comments.
function parseValue(raw) {
  const v = raw.trim();
  if (/^\[.*\]$/.test(v)) return v.slice(1, -1).split(",").map(parseValue).filter((x) => x !== "");
  if (/^(["']).*\1$/.test(v)) return v.slice(1, -1);
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

function matter(text) {
  const m = text.replace(/^\uFEFF/, "").match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/);
  if (!m) return { data: {}, content: text };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue; // blank lines and # comment lines
    let value = kv[2];
    const quoted = value.match(/^(["'])(.*?)\1/);
    value = quoted ? quoted[0] : value.replace(/\s+#.*$/, ""); // drop trailing comments
    data[kv[1]] = parseValue(value);
  }
  return { data, content: m[2] };
}

// ---------- media helpers (shared by cards and page bodies) ----------

function youtubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m && m[1];
}

function media(src, alt = "", extraClass = "") {
  const cls = ["rounded", extraClass].filter(Boolean).join(" ");
  const yt = youtubeId(src);
  if (yt) {
    return `<iframe class="rounded yt-embed" src="https://www.youtube.com/embed/${yt}" title="${esc(alt || "YouTube video")}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  }
  const itch = src.match(/^itch:(\d+)(?:\|(.+))?$/);
  if (itch) {
    const link = itch[2] ? `<a href="${esc(itch[2])}">${esc(alt || "Play on itch.io")}</a>` : "";
    return `<iframe frameborder="0" src="https://itch.io/embed/${itch[1]}?border_width=0&amp;bg_color=000000&amp;fg_color=ffffff&amp;border_color=000000" width="100%" height="165">${link}</iframe>`;
  }
  if (VIDEO_EXT.test(src)) {
    return `<video class="${cls}" autoplay muted loop playsinline disablepictureinpicture><source src="${esc(src)}"></video>`;
  }
  return `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`;
}

// ---------- markdown ----------

function makeMarkdown() {
  const md = new Marked();
  md.use({
    renderer: {
      // ![caption](file) -> image, autoplay video, YouTube or itch embed depending on the source.
      // A title adds CSS classes: ![caption](file "square no-shadow")
      image({ href, text, title }) {
        return media(href, text, title || "");
      },
      // Headings get ids so you can link to them: [dynamic fog](#dynamic-fog)
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        return `<h${depth} id="${slugify(inner)}">${inner}</h${depth}>\n`;
      },
      // External links open in a new tab
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        const ext = /^https?:\/\//.test(href) ? ' target="_blank" rel="noopener"' : "";
        return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ""}${ext}>${inner}</a>`;
      },
      // A paragraph that only holds media shouldn't be wrapped in <p>
      paragraph({ tokens }) {
        const onlyMedia = tokens.every((t) => t.type === "image" || (t.type === "text" && !t.text.trim()) || t.type === "br");
        const inner = this.parser.parseInline(tokens);
        return onlyMedia ? inner + "\n" : `<p>${inner}</p>\n`;
      },
      // ```grid  -> side-by-side media. One file per line, optional "| caption".
      // ```grid-3 for three columns.
      code({ text, lang }) {
        const g = (lang || "").match(/^grid(?:-(\d))?$/);
        if (g) {
          const cols = g[1] || "2";
          const items = text.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
            const [src, alt] = l.split("|").map((s) => s.trim());
            return media(src, alt);
          });
          return `<div class="grid-container grid-${cols} gap-20">\n${items.join("\n")}\n</div>\n`;
        }
        return `<pre class="code"><code${lang ? ` class="language-${esc(lang)}"` : ""}>${esc(text)}</code></pre>\n`;
      },
    },
  });
  return md;
}

// ---------- templates ----------

function pageHtml(p, bodyHtml, md) {
  const tags = TAG_FIELDS
    .filter(([k]) => p[k] !== undefined && p[k] !== "")
    .map(([k, icon]) => `                        <span class="tag"><i class="fa-solid ${icon}"></i> ${esc(p[k])}</span>`)
    .join("\n");
  const date = p.date ? `\n                        <span class="date">${esc(p.date)}</span>` : "";
  // summary allows inline Markdown (links, **bold**, <br>)
  const summary = p.summary ? md.parseInline(String(p.summary)) : "";
  const intro = summary ? `\n                    <p>${summary}</p>` : "";
  const description = summary.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || p.title;
  const icon = p.title_icon ? ` <i class="${esc(p.title_icon)}"></i>` : "";
  const scripts = [].concat(p.scripts || []).map((src) => `\n    <script src="${esc(src)}"></script>`).join("");
  const hero = p.hero ? "\n                    " + media(p.hero, p.title, "thumbnail-main") : "";

  return `<!DOCTYPE html>
<!-- Generated from project.md by tools/build.js. Edit project.md, not this file. -->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    <link rel="icon" href="/images/icon.png">
    <script src="/html_importer.js"></script>${scripts}
    <title>Raphaël Daubelcour - Portfolio - ${esc(p.title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
    <div w3-include-html="/header.html"></div>
    <div class="container" style="padding-bottom: 60px;">
        <article class="padded">
            <div class="content">
                <div>
                    <h1>${esc(p.title)}${icon}</h1>
                    <div class="tag-container">
${tags}${date}
                    </div>${intro}${hero}
                </div>
                <div>
${bodyHtml}
                </div>
            </div>
        </article>
    </div>
    <footer>
        <div class="footer-content" style="height: 100px;"></div>
    </footer>
</body>
</html>
`;
}

function cardHtml(p) {
  const cardTags = p.card_tags || [p.engine, p.platform || p.type].filter(Boolean);
  const tags = cardTags.map((t) => `                            <span class="project-tag">${esc(t)}</span>`).join("\n");
  const coverSrc = /^https?:/.test(p.cover || "") ? p.cover : `projects/${p.slug}/${p.cover}`;
  const cover = p.cover ? media(coverSrc, p.title) : "";
  return `                <a class="project-button" href="projects/${p.slug}/page.html">
                    <div class="overlay">
                        ${cover}
                    </div>
                    <div class="project-details">
                        <p class="project-card-title">${esc(p.card_title || p.title)}</p>
                        <div class="project-tag-container">
${tags}
                        </div>
                    </div>
                </a>`;
}

// ---------- main ----------

function build() {
  const md = makeMarkdown();
  const projects = [];
  const problems = [];

  for (const slug of fs.readdirSync(PROJECTS_DIR).sort()) {
    const file = path.join(PROJECTS_DIR, slug, "project.md");
    if (!fs.existsSync(file)) continue;

    const { data, content } = matter(fs.readFileSync(file, "utf8"));
    const p = { ...data, slug };
    if (p.draft) { console.log(`  skip  ${slug} (draft)`); continue; }
    if (!p.title) { problems.push(`${slug}: missing "title"`); continue; }

    if (p.cover && !/^https?:/.test(p.cover) && !fs.existsSync(path.join(PROJECTS_DIR, slug, p.cover))) {
      problems.push(`${slug}: cover "${p.cover}" not found in projects/${slug}/`);
    }

    // Projects with a body get a generated page; projects without one keep their hand-written page.html.
    if (content.trim()) {
      const body = md.parse(content);
      fs.writeFileSync(path.join(PROJECTS_DIR, slug, "page.html"), pageHtml(p, body, md));
      console.log(`  page  ${slug}`);
    } else if (!fs.existsSync(path.join(PROJECTS_DIR, slug, "page.html"))) {
      problems.push(`${slug}: project.md has no content and there is no page.html`);
    }
    projects.push(p);
  }

  // Order: "order" ascending if set, then newest year first.
  const year = (p) => Math.max(0, ...String(p.date ?? "").match(/\d{4}/g)?.map(Number) ?? [0]);
  projects.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || year(b) - year(a) || a.title.localeCompare(b.title));

  const main = projects.filter((p) => !isPrototype(p));
  const prototypes = projects.filter(isPrototype);

  let index = fs.readFileSync(INDEX, "utf8");
  index = replaceBetween(index, START, END, main.map(cardHtml).join("\n") + "\n                ");
  // The whole Prototypes section is generated, so it disappears when there are none.
  const protoSection = prototypes.length
    ? `
            <h2 id="prototypes">Prototypes</h2>
            <div class="grid-container grid-2 gap-20">
${prototypes.map(cardHtml).join("\n")}
            </div>
            `
    : "\n            ";
  index = replaceBetween(index, PROTO_START, PROTO_END, protoSection);
  fs.writeFileSync(INDEX, index);
  console.log(`  index ${main.length} project cards, ${prototypes.length} prototype cards`);

  if (problems.length) {
    console.error("\nProblems:\n  " + problems.join("\n  "));
    process.exit(1);
  }
}

function replaceBetween(text, start, end, inner) {
  const s = text.indexOf(start), e = text.indexOf(end);
  if (s < 0 || e < 0) throw new Error(`index.html needs ${start} and ${end} markers.`);
  return text.slice(0, s + start.length) + "\n" + inner + text.slice(e);
}

build();
