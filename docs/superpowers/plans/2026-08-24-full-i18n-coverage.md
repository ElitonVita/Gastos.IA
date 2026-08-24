# Full EN/PT i18n Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every user-facing Portuguese string in Gastos.IA — static HTML and dynamically-rendered JS content alike — resolves through the existing `t()`/`data-i18n-*` i18n system, so switching to English via the header language selector leaves no Portuguese text visible anywhere in the app.

**Architecture:** The i18n system (`src/i18n.js`, `src/locales.js` generated from `locales/pt.json`/`locales/en.json`) already works and is proven (header, dropzone, filters, table headers, some modal buttons are wired). This plan (a) adds every missing locale key to both JSON files, (b) wires the remaining static HTML with `data-i18n`/`data-i18n-placeholder`/`data-i18n-title`/`data-i18n-option`, (c) replaces every hardcoded Portuguese string in `src/*.js` with a `t(...)` call, and (d) confirms `switchLanguage()`'s existing re-render hooks actually repaint everything once step (c) is done.

**Tech Stack:** Vanilla JS (no build tooling beyond `build.js`/`gen-locales.js`), Chart.js, Tailwind (CDN). No test framework in this repo — verification is manual, in-browser, in both languages.

## Global Constraints

- **`t` is a shadowed name — never call it bare inside `src/render.js` or `src/transactions.js`.** Both files use `t` as the per-transaction loop variable (`txP.forEach(t=>{ if(t.saida...) })`) throughout. Because `src/i18n.js` declares `function t(key, params={})` as a plain top-level function (classic `<script>`, no modules — this makes `t` global, same mechanism that makes `fmtEUR`/`monthLabel`/`escapeHtml` callable from every file), a bare `t('some.key')` call written inside a scope that also has a `t` transaction parameter **silently calls the wrong thing** (or throws, since `tx.t('some.key')` isn't valid — you'd get `t is not a function` or, worse, it silently resolves to whatever local `t` shadows it, doing nothing and failing quietly). **Fix:** in `src/render.js` and `src/transactions.js` only, always call `window.i18n.t(...)` explicitly (never the bare `t(...)`). In every other file (`src/file-handling.js`, `src/ollama.js`, `src/persistence.js`, `src/print-report.js`, `src/categories.js`) the bare global `t(...)` is safe to use directly — grep each file first (`grep -n '(^|[^.])\bt\s*=>' file.js` or just eyeball every `forEach`/`map`/`filter` callback param name) to confirm no local `t` exists before relying on the bare form there too.
- **Locale key naming:** dot-path, lower-camelCase segments, matching the existing convention in `locales/pt.json` (e.g. `settings.ai.title`, `modals.details.title`). New keys go under the most specific existing namespace; only create a new top-level namespace (`dashboard`) when nothing existing fits.
- **`data-i18n-html="true"`** only on spans/paragraphs whose translated value legitimately contains markup (existing convention, see `app.title`). Every other `data-i18n` uses `textContent`.
- **Never translate:** demo-data transaction descriptions in `src/transactions.js` (`DEMO` array — realistic Portuguese merchant names for a Portugal-based user, e.g. "Pingo Doce Supermercado"; translating them would make the demo data read as fictional/foreign), the Ollama system/user prompts in `src/ollama.js` (`categorizeWithOllama` — these are instructions sent to the local LLM, not shown to the user), and `console.log`/`console.warn` diagnostic strings in `src/persistence.js` (developer-facing only, never rendered in the UI). Each of these three exclusions must be called out with a code comment (`// i18n: intentionally not translated — <reason>`) at the point in the file where a future reader might otherwise expect a `t()` call.
- **After every task**, regenerate `src/locales.js` (`node gen-locales.js`) before testing in-browser — the JSON files are not read directly at runtime.
- **Test each task** by serving the repo over HTTP (`python3 -m http.server` from the repo root, not `file://` — you need to observe live language switching, which works either way, but a local server keeps parity with how the project is normally iterated on) and toggling 🇧🇷/🇬🇧 in the header, confirming: no raw dot-path keys visible (e.g. `settings.ai.title` literally on screen means a key is missing from one locale file), no leftover Portuguese in the areas that task touched, and the existing areas (header, dropzone, filters, table columns) still translate correctly (regression check).

---

## Part 1 — Static HTML (`index.html`)

### Task 1: Locale keys + wiring for dashboard section eyebrows, KPI cards, and the period bar

**Files:**
- Modify: `locales/pt.json`, `locales/en.json` (add `dashboard` namespace, extend `kpis`)
- Modify: `index.html:61-118` (period bar + KPI row)

**Interfaces:**
- Consumes: existing `t()`/`applyTranslations()` from `src/i18n.js` (already loaded, no changes needed there in this task)
- Produces: new locale keys under `dashboard.*` and extended `kpis.*`, used by Task 5 (render.js KPI rendering) later

- [ ] **Step 1: Add the `dashboard` namespace to `locales/pt.json`**

