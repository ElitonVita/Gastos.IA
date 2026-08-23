# Gastos.IA — Dashboard de Extratos (PDF → € → Gráficos)

Dashboard local, em um único `index.html`, para transformar extratos bancários em PDF em gráficos e categorias de gastos — sem enviar nada para a nuvem.

## Da ideia inicial ao que existe hoje

A ideia original (`IDEA.md`) era simples: *"a no-nonsense budget tracker — importar transações, taggeá-las rápido, comparar gasto mensal com o planejado, um gráfico que diga a verdade."*

Desde essa primeira ideia o projeto evoluiu de um tracker manual para um pipeline quase automático:

- **Importação deixou de ser manual** — em vez de digitar transações, o dashboard lê os **PDFs de extrato direto do banco** (via `pdf.js`, no próprio navegador) e extrai data, descrição, saída, entrada e saldo.
- **Suporte a dois bancos com layouts diferentes** — parsers dedicados para extratos da **Revolut** (formato "pipe", datas por nome de mês) e da **BIL — Banque Internationale à Luxembourg** (formato colunar, datas numéricas `dd.mm.aaaa`, conta corrente e fatura de cartão separadas), com **detecção automática do banco** pelo texto do PDF.
- **Transferências entre contas próprias deixaram de contar como gasto duplicado** — o dashboard identifica quando uma saída em um banco (ex.: BIL) corresponde a uma entrada em outro (ex.: Revolut) e liga as duas, manual ou automaticamente.
- **"Tagueação rápida" virou categorização assistida por IA local** — em vez de só marcar categorias na mão, um modelo rodando via **Ollama** (100% offline) sugere categorias para o que ainda está em "Outros", com opção de auto-categorizar ao importar.
- **"Um gráfico que diga a verdade" virou um dashboard completo** — gráficos por categoria e por mês, saída vs. entrada, filtros, busca com debounce, e exportação para CSV.
- **Persistência e robustez** — os dados ficam salvos no `localStorage` do navegador, com detecção de limite de armazenamento excedido e um fluxo de "Salvar agora" sem condição de corrida.

Veja [`PROJECT.md`](PROJECT.md) para a descrição completa do projeto — o que ele faz, o que não faz, e como contribuir com extratos de outros bancos.

## Arquivos
- `index.html` — dashboard para desenvolvimento; carrega os módulos em `src/` via `<script src>` (abre direto no navegador, mas precisa da pasta `src/` ao lado)
- `dist/index.html` — **versão standalone**, tudo injetado inline num único arquivo — é essa que você baixa/abre se só quer usar o app
- `src/` — o código-fonte separado por responsabilidade (parsers, renderização, persistência etc. — veja abaixo)
- `build.js` — script Node sem dependências que monta `dist/index.html` a partir de `index.html` + `src/`
- `PROJECT.md` — descrição completa do projeto, escopo e limitações
- `IDEA.md` — a ideia original que deu origem ao projeto
- `README.md` — este arquivo

## Como usar
1. Baixe `dist/index.html` (ou o `index.html` da raiz, se clonar o repo inteiro) e abra no navegador (duplo clique)
2. Arraste PDFs de extrato bancário (colunas: Data · Descrição · Saída · Entrada · Saldo)
3. Veja gráficos, filtre por categoria, troque Saída↔Entrada com o botão ⇆ na tabela
4. Exporte CSV se precisar

## Estrutura do código

O app é JS puro, sem framework e sem build obrigatório — `src/*.js` são scripts globais simples, só divididos em arquivos por responsabilidade em vez de um único bloco de 3500 linhas:

| Arquivo | Responsabilidade |
|---|---|
| `src/categories.js` | categorias, tipos de conta/banco, icon pickers, e o estado global da aplicação (transações, filtros, etc.) |
| `src/parsers.js` | parsing de números em euros e extração de transações dos PDFs (Revolut, BIL conta corrente, BIL cartão) |
| `src/render.js` | tabela, gráficos, KPIs, detecção de anomalias, heatmap de calendário |
| `src/file-handling.js` | drag-and-drop de PDF, barra de progresso, dados de exemplo, exportação CSV |
| `src/transactions.js` | notas, detalhes de transação, ações em massa, transferências entre contas |
| `src/ollama.js` | categorização assistida por IA local (Ollama) |
| `src/persistence.js` | salvar/carregar estado (`localStorage` e `gastos-data.json` via File System Access API) |
| `src/print-report.js` | relatório para impressão |
| `src/styles.css` | CSS customizado |

### Desenvolvimento
Edite os arquivos em `src/` (e o `index.html` da raiz para marcação/HTML). Para gerar o `dist/index.html` standalone atualizado:

```bash
node build.js
```

Sem `npm install`, sem bundler — o script só injeta cada `src/*.js`/`src/*.css` de volta inline no lugar da tag `<script src>`/`<link>` correspondente.

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

## Changelog

### Sprint 1 (2026-08-23)
- **Segurança:** escape de `c.name` em chips/legendas (XSS), SRI+crossorigin nos 4 CDNs
- **Bugs:** `isInternalTransfer` sem código morto, `fmtEUR(null)` com guard, `inPeriod` sem branch morto `__range__`
- **Persistência:** `persistStateImmediate()` sem race nos botões "Salvar agora" + detecção de `QuotaExceededError` com banner vermelho
- **UX:** debounce 180ms na busca, `aria-label` em botões ícone, preload com SRI do `pdf.worker.min.js`
