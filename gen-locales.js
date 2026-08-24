#!/usr/bin/env node
// Gera src/locales.js a partir de locales/*.json.
// Por quê: abrir o index.html direto (file://), sem servidor, é como este
// app sempre funcionou — mas fetch() para um arquivo local é bloqueado pelo
// navegador nesse caso (CORS de file://), então i18n.js não conseguia
// carregar locales/pt.json / locales/en.json e a UI ficava com as chaves
// cruas (ex: "header.print"). Embutindo as traduções como um objeto JS,
// carregado via <script src>, elas ficam disponíveis sem precisar de fetch,
// exatamente como os outros módulos em src/*.js.
// Edite locales/pt.json e locales/en.json (fonte da verdade) e rode
// `node gen-locales.js` (ou `node build.js`, que já chama isso) para
// regenerar src/locales.js.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'src', 'locales.js');

function build() {
  const pt = JSON.parse(fs.readFileSync(path.join(ROOT, 'locales', 'pt.json'), 'utf8'));
  const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'locales', 'en.json'), 'utf8'));
  const banner = `// GERADO AUTOMATICAMENTE por gen-locales.js a partir de locales/pt.json e locales/en.json.
// Não edite este arquivo à mão — edite os .json e rode \`node gen-locales.js\` (ou \`node build.js\`).
`;
  const content = `${banner}window.GASTOS_LOCALES = ${JSON.stringify({ pt, en }, null, 2)};\n`;
  fs.writeFileSync(OUT, content);
  console.log(`src/locales.js gerado (${(content.length / 1024).toFixed(0)} KB)`);
}

build();