Add as a new top-level key (after `"charts"`, before `"budget"` — matches the file's existing top-to-bottom ordering of "things shown in the main dashboard view before settings"):

```json
"dashboard": {
  "periodLabel": "Período",
  "periodExpenses": "Gastos no período:",
  "periodIncome": "Entradas:",
  "sectionOverview": "01 · Visão geral",
  "sectionWhereItGoes": "02 · Para onde vai",
  "sectionPatterns": "03 · Padrões no tempo"
},
```

- [ ] **Step 2: Add the same namespace to `locales/en.json`**

```json
"dashboard": {
  "periodLabel": "Period",
  "periodExpenses": "Expenses this period:",
  "periodIncome": "Income:",
  "sectionOverview": "01 · Overview",
  "sectionWhereItGoes": "02 · Where it goes",
  "sectionPatterns": "03 · Patterns over time"
},
```

- [ ] **Step 3: Extend `kpis` in both files**

In `locales/pt.json`, inside the existing `"kpis": { ... }` object, add:

```json
"transactionsLabel": "{count} transações",
"avgTicket": "Ticket médio",
"perTransaction": "por transação",
"insightTitle": "O que mais pesa?",
"insightDefault": "Adicione PDFs para ver insights."
```

In `locales/en.json`, inside `"kpis"`, add:

```json
"transactionsLabel": "{count} transactions",
"avgTicket": "Avg ticket",
"perTransaction": "per transaction",
"insightTitle": "What weighs the most?",
"insightDefault": "Add PDFs to see insights."
```

- [ ] **Step 4: Regenerate `src/locales.js`**

Run: `node gen-locales.js`
Expected: `src/locales.js gerado (NN KB)` with a larger KB count than before.

- [ ] **Step 5: Wire the period bar in `index.html`**

Read the current block first (`index.html:61-76`), then apply this pattern — one worked example, then the rest follow the identical pattern via the table below:

Before (`index.html:61`):
```html
<span class="text-[11px] font-bold tracking-widest uppercase text-zinc-500"><i class="ri-calendar-line"></i> Período</span>
```
After:
```html
<span class="text-[11px] font-bold tracking-widest uppercase text-zinc-500"><i class="ri-calendar-line"></i> <span data-i18n="dashboard.periodLabel">Período</span></span>
```

Apply the same "wrap the literal text in `<span data-i18n="key">text</span>`" mechanical pattern (or add `data-i18n-option`/`data-i18n` directly on the element when it's a `<button>`/`<option>` with no other children) for the rest of this task's strings:

| Line | Element | Old text | data-i18n key |
|---|---|---|---|
| 64 | `<button data-period="">` | `Tudo` | `filters.periodChips.all` |
| 67 | `<option value="">` | `Todo o período` | `filters.allPeriods` |
| 70 | `<span>` before `#periodTotal` | `Gastos no período:` | `dashboard.periodExpenses` |
| 73 | `<span>` before `#periodIn` | `Entradas:` | `dashboard.periodIncome` |
| 83 | `<span>` eyebrow | `01 · Visão geral` | `dashboard.sectionOverview` |
| 140 | `<span>` eyebrow | `02 · Para onde vai` | `dashboard.sectionWhereItGoes` |
| 176 | `<span>` eyebrow | `03 · Padrões no tempo` | `dashboard.sectionPatterns` |

- [ ] **Step 6: Wire the KPI row (`index.html:87-118`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 89 | `Saldo atual` | `kpis.balance` |
| 91 | `Entradas − saídas de todo o histórico.` | `kpis.balanceSubDefault` |
| 94 | `Total gasto` | `kpis.totalExpenses` |
| 96 | `0 transações` | `kpis.transactionsLabel` (note: this text is fully replaced at runtime by `updateKPIs()` in Task 5 — wiring `data-i18n` here just fixes the pre-render flash before JS runs) |
| 100 | `Maior categoria` | `kpis.topCategory` |
| 105 | `Ticket médio` | `kpis.avgTicket` |
| 107 | `por transação` | `kpis.perTransaction` |
| 110 | `Taxa de poupança` | `kpis.savingsRate` |
| 112 | `sem entradas no período` | `kpis.noIncome` |
| 115 | `O que mais pesa?` | `kpis.insightTitle` |
| 116 | `Adicione PDFs para ver insights.` | `kpis.insightDefault` |

- [ ] **Step 7: Verify in-browser**

Serve the repo (`python3 -m http.server 8000` from repo root), open `http://localhost:8000/index.html`, switch to English. Confirm: "Period", "Expenses this period:", "Income:", "01 · Overview", "02 · Where it goes", "03 · Patterns over time", and every KPI card label listed above show in English with no raw key text and no leftover Portuguese in the areas touched.

- [ ] **Step 8: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js index.html
git commit -m "i18n: wire dashboard eyebrows and KPI cards"
```

---

### Task 2: Locale keys + wiring for the Cashflow, Category, Month/Merchant, Histogram, Trend, Recurring, Anomalies, Day-of-week, Calendar, and Category-comparison chart cards

**Files:**
- Modify: `locales/pt.json`, `locales/en.json` (extend `charts`, `anomalies`, `budget`)
- Modify: `index.html:121-259`

**Interfaces:**
- Consumes: Task 1's regen step, same `t()`/`applyTranslations()` machinery
- Produces: `charts.*` keys consumed by Task 5b (render.js chart-building code)

- [ ] **Step 1: Extend `charts` in `locales/pt.json`**

Inside the existing `"charts": { ... }` object, extend `"mode"` and `"cashflowMode"`, and add `"cashflow"`, `"category"`, `"monthChart"`, `"merchantChart"`, `"histogram"`, `"trend"`, `"recurring"`, `"dow"`, `"calendar"`, `"compare"`, `"waterfall"`:

```json
"mode": {
  "donut": "Rosca",
  "bar": "Barras",
  "waterfall": "Cascata"
},
"compareMode": {
  "bars": "Barras agrupadas",
  "lines": "Linhas sobrepostas"
},
"budgetScope": {
  "month": "Mês atual",
  "quarter": "Trimestre",
  "year": "Ano",
  "cumulative": "Acumulado"
},
"cashflowMode": {
  "monthly": "Mensal",
  "cumulative": "Acumulado",
  "forecast": "Previsão"
},
"cashflow": {
  "title": "Fluxo de caixa",
  "hintCumulative": "· saldo acumulado ao longo do tempo",
  "subtitle": "Entradas − saídas reais, sem transferências internas. Verde = sobrando, vermelho = consumindo reserva."
},
"category": {
  "title": "Onde seu dinheiro vai",
  "hintByCategory": "· por categoria"
},
"monthChart": {
  "title": "Evolução mensal",
  "legendLabel": "Total mensal ·"
},
"merchantChart": {
  "title": "Top estabelecimentos / descrições",
  "subtitle": "Quem mais levou seu dinheiro no período"
},
"histogram": {
  "title": "Distribuição de valores",
  "badge": "Histograma",
  "hint": "Picos indicam faixa de gasto mais comum. Use para identificar micro-gastos recorrentes."
},
"trend": {
  "title": "Tendência de gastos",
  "subtitle": "Média móvel (3 meses) vs gasto mensal"
},
"recurring": {
  "title": "Gastos recorrentes detectados",
  "subtitle": "Mesma descrição em vários meses — assinaturas e fixos"
},
"dow": {
  "subtitle": "Onde seus gastos se concentram"
},
"calendar": {
  "title": "Calendário de gastos",
  "subtitle": "Cor mais forte = dia com mais gasto — pico de salário, fim de semana, etc."
},
"compare": {
  "title": "Comparativo por categoria",
  "hintBars": "· barras lado a lado por mês",
  "hintLines": "· tendência de cada categoria mês a mês",
  "hintCumulative": "· real sobreposto à meta acumulada dos {n} meses do período — suaviza picos isolados (férias, etc.)",
  "hintThisMonth": "· real sobreposto à meta definida em Configurações, mês mais recente",
  "tabBars": "Barras",
  "tabLines": "Linhas",
  "tabBudget": "Orçamento",
  "cumulativeTitle": "Soma o orçamento e o gasto real de todos os meses do período — evita que um mês fora da curva (férias, etc.) pareça um estouro isolado",
  "noBudgetDefined": "Nenhuma categoria tem orçamento definido ainda. Defina metas em <b>Configurações → Orçamentos mensais</b>."
},
"waterfall": {
  "income": "Renda",
  "otherCategories": "Outras categorias",
  "balance": "Saldo",
  "howToRead": "Como ler:",
  "explanation": "começa na sua renda do período e desce categoria por categoria até o que sobrou.",
  "legendIncomePositive": "Renda / saldo positivo",
  "legendNegative": "Saldo negativo",
  "legendOtherGrouped": "Outras categorias agrupadas",
  "emptyState": "Sem dados ainda — adicione PDFs ou use o exemplo."
}
```

(This replaces the existing `mode`, `compareMode`, `budgetScope`, `cashflowMode` sub-objects in place — keep every pre-existing key, only the additions are new.)

- [ ] **Step 2: Extend `charts` in `locales/en.json`** — same structure, English text:

```json
"mode": { "donut": "Donut", "bar": "Bars", "waterfall": "Waterfall" },
"compareMode": { "bars": "Grouped bars", "lines": "Overlaid lines" },
"budgetScope": { "month": "Current month", "quarter": "Quarter", "year": "Year", "cumulative": "Cumulative" },
"cashflowMode": { "monthly": "Monthly", "cumulative": "Cumulative", "forecast": "Forecast" },
"cashflow": {
  "title": "Cash flow",
  "hintCumulative": "· cumulative balance over time",
  "subtitle": "Income − real expenses, excluding internal transfers. Green = surplus, red = drawing down reserves."
},
"category": { "title": "Where your money goes", "hintByCategory": "· by category" },
"monthChart": { "title": "Monthly evolution", "legendLabel": "Monthly total ·" },
"merchantChart": { "title": "Top merchants / descriptions", "subtitle": "Who took most of your money this period" },
"histogram": {
  "title": "Value distribution",
  "badge": "Histogram",
  "hint": "Peaks show the most common spending range. Use it to spot recurring micro-expenses."
},
"trend": { "title": "Spending trend", "subtitle": "3-month moving average vs monthly spend" },
"recurring": { "title": "Recurring charges detected", "subtitle": "Same description across several months — subscriptions and fixed costs" },
"dow": { "subtitle": "Where your spending concentrates" },
"calendar": { "title": "Spending calendar", "subtitle": "Stronger color = day with more spending — payday, weekend, etc." },
"compare": {
  "title": "Category comparison",
  "hintBars": "· side-by-side bars per month",
  "hintLines": "· each category's trend month by month",
  "hintCumulative": "· actuals overlaid on the cumulative target across {n} months — smooths out one-off spikes (vacations, etc.)",
  "hintThisMonth": "· actuals overlaid on the target set in Settings, most recent month",
  "tabBars": "Bars",
  "tabLines": "Lines",
  "tabBudget": "Budget",
  "cumulativeTitle": "Sums the budget and real spend across every month in the period — keeps one outlier month (vacation, etc.) from looking like a blown budget",
  "noBudgetDefined": "No category has a budget set yet. Set targets in <b>Settings → Monthly budgets</b>."
},
"waterfall": {
  "income": "Income",
  "otherCategories": "Other categories",
  "balance": "Balance",
  "howToRead": "How to read:",
  "explanation": "starts at your income for the period and works down category by category to what's left.",
  "legendIncomePositive": "Income / positive balance",
  "legendNegative": "Negative balance",
  "legendOtherGrouped": "Other categories grouped",
  "emptyState": "No data yet — add PDFs or use the example."
}
```

- [ ] **Step 3: Add `anomalies.subtitle` to both files**

`locales/pt.json`, inside `"anomalies"`: `"subtitle": "Cobranças repetidas, valores fora do padrão e picos de gasto — vale conferir"`
`locales/en.json`, inside `"anomalies"`: `"subtitle": "Repeated charges, out-of-pattern values and spending spikes — worth a look"`

- [ ] **Step 4: Regenerate `src/locales.js`**

Run: `node gen-locales.js`

- [ ] **Step 5: Wire the Cashflow chart card (`index.html:121-135`)**

Worked example — before:
```html
<h3 class="font-bold text-sm">Fluxo de caixa <span class="font-normal text-zinc-500" id="cashflowHint">· saldo acumulado ao longo do tempo</span></h3>
```
After:
```html
<h3 class="font-bold text-sm"><span data-i18n="charts.cashflow.title">Fluxo de caixa</span> <span class="font-normal text-zinc-500" id="cashflowHint" data-i18n="charts.cashflow.hintCumulative">· saldo acumulado ao longo do tempo</span></h3>
```
(Note: `#cashflowHint`'s `data-i18n` here only fixes the initial static text — `updateCharts()` in `src/render.js` overwrites `cashflowHint.textContent` at runtime per cashflow mode, which Task 5b's `charts.cashflow.hintCumulative`/`charts.cashflowMode.forecast`-based calls will handle for the live-updated cases.)

| Line | Element | Old text | data-i18n key |
|---|---|---|---|
| 125 | button `data-cashflowmode="cumulative"` | `Acumulado` | `charts.cashflowMode.cumulative` |
| 126 | button `data-cashflowmode="monthly"` | `Mensal` | `charts.cashflowMode.monthly` |
| 127 | button `data-cashflowmode="forecast"` | `Previsão` | `charts.cashflowMode.forecast` |
| 130 | `<p id="cashflowSub">` | `Entradas − saídas reais, sem transferências internas. Verde = sobrando, vermelho = consumindo reserva.` | `charts.cashflow.subtitle` |

- [ ] **Step 6: Wire the Category chart card (`index.html:144-157`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 146 | `Onde seu dinheiro vai` | `charts.category.title` |
| 146 | `#catModeHint` `· por categoria` | `charts.category.hintByCategory` |
| 148 | `Donut` | `charts.mode.donut` |
| 149 | `Barras` | `charts.mode.bar` |
| 150 | `Cascata` | `charts.mode.waterfall` |

- [ ] **Step 7: Wire Month/Merchant charts (`index.html:160-171`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 162 | `Evolução mensal` | `charts.monthChart.title` |
| 164 | `Total mensal ·` (text before `#monthRange`) | `charts.monthChart.legendLabel` |
| 167 | `Top estabelecimentos / descrições` | `charts.merchantChart.title` |
| 168 | `Quem mais levou seu dinheiro no período` | `charts.merchantChart.subtitle` |

- [ ] **Step 8: Wire Histogram (`index.html:180-187`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 182 | `Distribuição de valores` | `charts.histogram.title` |
| 183 | `Histograma` (badge span) | `charts.histogram.badge` |
| 186 | `Picos indicam faixa de gasto mais comum...` | `charts.histogram.hint` |

- [ ] **Step 9: Wire Trend + Recurring (`index.html:190-204`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 193 | `Tendência de gastos` | `charts.trend.title` |
| 196 | `Média móvel (3 meses) vs gasto mensal` | `charts.trend.subtitle` |
| 200 | `Gastos recorrentes detectados` | `charts.recurring.title` |
| 201 | `Mesma descrição em vários meses — assinaturas e fixos` | `charts.recurring.subtitle` |

- [ ] **Step 10: Wire Anomalies card (`index.html:207-214`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 209 | `Gastos estranhos detectados` | `anomalies.title` |
| 212 | `Cobranças repetidas, valores fora do padrão e picos de gasto — vale conferir` | `anomalies.subtitle` |

- [ ] **Step 11: Wire Day-of-week + Calendar (`index.html:217-234`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 219 | `Por dia da semana` | `charts.legends.dayOfWeek` |
| 221 | `Onde seus gastos se concentram` | `charts.dow.subtitle` |
| 225 | `Calendário de gastos` | `charts.calendar.title` |
| 229 | `Cor mais forte = dia com mais gasto...` | `charts.calendar.subtitle` |

- [ ] **Step 12: Wire Category comparison (`index.html:237-259`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 239 | `Comparativo por categoria` | `charts.compare.title` |
| 239 | `#compareModeHint` `· barras lado a lado por mês` | `charts.compare.hintBars` |
| 243 | button `data-comparemode="bars"` | `charts.compare.tabBars` |
| 244 | button `data-comparemode="lines"` | `charts.compare.tabLines` |
| 245 | button `data-comparemode="budget"` | `charts.compare.tabBudget` |
| 252 | button `data-budgetscope="month"` | `charts.budgetScope.month` |
| 253 | button `data-budgetscope="cumulative"` (text) | `charts.budgetScope.cumulative` |
| 253 | same button, `title="Soma o orçamento..."` | add `data-i18n-title="charts.compare.cumulativeTitle"` |
| 258 | `<p id="compareBudgetEmpty">` (contains `<b>` tags) | `charts.compare.noBudgetDefined` — add `data-i18n-html="true"` |

- [ ] **Step 13: Verify in-browser**

Same server as Task 1. Load demo data (Settings → "Ver com dados de exemplo" / "Load demo data") so charts actually render, switch language, scroll through every card in this task and confirm English text with no raw keys, no Portuguese leftovers, no visual breakage (chart canvases still sized correctly, tab buttons still highlight the active mode).

- [ ] **Step 14: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js index.html
git commit -m "i18n: wire chart card titles, subtitles, and mode toggles"
```

---

### Task 3: Locale keys + wiring for the transactions toolbar, bulk-action bar, table sort tooltips, and empty state

**Files:**
- Modify: `locales/pt.json`, `locales/en.json` (extend `table`, `actions`)
- Modify: `index.html:261-336`

- [ ] **Step 1: Extend `table` in `locales/pt.json`**

Inside `"table"`, add (alongside the existing `"columns"` object):

```json
"howItWorks": "<span class=\"font-bold\">Como funciona:</span> Importe extratos em <b>Configurações → Importar PDFs</b> → os gráficos usam só <b>Saídas</b> → corrija categorias na tabela. Tudo salvo automaticamente.",
"title": "Transações",
"subtitle": "· extrato completo",
"selectAllTitle": "Selecionar tudo nesta página",
"sort": {
  "date": "Ordenar por data",
  "description": "Ordenar por descrição",
  "expense": "Ordenar por valor de saída",
  "income": "Ordenar por valor de entrada",
  "category": "Ordenar por categoria"
},
"emptyTitle": "Nenhuma despesa ainda",
"emptyDetail": "Adicione PDFs de extrato bancário (com colunas Data, Descrição, Saída, Entrada, Saldo) em <b>Configurações</b>, ou use dados de exemplo para explorar.",
"goToSettings": "Ir para Configurações"
```

- [ ] **Step 2: Extend `table` in `locales/en.json`**

```json
"howItWorks": "<span class=\"font-bold\">How it works:</span> Import statements in <b>Settings → Import PDFs</b> → charts only use <b>Expenses</b> → fix categories in the table. Everything saves automatically.",
"title": "Transactions",
"subtitle": "· full statement",
"selectAllTitle": "Select all on this page",
"sort": {
  "date": "Sort by date",
  "description": "Sort by description",
  "expense": "Sort by expense amount",
  "income": "Sort by income amount",
  "category": "Sort by category"
},
"emptyTitle": "No expenses yet",
"emptyDetail": "Add bank statement PDFs (with Date, Description, Expense, Income, Balance columns) in <b>Settings</b>, or use demo data to explore.",
"goToSettings": "Go to Settings"
```

- [ ] **Step 3: Extend `actions` in `locales/pt.json`**

Add: `"linkTransferHint": "Selecione a saída (ex: BIL) e a entrada (ex: Revolut) da mesma transferência"`, `"linkTransferBetweenAccounts": "Transferência entre contas"`, `"bulkCountSuffix": "selecionada(s)"`

- [ ] **Step 4: Extend `actions` in `locales/en.json`**

Add: `"linkTransferHint": "Select the outgoing (e.g. BIL) and incoming (e.g. Revolut) side of the same transfer"`, `"linkTransferBetweenAccounts": "Transfer between accounts"`, `"bulkCountSuffix": "selected"`

- [ ] **Step 5: Regenerate `src/locales.js`**

Run: `node gen-locales.js`

- [ ] **Step 6: Wire the "how it works" banner and table toolbar (`index.html:262-315`)**

Worked example — before (`index.html:263`):
```html
<p class="text-xs text-zinc-600 dark:text-zinc-400"><span class="font-bold">Como funciona:</span> Importe extratos em <b>Configurações → Importar PDFs</b> → os gráficos usam só <b>Saídas</b> → corrija categorias na tabela. Tudo salvo automaticamente.</p>
```
After:
```html
<p class="text-xs text-zinc-600 dark:text-zinc-400" data-i18n="table.howItWorks" data-i18n-html="true"><span class="font-bold">Como funciona:</span> Importe extratos em <b>Configurações → Importar PDFs</b> → os gráficos usam só <b>Saídas</b> → corrija categorias na tabela. Tudo salvo automaticamente.</p>
```

| Line | Element | Old text | data-i18n key |
|---|---|---|---|
| 271 | `<h3>` | `Transações` | `table.title` |
| 271 | `<span>` after title | `· extrato completo` | `table.subtitle` |
| 309 | checkbox `title=` | `Selecionar tudo nesta página` | `data-i18n-title="table.selectAllTitle"` |
| 310 | `<th data-sort="date">` `title=` | `Ordenar por data` | `data-i18n-title="table.sort.date"` |
| 311 | `<th data-sort="desc">` `title=` | `Ordenar por descrição` | `data-i18n-title="table.sort.description"` |
| 312 | `<th data-sort="saida">` `title=` | `Ordenar por valor de saída` | `data-i18n-title="table.sort.expense"` |
| 313 | `<th data-sort="entrada">` `title=` | `Ordenar por valor de entrada` | `data-i18n-title="table.sort.income"` |
| 314 | `<th data-sort="cat">` `title=` | `Ordenar por categoria` | `data-i18n-title="table.sort.category"` |

- [ ] **Step 7: Wire the bulk-action bar (`index.html:291-304`)**

| Line | Element | Old text | data-i18n key |
|---|---|---|---|
| 292 | `<span>` after `#bulkCount` | `selecionada(s)` | `actions.bulkCountSuffix` |
| 295 | `<option>` in `#bulkCatSelect` | `Categoria...` | `data-i18n-option="actions.bulkCategory"` |
| 297 | `<option>` in `#bulkBankSelect` | `Tipo de conta...` | `data-i18n-option="actions.bulkBank"` |
| 299 | `#bulkSwapBtn` text (after icon) | `Trocar Saída ↔ Entrada` | `actions.swap` |
| 300 | `#bulkLinkTransferBtn` `title=` | `Selecione a saída (ex: BIL)...` | `data-i18n-title="actions.linkTransferHint"` |
| 300 | `#bulkLinkTransferBtn` text (after icon) | `Transferência entre contas` | `actions.linkTransferBetweenAccounts` |
| 301 | `#bulkNoteBtn` text (after icon) | `Nota` | `actions.note` |
| 302 | `#bulkDeleteBtn` text (after icon) | `Excluir` | `common.delete` |
| 303 | `#bulkClearBtn` text (after icon) | `Limpar seleção` | `actions.bulkClear` |

- [ ] **Step 8: Wire the empty state (`index.html:320-325`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 322 | `Nenhuma despesa ainda` | `table.emptyTitle` |
| 323 | full paragraph with `<b>` tags | `table.emptyDetail` — add `data-i18n-html="true"` |
| 324 | button text | `table.goToSettings` |

- [ ] **Step 9: Verify in-browser**

Select two or more transactions in the table to reveal the bulk bar; confirm every bulk-bar string and both `title=` tooltips (hover to see) switch language. Clear all data (Settings → "Limpar tudo"/"Clear all") to see the empty state and confirm it translates too.

- [ ] **Step 10: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js index.html
git commit -m "i18n: wire transactions toolbar, bulk bar, sort tooltips, empty state"
```

---

### Task 4: Locale keys + wiring for every Settings card

**Files:**
- Modify: `locales/pt.json`, `locales/en.json` (extend `settings`, `budget`, `openingBalance`)
- Modify: `index.html:340-490`

- [ ] **Step 1: Extend `settings` in `locales/pt.json`**

Add `"backToDashboard": "← Voltar ao dashboard"` at the top level of `"settings"`. Inside `"settings.ai"`, add:

```json
"statusChecking": "a verificar...",
"testButton": "Testar",
"saveJsonNowTitle": "Salvar gastos-data.json agora",
"footerNote": "100% offline · <span class=\"text-zinc-400\">{model}</span> já detectado ({size}) · Nada sai da sua rede."
```

Inside `"settings.banks"`, add: `"addShort": "+ Novo"`, `"hint": "Detectado automaticamente ao importar PDFs (BIL, Cartão BIL, Revolut). Crie outros tipos se usar mais contas — aparece discretamente abaixo da descrição na tabela de transações, e pode ser ajustado por transação ou em massa."`

Add a new `"settings.importPdfs"` object:

```json
"importPdfs": {
  "title": "Importar PDFs",
  "badge": "Arraste ou selecione",
  "localNote": "100% local — nada sai do seu PC · € (1.234,56 €)",
  "readingProgress": "Lendo PDFs...",
  "formatHint": "<span class=\"font-bold\">Formato:</span> Data, Descrição, <b class=\"text-red-600\">Saída</b>, <b class=\"text-emerald-600\">Entrada</b>, Saldo. Só <b>Saídas</b> entram nos gráficos. Duplicatas são ignoradas automaticamente.",
  "formatHintExtra": "Testado com extratos <b>Revolut</b>. Datas numéricas (dd.mm.aaaa, comuns em bancos europeus como <b>BIL Luxembourg</b>) também são reconhecidas — se o seu extrato não importar corretamente, veja como reportar em <b>Configurações → Dados</b> ou ajuste manualmente na tabela.",
  "dragAnywhereHint": "Você também pode arrastar PDFs em qualquer lugar da página do dashboard."
}
```

Inside `"settings.categories"`, add: `"addShort": "+ Nova"`, `"hint": "Clique numa fatia do gráfico ou no chip para filtrar a tabela lá embaixo."`

Add a new `"settings.budget"` object:

```json
"budget": {
  "cardTitle": "Orçamentos mensais",
  "hint": "Defina uma meta de gasto por categoria — habilita o modo \"Orçamento\" no comparativo do dashboard e alimenta a aba <b>Previsão</b> do Fluxo de caixa.",
  "incomeTargetLabel": "Meta de renda mensal",
  "incomeTargetPlaceholder": "Ex: 3000",
  "footerHint": "Categorias sem meta usam a média dos últimos meses na Previsão — não precisa preencher tudo."
}
```

Inside `"settings.data"`, add: `"localStorageSubHtml": "Escolha uma pasta para gravar <code>gastos-data.json</code> direto no seu computador."`, `"compatNote": "Funciona no Chrome e Edge. Sem pasta escolhida, tudo continua salvo automaticamente no navegador."`, `"quotaBannerHtml": "<span class=\"font-bold\">Armazenamento do navegador cheio.</span> Escolha uma pasta acima ou <button id=\"quotaDlBtnInline\" class=\"underline font-bold\">baixe backup JSON</button> e limpe dados antigos em <span class=\"font-mono\">localStorage</span>."`

- [ ] **Step 2: Extend `settings` in `locales/en.json`** — mirror structure:

```json
"backToDashboard": "← Back to dashboard"
```
`settings.ai`:
```json
"statusChecking": "checking...",
"testButton": "Test",
"saveJsonNowTitle": "Save gastos-data.json now",
"footerNote": "100% offline · <span class=\"text-zinc-400\">{model}</span> already detected ({size}) · Nothing leaves your network."
```
`settings.banks`: `"addShort": "+ New"`, `"hint": "Auto-detected when importing PDFs (BIL, BIL Card, Revolut). Create other types if you use more accounts — shows discreetly under the description in the transactions table, and can be adjusted per transaction or in bulk."`
`settings.importPdfs`:
```json
"importPdfs": {
  "title": "Import PDFs",
  "badge": "Drag or select",
  "localNote": "100% local — nothing leaves your PC · € (1,234.56 €)",
  "readingProgress": "Reading PDFs...",
  "formatHint": "<span class=\"font-bold\">Format:</span> Date, Description, <b class=\"text-red-600\">Expense</b>, <b class=\"text-emerald-600\">Income</b>, Balance. Only <b>Expenses</b> feed the charts. Duplicates are skipped automatically.",
  "formatHintExtra": "Tested with <b>Revolut</b> statements. Numeric dates (dd.mm.yyyy, common at European banks like <b>BIL Luxembourg</b>) are also recognized — if your statement doesn't import correctly, see how to report it in <b>Settings → Data</b> or edit manually in the table.",
  "dragAnywhereHint": "You can also drag PDFs anywhere on the dashboard page."
}
```
`settings.categories`: `"addShort": "+ New"`, `"hint": "Click a chart slice or the chip to filter the table below."`
`settings.budget`:
```json
"budget": {
  "cardTitle": "Monthly budgets",
  "hint": "Set a spending target per category — enables \"Budget\" mode in the dashboard comparison and feeds the cash flow <b>Forecast</b> tab.",
  "incomeTargetLabel": "Monthly income target",
  "incomeTargetPlaceholder": "e.g. 3000",
  "footerHint": "Categories without a target use the average of recent months in the Forecast — no need to fill in everything."
}
```
`settings.data`: `"localStorageSubHtml": "Choose a folder to save <code>gastos-data.json</code> directly on your computer."`, `"compatNote": "Works in Chrome and Edge. Without a folder chosen, everything still saves automatically in the browser."`, `"quotaBannerHtml": "<span class=\"font-bold\">Browser storage full.</span> Choose a folder above or <button id=\"quotaDlBtnInline\" class=\"underline font-bold\">download JSON backup</button> and clear old data in <span class=\"font-mono\">localStorage</span>."`

- [ ] **Step 3: Add `openingBalance` and `budget` (top-level) additions to both files**

`locales/pt.json`, inside `"openingBalance"`, add: `"explanation": "Se o extrato começa no meio do caminho (ex: janeiro/2026) e falta uma entrada anterior a ele (ex: o salário de dezembro que pagou o começo de janeiro), informe aqui o saldo que você tinha um dia antes do primeiro extrato importado. Esse valor entra tanto no <b>Saldo atual</b> (topo do painel) quanto no início do gráfico de <b>Fluxo de caixa acumulado</b>. Alternativa: em vez de preencher aqui, lance uma <b>transação manual do tipo Entrada</b> em dezembro com o total que você tinha — dá no mesmo, mas não use os dois ao mesmo tempo pra não contar em dobro."`, `"dateLabel": "Saldo em"`, `"valuePlaceholder": "Ex: 3200.00"`, `"saveShort": "Salvar"`, `"removeShort": "Remover"`

`locales/en.json`, same keys: `"explanation": "If the statement starts partway through (e.g. January/2026) and is missing an entry before it (e.g. December's salary that paid for the start of January), enter here the balance you had one day before the first imported statement. This value feeds both the <b>Current balance</b> (top of the dashboard) and the start of the <b>Cumulative cash flow</b> chart. Alternative: instead of filling this in, log a <b>manual Income transaction</b> in December with the total you had — same result, but don't use both at once or it'll double-count."`, `"dateLabel": "Balance on"`, `"valuePlaceholder": "e.g. 3200.00"`, `"saveShort": "Save"`, `"removeShort": "Remove"`

- [ ] **Step 4: Regenerate `src/locales.js`**

Run: `node gen-locales.js`

- [ ] **Step 5: Wire the Settings header and IA Local card (`index.html:342-370`)**

| Line | Element | Old text | data-i18n key |
|---|---|---|---|
| 343 | back button | `← Voltar ao dashboard` | `settings.backToDashboard` |
| 353 | ollamaStatusText default | `a verificar...` | `settings.ai.statusChecking` |
| 362 | `#btnOllamaTest` text | `Testar` | `settings.ai.testButton` (title already covered — add `data-i18n-title="settings.ai.testConnection"`) |
| 363 | `#btnSaveJson` `title=` | `Salvar gastos-data.json agora` | `data-i18n-title="settings.ai.saveJsonNowTitle"` |
| 369 | `<p>` footer note | `100% offline · gemma4:latest já detectado (9.6 GB) · Nada sai da sua rede.` | `settings.ai.footerNote` — add `data-i18n-html="true"` (note: this text is also runtime-overwritten by JS status checks — Task 8's `src/ollama.js` changes cover the dynamic case; this only fixes the pre-JS static flash) |

- [ ] **Step 6: Wire "Tipos de conta" and "Importar PDFs" cards (`index.html:373-415`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 377 | `+ Novo` | `settings.banks.addShort` |
| 379 | hint paragraph | `settings.banks.hint` |
| 386 | `Importar PDFs` | `settings.importPdfs.title` |
| 387 | `Arraste ou selecione` | `settings.importPdfs.badge` |
| 399 | `100% local — nada sai do seu PC · € (1.234,56 €)` | `settings.importPdfs.localNote` |
| 401 | `#progressLabel` default | `settings.importPdfs.readingProgress` |
| 409 | format hint (with `<b>` tags) | `settings.importPdfs.formatHint` — `data-i18n-html="true"` |
| 410 | second format hint paragraph | `settings.importPdfs.formatHintExtra` — `data-i18n-html="true"` |
| 413 | drag-anywhere hint | `settings.importPdfs.dragAnywhereHint` |
| 415 | `#btnDemo` text | `settings.general.demoData` |

- [ ] **Step 7: Wire "Categorias" and "Saldo inicial" cards (`index.html:422-444`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 425 | `Categorias` | `settings.tabs.categories` |
| 426 | `+ Nova` | `settings.categories.addShort` |
| 429 | hint | `settings.categories.hint` |
| 434 | `Saldo inicial` | `openingBalance.title` |
| 435 | explanation paragraph | `openingBalance.explanation` — `data-i18n-html="true"` |
| 436 | `Saldo em` label | `openingBalance.dateLabel` |
| 437 | `placeholder="Ex: 3200.00"` | `data-i18n-placeholder="openingBalance.valuePlaceholder"` |
| 440 | `Salvar` button | `openingBalance.saveShort` |
| 441 | `Remover` button | `openingBalance.removeShort` |

- [ ] **Step 8: Wire "Orçamentos mensais" and "Dados" cards (`index.html:448-489`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 449 | `Orçamentos mensais` | `settings.budget.cardTitle` |
| 450 | hint paragraph | `settings.budget.hint` — `data-i18n-html="true"` |
| 452 | `Meta de renda mensal` label | `settings.budget.incomeTargetLabel` |
| 453 | `placeholder="Ex: 3000"` | `data-i18n-placeholder="settings.budget.incomeTargetPlaceholder"` |
| 457 | footer hint | `settings.budget.footerHint` |
| 465 | `Dados` | `settings.tabs.data` |
| 469 | `#fsStatusText` default | `settings.data.localStorage` |
| 470 | `#fsStatusSub` default (has `<code>` tag) | `settings.data.localStorageSubHtml` — `data-i18n-html="true"` |
| 473 | `#btnChooseFolder` text | `settings.data.chooseFolder` |
| 476 | `#btnSaveJsonNow` text | `settings.data.saveNow` |
| 477 | `#btnExportJson` text | `settings.data.exportJson` |
| 478 | `Restaurar backup` label | `settings.data.importJson` |
| 480 | compat note | `settings.data.compatNote` |
| 484 | quota banner text | `settings.data.quotaBannerHtml` — `data-i18n-html="true"` (note: this introduces a duplicate-id risk — see Step 9) |

- [ ] **Step 9: Resolve the quota-banner button id collision**

The quota banner's "baixe backup JSON" is currently an inline `<button id="quotaDlBtn">` wired up in `src/persistence.js`. Embedding the whole sentence as one `data-i18n-html` block (Step 8, line 484) means the button now comes from the translated HTML string, so its `id` must stay `quotaDlBtn` (not `quotaDlBtnInline` as drafted in Step 1/2 above — fix that placeholder id back to `quotaDlBtn` in both locale files before regenerating) for the existing `document.getElementById('quotaDlBtn')` listener in `src/persistence.js` to keep working. Read `src/persistence.js` for the exact listener before editing to confirm the id it queries, then make the locale JSON match exactly.

- [ ] **Step 10: Verify in-browser**

Open Settings, switch language, and read through every card top-to-bottom in both languages. Trigger the quota banner if easy to reproduce (or at minimum confirm its "download backup" button still calls the existing handler by checking `onclick`/listener wiring didn't break — click it and confirm a JSON file downloads).

- [ ] **Step 11: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js index.html
git commit -m "i18n: wire all Settings cards"
```

---

### Task 5: Locale keys + wiring for all dialogs (manual entry, note, details, anomaly, bulk note, category, bank type)

**Files:**
- Modify: `locales/pt.json`, `locales/en.json` (extend `modals`)
- Modify: `index.html:504-654`

- [ ] **Step 1: Extend `modals.manualEntry` in `locales/pt.json`**

Add: `"valuePlaceholder": "123,45"`, `"descriptionPlaceholder": "Ex: Supermercado Pão de Açúcar"`

In `locales/en.json`: `"valuePlaceholder": "123.45"`, `"descriptionPlaceholder": "e.g. Supermarket"`

- [ ] **Step 2: Extend `modals.note`**

`locales/pt.json`: add `"dialogTitle": "Nota da transação"`, `"label": "Nota"`, `"deleteShort": "Remover"`
`locales/en.json`: add `"dialogTitle": "Transaction note"`, `"label": "Note"`, `"deleteShort": "Remove"`

- [ ] **Step 3: Extend `modals.details`**

`locales/pt.json`: add `"transferBetweenAccounts": "Transferência entre contas"`, `"possibleTransfer": "Possível transferência entre contas"`, `"autoTransferHint": "Detectado pelo banco do beneficiário no extrato — não está contando como Gasto. Se estiver certo, não precisa fazer nada; se for um gasto de verdade, desfaça abaixo."`, `"extractedData": "Dados extraídos do extrato"`, `"unlinkShort": "Desvincular"`, `"rejectShort": "Não é transferência — restaurar categoria"`

`locales/en.json`: add `"transferBetweenAccounts": "Transfer between accounts"`, `"possibleTransfer": "Possible transfer between accounts"`, `"autoTransferHint": "Auto-detected from the beneficiary bank on the statement — not counted as an Expense. If that's correct, no action needed; if it's a real expense, undo it below."`, `"extractedData": "Data extracted from the statement"`, `"unlinkShort": "Unlink"`, `"rejectShort": "Not a transfer — restore category"`

- [ ] **Step 4: Extend `modals` with a new `anomaly` object**

`locales/pt.json`:
```json
"anomaly": {
  "title": "Resolver gasto estranho",
  "txListLabel": "Transações envolvidas",
  "hint": "Excluir remove a transação de vez do extrato. Aceitar marca só esse alerta como revisado.",
  "alwaysAcceptHint": "\"Sempre aceitar\" ignora essa descrição pra sempre — não vira mais gasto estranho, nem em meses futuros.",
  "alwaysAcceptTitle": "Nunca mais avisar sobre essa descrição"
}
```
`locales/en.json`:
```json
"anomaly": {
  "title": "Resolve unusual expense",
  "txListLabel": "Transactions involved",
  "hint": "Deleting removes the transaction from the statement for good. Accepting just marks this alert as reviewed.",
  "alwaysAcceptHint": "\"Always accept\" ignores this description forever — it won't show up as unusual again, even in future months.",
  "alwaysAcceptTitle": "Never warn about this description again"
}
```

- [ ] **Step 5: Extend `modals.bulkNote`**

`locales/pt.json`: add `"dialogTitle": "Nota em massa"`, `"description": "Aplica a mesma nota em <span class=\"font-bold\">{count}</span> transações selecionadas, substituindo a nota atual de cada uma."`, `"saveShort": "Aplicar a todas"`
`locales/en.json`: add `"dialogTitle": "Bulk note"`, `"description": "Applies the same note to <span class=\"font-bold\">{count}</span> selected transactions, replacing each one's current note."`, `"saveShort": "Apply to all"`

- [ ] **Step 6: Extend `modals.category`**

`locales/pt.json`: add `"namePlaceholder": "Ex: Pets, Assinaturas"`, `"keywordsPlaceholder": "ex: petshop, cobasi, veterinário"`, `"keywordsHelp": "Usadas para classificar automaticamente. Só valem para categorização futura — não recategoriza o que já existe."`
`locales/en.json`: add `"namePlaceholder": "e.g. Pets, Subscriptions"`, `"keywordsPlaceholder": "e.g. petshop, vet"`, `"keywordsHelp": "Used to auto-classify. Only applies to future categorization — doesn't recategorize what already exists."`

- [ ] **Step 7: Add `modals.bankType`**

`locales/pt.json`:
```json
"bankType": {
  "titleNew": "Novo tipo de conta",
  "namePlaceholder": "Ex: N26, Banco do Brasil",
  "submitNew": "Criar tipo de conta"
}
```
`locales/en.json`:
```json
"bankType": {
  "titleNew": "New account type",
  "namePlaceholder": "e.g. N26, Chase",
  "submitNew": "Create account type"
}
```

- [ ] **Step 8: Regenerate `src/locales.js`**

Run: `node gen-locales.js`

- [ ] **Step 9: Wire the manual entry dialog (`index.html:506-518`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 507 | `Adicionar transação manual` | `modals.manualEntry.title` |
| 509 | `Data` label | `modals.manualEntry.date` |
| 509 | `placeholder="123,45"` | `data-i18n-placeholder="modals.manualEntry.valuePlaceholder"` |
| 511 | `placeholder="Ex: Supermercado Pão de Açúcar"` | `data-i18n-placeholder="modals.manualEntry.descriptionPlaceholder"` |
| 513 | `Tipo` label | `modals.manualEntry.type` |
| 513 | `Saída (despesa)` option | `data-i18n-option="modals.manualEntry.typeExpense"` |
| 513 | `Entrada (receita)` option | `data-i18n-option="modals.manualEntry.typeIncome"` |
| 513 | `Categoria` label | `modals.manualEntry.category` |
| 514 | `Cancelar` button | `common.cancel` (already wired in earlier session work — verify, don't duplicate) |
| 515 | `Adicionar` submit button | `modals.manualEntry.submit` (already wired — verify) |

- [ ] **Step 10: Wire the note dialog (`index.html:522-538`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 524 | `Nota da transação` | `modals.note.dialogTitle` |
| 529 | `Nota` label (before textarea) | `modals.note.label` |
| 534 | `Remover` button | `modals.note.deleteShort` |

- [ ] **Step 11: Wire the details dialog (`index.html:541-570`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 545 | `Detalhes da transação` | `modals.details.title` |
| 551 | `Tipo de conta` label | `modals.details.bankType` |
| 556 | `Transferência entre contas` (bold p) | `modals.details.transferBetweenAccounts` |
| 558 | `Desvincular` button | `modals.details.unlinkShort` |
| 561 | `Possível transferência entre contas` (bold p) | `modals.details.possibleTransfer` |
| 563 | hint paragraph | `modals.details.autoTransferHint` |
| 564 | `Não é transferência — restaurar categoria` button | `modals.details.rejectShort` |
| 567 | `Dados extraídos do extrato` span | `modals.details.extractedData` |

- [ ] **Step 12: Wire the anomaly dialog (`index.html:573-591`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 576 | `Resolver gasto estranho` | `modals.anomaly.title` |
| 582 | `Transações envolvidas` | `modals.anomaly.txListLabel` |
| 585 | hint sentence 1 | `modals.anomaly.hint` |
| 585 | `#anomalyAlwaysHint` sentence | `modals.anomaly.alwaysAcceptHint` |
| 586 | `Fechar` button | `common.close` |
| 588 | button `title=` | `data-i18n-title="modals.anomaly.alwaysAcceptTitle"` |
| 588 | button text | `anomalies.alwaysAccept` |
| 589 | button text | `anomalies.accept` |

- [ ] **Step 13: Wire the bulk note dialog (`index.html:594-606`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 596 | `Nota em massa` | `modals.bulkNote.dialogTitle` |
| 597 | `Aplica a mesma nota em <span id="bulkNoteCount">0</span> transações selecionadas, substituindo a nota atual de cada uma.` | replace entirely with `<p class="text-sm text-zinc-500" data-i18n="modals.bulkNote.description" data-i18n-html="true">...</p>` — **note:** the `{count}` template param is not auto-filled by `data-i18n` (that mechanism only handles static text, not live JS-driven values). After this HTML change, `src/transactions.js`'s `openBulkNoteDialog`-equivalent function (wherever `#bulkNoteCount` is currently set — grep for `bulkNoteCount` in `src/transactions.js`) must switch from setting `#bulkNoteCount`'s `textContent` to instead setting the whole paragraph's `innerHTML` via `window.i18n.t('modals.bulkNote.description', {count: n})`. Do this JS-side fix as part of Task 6 (Step covering `transactions.js` bulk actions), not here — this step only prepares the HTML skeleton; leave a `<p id="bulkNoteDesc">` wrapper in place so Task 6 has an element to target.
| 600 | `placeholder="Ex: revisão de assinatura, reembolsável..."` | already wired (`modals.bulkNote.placeholder`) — verify |
| 604 | `Aplicar a todas` submit button | `modals.bulkNote.saveShort` |

- [ ] **Step 14: Wire the category dialog (`index.html:609-628`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 611 | `Nova categoria` (default h3 text) | `modals.category.titleNew` |
| 614 | `Nome` label | `modals.category.name` |
| 614 | `placeholder="Ex: Pets, Assinaturas"` | `data-i18n-placeholder="modals.category.namePlaceholder"` |
| 615 | `Cor` label | `modals.category.color` |
| 618 | `Ícone` span | `modals.category.icon` |
| 622 | `Palavras-chave (separa por vírgula)` label | `modals.category.keywords` |
| 622 | `placeholder="ex: petshop, cobasi, veterinário"` | `data-i18n-placeholder="modals.category.keywordsPlaceholder"` |
| 622 | helper span | `modals.category.keywordsHelp` |

- [ ] **Step 15: Wire the bank type dialog (`index.html:631-646`)**

| Line | Old text | data-i18n key |
|---|---|---|
| 633 | `Novo tipo de conta` (default h3 text) | `modals.bankType.titleNew` |
| 635 | `Nome` label | `settings.banks.name` |
| 635 | `placeholder="Ex: N26, Banco do Brasil"` | `data-i18n-placeholder="modals.bankType.namePlaceholder"` |
| 637 | `Ícone` span | `settings.banks.icon` |
| 643 | `Criar tipo de conta` submit button | `modals.bankType.submitNew` |

- [ ] **Step 16: Verify in-browser**

Open every dialog (manual entry, note on a transaction, details on a transaction, an anomaly if any demo data triggers one, bulk note with 2+ selected rows, new category, new bank type), switch language while each is open, confirm every label/placeholder/button/title translates.

- [ ] **Step 17: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js index.html
git commit -m "i18n: wire all dialogs"
```

---

## Part 2 — Dynamic JS content

### Task 6: Translate `src/render.js` — KPIs, budget summary, category chips/filters, table row rendering

**Files:**
- Modify: `src/render.js` (functions: `updateKPIs`, `updateBudgetSummary`/`renderBudgetList`, `renderCategoryChips`, `refreshPeriodOptions`, `renderBulkBar`, table-row-building code inside `renderTable`)

**Interfaces:**
- Consumes: `window.i18n.t(key, params)` (per the Global Constraint above — always the `window.i18n.t` form in this file, never bare `t`)
- Produces: nothing new for later tasks; this task and Task 7 are independent halves of the same file

- [ ] **Step 1: Read the current `updateKPIs` function** (`src/render.js:375-425` approximately) in full before editing, to get exact surrounding code for each replacement.

- [ ] **Step 2: Replace KPI hardcoded strings**

Worked example — before (`src/render.js:385`):
```js
document.getElementById('kpiBalanceSub').textContent = 'Entradas − saídas de todo o histórico · defina um saldo inicial em Configurações se faltar dado anterior';
```
After:
```js
document.getElementById('kpiBalanceSub').textContent = window.i18n.t('kpis.balanceSubDefault');
```

Apply the same pattern for the rest, using `window.i18n.t(key, {param: value})` wherever the original string had a `${}` interpolation (pass the interpolated values as the params object; the locale string's own `{param}` placeholders get substituted by `t()`'s existing param-replacement logic in `src/i18n.js`):

| Line | Old | New `t()` call |
|---|---|---|
| 384 | `` `Saldo inicial ${fmtEUR(bal.base)} (${openingBalance.date.toLocaleDateString('pt-BR')}) + entradas − saídas` `` | Add new key `kpis.balanceSubWithOpening` (pt: `"Saldo inicial {value} ({date}) + entradas − saídas"`, en: `"Opening balance {value} ({date}) + income − expenses"`) to both locale files first, then: `window.i18n.t('kpis.balanceSubWithOpening', {value: fmtEUR(bal.base), date: openingBalance.date.toLocaleDateString('pt-BR')})` |
| 395 | `` `${saidasCount} saídas · ${entradasCount} entradas${transfCount?` · ${transfCount} transferências internas`:''} · ${new Set(...).size} arquivos` `` | Add new key `kpis.countBreakdown` (pt: `"{expenses} saídas · {income} entradas{transfers} · {files} arquivos"`, en: `"{expenses} expenses · {income} income{transfers} · {files} files"`) and a separate small key `kpis.countTransfersClause` (pt: `" · {n} transferências internas"`, en: `" · {n} internal transfers"`) built up in JS before the main call — build the `transfCount` clause first with `transfCount ? window.i18n.t('kpis.countTransfersClause', {n: transfCount}) : ''`, then pass it as the `transfers` param to `kpis.countBreakdown` |
| 403 | `` `${fmtEUR(top[1])} · ${Math.round(top[1]/total*100)}% do total` `` | new key `kpis.topCategoryValueText` (pt: `"{value} · {pct}% do total"`, en: `"{value} · {pct}% of total"`) → `window.i18n.t('kpis.topCategoryValueText', {value: fmtEUR(top[1]), pct: Math.round(top[1]/total*100)})` |
| 404 | `` `${c.name} é seu maior gasto` `` | new key `kpis.insightMainText` (pt: `"{cat} é seu maior gasto"`, en: `"{cat} is your biggest expense"`) → `window.i18n.t('kpis.insightMainText', {cat: c.name})` |
| 405 | `` `${fmtEUR(top[1])} (${Math.round(...)}%) — vale revisar assinaturas e compras nessa categoria.` `` | new key `kpis.insightSubText` (pt: `"{value} ({pct}%) — vale revisar assinaturas e compras nessa categoria."`, en: `"{value} ({pct}%) — worth reviewing subscriptions and purchases in this category."`) → `window.i18n.t('kpis.insightSubText', {value: fmtEUR(top[1]), pct: Math.round(top[1]/total*100)})` |
| 409 | `'Adicione PDFs para ver insights.'` | `window.i18n.t('kpis.insightDefault')` (key already added in Task 1) |
| 421 | `` rate>=0 ? `${fmtEUR(saved)} sobrando no período` : `${fmtEUR(Math.abs(saved))} além da renda` `` | new keys `kpis.savedText` (pt: `"{value} sobrando no período"`, en: `"{value} left over this period"`) and `kpis.overspentText` (pt: `"{value} além da renda"`, en: `"{value} over income"`) → `rate>=0 ? window.i18n.t('kpis.savedText', {value: fmtEUR(saved)}) : window.i18n.t('kpis.overspentText', {value: fmtEUR(Math.abs(saved))})` |
| 425 | `'sem entradas no período'` | `window.i18n.t('kpis.noIncome')` (existing key) |

- [ ] **Step 3: Add the new keys from Step 2's table to both locale files, then regenerate**

Run: `node gen-locales.js` after editing `locales/pt.json` and `locales/en.json` with the 5 new keys listed (`kpis.balanceSubWithOpening`, `kpis.countBreakdown`, `kpis.countTransfersClause`, `kpis.topCategoryValueText`, `kpis.insightMainText`, `kpis.insightSubText`, `kpis.savedText`, `kpis.overspentText`).

- [ ] **Step 4: Replace budget summary hardcoded strings** (`updateBudgetSummary`, around `src/render.js:84-104`)

| Line | Old | New `t()` call (reusing existing `budget.summary.*` keys — no new keys needed) |
|---|---|---|
| 84 | `'Total orçado'` | `window.i18n.t('budget.summary.totalBudgeted')` |
| 86 | `` `${pctUsed}% da renda` `` | new key `budget.summary.pctOfIncomeText` (pt: `"{pct}% da renda"`, en: `"{pct}% of income"`) → `window.i18n.t('budget.summary.pctOfIncomeText', {pct: pctUsed})` |
| 89 | `'Meta de renda'` | `window.i18n.t('budget.summary.incomeTarget')` |
| 94 | `` `${over?'Falta':'Sobra'}` `` | `over ? window.i18n.t('budget.summary.shortfall') : window.i18n.t('budget.summary.remaining')` |
| 96 | `` `${Math.abs(100-pctUsed)}% ${over?'além da renda':'livre'}` `` | new key `budget.summary.pctFreeOrOverText` (pt: `"{pct}% {label}"`, en: `"{pct}% {label}"`) with label built from existing `budget.summary.beyondIncome`/`budget.summary.free` → `window.i18n.t('budget.summary.pctFreeOrOverText', {pct: Math.abs(100-pctUsed), label: over ? window.i18n.t('budget.summary.beyondIncome') : window.i18n.t('budget.summary.free')})` |
| 101 | `'Total orçado'` | `window.i18n.t('budget.summary.totalBudgeted')` |
| 104 | hint sentence | `window.i18n.t('budget.summary.noIncomeTarget')` (existing key) |

Add the two new keys (`budget.summary.pctOfIncomeText`, `budget.summary.pctFreeOrOverText`) to both locale files, then `node gen-locales.js`.

- [ ] **Step 5: Replace category chip / filter / bulk-select hardcoded HTML fragments** (`renderCategoryChips`, `refreshPeriodOptions`, `renderBulkBar`, roughly lines 9-179)

| Line | Old | New |
|---|---|---|
| 9 | `'<option value="">Todas categorias</option>'` | `` `<option value="">${window.i18n.t('filters.allCategories')}</option>` `` |
| 24 | `` `Editar ${escapeHtml(c.name)}` `` | new key `common.editItemTitle` (pt: `"Editar {name}"`, en: `"Edit {name}"`) → `window.i18n.t('common.editItemTitle', {name: escapeHtml(c.name)})` |
| 120 | `'<option value="">Todo o período</option>'` | `` `<option value="">${window.i18n.t('filters.allPeriods')}</option>` `` |
| 139 | `'Tudo'` | `window.i18n.t('filters.periodChips.all')` |
| 141 | `` `Ano de ${y}` `` | new key `filters.yearOf` (pt: `"Ano de {year}"`, en: `"Year {year}"`) → `window.i18n.t('filters.yearOf', {year: y})` |
| 177 | `'<option value="">Categoria...</option>'` | `` `<option value="">${window.i18n.t('actions.bulkCategory')}</option>` `` |
| 179 | `'<option value="">Tipo de conta...</option>'` | `` `<option value="">${window.i18n.t('actions.bulkBank')}</option>` `` |

Add `common.editItemTitle` and `filters.yearOf` to both locale files, `node gen-locales.js`.

- [ ] **Step 6: Replace table-row badge/confirm/footer hardcoded strings** (inside `renderTable`, roughly lines 237-350)

Add these new keys first — `locales/pt.json`:
```json
"table": {
  "cardSettlementText": "Fatura do cartão",
  "cardSettlementTitleText": "Débito único da fatura do cartão — não contabilizado (as compras já foram contadas individualmente)",
  "transferBetweenAccountsText": "entre contas",
  "transferBetweenAccountsTitleText": "Transferência entre suas contas — não contabilizada em Gastos/Entradas. Veja o par em Detalhes.",
  "possibleTransferTitleText": "Detectado automaticamente pelo banco do beneficiário — provável transferência para {bank}. Confira em Detalhes.",
  "possibleTransferText": "possível transferência",
  "internalTransferText": "⇄ interna",
  "internalTransferTitleText": "Movimentação interna — não contabilizada",
  "swapTitle": "Trocar Saída ↔ Entrada",
  "noteTitle": "Nota",
  "detailsTitle": "Detalhes",
  "deleteTitle": "Excluir transação",
  "deleteConfirm": "Excluir esta transação?\n\n{desc}\n{date} · {value}",
  "avgPerMonthTitle": "Total dividido pelos {n} {monthWord} com movimento nessa categoria",
  "avgPerMonthLabel": "Média mensal: ",
  "monthWordSingular": "mês",
  "monthWordPlural": "meses",
  "summaryMovements": "{n} movimentos",
  "summaryRealExpenses": "Gastos reais",
  "summaryIncome": "Entradas",
  "summaryInternalTransfers": "Transf. internas",
  "summaryInternalTransfersTitle": "Movimentações internas (pockets, Flexible Cash Funds) — não contam como gasto",
  "pageInfoText": "Página {current} / {total}"
}
```
(These are added *inside* the existing `"table"` object, alongside `columns`/`empty`/etc. already there — merge, don't overwrite.)

`locales/en.json`:
```json
"cardSettlementText": "Card statement",
"cardSettlementTitleText": "Single card statement debit — not counted (individual purchases already counted)",
"transferBetweenAccountsText": "between accounts",
"transferBetweenAccountsTitleText": "Transfer between your accounts — not counted in Expenses/Income. See pair in Details.",
"possibleTransferTitleText": "Auto-detected by beneficiary bank — likely transfer to {bank}. Check in Details.",
"possibleTransferText": "possible transfer",
"internalTransferText": "⇄ internal",
"internalTransferTitleText": "Internal movement — not counted",
"swapTitle": "Swap Expense ↔ Income",
"noteTitle": "Note",
"detailsTitle": "Details",
"deleteTitle": "Delete transaction",
"deleteConfirm": "Delete this transaction?\n\n{desc}\n{date} · {value}",
"avgPerMonthTitle": "Total split across the {n} {monthWord} with activity in this category",
"avgPerMonthLabel": "Monthly average: ",
"monthWordSingular": "month",
"monthWordPlural": "months",
"summaryMovements": "{n} transactions",
"summaryRealExpenses": "Real expenses",
"summaryIncome": "Income",
"summaryInternalTransfers": "Internal transfers",
"summaryInternalTransfersTitle": "Internal movements (pockets, Flexible Cash Funds) — not counted as expenses",
"pageInfoText": "Page {current} / {total}"
```

Then, in `src/render.js`, replace (using `window.i18n.t`):

| Line | Old | New |
|---|---|---|
| 238 | `'Débito único da fatura do cartão...'` / `'Fatura do cartão'` | `window.i18n.t('table.cardSettlementTitleText')` / `window.i18n.t('table.cardSettlementText')` |
| 240 | `'Transferência entre suas contas...'` / `'entre contas'` | `window.i18n.t('table.transferBetweenAccountsTitleText')` / `window.i18n.t('table.transferBetweenAccountsText')` |
| 242 | `` `Detectado automaticamente...para ${escapeHtml(bankLabel(...))}...` `` / `'possível transferência'` | `window.i18n.t('table.possibleTransferTitleText', {bank: escapeHtml(bankLabel(t.meta&&t.meta.transferToBank))})` / `window.i18n.t('table.possibleTransferText')` |
| 243 | `'Movimentação interna...'` / `'⇄ interna'` | `window.i18n.t('table.internalTransferTitleText')` / `window.i18n.t('table.internalTransferText')` |
| 258 | `title="Trocar Saída ↔ Entrada"` | `` title="${window.i18n.t('table.swapTitle')}" `` |
| 259 | `title="Nota"` | `` title="${window.i18n.t('table.noteTitle')}" `` |
| 260 | `title="Detalhes"` | `` title="${window.i18n.t('table.detailsTitle')}" `` |
| 261 | `title="Excluir transação"` | `` title="${window.i18n.t('table.deleteTitle')}" `` |
| 295 | `` confirm(`Excluir esta transação?\n\n${tx.desc}\n${...} · ${fmtEUR(...)}`) `` | `` confirm(window.i18n.t('table.deleteConfirm', {desc: tx.desc, date: (tx.realDate||tx.date).toLocaleDateString('pt-BR'), value: fmtEUR(tx.saida||tx.entrada||0)})) `` |
| 346 | avg-per-month title + label | `` window.i18n.t('table.avgPerMonthTitle', {n: catMonths, monthWord: catMonths===1?window.i18n.t('table.monthWordSingular'):window.i18n.t('table.monthWordPlural')}) `` for the title, `window.i18n.t('table.avgPerMonthLabel')` for the prefix |
| 349 | footer summary line | build from `window.i18n.t('table.summaryMovements', {n: totalRows})`, `window.i18n.t('table.summaryRealExpenses')`, `window.i18n.t('table.summaryIncome')`, `window.i18n.t('table.summaryInternalTransfers')` + `` title="${window.i18n.t('table.summaryInternalTransfersTitle')}" `` |
| 350 | `` `Página ${currentPage} / ${totalPages}` `` | `window.i18n.t('table.pageInfoText', {current: currentPage, total: totalPages})` |
| 731 | (anomaly dialog's own delete confirm, same text as line 295) | same `table.deleteConfirm` key |

Run `node gen-locales.js` after adding these keys.

- [ ] **Step 7: Verify in-browser**

Load demo data, switch language, and check: KPI cards (all 6), budget summary in Settings → Orçamentos, category/period/bulk filter dropdowns, every table row's badges (need a duplicate/transfer/internal transaction in the demo set — check `src/transactions.js`'s `DEMO` array for one, or manually create one via "Adicionar transação manual" twice with identical values to trigger the "possível transferência" style badge if applicable), the swap/note/details/delete button tooltips (hover), the delete confirm dialog text (click delete, read the confirm box), the footer summary line, and pagination text if there are enough rows to paginate.

- [ ] **Step 8: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js src/render.js
git commit -m "i18n: translate render.js KPIs, budget summary, chips/filters, table rows"
```

---

### Task 7: Translate `src/render.js` — charts, anomalies list, calendar heatmap, recurring list

**Files:**
- Modify: `src/render.js` (functions: day-of-week/histogram/trend chart building inside `ensureCharts`/`updateCharts`, `detectAnomalies`/`renderAnomalies`, `renderCalHeatmap`, category chart & legend building, cashflow chart building, recurring-list rendering)

- [ ] **Step 1: Replace the day-of-week chart's hardcoded day labels** (`src/render.js:449`)

Before:
```js
dowChart.data.labels = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
```
After:
```js
dowChart.data.labels = window.i18n.t('days.short'); // returns the array directly — t() already returns non-string values (arrays/objects) unmodified when the resolved value isn't a string; see src/i18n.js's `t()` — it only applies the {param} regex replace when `typeof value === 'string'`
```
Read `src/i18n.js`'s `t()` implementation first to confirm this array-passthrough behavior before relying on it (`t()` currently does `if (typeof value !== 'string') { console.warn(...); return key; }` for the tHtml/normal getter path — **check this carefully**: if `t()` warns-and-returns-the-key for non-string values, `days.short` being an array means `t('days.short')` would NOT return the array, it would hit the `typeof value !== 'string'` guard and return `'days.short'` (the literal key string) with a console warning. In that case, do not use `t()` for this — instead add a small dedicated helper to `src/i18n.js`:

```js
function tArray(key) {
  const keys = key.split('.');
  let value = translations;
  for (const k of keys) { if (value && typeof value === 'object' && k in value) value = value[k]; else return []; }
  return Array.isArray(value) ? value : [];
}
```
and export it on `window.i18n.tArray = tArray;` alongside the existing exports at the bottom of `src/i18n.js`. Then in `render.js`: `dowChart.data.labels = window.i18n.tArray('days.short');`

- [ ] **Step 2: Verify which behavior `t()` actually has, then apply Step 1's fix**

Run: `grep -n "typeof value !== 'string'" src/i18n.js`
Expected: one match inside the `t()` function. Confirm the guard exists as described, add `tArray` as shown, wire it into `src/i18n.js`'s `window.i18n = {...}` export block, then apply the `dowChart.data.labels` change from Step 1.

- [ ] **Step 3: Replace histogram tooltip strings** (`src/render.js:543`)

Add to both locale files, inside `"charts.histogram"` (extend the object from Task 2): `"tooltipTitle": "Faixa {range}"` (pt) / `"tooltipTitle": "Range {range}"` (en), `"tooltipLabel": "{n} transações"` (pt) / `"tooltipLabel": "{n} transactions"` (en).

Before:
```js
title:(a)=>`Faixa ${a[0].label}`,
label:(c)=>` ${c.parsed.y} transações`
```
After:
```js
title:(a)=>window.i18n.t('charts.histogram.tooltipTitle', {range: a[0].label}),
label:(c)=>window.i18n.t('charts.histogram.tooltipLabel', {n: c.parsed.y})
```

- [ ] **Step 4: Replace anomaly message strings** (`detectAnomalies`, roughly lines 586-668)

Add to both locale files a new `anomalies.messages` object:

`locales/pt.json`:
```json
"messages": {
  "exactDuplicate": "{n}× cobrança idêntica de {value} em \"{desc}\" no mesmo dia — pode ser cobrança duplicada.",
  "nearDuplicate": "Duas cobranças de {value} em \"{desc}\" com {days} dia(s) de intervalo — confira se não é duplicada.",
  "merchantOutlier": "{value} em \"{desc}\" ficou bem acima do habitual (média {avg}, {pct}% a mais).",
  "globalOutlier": "Gasto atípico para o período: {value} em \"{desc}\" (média geral {avg}).",
  "spikeDay": "{date} teve {total} em {count} transações — bem acima da média diária ({avg}).",
  "countFound": "{n} encontrado{plural}",
  "countNone": "nada fora do comum",
  "emptyTitle": "Nada fora do padrão",
  "emptyDetail": "Sem duplicidades, picos ou valores atípicos no período.",
  "resolveButton": "Resolver",
  "moreNotShown": "+ {n} outro(s) não exibido(s).",
  "noTxFound": "Nenhuma transação envolvida ainda existe (já foi excluída)."
}
```
`locales/en.json`:
```json
"messages": {
  "exactDuplicate": "{n}× identical charge of {value} for \"{desc}\" on the same day — might be a duplicate.",
  "nearDuplicate": "Two charges of {value} for \"{desc}\" {days} day(s) apart — check it isn't a duplicate.",
  "merchantOutlier": "{value} for \"{desc}\" was well above usual (average {avg}, {pct}% more).",
  "globalOutlier": "Atypical expense for the period: {value} for \"{desc}\" (overall average {avg}).",
  "spikeDay": "{date} had {total} across {count} transactions — well above the daily average ({avg}).",
  "countFound": "{n} found",
  "countNone": "nothing out of the ordinary",
  "emptyTitle": "Nothing out of the ordinary",
  "emptyDetail": "No duplicates, spikes, or atypical values this period.",
  "resolveButton": "Resolve",
  "moreNotShown": "+ {n} more not shown.",
  "noTxFound": "No transaction involved still exists (already deleted)."
}
```

Then in `src/render.js`:

| Line | Old | New |
|---|---|---|
| 586 | exact-duplicate text | `window.i18n.t('anomalies.messages.exactDuplicate', {n: g.length, value: fmtEUR(g[0].saida), desc: g[0].desc})` |
| 602 | near-duplicate text | `window.i18n.t('anomalies.messages.nearDuplicate', {value: fmtEUR(b.saida), desc: b.desc, days: Math.round(days)})` |
| 618 | merchant-outlier text | `window.i18n.t('anomalies.messages.merchantOutlier', {value: fmtEUR(t.saida), desc: t.desc, avg: fmtEUR(m), pct: Math.round(t.saida/m*100-100)})` |
| 631 | global-outlier text | `window.i18n.t('anomalies.messages.globalOutlier', {value: fmtEUR(t.saida), desc: t.desc, avg: fmtEUR(m)})` |
| 649 | spike-day text | `window.i18n.t('anomalies.messages.spikeDay', {date: d.date.toLocaleDateString('pt-BR'), total: fmtEUR(d.total), count: d.count, avg: fmtEUR(m)})` |
| 666 | count badge | `anomalies.length ? window.i18n.t('anomalies.messages.countFound', {n: anomalies.length, plural: anomalies.length>1?'s':''}) : window.i18n.t('anomalies.messages.countNone')` (note: the `plural` param bakes an English/Portuguese-specific "s" suffix into the value passed in — this is backwards; **fix properly** by making `countFound` two separate keys instead: `countFoundSingular`: `"{n} encontrado"`/`"{n} found"` and `countFoundPlural`: `"{n} encontrados"`/`"{n} found"` (English doesn't pluralize "found" so both EN values are identical — that's fine, it's still correct), then pick between them in JS with `anomalies.length===1 ? t('...countFoundSingular') : t('...countFoundPlural')`. Use this corrected two-key approach instead of the single `countFound`+`plural`-param version shown above; update the locale JSON accordingly before regenerating.) |
| 668 | empty state title/detail | `window.i18n.t('anomalies.messages.emptyTitle')` / `window.i18n.t('anomalies.messages.emptyDetail')` |
| 680 | `'Resolver'` button | `window.i18n.t('anomalies.messages.resolveButton')` |
| 683 | "more not shown" text | `window.i18n.t('anomalies.messages.moreNotShown', {n: anomalies.length-30})` |
| 713 | empty tx-list text | `window.i18n.t('anomalies.messages.noTxFound')` |
| 724 | `title="Excluir esta transação"` | `` title="${window.i18n.t('table.deleteTitle')}" `` (reuse Task 6's key — this is the same concept, not a new one) |

Fix the `countFound`/plural approach as described before finalizing the JSON.

- [ ] **Step 5: Replace calendar heatmap strings** (`renderCalHeatmap`, roughly lines 773-829)

Add to both locale files, new `charts.calendar` sub-keys (extending the object from Task 2):
`locales/pt.json`:
```json
"emptyState": "Sem dados ainda.",
"noSpendThisMonth": "Sem gastos nesse mês.",
"biggestDayTitle": "Dia mais caro",
"biggestDayText": "{date} — {value}",
"avgPerDayTitle": "Média por dia com gasto",
"avgPerDayText": "{value} em {n} de {total} dias",
"weekendHigherTitle": "Fim de semana pesa mais",
"weekdayHigherTitle": "Dias úteis pesam mais",
"weekdayVsWeekendText": "{weekday}/dia útil vs {weekend}/dia de fim de semana — {pct}% a mais {which}.",
"weekendOnlyText": "Só há gasto {which} até agora.",
"onWeekend": "no fim de semana",
"onWeekdays": "em dias úteis",
"noSpendDaysTitle": "Dias sem gasto",
"noSpendDaysText": "{n} de {total} dias sem nenhuma saída registrada."
```
`locales/en.json`:
```json
"emptyState": "No data yet.",
"noSpendThisMonth": "No spending this month.",
"biggestDayTitle": "Priciest day",
"biggestDayText": "{date} — {value}",
"avgPerDayTitle": "Average per spending day",
"avgPerDayText": "{value} across {n} of {total} days",
"weekendHigherTitle": "Weekends weigh more",
"weekdayHigherTitle": "Weekdays weigh more",
"weekdayVsWeekendText": "{weekday}/weekday vs {weekend}/weekend day — {pct}% more {which}.",
"weekendOnlyText": "Spending only {which} so far.",
"onWeekend": "on weekends",
"onWeekdays": "on weekdays",
"noSpendDaysTitle": "Days without spending",
"noSpendDaysText": "{n} of {total} days with no recorded expense."
```

Then replace in `src/render.js` (lines are approximate — re-locate exact strings with `grep -n "Sem dados ainda\|Dia mais caro\|Fim de semana pesa" src/render.js` before editing):

| Old | New |
|---|---|
| `'<p ...>Sem dados ainda.</p>'` | `` `<p ...>${window.i18n.t('charts.calendar.emptyState')}</p>` `` |
| `'Sem gastos nesse mês.</p>'` | `` `${window.i18n.t('charts.calendar.noSpendThisMonth')}</p>` `` |
| `title:'Dia mais caro'` / biggest-day text | `title: window.i18n.t('charts.calendar.biggestDayTitle')` / `text: window.i18n.t('charts.calendar.biggestDayText', {date: ..., value: fmtEUR(byDay[biggestDay])})` |
| `title:'Média por dia com gasto'` / avg text | `title: window.i18n.t('charts.calendar.avgPerDayTitle')` / `text: window.i18n.t('charts.calendar.avgPerDayText', {value: fmtEUR(total/activeDays.length), n: activeDays.length, total: daysInMonth})` |
| weekend/weekday title ternary | `title: weekendHigher ? window.i18n.t('charts.calendar.weekendHigherTitle') : window.i18n.t('charts.calendar.weekdayHigherTitle')` |
| weekday-vs-weekend text | build `which` first as `weekendHigher ? window.i18n.t('charts.calendar.onWeekend') : window.i18n.t('charts.calendar.onWeekdays')`, then `pct!=null ? window.i18n.t('charts.calendar.weekdayVsWeekendText', {weekday: fmtEUR(avgWeekday), weekend: fmtEUR(avgWeekend), pct, which}) : window.i18n.t('charts.calendar.weekendOnlyText', {which})` |
| `title:'Dias sem gasto'` / no-spend text | `title: window.i18n.t('charts.calendar.noSpendDaysTitle')` / `text: window.i18n.t('charts.calendar.noSpendDaysText', {n: daysWithoutSpend, total: daysInMonth})` |

- [ ] **Step 6: Replace category chart / waterfall / legend strings** (roughly lines 854-909)

Using the `charts.waterfall`/`charts.category` keys already added in Task 2:

| Old | New |
|---|---|
| `'<span ...>Sem dados ainda — adicione PDFs ou use o exemplo.</span>'` | `` `<span ...>${window.i18n.t('charts.waterfall.emptyState')}</span>` `` |
| `'· da renda até o saldo, categoria por categoria'` (catModeHint waterfall) | add new key `charts.category.hintWaterfall` (pt: `"· da renda até o saldo, categoria por categoria"`, en: `"· from income down to balance, category by category"`) → `window.i18n.t('charts.category.hintWaterfall')` |
| `wLabels=['Renda']` | `wLabels=[window.i18n.t('charts.waterfall.income')]` |
| `wLabels.push('Outras categorias')` | `wLabels.push(window.i18n.t('charts.waterfall.otherCategories'))` |
| `wLabels.push('Saldo')` | `wLabels.push(window.i18n.t('charts.waterfall.balance'))` |
| `'Como ler:'` / explanation / legend lines | `window.i18n.t('charts.waterfall.howToRead')`, `window.i18n.t('charts.waterfall.explanation')`, `window.i18n.t('charts.waterfall.legendIncomePositive')`, `window.i18n.t('charts.waterfall.legendNegative')`, `window.i18n.t('charts.waterfall.legendOtherGrouped')` |
| `'· por categoria'` (catModeHint normal) | `window.i18n.t('charts.category.hintByCategory')` (already exists from Task 2) |

Add `charts.category.hintWaterfall` to both locale files, `node gen-locales.js`.

- [ ] **Step 7: Replace monthChart/trendChart dataset labels and trend badge text**

Add to both locale files a new `charts.datasetLabels` object: `locales/pt.json`: `{"expense": "Gasto", "trend3m": "Tendência (3m)"}`; `locales/en.json`: `{"expense": "Expense", "trend3m": "Trend (3m)"}`. Add `charts.trend.upBadge`/`charts.trend.downBadge`: pt `"▲ +{pct}% vs mês anterior"` / `"▼ -{pct}% vs mês anterior"`, en `"▲ +{pct}% vs last month"` / `"▼ -{pct}% vs last month"`.

| Line | Old | New |
|---|---|---|
| 943 | `label:'Gasto'` (monthChart) | `label: window.i18n.t('charts.datasetLabels.expense')` |
| 977 | `label:'Gasto'` (trendChart) | `label: window.i18n.t('charts.datasetLabels.expense')` |
| 978 | `label:'Tendência (3m)'` | `label: window.i18n.t('charts.datasetLabels.trend3m')` |
| 986 | `` `▲ +${pctPrev}% vs mês anterior` `` | `window.i18n.t('charts.trend.upBadge', {pct: pctPrev})` |
| 987 | `` `▼ -${pctPrev}% vs mês anterior` `` | `window.i18n.t('charts.trend.downBadge', {pct: pctPrev})` |

**Note:** Chart.js dataset `label` values feed the built-in tooltip/legend text. Because these are stored inside a Chart.js dataset object and only re-read when `.update()` is called, this is one of the two risk areas flagged in the plan's introduction — confirm `updateCharts()` (which rebuilds these datasets from scratch, including the `label:` field, every time it runs) is in `switchLanguage()`'s existing re-render list in `src/i18n.js` (`if (typeof updateCharts === 'function') updateCharts();` — already present per the current file). No changes needed there; just confirm by reading `src/i18n.js`'s `switchLanguage()` function.

- [ ] **Step 8: Replace compareModeHint / compare chart tab and cashflow chart strings**

Using `charts.compare.*` keys from Task 2:

| Old | New |
|---|---|
| cumulative-mode hint | `window.i18n.t('charts.compare.hintCumulative', {n: scopeMonths.length})` |
| this-month-mode hint | `window.i18n.t('charts.compare.hintThisMonth')` |
| lines-mode hint | `window.i18n.t('charts.compare.hintLines')` |
| bars-mode hint | `window.i18n.t('charts.compare.hintBars')` |

Add to both locale files a `charts.cashflowDatasetLabels` object: pt `{"monthly": "Saldo do mês", "forecast": "Saldo (real + previsto)", "cumulative": "Saldo acumulado"}`, en `{"monthly": "Monthly balance", "forecast": "Balance (actual + forecast)", "cumulative": "Cumulative balance"}`. Add `charts.cashflow.hintMonthly`/`hintForecast`/`hintWithOpening` and `charts.cashflow.subtitleForecast`/`healthyTitle`/`healthySubHasIncome`/`healthySubNoIncome`/`deficitMonthText`/`tightMarginText`/`forecastPositiveTitle`/`forecastNegativeTitle`/`forecastPositiveText`/`forecastNegativeText`/`estimatedBalanceTitle`/`estimatedBalanceText`/`zeroBalanceTitle`/`zeroBalanceText`/`noIncomeTargetTitle`/`noIncomeTargetText`/`noBudgetCatsTitle`/`noBudgetCatsText` — write out the PT/EN pairs for every remaining string listed under "Cashflow chart (monthly / cumulative / forecast)" in the render.js audit findings (lines 1124-1258), following the exact same `{param}` substitution pattern demonstrated in Steps 2-7 above (each `${...}` in the original template literal becomes a named `{param}` in the locale string and a matching key in the `t()` call's second argument). Given the volume (18 distinct strings in this block), do not skip any — cross-reference the full audit list from this task's research phase (cashflow section) to make sure every one gets a key and a `window.i18n.t(...)` call; none of them are exempted by the Global Constraints section.

Replace `'Linha sólida = real. Linha tracejada (roxa) = projeção...'` with a `charts.cashflow.subtitleForecast` key — translate "(roxa)"/"(purple)" faithfully to whatever the actual current line color is (check the `borderColor` used for the forecast segment in this same function — after the palette revert earlier this session it should be back to the original violet, so "(roxa)"/"(purple)" is accurate again; if a future palette change happens, this string must be updated to match, so leave a `// i18n: color name here must match the forecast line's actual borderColor` comment next to it).

Regenerate `src/locales.js` after all additions in this step.

- [ ] **Step 9: Replace recurring-charges list strings** (roughly lines 1281-1288)

Add to both locale files a new `charts.recurring.messages` object: pt `{"emptyState": "Nenhum padrão recorrente detectado ainda — aparece depois de 2+ meses de dados.", "monthsCountTitle": "{n} meses com esse gasto", "itemSubtext": "{count}x no total · média {avg}"}`; en `{"emptyState": "No recurring pattern detected yet — appears after 2+ months of data.", "monthsCountTitle": "{n} months with this expense", "itemSubtext": "{count}x total · average {avg}"}`.

| Line | Old | New |
|---|---|---|
| 1281 | empty state | `window.i18n.t('charts.recurring.messages.emptyState')` |
| 1287 | `` title="${r.months.size} meses com esse gasto"`` | `` title="${window.i18n.t('charts.recurring.messages.monthsCountTitle', {n: r.months.size})}" `` |
| 1288 | `` `${r.count}x no total · média ${fmtEUR(avg)}` `` | `window.i18n.t('charts.recurring.messages.itemSubtext', {count: r.count, avg: fmtEUR(avg)})` |

- [ ] **Step 10: Verify in-browser**

Load demo data (needs 2+ months to exercise recurring/trend/calendar code paths — check the `DEMO` array in `src/transactions.js` spans enough months; if not, add a manual transaction in an earlier or later month to force multi-month code paths). Switch language and check: day-of-week chart x-axis labels, histogram tooltip (hover a bar), every anomaly card (trigger by importing/creating a duplicate or outlier transaction if demo data doesn't already produce one), calendar heatmap empty/populated states and all 4 highlight boxes, category chart in all 3 modes (donut/bar/waterfall) including the waterfall legend text, month/trend charts' legends and the trend badge, cashflow chart in all 3 modes (monthly/cumulative/forecast) including every tip/warning box under the forecast tab, and the recurring-charges list.

- [ ] **Step 11: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js src/i18n.js src/render.js
git commit -m "i18n: translate render.js charts, anomalies, calendar heatmap, recurring list"
```

---

### Task 8: Translate `src/transactions.js`

**Files:**
- Modify: `src/transactions.js`
- Modify: `locales/pt.json`, `locales/en.json` (add `modals.details.metaLabels`, extend `actions`, `modals.category`, `common`)

- [ ] **Step 1: Add `modals.details.metaLabels` to both locale files**

`locales/pt.json`, inside `modals.details`:
```json
"metaLabels": {
  "town": "Local",
  "dateProcessed": "Data de processamento",
  "type": "Tipo de movimento",
  "remittance": "Informação de remessa",
  "beneficiary": "Beneficiário",
  "byOrderOf": "Por ordem de",
  "beneficiaryAccount": "Conta do beneficiário",
  "atBank": "Banco do beneficiário",
  "mandateRef": "Referência do mandato",
  "endToEnd": "ID ponta a ponta",
  "ourRef": "Nossa referência",
  "to": "Destino",
  "card": "Cartão",
  "fxRate": "Taxa de câmbio",
  "originalAmount": "Valor na moeda original",
  "paymentDate": "Data de pagamento da fatura",
  "cardNumber": "Número do cartão",
  "cardStatementDate": "Fatura referente a"
}
```
`locales/en.json`:
```json
"metaLabels": {
  "town": "Location",
  "dateProcessed": "Processing date",
  "type": "Transaction type",
  "remittance": "Remittance information",
  "beneficiary": "Beneficiary",
  "byOrderOf": "By order of",
  "beneficiaryAccount": "Beneficiary account",
  "atBank": "Beneficiary bank",
  "mandateRef": "Mandate reference",
  "endToEnd": "End-to-end ID",
  "ourRef": "Our reference",
  "to": "To",
  "card": "Card",
  "fxRate": "Exchange rate",
  "originalAmount": "Original currency amount",
  "paymentDate": "Statement payment date",
  "cardNumber": "Card number",
  "cardStatementDate": "Statement period"
}
```

- [ ] **Step 2: Replace `META_LABELS` in `src/transactions.js`**

Before (`src/transactions.js:28-36`):
```js
const META_LABELS = {
  town:'Local', dateProcessed:'Data de processamento',
  type:'Tipo de movimento', remittance:'Informação de remessa',
  beneficiary:'Beneficiário', byOrderOf:'Por ordem de',
  beneficiaryAccount:'Conta do beneficiário', atBank:'Banco do beneficiário',
  mandateRef:'Referência do mandato', endToEnd:'ID ponta a ponta', ourRef:'Nossa referência',
  to:'Destino', card:'Cartão', fxRate:'Taxa de câmbio', originalAmount:'Valor na moeda original',
  paymentDate:'Data de pagamento da fatura', cardNumber:'Número do cartão', cardStatementDate:'Fatura referente a'
};
```
After — replace the static object with a function so it re-reads the current language every time it's called (a plain object built once at load time would freeze in whatever language was active on page load):
```js
function getMetaLabels(){
  const m = window.i18n.t('modals.details.metaLabels');
  // window.i18n.t returns the literal key string if metaLabels isn't found as a string —
  // but here we want the whole nested object, so read it directly off `translations`
  // the same way tArray does (see src/i18n.js Task 7 Step 1-2). Reuse tArray's pattern:
  return window.i18n.tObject ? window.i18n.tObject('modals.details.metaLabels') : {};
}
```
This requires a `tObject` helper alongside `tArray` from Task 7 — add it now if Task 7 hasn't been done yet, or confirm it already exists if done in order:

In `src/i18n.js`, next to `tArray` (or in place of it — merge into one generic helper if both are needed, since `tArray`/`tObject` share the identical lookup logic and only differ in the `Array.isArray` check):
```js
function tRaw(key) {
  const keys = key.split('.');
  let value = translations;
  for (const k of keys) { if (value && typeof value === 'object' && k in value) value = value[k]; else return null; }
  return value;
}
function tArray(key) { const v = tRaw(key); return Array.isArray(v) ? v : []; }
function tObject(key) { const v = tRaw(key); return (v && typeof v === 'object' && !Array.isArray(v)) ? v : {}; }
```
Export both on `window.i18n`. Then every call site that used `META_LABELS[k]` becomes `getMetaLabels()[k]`.

Find every reference to `META_LABELS` in `src/transactions.js` (`grep -n "META_LABELS" src/transactions.js`) and replace with `getMetaLabels()` calls — the `openDetailsDialog` function's loop (`for(const k of Object.keys(META_LABELS)){ if(meta[k]) rows.push([META_LABELS[k], meta[k]]); }`) becomes `for(const k of Object.keys(getMetaLabels())){ if(meta[k]) rows.push([getMetaLabels()[k], meta[k]]); }` (call it once into a local `const labels = getMetaLabels();` before the loop to avoid redundant lookups: `const labels = getMetaLabels(); for(const k of Object.keys(labels)){ if(meta[k]) rows.push([labels[k], meta[k]]); }`).

- [ ] **Step 3: Replace `openDetailsDialog` remaining strings**

Add to both locale files, inside `modals.details`: `"notIdentifiedOption": "Não identificado"` (pt) / `"Not identified"` (en) — reuse existing `modals.details.notIdentified` if the text matches (check: existing key value is `"Não identificado"` — matches exactly, so **no new key needed**, just use the existing one), `"transferPairText": "Vinculada a: {desc} · {date} · {value}{bank}"` (this exists already as `modals.details.transferPair` — reuse, don't duplicate), `"autoTransferInfoText": "Provável destino: {bank}"` (exists as `modals.details.autoTransferInfo` — reuse), `"sourceFileLabel": "Arquivo de origem"` (exists as `modals.details.sourceFile` — reuse), new key `"consideredDateLabel": "Data considerada no mês/orçamento"` (pt) / `"Month/budget date considered"` (en) — this one is genuinely new.

In `src/transactions.js`:

| Line | Old | New |
|---|---|---|
| 43 | `'<option value="">Não identificado</option>'` | `` `<option value="">${window.i18n.t('modals.details.notIdentified')}</option>` `` |
| 48 | transfer pair text | `window.i18n.t('modals.details.transferPair', {desc: pair.desc, date: (pair.realDate||pair.date).toLocaleDateString('pt-BR'), value: fmtEUR(pair.saida||pair.entrada||0), bank: pair.bank?' · '+bankLabel(pair.bank):''})` |
| 55 | auto-transfer info text | `` toBank ? window.i18n.t('modals.details.autoTransferInfo', {bank: toBank}) : '' `` |
| 57 | `['Arquivo de origem', tx.source||'—']` | `[window.i18n.t('modals.details.sourceFile'), tx.source||'—']` |
| 58 | `['Data considerada no mês/orçamento', ...]` | `[window.i18n.t('modals.details.consideredDateLabel'), tx.date.toLocaleDateString('pt-BR')]` |

- [ ] **Step 4: Replace bulk-action alert/confirm strings** (roughly lines 102-160)

Add to both locale files, inside `actions`: `"bulkDeleteConfirmText": "Excluir {n} transação(ões) selecionada(s)? Essa ação não pode ser desfeita."` (reuse existing `actions.bulkDeleteConfirm` — check: existing value is exactly `"Excluir {n} transação(ões) selecionada(s)? Essa ação não pode ser desfeita."` — **matches, reuse `actions.bulkDeleteConfirm`, no new key**). Similarly check `actions.selectTwoTransfers`, `actions.selectOneExpenseOneIncome`, `actions.alreadyLinked`, `actions.differentValues` against the exact hardcoded text at these lines — all four already exist verbatim in `locales/pt.json` per the earlier audit, so **no new keys needed for this step, only wiring**.

| Line | Old | New |
|---|---|---|
| 102 | bulk delete confirm | `window.i18n.t('actions.bulkDeleteConfirm', {n})` |
| 153 | select-two-transfers alert | `window.i18n.t('actions.selectTwoTransfers')` |
| 156 | select-one-expense-one-income alert | `window.i18n.t('actions.selectOneExpenseOneIncome')` |
| 157 | already-linked alert | `window.i18n.t('actions.alreadyLinked')` |
| 160 | different-values confirm | `window.i18n.t('actions.differentValues', {expense: fmtEUR(...), income: fmtEUR(...)})` |

- [ ] **Step 5: Replace category dialog title/submit-button text** (`openCategoryDialog`, roughly lines 204-205)

| Line | Old | New |
|---|---|---|
| 204 | `c ? 'Editar categoria' : 'Nova categoria'` | `c ? window.i18n.t('modals.category.titleEdit') : window.i18n.t('modals.category.titleNew')` (both keys already exist) |
| 205 | `c ? 'Salvar alterações' : 'Criar categoria'` | `c ? window.i18n.t('modals.category.submitEdit') : window.i18n.t('modals.category.submitNew')` (both keys already exist) |

- [ ] **Step 6: Handle the bulk-note dialog `{count}` description** (deferred from Task 5, Step 13)

Locate the function that populates `#bulkNoteCount` before opening `bulkNoteDialog` (search: `grep -n "bulkNoteCount" src/transactions.js`). Before:
```js
document.getElementById('bulkNoteCount').textContent = selectedTxIds.size;
```
After — target the wrapper paragraph added in Task 5 Step 13 (`#bulkNoteDesc`) instead, setting its full `innerHTML` via the templated key:
```js
document.getElementById('bulkNoteDesc').innerHTML = window.i18n.t('modals.bulkNote.description', {count: selectedTxIds.size});
```
Remove the now-unused `<span id="bulkNoteCount">0</span>` reference if nothing else reads it — grep first (`grep -rn "bulkNoteCount" index.html src/*.js`) to confirm no other consumer before deleting.

- [ ] **Step 7: Leave demo data untouched — add the required scope-decision comment**

At the top of the `DEMO` array declaration in `src/transactions.js` (find with `grep -n "const DEMO" src/transactions.js`), add immediately above it:
```js
// i18n: intentionally not translated — these are realistic Portuguese merchant
// names/descriptions for a Portugal-based demo dataset (Continente, Pingo Doce,
// BIL, etc). Translating them would make the sample data read as fictional.
```

- [ ] **Step 8: Verify no other hardcoded strings remain**

Run: `grep -n "'[A-ZÀ-Ú][a-zà-ú]* [a-zà-ú]" src/transactions.js | grep -v "i18n\|DEMO\|// "` and manually review any hits not already covered above (this regex is a coarse heuristic for "capitalized Portuguese-looking phrase" — expect some false positives from variable/CSS content; confirm each real hit against the original audit list from this task's research phase to make sure nothing was missed, particularly the CSV export header array at `transactions.js:307` and the `'Nada para exportar ainda.'`/`'Informe um valor válido'`/`'Movimento'` fallback strings — add locale keys `actions.nothingToExport`, `modals.manualEntry.invalidValue` (already exists — reuse), `transactions.defaultDescription` for these and wire them the same way as Steps 3-5.

- [ ] **Step 9: Regenerate `src/locales.js` and verify in-browser**

Run: `node gen-locales.js`. Test: details dialog on a transaction with rich meta fields (import a real PDF or check demo data for one with `meta` populated), bulk actions (select 2+, try swap/delete/link-transfer with mismatched selections to trigger each alert), category dialog (new + edit), bulk note dialog (check the `{count}` renders correctly and updates live), CSV export (open the downloaded file, confirm headers match whichever language was active at export time), manual entry with an invalid amount, clear-all confirm dialog.

- [ ] **Step 10: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js src/i18n.js src/transactions.js
git commit -m "i18n: translate transactions.js dialogs, bulk actions, meta labels"
```

---

### Task 9: Translate `src/file-handling.js`

**Files:**
- Modify: `src/file-handling.js`
- Modify: `locales/pt.json`, `locales/en.json` (extend `fileList`)

**Interfaces:**
- Consumes: bare global `t()` is safe in this file (confirm first — Step 1)

- [ ] **Step 1: Confirm `t` is not shadowed in this file**

Run: `grep -n "=>.*\bt\b\|function.*\bt\b\s*(" src/file-handling.js` and read every match. Expected: no local parameter or variable literally named `t` (the file's loop variables are typically named `f`/`file`/`pdf` per the audit). If confirmed clear, bare `t(...)` calls are safe here; if any match shows a local `t`, use `window.i18n.t(...)` for the remainder of this task instead.

- [ ] **Step 2: Extend `fileList` in `locales/pt.json`**

Add (alongside existing keys already in `fileList`): `"readingStatus": "lendo..."`, `"readingProgress": "Lendo {name} ({current}/{total})"`, `"parsedCounts": "{expenses} saídas · {income} entradas"`, `"parsedNone": "nenhum valor encontrado"`, `"bilCardTitle": "Fatura de cartão BIL"`, `"bilAccountTitle": "Extrato de conta BIL"`, `"bilBadge": "BIL"`, `"revolutTitle": "Extrato Revolut"`, `"revolutBadge": "Revolut"`, `"readError": "erro ao ler"`, `"completed": "Concluído"`, `"debugEmptyText": "(vazio — PDF sem texto selecionável)"`, `"duplicatesBanner": "⏭️ {n} duplicadas ignoradas (data+descrição+valor idênticos){extra}"`, `"enrichedClause": " · {n} completadas com novos detalhes"`, `"nothingNewProgress": "Nada novo"`, `"nothingNewLog": "{n} movimentos duplicados{enrichedClause} — nada novo importado."`, `"enrichedLogClause": " ({n} completados com novos detalhes)"`, `"inheritedBanner": "✨ {n} herdados de categorias já salvas"`

`locales/en.json`: `"readingStatus": "reading..."`, `"readingProgress": "Reading {name} ({current}/{total})"`, `"parsedCounts": "{expenses} expenses · {income} income"`, `"parsedNone": "no values found"`, `"bilCardTitle": "BIL card statement"`, `"bilAccountTitle": "BIL account statement"`, `"bilBadge": "BIL"`, `"revolutTitle": "Revolut statement"`, `"revolutBadge": "Revolut"`, `"readError": "read error"`, `"completed": "Done"`, `"debugEmptyText": "(empty — PDF has no selectable text)"`, `"duplicatesBanner": "⏭️ {n} duplicates skipped (identical date+description+value){extra}"`, `"enrichedClause": " · {n} enriched with new details"`, `"nothingNewProgress": "Nothing new"`, `"nothingNewLog": "{n} duplicate transactions{enrichedClause} — nothing new imported."`, `"enrichedLogClause": " ({n} enriched with new details)"`, `"inheritedBanner": "✨ {n} inherited from saved categories"`

- [ ] **Step 3: Regenerate `src/locales.js`**

Run: `node gen-locales.js`

- [ ] **Step 4: Replace `handleFiles` strings**

| Line | Old | New |
|---|---|---|
| 17 | `'Nenhum PDF encontrado. Selecione arquivos .pdf'` | `t('fileList.noPdfs')` (existing key) |
| 19 | `'lendo...'` | `t('fileList.readingStatus')` |
| 24 | `` `Lendo ${f.name} (${i+1}/${pdfs.length})` `` | `t('fileList.readingProgress', {name: f.name, current: i+1, total: pdfs.length})` |
| 84 | `` `${saidas} saídas · ${entradas} entradas` `` | `t('fileList.parsedCounts', {expenses: saidas, income: entradas})` |
| 84 | `'nenhum valor encontrado'` | `t('fileList.parsedNone')` |
| 91 | `'Fatura de cartão BIL'` | `t('fileList.bilCardTitle')` |
| 94 | `'Extrato de conta BIL'` | `t('fileList.bilAccountTitle')` |
| 95 | `'BIL'` (badge, both occurrences) | `t('fileList.bilBadge')` |
| 97 | `'Extrato Revolut'` | `t('fileList.revolutTitle')` |
| 98 | `'Revolut'` | `t('fileList.revolutBadge')` |
| 102 | `'erro ao ler'` | `t('fileList.error')` (existing key — check exact match; audit showed `fileList.error`="Erro ao ler" with capital E, this usage is lowercase "erro ao ler" — reuse the same key regardless of the case difference since it's the same concept and `t()` will now supply consistent casing) |
| 106 | `'Concluído'` | `t('fileList.completed')` |
| 108 | `'Não encontrei valores no formato esperado...'` | `t('fileList.noValuesFound')` (existing key) |
| 115 | `'Texto extraído (primeiros 1200 chars)...'` | `t('fileList.extractedText')` (existing key) |
| 115 | `'(vazio — PDF sem texto selecionável)'` | `t('fileList.debugEmptyText')` |
| 139-140 | duplicates banner + enriched clause | `` const extra = enrichedCount>0 ? t('fileList.enrichedClause', {n: enrichedCount}) : ''; ...t('fileList.duplicatesBanner', {n: dupCount, extra}) `` |
| 145 | `'Nada novo'` | `t('fileList.nothingNewProgress')` |
| 146 | nothing-new log message | build the enriched clause the same way as line 139-140, then `t('fileList.nothingNewLog', {n: dupCount, enrichedClause: enrichedCount>0 ? t('fileList.enrichedLogClause', {n: enrichedCount}) : ''})` |
| 163 | inherited-categories banner | `t('fileList.inheritedBanner', {n: inherited})` |

- [ ] **Step 5: Verify in-browser**

Import a real PDF (or the demo dataset if it exercises this path) and watch the progress bar / file list update live in both languages — since this is an async flow, switch language *before* starting an import to confirm the freshly-set language is used throughout (this file's strings are generated once per import run, not re-rendered on language switch, since there's no re-render hook for "in-flight import status" in `switchLanguage()` — that's expected and fine, same as any async operation that started under the previous language would keep using it; document this as intentional, not a bug, with a comment near the top of `handleFiles`: `// i18n: strings here are resolved once, at each event; switching language mid-import is expected to leave in-flight messages in whatever language was active when they were generated — the next fresh import call picks up the new language`).

- [ ] **Step 6: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js src/file-handling.js
git commit -m "i18n: translate file-handling.js import progress and status messages"
```

---

### Task 10: Translate `src/ollama.js`

**Files:**
- Modify: `src/ollama.js`
- Modify: `locales/pt.json`, `locales/en.json` (extend `settings.ai`)

- [ ] **Step 1: Confirm `t` is not shadowed**

Run: `grep -n "=>.*\bt\b\|function.*\bt\b\s*(" src/ollama.js`. Expect no hits with a bare `t` parameter (loop variables here are typically `batch`/`targets`/`m` per the audit). Bare `t(...)` is safe if confirmed.

- [ ] **Step 2: Extend `settings.ai.status`/`settings.ai.log` in `locales/pt.json`**

Inside `settings.ai.status`, add: `"onlineWithModel": "online · {model}"` (existing key `hasModel` already covers this exact shape — audit found `'online · '+models.find(...)` at line 34, which is the same as existing `status.hasModel`="online · {model}" — **reuse `settings.ai.status.hasModel`, no new key**). Add `"none": "(nenhum)"`.

Inside `settings.ai.log`, add: `"healthCheckOk": "Ollama online. Modelos: {models}"`, `"healthCheckFail": "Ollama offline: {error} — verifique: OLLAMA_ORIGINS=\"*\" ollama serve"`, `"healthCheckHint": "Dica: brew services stop ollama && OLLAMA_ORIGINS=\"*\" ollama serve"`, `"batchSummary": "{n} sem categoria serão enviadas à IA · {already} já categorizadas foram ignoradas"`, `"batchUnparsable": "Lote {batch}: resposta sem JSON — \"{preview}\""`.

`locales/en.json`, mirror: `settings.ai.status.none`: `"(none)"`. `settings.ai.log`: `"healthCheckOk": "Ollama online. Models: {models}"`, `"healthCheckFail": "Ollama offline: {error} — check: OLLAMA_ORIGINS=\"*\" ollama serve"`, `"healthCheckHint": "Tip: brew services stop ollama && OLLAMA_ORIGINS=\"*\" ollama serve"`, `"batchSummary": "{n} uncategorized will be sent to the AI · {already} already categorized were skipped"`, `"batchUnparsable": "Batch {batch}: response had no JSON — \"{preview}\""`.

- [ ] **Step 3: Regenerate `src/locales.js`**

Run: `node gen-locales.js`

- [ ] **Step 4: Replace status/log strings**

| Line | Old | New |
|---|---|---|
| 34 | `'online · '+models.find(...)` | `t('settings.ai.status.hasModel', {model: models.find(...)})` |
| 34 | `'online'` (no-Gemma-match branch) | `t('settings.ai.status.online')` (existing key) |
| 35 | health-check-ok log | `t('settings.ai.log.healthCheckOk', {models: models.join(', ')||t('settings.ai.status.none')})` |
| 38 | `'offline'` | `t('settings.ai.status.offline')` (existing key) |
| 39 | health-check-fail log | `t('settings.ai.log.healthCheckFail', {error: e.message})` |
| 40 | hint line | `t('settings.ai.log.healthCheckHint')` |
| 50 | nothing-to-categorize log | `t('settings.ai.log.nothingToCategorize')` (existing key) |
| 55 | all-categorized log | `t('settings.ai.log.allCategorized', {count: saidaTxs.length})` (existing key) |
| 58 | batch summary log | `t('settings.ai.log.batchSummary', {n: targets.length, already})` |
| 61 | button label while busy | `` '<i class="ri-loader-4-line animate-spin"></i> '+t('settings.ai.categorizing') `` (existing key) |
| 62 | busy status pill | `t('settings.ai.status.busy')` (existing key) |
| 63 | starting log | `t('settings.ai.log.starting', {count: targets.length, model, url})` (existing key) |
| 112 | unparsable-batch log | `t('settings.ai.log.batchUnparsable', {batch: i/BATCH+1, preview: content.slice(0,120)})` |
| 125 | batch progress log | `t('settings.ai.log.batchProgress', {current: i/BATCH+1, total: Math.ceil(targets.length/BATCH), applied})` (existing key) |
| 128 | batch error log | `t('settings.ai.log.batchError', {batch: i/BATCH+1, error: e.message})` (existing key) |
| 130 | CORS error log | `t('settings.ai.log.corsError')` (existing key) |
| 138 | button label after completion | `` '<i class="ri-magic-line"></i> '+t('settings.ai.categorizeNow') `` (existing key) |
| 139 | status pill after completion | `t('settings.ai.status.online')` |
| 140 | completed log | `t('settings.ai.log.completed', {done, model})` (existing key) |

- [ ] **Step 5: Leave the LLM system/user prompts untouched — add the required scope-decision comment**

Locate the `systemPrompt`/prompt-building code (`grep -n "systemPrompt\|Classifique estas" src/ollama.js`). Add immediately above it:
```js
// i18n: intentionally not translated — this is the instruction text sent to the
// local LLM (Ollama), never rendered in the UI. Keeping it in Portuguese matches
// the transaction descriptions being classified (mostly Portuguese/European bank
// statement text), which likely improves classification accuracy; translating
// only the prompt wrapper while leaving user data in Portuguese would be
// inconsistent anyway.
```

- [ ] **Step 6: Verify in-browser**

With Ollama running locally (or without — check both the online and offline status-pill paths), switch language and re-trigger "Testar conexão"/"Test connection" and "Categorizar com IA local"/"Categorize with local AI", reading the `#ollamaLog` panel output in both languages.

- [ ] **Step 7: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js src/ollama.js
git commit -m "i18n: translate ollama.js status and log messages"
```

---

### Task 11: Translate `src/persistence.js`

**Files:**
- Modify: `src/persistence.js`
- Modify: `locales/pt.json`, `locales/en.json` (extend `settings.data`, add `openingBalance` alerts)

- [ ] **Step 1: Confirm `t` is not shadowed**

Run: `grep -n "=>.*\bt\b\|function.*\bt\b\s*(" src/persistence.js`. Expect no hits (audit shows no transaction-loop-variable usage in this file). Bare `t(...)` should be safe; verify before proceeding.

- [ ] **Step 2: Extend locale files**

`locales/pt.json`, inside `settings.data`, add: `"folderApiUnsupported": "Escolher pasta funciona no Chrome e Edge. Nesse navegador, os dados continuam salvos automaticamente aqui mesmo (localStorage)."`, `"quotaFull": "⚠️ Armazenamento do navegador cheio — escolha uma pasta em Configurações → Dados ou baixe backup JSON."`, `"restoredFromFolder": "Restaurado de gastos-data.json ({count} transações, {date})"`, `"savedToFolderLog": "💾 gastos-data.json salvo na pasta \"{name}\""`, `"savedToLocalLog": "💾 salvo no navegador (localStorage) — use \"Escolher pasta\" em Configurações → Dados para gravar no computador"`, `"savedToFolderAlert": "✅ gastos-data.json salvo na pasta \"{name}\""`, `"savedToLocalAlert": "✅ Salvo no navegador (localStorage). Clique em \"Escolher pasta\" para gravar direto no computador."`, `"importedAlert": "✅ Backup restaurado: {count} transações"` (audit shows existing key `settings.data.importSuccess`="Backup restaurado: {count} transações" — **reuse that, just prepend the ✅ inline in JS**: `` '✅ '+t('settings.data.importSuccess', {count}) ``, no new key needed for this one), `"invalidFileAlert": "Arquivo inválido: {error}"` (reuse existing `settings.data.importError` the same way).

Add new key `"fixedBilCardMigration": "🔧 {n} compra(s) do cartão BIL, importadas antes da correção, foram recategorizadas e voltaram a contar como Gasto."`, `"fixedTransfersMigration": "🔧 {n} transação(ões) identificadas como transferência entre suas contas (pelo banco do beneficiário) — não contam mais como Gasto/Entrada."` under `settings.data`.

Add `openingBalance.invalidInput`: `"Informe uma data e um valor válidos."`

`locales/en.json`, mirror all of the above in English: `"folderApiUnsupported": "Choosing a folder works in Chrome and Edge. In this browser, data keeps saving automatically right here (localStorage)."`, `"quotaFull": "⚠️ Browser storage full — choose a folder in Settings → Data or download a JSON backup."`, `"restoredFromFolder": "Restored from gastos-data.json ({count} transactions, {date})"`, `"savedToFolderLog": "💾 gastos-data.json saved to folder \"{name}\""`, `"savedToLocalLog": "💾 saved in browser (localStorage) — use \"Choose folder\" in Settings → Data to save to your computer"`, `"savedToFolderAlert": "✅ gastos-data.json saved to folder \"{name}\""`, `"savedToLocalAlert": "✅ Saved in browser (localStorage). Click \"Choose folder\" to save directly to your computer."`, `"fixedBilCardMigration": "🔧 {n} BIL card purchase(s), imported before the fix, were recategorized and now count as an Expense again."`, `"fixedTransfersMigration": "🔧 {n} transaction(s) identified as a transfer between your accounts (by beneficiary bank) — no longer counted as Expense/Income."`, `openingBalance.invalidInput`: `"Enter a valid date and amount."`

- [ ] **Step 3: Regenerate `src/locales.js`**

Run: `node gen-locales.js`

- [ ] **Step 4: Replace `chooseFolder`/`updateFsStatus` strings** (roughly lines 39-65)

| Line | Old | New |
|---|---|---|
| 39 | folder-API-unsupported alert | `t('settings.data.folderApiUnsupported')` |
| 58 | `` `Salvando na pasta "${fsDirHandle.name}"` `` | `t('settings.data.folder', {name: fsDirHandle.name})` (existing key) |
| 59 | folder-status subtext | `t('settings.data.folderSub')` (existing key) |
| 60 | `'<i class="ri-folder-open-line"></i> Trocar pasta'` | `` '<i class="ri-folder-open-line"></i> '+t('settings.data.changeFolder') `` (existing key) |
| 63 | localStorage status text | `t('settings.data.localStorage')` (existing key) |
| 64 | localStorage-status subtext | `t('settings.data.localStorageSub')` (existing key) |
| 65 | `'<i class="ri-folder-open-line"></i> Escolher pasta'` | `` '<i class="ri-folder-open-line"></i> '+t('settings.data.chooseFolder') `` (existing key) |

- [ ] **Step 5: Replace `updateOpeningBalanceStatus` strings** (roughly lines 73-83)

| Line | Old | New |
|---|---|---|
| 73 | `` `Definido: ${fmtEUR(...)} em ${...}` `` | `t('openingBalance.statusSet', {value: fmtEUR(...), date: ...})` (existing key) |
| 77 | empty-state text | `t('openingBalance.statusNone')` (existing key) |
| 83 | invalid-input alert | `t('openingBalance.invalidInput')` |

- [ ] **Step 6: Replace quota-banner and migration log messages**

| Line | Old | New |
|---|---|---|
| 134 | quota-full ollamaLog message | `t('settings.data.quotaFull')` |
| 173 | restored-from-folder log | `t('settings.data.restoredFromFolder', {count: ..., date: new Date(j.savedAt).toLocaleString()})` |
| 225 | BIL-card migration log | `t('settings.data.fixedBilCardMigration', {n: fixedLegacy})` |
| 226 | transfers migration log | `t('settings.data.fixedTransfersMigration', {n: fixedTransfers})` |

- [ ] **Step 7: Replace save/export/import handler strings** (roughly lines 280-296)

| Line | Old | New |
|---|---|---|
| 280 | save-json-now log (folder branch) | `t('settings.data.savedToFolderLog', {name: fsDirHandle.name})` |
| 280 | save-json-now log (local branch) | `t('settings.data.savedToLocalLog')` |
| 281 | alert (folder branch) | `t('settings.data.savedToFolderAlert', {name: fsDirHandle.name})` |
| 281 | alert (local branch) | `t('settings.data.savedToLocalAlert')` |
| 295 | import-success alert | `` '✅ '+t('settings.data.importSuccess', {count: j.transactions?.length||0}) `` |
| 296 | invalid-file alert | `` t('settings.data.importError', {error: err.message}) `` |

Leave the backup filename (`` `gastos-backup-${new Date().toISOString().slice(0,10)}.json` ``, line 287) and the two `console.log`/`console.warn` diagnostic strings (lines 146-147, 184) untouched — add the required scope-decision comment above the `console.log`/`console.warn` lines:
```js
// i18n: intentionally not translated — developer-facing console diagnostics, never rendered in the UI.
```

- [ ] **Step 8: Verify in-browser**

Test folder choose/save/export/import flows in both languages (the File System Access API folder-picker itself is browser-native and not translatable by this app — only the surrounding status text is in scope). Trigger the opening-balance invalid-input alert by submitting an empty form. If reproducible, trigger the quota-full path (or read the code path carefully instead if not easily reproducible, confirming the `t()` call is correctly placed).

- [ ] **Step 9: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js src/persistence.js
git commit -m "i18n: translate persistence.js status, alerts, and migration log messages"
```

---

### Task 12: Translate `src/print-report.js`

**Files:**
- Modify: `src/print-report.js`
- Modify: `locales/pt.json`, `locales/en.json` (mostly reusing the existing `printReport.*` namespace already in both files)

- [ ] **Step 1: Confirm `t` is not shadowed**

Run: `grep -n "=>.*\bt\b\|function.*\bt\b\s*(" src/print-report.js`. Expect no hits. Bare `t(...)` safe if confirmed.

- [ ] **Step 2: Add the two genuinely missing keys**

The existing `printReport` namespace in both locale files already covers most of this file's strings (title, generated, kpis.*, sections.*, tableHeaders.*, footer — see the current `locales/pt.json`/`locales/en.json` for exact keys). Two are missing: the default "all time" period label and the "no data" empty states.

`locales/pt.json`, inside `printReport`, add: `"allPeriod": "Todo o período"` (reuse `filters.allPeriods` instead if identical — check: `filters.allPeriods` = `"Todo o período"`, exact match — **reuse `filters.allPeriods`, skip adding this key**), `"noExpensesInPeriod": "Sem saídas no período."`, `"noData": "Sem dados."`, `"printWithoutDataAlert": "Adicione dados antes de imprimir — importe PDFs ou use \"Ver com dados de exemplo\" em Configurações."`

`locales/en.json`: `"noExpensesInPeriod": "No expenses this period."`, `"noData": "No data."`, `"printWithoutDataAlert": "Add data before printing — import PDFs or use \"Load demo data\" in Settings."`

- [ ] **Step 3: Regenerate `src/locales.js`**

Run: `node gen-locales.js`

- [ ] **Step 4: Replace strings in `buildPrintReport`**

| Line | Old | New |
|---|---|---|
| 26 | `'Todo o período'` | `t('filters.allPeriods')` |
| 63 | `'Gastos<span style="color:#7c3aed;">.AI</span> — Relatório de Despesas'` | keep the brand name as-is (this is the print-only header, matches `printReport.title` — audit shows `printReport.title` = `"Gastos.AI — Relatório de Despesas"` without the inline color span; **align the two**: replace this whole line's content with `` `${t('printReport.title')}` `` wrapped in the existing color-span markup, i.e. `` `<span>Gastos<span style="color:#7c3aed;">.AI</span></span> — ${t('printReport.sections.???')}` `` — actually simplest: split the key so the brand mark stays hardcoded HTML (it's a logo, not translatable text) and only the "— Relatório de Despesas" suffix is templated: add a new key `printReport.subtitle`: `"Relatório de Despesas"` (pt) / `"Expense Report"` (en) to both files, then render `` `Gastos<span style="color:#7c3aed;">.AI</span> — ${t('printReport.subtitle')}` `` |
| 64 | period/category/generated subheader | already has `t()`-ready equivalents? No — this file currently has zero `t()` calls (confirm via `grep -n "window.i18n\|[^.]\bt(" src/print-report.js` returning nothing before this task). Replace with: add key `printReport.categoryClause`: `" · categoria: {name}"` (pt) / `" · category: {name}"` (en), then `` `${periodLabel}${catFilterLabel?t('printReport.categoryClause',{name:escapeHtml(catFilterLabel)}):''} · ${t('printReport.generated',{date:genStr})}` `` (existing `printReport.generated` key already has the `{date}` placeholder per current locale file — reuse it) |
| 69-72 | KPI box labels | `t('printReport.kpis.totalExpenses')`, `t('printReport.kpis.income')`, `t('printReport.kpis.balance')`, `t('printReport.kpis.savingsRate')` (all existing keys) |
| 77 | `'Gasto por categoria'` | `t('printReport.sections.byCategory')` (existing key) |
| 87 | `'Sem saídas no período.'` | `t('printReport.noExpensesInPeriod')` |
| 92 | `'Evolução mensal'` | `t('printReport.sections.monthlyEvolution')` (existing key) |
| 101 | `'Top estabelecimentos'` | `t('printReport.sections.topMerchants')` (existing key) |
| 103 | `'Sem dados.'` | `t('printReport.noData')` |
| 108 | statement section header | `t('printReport.sections.statement', {count: rows.length, category: catFilterLabel?t('printReport.categoryClause',{name:escapeHtml(catFilterLabel)}):''})` (existing key with `{count}`/`{category}` placeholders per current locale file — reuse) |
| 111-115 | table column headers | `t('printReport.tableHeaders.date')`, `.description`, `.category`, `.expense`, `.income` (all existing keys) |
| 127 | `'Nenhuma transação nesse filtro.'` | `t('table.empty')` (existing key, shared with the dashboard table's empty state) |
| 133 | footer text | `t('printReport.footer', {date: ...})` (existing key) |

- [ ] **Step 5: Replace the print-without-data alert**

Locate the `btnPrint` click handler (`grep -n "btnPrint" src/print-report.js`), replace the alert string at line 139 with `t('printReport.printWithoutDataAlert')`.

- [ ] **Step 6: Verify in-browser**

With data loaded, click "Imprimir relatório"/"Print report" in both languages and inspect the print preview (browser's print dialog / print-to-PDF) for every section header, KPI label, table header, and footer text. Clear all data and click print again to see the (previously untranslated) `printWithoutDataAlert`.

- [ ] **Step 7: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js src/print-report.js
git commit -m "i18n: translate print-report.js section headers and alerts"
```

---

### Task 13: Translate `src/categories.js` default category/bank-type names and dialogs

**Files:**
- Modify: `src/categories.js`
- Modify: `locales/pt.json`, `locales/en.json` (already have `categories.*` and `bankTypes.*` namespaces with the right ids — this task wires them, adds nothing new except two dialog keys)

**Interfaces:**
- Produces: `catById(id).name` and bank-type lookups must now resolve default entries' `name` through `t()` while still returning the raw stored `name` for user-created custom categories/bank-types (this is the risk area explicitly flagged in the plan intro)

- [ ] **Step 1: Confirm `t` is not shadowed**

Run: `grep -n "=>.*\bt\b\|function.*\bt\b\s*(" src/categories.js`. Expect no hits (loop variables here are `c`/`b` per the audit). Bare `t(...)` safe if confirmed.

- [ ] **Step 2: Read `DEFAULT_CATEGORIES` and `DEFAULT_BANK_TYPES` in full** (`src/categories.js:1-136` approximately) before editing, to see exactly how `name:` is used elsewhere (rendering, dropdowns, CSV export) — this determines whether changing `name:` to a `t()` call at declaration time is safe, or whether it must be resolved lazily.

**Critical design decision:** `DEFAULT_CATEGORIES` is very likely built once, at module load time (`const DEFAULT_CATEGORIES = [...]`), and its `name:` values get copied into the live `categories` array (probably via `categories = loadFromStorage() || DEFAULT_CATEGORIES.map(c=>({...c}))` or similar — check `src/categories.js` and `src/persistence.js` for exactly how `categories` is initialized and persisted). If `name:` is evaluated once at load time as `t('categories.alimentacao')`, the resolved English or Portuguese *string* gets baked in and saved to `localStorage`/`gastos-data.json` as static data — switching language later would NOT re-translate a category whose name was already resolved and persisted. This is the second risk area flagged in the plan intro. **Do not bake the translation into `name:` at declaration time.** Instead:

- [ ] **Step 3: Keep `id:` as the source of truth for default categories/bank-types; make `name:` resolution lazy**

Add a small helper near the top of `src/categories.js`, after `DEFAULT_CATEGORIES`/`DEFAULT_BANK_TYPES` are declared:

```js
// i18n: DEFAULT_CATEGORIES/DEFAULT_BANK_TYPES keep their original Portuguese
// `name:` as a fallback (used if a locale key is ever missing), but display
// name resolution goes through catDisplayName()/bankDisplayName() so switching
// language re-translates default entries without re-persisting a baked-in string.
// User-created custom categories/bank-types (anything whose id isn't one of
// DEFAULT_CATEGORIES/DEFAULT_BANK_TYPES' ids) always use their own stored `name`
// verbatim — there's no locale key for a category the user invented themselves.
const DEFAULT_CATEGORY_IDS = new Set(DEFAULT_CATEGORIES.map(c=>c.id));
const DEFAULT_BANK_TYPE_IDS = new Set(DEFAULT_BANK_TYPES.map(b=>b.id));

function catDisplayName(cat){
  if (!cat) return '';
  if (DEFAULT_CATEGORY_IDS.has(cat.id)) {
    const translated = t(`categories.${cat.id}`);
    return translated === `categories.${cat.id}` ? cat.name : translated; // t() returns the key itself on a miss — fall back to stored name
  }
  return cat.name;
}
function bankDisplayName(bank){
  if (!bank) return '';
  if (DEFAULT_BANK_TYPE_IDS.has(bank.id)) {
    const translated = t(`bankTypes.${bank.id}`);
    return translated === `bankTypes.${bank.id}` ? bank.name : translated;
  }
  return bank.name;
}
```

- [ ] **Step 4: Find every place that reads `c.name`/`cat.name`/`b.name`/`bank.name` for a *default* category or bank type and route it through the new helpers**

This is cross-file — `catDisplayName`/`bankDisplayName` need to be called from `src/render.js` (category chips, chart legends, table category dropdown, waterfall labels already handled via other keys in Task 6/7 — but any spot rendering a category's `.name` directly still needs this), `src/transactions.js` (bank select in details dialog, category select in manual-entry/table-row dropdowns), and `src/categories.js` itself (bank-type chips, category chips). Search broadly first:

Run: `grep -rn "\.name\b" src/categories.js src/render.js src/transactions.js | grep -v "b\.name\s*=\|c\.name\s*=\|cat\.name\s*=\|cName\|bName"` (excludes assignment sites, keeps read sites) and manually classify each hit as "reads a category/bank-type name for display" (needs `catDisplayName()`/`bankDisplayName()`) vs. something unrelated (a different object entirely).

Apply the swap at each display read site, e.g. in `src/categories.js`'s chip-rendering functions:

Before (typical pattern, exact line depends on what Step 4's grep found — this shows the shape, not a specific line number since it recurs many times):
```js
`<span ...>${escapeHtml(c.name)}</span>`
```
After:
```js
`<span ...>${escapeHtml(catDisplayName(c))}</span>`
```

Do the same for every bank-type chip/select rendering `b.name`/`bank.name` → `bankDisplayName(b)`.

- [ ] **Step 5: Wire the bank-type dialog title/submit-button and edit-title tooltip** (roughly lines 192, 203, 205, 211-212)

| Line | Old | New |
|---|---|---|
| 192 | `` `Editar ${escapeHtml(b.name)}` `` | `t('common.editItemTitle', {name: escapeHtml(bankDisplayName(b))})` (reuses Task 6's `common.editItemTitle` key) |
| 203 | `'<option value="">Todas contas</option>'` | `` `<option value="">${t('filters.bankAll')}</option>` `` (existing key) |
| 205 | `'<option value="">Sem conta identificada</option>'` | `` `<option value="">${t('filters.bankNone')}</option>` `` (existing key) |
| 211 | `'Editar tipo de conta'` / `'Novo tipo de conta'` | `t('modals.bankType.titleEdit')` (new — see Step 6) / `t('modals.bankType.titleNew')` (added in Task 5) |
| 212 | `'Salvar alterações'` / `'Criar tipo de conta'` | `t('modals.category.submitEdit')` (reuse existing generic "save changes" key — check text matches: existing value is `"Salvar alterações"`, exact match) / `t('modals.bankType.submitNew')` (added in Task 5) |

- [ ] **Step 6: Add the one missing key from Step 5**

`locales/pt.json`, inside `modals.bankType` (added in Task 5): add `"titleEdit": "Editar tipo de conta"`. `locales/en.json`: add `"titleEdit": "Edit account type"`. Regenerate: `node gen-locales.js`.

- [ ] **Step 7: Replace `applySameDescription`'s log message** (roughly line 252)

Add to both locale files a new key `categories.propagatedLog`: pt `"Propagado: {n} transações com descrição \"{desc}\" → {category}"`, en `"Propagated: {n} transactions with description \"{desc}\" → {category}"`.

Before:
```js
ollamaLog(`Propagado: ${n} transações com descrição "${...}" → ${catById(changedTx.cat).name}`);
```
After:
```js
ollamaLog(t('categories.propagatedLog', {n, desc: ..., category: catDisplayName(catById(changedTx.cat))}));
```

- [ ] **Step 8: Regenerate `src/locales.js`**

Run: `node gen-locales.js`

- [ ] **Step 9: Verify in-browser — this is the most important check in the whole plan**

Load demo data. Switch language and confirm: every default category's displayed name (chips, table dropdown, chart legends, waterfall labels, KPI "maior categoria" text) changes language live, with **no page reload and no re-import needed**. Create a **custom** category with a made-up name (e.g. "Pets"), switch language again, and confirm the custom category's name does **not** change (since it has no locale key — this proves the `DEFAULT_CATEGORY_IDS.has()` branch correctly falls through to the stored `name` for user data). Do the same for a custom bank type. Finally, reload the page after switching language once, and confirm categories still show correctly in the now-current language (proving nothing got incorrectly baked into persisted storage).

- [ ] **Step 10: Commit**

```bash
git add locales/pt.json locales/en.json src/locales.js src/categories.js src/render.js src/transactions.js
git commit -m "i18n: translate default category/bank-type names via lazy display-name lookup"
```

---

## Part 3 — Final verification

### Task 14: Full-repo audit for leftover hardcoded Portuguese, and end-to-end bilingual QA pass

**Files:**
- No new files — this task only verifies Tasks 1-13's output

- [ ] **Step 1: Grep for obviously-Portuguese leftover strings across all touched files**

Run:
```bash
grep -rnE "'[A-ZÀ-Ú][a-zà-ÿ]+ [a-zà-ÿçãõáéíóúâêô]+" src/*.js index.html | grep -v "i18n\|DEMO\|// \|console\.\|systemPrompt\|userPrompt"
```
Expected: zero hits, or only hits already reviewed and explicitly exempted per the Global Constraints section (demo data, LLM prompts, console diagnostics). Any other hit is a miss from Tasks 1-13 — go back and translate it following the same file's established pattern.

- [ ] **Step 2: Grep for raw untranslated dot-path keys that might be showing on screen**

This can only be caught by eye, not grep (a missing key shows as literal text like `settings.ai.title` in the rendered page, not in source). Serve the app, open every view (main dashboard with demo data loaded, every settings card, every dialog) in **both** languages, and read every visible string end-to-end. Any text that looks like `word.word.word` on screen is a missing locale key — cross-reference the exact key name against both `locales/pt.json` and `locales/en.json` (a key present in one but not the other is the most common cause) and add the missing side.

- [ ] **Step 3: Confirm `switchLanguage()`'s re-render list covers everything this plan touched**

Read `src/i18n.js`'s `switchLanguage()` function. It currently calls: `applyTranslations()`, `updateLanguageSelector()`, `renderCategoryChips()`, `renderTable()`, `updateCharts()`, `updateKPIs()`, `renderBankTypeChips()`, `refreshPeriodOptions()`, `updateOpeningBalanceStatus()`, `updateFsStatus()`. Cross-check this list against every function this plan modified: `updateBudgetSummary`/`renderBudgetList` (Task 6, Step 4) and `renderBulkBar` (Task 6, Step 5) are **not** in the current re-render list — if either of them isn't already invoked as a side effect of one of the listed functions (check: does `updateKPIs()` call `updateBudgetSummary()` internally? does `renderTable()` call `renderBulkBar()` internally?), add them explicitly to `switchLanguage()`:

```js
if (typeof updateBudgetSummary === 'function') updateBudgetSummary();
if (typeof renderBulkBar === 'function') renderBulkBar();
```
(Read the actual call graph in `src/render.js` before assuming either is missing — only add what's genuinely not already covered transitively.)

- [ ] **Step 4: Test the ollama status footer note's dynamic model/size values** (Task 4, Step 5's `settings.ai.footerNote`)

This key has `{model}`/`{size}` placeholders that must be filled from live Ollama detection state, not left as static text forever. Find where `#ollamaCard`'s footer `<p>` is currently updated after a successful health check (likely in `src/ollama.js`'s health-check function) and confirm it now calls `t('settings.ai.footerNote', {model: ..., size: ...})` with real detected values rather than leaving the HTML's static placeholder text (which only shows before the first health check runs, or if Ollama is never reached).

- [ ] **Step 5: Verify `file://` still works (regression check for the earlier session's fix)**

Open `index.html` directly via `file://` (double-click it, or `open index.html` on macOS) rather than through a local server. Confirm every string this plan added still resolves correctly (no raw keys) — this proves the `src/locales.js` script-tag mechanism from the earlier i18n bugfix continues to cover every new key added in this plan, since `gen-locales.js` regenerates the whole file from the JSON sources every time.

- [ ] **Step 6: Rebuild the standalone `dist/` bundle**

Run: `node build.js`
Expected: `dist/index.html gerado (NNN KB)` with no errors. Open `dist/index.html` (via `file://`, since that's this bundle's whole purpose) and spot-check a handful of strings from different tasks in both languages to confirm the standalone build is fully in sync.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "i18n: final verification pass — fill gaps, wire remaining re-renders, rebuild dist"
```
