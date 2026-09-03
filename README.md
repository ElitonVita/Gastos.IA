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
- `server.js` — servidor HTTP mínimo (sem dependências) opcional, pra persistência compartilhada entre aparelhos — veja [Rodando via Docker](#rodando-via-docker-acesso-do-celular)
- `PROJECT.md` — descrição completa do projeto, escopo e limitações
- `IDEA.md` — a ideia original que deu origem ao projeto
- `README.md` — este arquivo

## Como usar
1. Baixe `dist/index.html` (ou o `index.html` da raiz, se clonar o repo inteiro) e abra no navegador (duplo clique)
2. Arraste PDFs de extrato bancário (colunas: Data · Descrição · Saída · Entrada · Saldo)
3. Veja gráficos, filtre por categoria, troque Saída↔Entrada com o botão ⇆ na tabela
4. Exporte CSV se precisar

Nesse modo (arquivo aberto direto, sem servidor) os dados ficam salvos no `localStorage` do navegador, ou numa pasta do seu computador se você clicar em **Escolher pasta** (Chrome/Edge) — cada aparelho tem os seus próprios dados. Se você quer abrir o **mesmo** painel, com os **mesmos** dados, tanto no computador quanto no celular, veja a seção abaixo.

## Rodando via Docker (acesso do celular)

Por padrão o app não tem backend — mas rodando `server.js` (via Docker ou `node server.js` direto), ele passa a servir o `dist/index.html` **e** gravar/ler o `gastos-data.json` no próprio servidor, na mesma pasta do `index.html`. Assim, computador e celular acessando o mesmo endereço (por exemplo, via [Tailscale](https://tailscale.com/)) veem e editam **os mesmos dados**, sem precisar escolher pasta em cada aparelho — a File System Access API (o botão "Escolher pasta") nem existe em navegador de celular.

```bash
docker compose up -d --build
```

Isso sobe o painel em `http://localhost:8080` (ajuste a porta em `docker-compose.yml` se quiser) e cria uma pasta `./dist` aqui do lado — é literalmente "a pasta onde o `index.html` está": nela fica o `index.html` gerado (sempre atualizado a cada `docker compose up`, a partir de `src/`) e, assim que você salvar algo no app, o `gastos-data.json` ao lado dele. Dá pra abrir esse `.json` direto, copiar, versionar num backup, etc.

Pra acessar do celular, instale o [Tailscale](https://tailscale.com/) no servidor (ou máquina/NAS) e no celular, entre na mesma tailnet, e acesse `http://<nome-ou-ip-tailscale-do-servidor>:8080` pelo navegador do celular — sem abrir porta nenhuma pra internet pública.

Sem Docker, dá pra rodar direto (só precisa de Node):
```bash
node build.js && node server.js
```

Variáveis de ambiente, todas opcionais:
| Variável | Padrão | O que faz |
|---|---|---|
| `PORT` | `8080` | Porta HTTP |
| `HOST` | `0.0.0.0` | Endereço pra escutar |
| `STATIC_DIR` | `./dist` | Pasta servida como o site |
| `DATA_FILE` | `<STATIC_DIR>/gastos-data.json` | Onde ler/gravar os dados |

**Sem autenticação** — pensado pra rodar atrás de uma rede que já é privada (Tailscale, LAN de casa), não pra expor na internet pública. Se você já tinha dados salvos só no `localStorage` do navegador quando ligar o modo servidor pela primeira vez, o app detecta o servidor vazio, carrega o que já existia localmente e sobe pro servidor na primeira gravação — nada se perde na troca.

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
| `src/persistence.js` | salvar/carregar estado (`localStorage`, `gastos-data.json` via File System Access API, e via `/api/data` quando rodando atrás de `server.js`) |
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

### Sprint 3 (2026-09-03)
- **Persistência compartilhada:** `server.js` (sem dependências) + `Dockerfile`/`docker-compose.yml` — rodando atrás de um servidor, `gastos-data.json` fica na pasta do próprio servidor e é lido/gravado via `/api/data`, permitindo acesso com os mesmos dados do computador e do celular (ex.: via Tailscale). Sem servidor, o app continua funcionando exatamente como antes (pasta local / `localStorage`).

### Sprint 1 (2026-08-23)
- **Segurança:** escape de `c.name` em chips/legendas (XSS), SRI+crossorigin nos 4 CDNs
- **Bugs:** `isInternalTransfer` sem código morto, `fmtEUR(null)` com guard, `inPeriod` sem branch morto `__range__`
- **Persistência:** `persistStateImmediate()` sem race nos botões "Salvar agora" + detecção de `QuotaExceededError` com banner vermelho
- **UX:** debounce 180ms na busca, `aria-label` em botões ícone, preload com SRI do `pdf.worker.min.js`
