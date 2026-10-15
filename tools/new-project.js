// Creates projects/<slug>/ with a ready-to-fill project.md.
//
//   npm run new "My Cool Game"
//
const fs = require("fs");
const path = require("path");

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new "Project Title"');
  process.exit(1);
}

const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const dir = path.join(__dirname, "..", "projects", slug);

if (fs.existsSync(dir)) {
  console.error(`projects/${slug} already exists.`);
  process.exit(1);
}

fs.mkdirSync(path.join(dir, "images"), { recursive: true });
fs.mkdirSync(path.join(dir, "videos"), { recursive: true });

const year = new Date().getFullYear();
fs.writeFileSync(path.join(dir, "project.md"), `---
title: ${title}
date: ${year}
summary: One or two sentences about the project and what you did on it.

# Shown as tags on the project page. Delete any line you don't need.
team: 1
engine: Godot
genre: Prototype
platform: PC
role: Gameplay Programmer
# type: Tool
# award: Technical Prize

# Homepage card. The cover can be an image or a video in this folder.
cover: images/cover.png
# card_title: ${title} - Game Jam
# card_tags: [Godot, PC]
# order: 1          # lower numbers show first; otherwise newest first
# hero: videos/trailer.mp4   # big media under the intro, or a YouTube link
# draft: true       # hide it until it's ready
---

## Overview

Write normally in Markdown. Media uses image syntax, and the file type decides what you get:

![Gameplay](videos/gameplay.mp4)

## A feature

- What it does
- How you built it

![Editor screenshot](images/editor.png)

\`\`\`grid
images/before.png | Before
images/after.png | After
\`\`\`
`);

console.log(`Created projects/${slug}/
  project.md   <- fill this in
  images/      <- drop screenshots here (and cover.png)
  videos/      <- drop clips here

Then commit and push. The site rebuilds itself.`);
