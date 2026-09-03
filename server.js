#!/usr/bin/env node
// Servidor HTTP mínimo, sem dependências (só módulos nativos do Node).
//
// Por quê: o app sempre funcionou como um HTML puro, sem backend — mas isso
// significa que a persistência (localStorage, ou uma pasta escolhida via File
// System Access API) é por navegador/aparelho. A File System Access API nem
// existe em navegador de celular, então não dá pra abrir o mesmo
// gastos-data.json no computador e no celular sem esse servidor no meio.
//
// O que ele faz: serve os arquivos estáticos de STATIC_DIR (por padrão,
// dist/, o build standalone) e expõe GET/PUT em /api/data pra ler e gravar
// gastos-data.json — por padrão, na MESMA pasta de onde o index.html está
// sendo servido, pra computador e celular (via Tailscale, LAN etc.) lerem e
// gravarem sempre o mesmo arquivo. Pensado pra rodar sem exposição pública
// (atrás de Tailscale ou só na rede local) — não tem autenticação.
'use strict';
const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';
const STATIC_DIR = path.resolve(process.env.STATIC_DIR || path.join(__dirname, 'dist'));
const DATA_FILE = path.resolve(process.env.DATA_FILE || path.join(STATIC_DIR, 'gastos-data.json'));
const MAX_BODY_BYTES = 20 * 1024 * 1024; // 20MB — sobra bem pra anos de transações em JSON

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ 'Cache-Control': 'no-store' }, headers));
  res.end(body);
}
function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function handleGetData(req, res) {
  try {
    const raw = await fsp.readFile(DATA_FILE, 'utf8');
    send(res, 200, raw, { 'Content-Type': 'application/json; charset=utf-8' });
  } catch (e) {
    if (e.code === 'ENOENT') return sendJson(res, 404, { error: 'no data yet' });
    console.error('falha ao ler', DATA_FILE, e);
    sendJson(res, 500, { error: 'read failed' });
  }
}

async function handlePutData(req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return sendJson(res, e.status || 400, { error: e.message });
  }
  let parsed;
  try {
    parsed = JSON.parse(body.toString('utf8'));
  } catch (e) {
    return sendJson(res, 400, { error: 'invalid json' });
  }
  // grava em arquivo temporário + rename atômico — evita gastos-data.json corrompido
  // se o processo cair no meio da escrita (dois aparelhos salvando quase junto, etc.)
  const tmpFile = `${DATA_FILE}.tmp-${process.pid}`;
  try {
    await fsp.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fsp.writeFile(tmpFile, JSON.stringify(parsed));
    await fsp.rename(tmpFile, DATA_FILE);
    sendJson(res, 200, { ok: true });
  } catch (e) {
    console.error('falha ao salvar', DATA_FILE, e);
    try { await fsp.unlink(tmpFile); } catch (e2) { /* nada a limpar */ }
    sendJson(res, 500, { error: 'write failed' });
  }
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = path.join(STATIC_DIR, urlPath === '/' ? '/index.html' : urlPath);
  const rel = path.relative(STATIC_DIR, filePath);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return send(res, 403, 'Forbidden');
  try {
    const data = await fsp.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  } catch (e) {
    // sem roteamento client-side pra falar de verdade — isso só cobre quem digitou
    // uma URL errada; sempre cai de volta pro dashboard.
    try {
      const data = await fsp.readFile(path.join(STATIC_DIR, 'index.html'));
      send(res, 200, data, { 'Content-Type': 'text/html; charset=utf-8' });
    } catch (e2) {
      send(res, 404, 'Not found');
    }
  }
}

const server = http.createServer((req, res) => {
  Promise.resolve()
    .then(() => {
      const urlPath = req.url.split('?')[0];
      if (urlPath === '/api/data') {
        if (req.method === 'GET') return handleGetData(req, res);
        if (req.method === 'PUT' || req.method === 'POST') return handlePutData(req, res);
        return send(res, 405, 'Method not allowed');
      }
      if (req.method === 'GET') return serveStatic(req, res);
      return send(res, 405, 'Method not allowed');
    })
    .catch((e) => {
      console.error('erro não tratado', e);
      sendJson(res, 500, { error: 'internal error' });
    });
});

server.listen(PORT, HOST, () => {
  console.log(`Gastos.IA rodando em http://${HOST}:${PORT}`);
  console.log(`Servindo ${STATIC_DIR}`);
  console.log(`Dados em ${DATA_FILE}`);
});
