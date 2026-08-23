# Gastos.AI — Dashboard de Extratos (PDF → € → Gráficos)

Pasta dedicada — nada mais solto em `AI Projects`.

## Arquivos
- `index.html` — dashboard (abra no navegador ou via `open index.html`)
- `README.md` — este arquivo

## Como usar
1. Abra `index.html` no navegador (duplo clique)
2. Arraste PDFs de extrato bancário (colunas: Data · Descrição · Saída · Entrada · Saldo)
3. Veja gráficos, filtre por categoria, troque Saída↔Entrada com o botão ⇆ na tabela
4. Exporte CSV se precisar

## IA Local com Ollama (100% offline)
- Modelo padrão: `gemma4:latest` (9.6 GB, já detectado na sua máquina)
- URL padrão: `http://localhost:11434`
- Card **IA Local** no dashboard:
  - `Testar` — verifica se Ollama está online
  - `Categorizar com IA local` — categoriza só o que ainda está em "Outros" (ou tudo, se já estiver tudo categorizado)
  - ☑ `Auto-categorizar ao importar PDF` — faz sozinho ao soltar arquivos

### Ligar Ollama com CORS (uma vez)
```bash
brew services stop ollama
OLLAMA_ORIGINS="*" ollama serve
# ou permanente:
launchctl setenv OLLAMA_ORIGINS "*" && brew services restart ollama
```

Teste: `curl http://localhost:11434/api/tags` deve listar `gemma4:latest`.

## Changelog — Sprint 1 (2026-08-23)
- **Segurança:** escape de `c.name` em chips/legendas (XSS), SRI+crossorigin nos 4 CDNs
- **Bugs:** `isInternalTransfer` sem código morto, `fmtEUR(null)` com guard, `inPeriod` sem branch morto `__range__`
- **Persistência:** `persistStateImmediate()` sem race nos botões "Salvar agora" + detecção de `QuotaExceededError` com banner vermelho
- **UX:** debounce 180ms na busca, `aria-label` em botões ícone, preload com SRI do `pdf.worker.min.js`
