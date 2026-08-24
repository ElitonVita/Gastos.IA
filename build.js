#!/usr/bin/env node
// Monta dist/index.html a partir de index.html + src/*.
// Sem dependências, sem bundler: só resolve <script src="src/x.js">
// e <link rel="stylesheet" href="src/x.css"> injetando o conteúdo inline.
// Resultado: um único HTML standalone, igual ao que o projeto sempre foi.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC_HTML = path.join(ROOT, 'index.html');
const OUT_DIR = path.join(ROOT, 'dist');
const OUT_HTML = path.join(OUT_DIR, 'index.html');

function readLocal(relSrc) {
  return fs.readFileSync(path.join(ROOT, relSrc), 'utf8');
}

function build() {
  // Regenera src/locales.js a partir de locales/*.json antes de embutir tudo no HTML.
  require('./gen-locales.js');

  let html = fs.readFileSync(SRC_HTML, 'utf8');

  // <script src="src/foo.js"></script>  ->  <script>...conteúdo de src/foo.js...</script>
  html = html.replace(
    /<script src="(src\/[^"]+\.js)"><\/script>/g,
    (_, relSrc) => `<script>\n${readLocal(relSrc)}</script>`
  );

  // <link rel="stylesheet" href="src/foo.css">  ->  <style>...conteúdo de src/foo.css...</style>
  html = html.replace(
    /<link rel="stylesheet" href="(src\/[^"]+\.css)">/g,
    (_, relSrc) => `<style>\n${readLocal(relSrc)}</style>`
  );

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_HTML, html);
  console.log(`dist/index.html gerado (${(html.length / 1024).toFixed(0)} KB)`);
}

build();
