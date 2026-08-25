// GERADO AUTOMATICAMENTE por gen-locales.js a partir de locales/pt.json e locales/en.json.
// Não edite este arquivo à mão — edite os .json e rode `node gen-locales.js` (ou `node build.js`).
window.GASTOS_LOCALES = {
  "pt": {
    "app": {
      "title": "Gastos<span style=\"color:#7c3aed;\">.AI</span>",
      "subtitle": "Dashboard de despesas 100% local e privado"
    },
    "header": {
      "language": "Idioma",
      "theme": "Tema",
      "print": "Imprimir relatório"
    },
    "dropZone": {
      "title": "Arraste PDFs aqui ou clique para selecionar",
      "subtitle": "Extratos bancários (Revolut, BIL, etc.) — PDFs de texto, não imagens",
      "btnPickFiles": "Escolher arquivos",
      "btnPickFolder": "Escolher pasta"
    },
    "fileList": {
      "title": "Arquivos importados",
      "reading": "Lendo...",
      "error": "Erro ao ler",
      "noPdfs": "Nenhum PDF encontrado. Selecione arquivos .pdf",
      "noValuesFound": "Não encontrei valores no formato esperado (ex: 12,34 € , € 1.234,56 ou 1 234,56 €). Abra o PDF e tente selecionar o valor com o mouse — se não conseguir selecionar, é PDF escaneado (imagem) e precisa de OCR. Use \"Adicionar transação manual\" como alternativa.",
      "extractedText": "Texto extraído (primeiros 1200 chars) — copie e me envie se o erro persistir:",
      "duplicatesSkipped": "duplicadas ignoradas (data+descrição+valor idênticos)",
      "enriched": "completadas com novos detalhes",
      "nothingNew": "Nada novo",
      "inheritedCategories": "herdados de categorias já salvas",
      "readingStatus": "lendo...",
      "readingProgress": "Lendo {name} ({current}/{total})",
      "parsedCounts": "{expenses} saídas · {income} entradas",
      "parsedNone": "nenhum valor encontrado",
      "bilCardTitle": "Fatura de cartão BIL",
      "bilAccountTitle": "Extrato de conta BIL",
      "bilBadge": "BIL",
      "revolutTitle": "Extrato Revolut",
      "revolutBadge": "Revolut",
      "readError": "erro ao ler",
      "completed": "Concluído",
      "debugEmptyText": "(vazio — PDF sem texto selecionável)",
      "duplicatesBanner": "⏭️ {n} duplicadas ignoradas (data+descrição+valor idênticos){extra}",
      "enrichedClause": " · {n} completadas com novos detalhes",
      "nothingNewProgress": "Nada novo",
      "nothingNewLog": "{n} movimentos duplicados{enrichedClause} — nada novo importado.",
      "enrichedLogClause": " ({n} completados com novos detalhes)",
      "inheritedBanner": "✨ {n} herdados de categorias já salvas",
      "demoLoaded": "Dados de exemplo carregados — {n} despesas"
    },
    "kpis": {
      "balance": "Saldo atual",
      "totalExpenses": "Total gasto",
      "count": "Movimentos",
      "average": "Média por gasto",
      "topCategory": "Maior categoria",
      "topCategoryValue": "Valor e % do total",
      "insight": "Insight",
      "insightDetail": "Detalhe do insight",
      "savingsRate": "Taxa de poupança",
      "saved": "sobrando no período",
      "overspent": "além da renda",
      "noIncome": "sem entradas no período",
      "balanceSubDefault": "Entradas − saídas de todo o histórico · defina um saldo inicial em Configurações se faltar dado anterior",
      "transactionsLabel": "{count} transações",
      "avgTicket": "Ticket médio",
      "perTransaction": "por transação",
      "insightTitle": "O que mais pesa?",
      "insightDefault": "Adicione PDFs para ver insights.",
      "balanceSubWithOpening": "Saldo inicial {value} ({date}) + entradas − saídas",
      "countBreakdown": "{expenses} saídas · {income} entradas{transfers} · {files} arquivos",
      "countTransfersClause": " · {n} transferências internas",
      "topCategoryValueText": "{value} · {pct}% do total",
      "insightMainText": "{cat} é seu maior gasto",
      "insightSubText": "{value} ({pct}%) — vale revisar assinaturas e compras nessa categoria.",
      "savedText": "{value} sobrando no período",
      "overspentText": "{value} além da renda"
    },
    "filters": {
      "searchPlaceholder": "Buscar descrição, categoria, arquivo...",
      "allCategories": "Todas categorias",
      "allPeriods": "Todo o período",
      "typeAll": "Todos",
      "typeExpense": "Só saídas",
      "typeIncome": "Só entradas",
      "bankAll": "Todos os tipos",
      "bankNone": "Sem tipo identificado",
      "periodChips": {
        "all": "Tudo"
      },
      "yearOf": "Ano de {year}"
    },
    "table": {
      "columns": {
        "select": "Selecionar",
        "date": "Data",
        "description": "Descrição",
        "expense": "Saída",
        "income": "Entrada",
        "category": "Categoria",
        "actions": "Ações"
      },
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
      "goToSettings": "Ir para Configurações",
      "empty": "Nenhuma transação nesse filtro.",
      "noValue": "—",
      "cardSettlement": "Fatura do cartão",
      "cardSettlementTitle": "Débito único da fatura do cartão — não contabilizado (as compras já foram contadas individualmente)",
      "transferBetweenAccounts": "entre contas",
      "transferBetweenAccountsTitle": "Transferência entre suas contas — não contabilizada em Gastos/Entradas. Veja o par em Detalhes.",
      "possibleTransfer": "possível transferência",
      "internalTransfer": "interna",
      "internalTransferTitle": "Movimentação interna — não contabilizada",
      "summary": "movimentos",
      "realExpenses": "Gastos reais",
      "income": "Entradas",
      "internalTransfers": "Transf. internas",
      "monthlyAverage": "Média mensal",
      "pageInfo": "Página {current} / {total}",
      "prevPage": "Anterior",
      "nextPage": "Próxima",
      "possibleTransferTitleText": "Detectado automaticamente pelo banco do beneficiário — provável transferência para {bank}. Confira em Detalhes.",
      "avgPerMonthTitle": "Total dividido pelos {n} {monthWord} com movimento nessa categoria",
      "monthWordSingular": "mês",
      "monthWordPlural": "meses",
      "summaryInternalTransfersTitle": "Movimentações internas (pockets, Flexible Cash Funds) — não contam como gasto",
      "csvHeaders": [
        "data",
        "descricao",
        "saida",
        "entrada",
        "saldo",
        "categoria",
        "arquivo"
      ]
    },
    "actions": {
      "swap": "Trocar Saída ↔ Entrada",
      "note": "Nota",
      "details": "Detalhes",
      "delete": "Excluir transação",
      "confirmDelete": "Excluir esta transação?\n\n{desc}\n{date} · {value}",
      "bulkActions": "Ações em massa",
      "bulkCount": "{count} selecionadas",
      "bulkClear": "Limpar seleção",
      "bulkDelete": "Excluir selecionadas",
      "bulkDeleteConfirm": "Excluir {n} transação(ões) selecionada(s)? Essa ação não pode ser desfeita.",
      "bulkSwap": "Inverter Saída/Entrada",
      "bulkCategory": "Categoria...",
      "bulkBank": "Tipo de conta...",
      "bulkNote": "Adicionar nota",
      "bulkLinkTransfer": "Vincular transferência",
      "selectTwoTransfers": "Selecione exatamente 2 transações: a saída (ex: na conta BIL) e a entrada correspondente (ex: na conta Revolut).",
      "selectOneExpenseOneIncome": "Selecione uma transação de Saída e uma de Entrada — são os dois lados da mesma transferência.",
      "alreadyLinked": "Uma das transações selecionadas já está vinculada a outra transferência. Desvincule antes (em Detalhes) se quiser refazer.",
      "differentValues": "Os valores são diferentes ({expense} saindo vs {income} entrando) — normal se houve conversão de moeda ou taxa. Vincular mesmo assim?",
      "linkTransferSuccess": "Transferência vinculada com sucesso",
      "unlinkTransfer": "Desvincular transferência",
      "rejectAutoTransfer": "Rejeitar detecção automática",
      "selectInOut": "Selecione uma transação de Saída e uma de Entrada — são os dois lados da mesma transferência.",
      "linkTransferHint": "Selecione a saída (ex: BIL) e a entrada (ex: Revolut) da mesma transferência",
      "linkTransferBetweenAccounts": "Transferência entre contas",
      "bulkCountSuffix": "selecionada(s)",
      "nothingToExport": "Nada para exportar ainda."
    },
    "transactions": {
      "defaultDescription": "Movimento"
    },
    "modals": {
      "manualEntry": {
        "title": "Adicionar transação manual",
        "date": "Data",
        "value": "Valor",
        "description": "Descrição",
        "type": "Tipo",
        "typeExpense": "Saída (gasto)",
        "typeIncome": "Entrada (receita)",
        "category": "Categoria",
        "cancel": "Cancelar",
        "submit": "Adicionar",
        "invalidValue": "Informe um valor válido",
        "valuePlaceholder": "123,45",
        "descriptionPlaceholder": "Ex: Supermercado Pão de Açúcar"
      },
      "note": {
        "title": "Nota para \"{desc}\"",
        "meta": "{date} · {value}{source}",
        "placeholder": "Escreva uma nota...",
        "cancel": "Cancelar",
        "delete": "Apagar nota",
        "save": "Salvar",
        "dialogTitle": "Nota da transação",
        "label": "Nota",
        "deleteShort": "Remover"
      },
      "details": {
        "title": "Detalhes da transação",
        "meta": "{date} · {value}",
        "sourceFile": "Arquivo de origem",
        "bankType": "Tipo de conta",
        "notIdentified": "Não identificado",
        "transferPair": "Vinculada a: {desc} · {date} · {value}{bank}",
        "autoTransferInfo": "Provável destino: {bank}",
        "close": "Fechar",
        "unlinkTransfer": "Desvincular transferência",
        "rejectAutoTransfer": "Rejeitar detecção automática",
        "transferBetweenAccounts": "Transferência entre contas",
        "possibleTransfer": "Possível transferência entre contas",
        "autoTransferHint": "Detectado pelo banco do beneficiário no extrato — não está contando como Gasto. Se estiver certo, não precisa fazer nada; se for um gasto de verdade, desfaça abaixo.",
        "extractedData": "Dados extraídos do extrato",
        "unlinkShort": "Desvincular",
        "rejectShort": "Não é transferência — restaurar categoria",
        "consideredDateLabel": "Data considerada no mês/orçamento",
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
      },
      "anomaly": {
        "title": "Resolver gasto estranho",
        "txListLabel": "Transações envolvidas",
        "hint": "Excluir remove a transação de vez do extrato. Aceitar marca só esse alerta como revisado.",
        "alwaysAcceptHint": "\"Sempre aceitar\" ignora essa descrição pra sempre — não vira mais gasto estranho, nem em meses futuros.",
        "alwaysAcceptTitle": "Nunca mais avisar sobre essa descrição"
      },
      "category": {
        "titleNew": "Nova categoria",
        "titleEdit": "Editar categoria",
        "name": "Nome",
        "color": "Cor",
        "icon": "Ícone",
        "keywords": "Palavras-chave (separadas por vírgula)",
        "cancel": "Cancelar",
        "submitNew": "Criar categoria",
        "submitEdit": "Salvar alterações",
        "namePlaceholder": "Ex: Pets, Assinaturas",
        "keywordsPlaceholder": "ex: petshop, cobasi, veterinário",
        "keywordsHelp": "Usadas para classificar automaticamente. Só valem para categorização futura — não recategoriza o que já existe."
      },
      "bulkNote": {
        "title": "Adicionar nota a {count} transações",
        "count": "{count} transações",
        "placeholder": "Nota para todas as selecionadas...",
        "cancel": "Cancelar",
        "save": "Salvar nota",
        "dialogTitle": "Nota em massa",
        "description": "Aplica a mesma nota em <span class=\"font-bold\">{count}</span> transações selecionadas, substituindo a nota atual de cada uma.",
        "saveShort": "Aplicar a todas"
      },
      "bankType": {
        "titleNew": "Novo tipo de conta",
        "titleEdit": "Editar tipo de conta",
        "namePlaceholder": "Ex: N26, Banco do Brasil",
        "submitNew": "Criar tipo de conta"
      }
    },
    "charts": {
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
        "subtitle": "Entradas − saídas reais, sem transferências internas. Verde = sobrando, vermelho = consumindo reserva.",
        "hintMonthly": "· entradas − saídas por mês",
        "hintForecast": "· projeção: {income} renda − {expense} gasto = {net}/mês",
        "hintWithOpening": "· saldo acumulado a partir de {value} em {date}",
        "subtitleForecast": "Linha sólida = real. Linha tracejada (roxa) = projeção usando o orçamento definido em Configurações, com média histórica pra categorias sem meta.",
        "healthyTitle": "Fluxo saudável",
        "healthySubHasIncome": "Guardando {pct}% da renda no último mês — nenhum mês estourou a renda.",
        "healthySubNoIncome": "Sem entradas suficientes para avaliar ainda — nenhum mês estourou a renda.",
        "deficitMonthText": "Gastou {value} a mais do que ganhou nesse mês.",
        "tightMarginText": "Só sobrou {pct}% da renda ({value}).",
        "forecastPositiveTitle": "Sobra prevista por mês",
        "forecastNegativeTitle": "Falta prevista por mês",
        "forecastText": "Renda {income} − gastos {expense} = {net}/mês, no ritmo do orçamento.",
        "estimatedBalanceTitle": "Saldo estimado em {month}",
        "estimatedBalanceText": "Partindo de {start} hoje, projeta-se {final} em {n} meses.",
        "zeroBalanceTitle": "Saldo pode zerar",
        "zeroBalanceTextSingular": "Nesse ritmo, o saldo estimado fica negativo em ~{n} mês.",
        "zeroBalanceTextPlural": "Nesse ritmo, o saldo estimado fica negativo em ~{n} meses.",
        "noIncomeTargetTitle": "Meta de renda não definida",
        "noIncomeTargetText": "Usando a média das últimas entradas ({avg}/mês) — defina uma meta em Configurações → Orçamentos mensais pra uma previsão mais intencional.",
        "noBudgetCatsTitle": "Categorias sem meta",
        "noBudgetCatsText": "{n} categoria(s) sem orçamento usam a média histórica: {names}.",
        "forecastSuffix": " (prev.)"
      },
      "cashflowDatasetLabels": {
        "monthly": "Saldo do mês",
        "forecast": "Saldo (real + previsto)",
        "cumulative": "Saldo acumulado"
      },
      "category": {
        "title": "Onde seu dinheiro vai",
        "hintByCategory": "· por categoria",
        "hintWaterfall": "· da renda até o saldo, categoria por categoria"
      },
      "datasetLabels": {
        "expense": "Gasto",
        "trend3m": "Tendência (3m)"
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
        "hint": "Picos indicam faixa de gasto mais comum. Use para identificar micro-gastos recorrentes.",
        "tooltipTitle": "Faixa {range}",
        "tooltipLabel": "{n} transações"
      },
      "trend": {
        "title": "Tendência de gastos",
        "subtitle": "Média móvel (3 meses) vs gasto mensal",
        "upBadge": "▲ +{pct}% vs mês anterior",
        "downBadge": "▼ -{pct}% vs mês anterior"
      },
      "recurring": {
        "title": "Gastos recorrentes detectados",
        "subtitle": "Mesma descrição em vários meses — assinaturas e fixos",
        "messages": {
          "emptyState": "Nenhum padrão recorrente detectado ainda — aparece depois de 2+ meses de dados.",
          "monthsCountTitle": "{n} meses com esse gasto",
          "itemSubtext": "{count}x no total · média {avg}"
        }
      },
      "dow": {
        "subtitle": "Onde seus gastos se concentram"
      },
      "calendar": {
        "title": "Calendário de gastos",
        "subtitle": "Cor mais forte = dia com mais gasto — pico de salário, fim de semana, etc.",
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
      },
      "legends": {
        "compare": "Legenda (clique para isolar categoria)",
        "monthlyExpenses": "Gastos mensais",
        "byCategory": "Por categoria",
        "byMerchant": "Top estabelecimentos",
        "distribution": "Distribuição",
        "dayOfWeek": "Por dia da semana",
        "compareCategoryMonth": "Categoria × Mês",
        "trend": "Tendência",
        "cashflow": "Fluxo de caixa"
      }
    },
    "dashboard": {
      "periodLabel": "Período",
      "periodExpenses": "Gastos no período:",
      "periodIncome": "Entradas:",
      "sectionOverview": "01 · Visão geral",
      "sectionWhereItGoes": "02 · Para onde vai",
      "sectionPatterns": "03 · Padrões no tempo"
    },
    "budget": {
      "title": "Orçamento por categoria",
      "incomeTarget": "Meta de renda mensal (€)",
      "placeholder": "Sem meta",
      "summary": {
        "totalBudgeted": "Total orçado",
        "incomeTarget": "Meta de renda",
        "ofIncome": "% da renda",
        "remaining": "Sobra",
        "shortfall": "Falta",
        "beyondIncome": "além da renda",
        "free": "livre",
        "noIncomeTarget": "Defina a meta de renda mensal acima pra ver quanto sobra e a porcentagem comprometida.",
        "pctOfIncomeText": "{pct}% da renda",
        "pctFreeOrOverText": "{pct}% {label}"
      }
    },
    "settings": {
      "title": "Configurações",
      "backToDashboard": "← Voltar ao dashboard",
      "tabs": {
        "general": "Geral",
        "data": "Dados",
        "ai": "IA Local (Ollama)",
        "categories": "Categorias",
        "banks": "Tipos de conta"
      },
      "general": {
        "demoData": "Ver com dados de exemplo",
        "exportCsv": "Exportar CSV",
        "clearAll": "Limpar tudo",
        "clearConfirm": "Limpar {count} transações?"
      },
      "data": {
        "title": "Persistência de dados",
        "localStorage": "Salvando no navegador (localStorage)",
        "folder": "Salvando na pasta \"{name}\"",
        "folderSub": "gastos-data.json é gravado direto no seu computador a cada mudança.",
        "localStorageSub": "Escolha uma pasta para gravar gastos-data.json direto no seu computador.",
        "localStorageSubHtml": "Escolha uma pasta para gravar <code>gastos-data.json</code> direto no seu computador.",
        "compatNote": "Funciona no Chrome e Edge. Sem pasta escolhida, tudo continua salvo automaticamente no navegador.",
        "quotaBannerHtml": "<span class=\"font-bold\">Armazenamento do navegador cheio.</span> Escolha uma pasta acima ou <button id=\"quotaDlBtn\" class=\"underline font-bold\">baixe backup JSON</button> e limpe dados antigos em <span class=\"font-mono\">localStorage</span>.",
        "chooseFolder": "Escolher pasta",
        "changeFolder": "Trocar pasta",
        "saveNow": "Salvar agora",
        "saveNowSuccess": "gastos-data.json salvo na pasta \"{name}\"",
        "saveNowSuccessLocal": "Salvo no navegador (localStorage). Clique em \"Escolher pasta\" para gravar direto no computador.",
        "exportJson": "Baixar backup JSON",
        "importJson": "Restaurar backup JSON",
        "importSuccess": "Backup restaurado: {count} transações",
        "importError": "Arquivo inválido: {error}",
        "storageFull": "Armazenamento do navegador cheio — escolha uma pasta ou baixe backup",
        "folderApiUnsupported": "Escolher pasta funciona no Chrome e Edge. Nesse navegador, os dados continuam salvos automaticamente aqui mesmo (localStorage).",
        "quotaFull": "⚠️ Armazenamento do navegador cheio — escolha uma pasta em Configurações → Dados ou baixe backup JSON.",
        "restoredFromFolder": "Restaurado de gastos-data.json ({count} transações, {date})",
        "savedToFolderLog": "💾 gastos-data.json salvo na pasta \"{name}\"",
        "savedToLocalLog": "💾 salvo no navegador (localStorage) — use \"Escolher pasta\" em Configurações → Dados para gravar no computador",
        "savedToFolderAlert": "✅ gastos-data.json salvo na pasta \"{name}\"",
        "savedToLocalAlert": "✅ Salvo no navegador (localStorage). Clique em \"Escolher pasta\" para gravar direto no computador.",
        "fixedBilCardMigration": "🔧 {n} compra(s) do cartão BIL, importadas antes da correção, foram recategorizadas e voltaram a contar como Gasto.",
        "fixedTransfersMigration": "🔧 {n} transação(ões) identificadas como transferência entre suas contas (pelo banco do beneficiário) — não contam mais como Gasto/Entrada."
      },
      "ai": {
        "title": "Categorização automática com IA local",
        "url": "URL do Ollama",
        "model": "Modelo",
        "testConnection": "Testar conexão",
        "statusChecking": "a verificar...",
        "testButton": "Testar",
        "saveJsonNowTitle": "Salvar gastos-data.json agora",
        "footerNote": "100% offline · <span class=\"text-zinc-400\">{model}</span> já detectado ({size}) · Nada sai da sua rede.",
        "autoCategorize": "Categorizar automaticamente ao importar",
        "categorizeNow": "Categorizar com IA local",
        "categorizing": "Categorizando...",
        "status": {
          "online": "online",
          "offline": "offline",
          "busy": "a categorizar...",
          "hasModel": "online · {model}",
          "none": "(nenhum)"
        },
        "log": {
          "nothingToCategorize": "Nada para categorizar (sem Saídas).",
          "allCategorized": "Todas as {count} saídas já estão categorizadas — nada a fazer. ✅",
          "starting": "Iniciando: {count} descrições → {model} @ {url}",
          "batchProgress": "Lote {current}/{total}: {applied} categorizadas",
          "batchError": "Erro no lote {batch}: {error}",
          "corsError": "Erro de CORS — rode: OLLAMA_ORIGINS=\"*\" ollama serve",
          "completed": "Concluído: {done} transações re-categorizadas com {model}.",
          "healthCheckOk": "Ollama online. Modelos: {models}",
          "healthCheckFail": "Ollama offline: {error} — verifique: OLLAMA_ORIGINS=\"*\" ollama serve",
          "healthCheckHint": "Dica: brew services stop ollama && OLLAMA_ORIGINS=\"*\" ollama serve",
          "batchSummary": "{n} sem categoria serão enviadas à IA · {already} já categorizadas foram ignoradas",
          "batchUnparsable": "Lote {batch}: resposta sem JSON — \"{preview}\""
        }
      },
      "categories": {
        "add": "Adicionar categoria",
        "addShort": "+ Nova",
        "hint": "Clique numa fatia do gráfico ou no chip para filtrar a tabela lá embaixo.",
        "edit": "Editar",
        "keywordsHelp": "Palavras que fazem a categoria ser sugerida automaticamente"
      },
      "banks": {
        "title": "Tipos de conta / banco",
        "add": "Adicionar tipo",
        "addShort": "+ Novo",
        "hint": "Detectado automaticamente ao importar PDFs (BIL, Cartão BIL, Revolut). Crie outros tipos se usar mais contas — aparece discretamente abaixo da descrição na tabela de transações, e pode ser ajustado por transação ou em massa.",
        "name": "Nome",
        "icon": "Ícone",
        "keywords": "Palavras-chave para detecção automática"
      },
      "importPdfs": {
        "title": "Importar PDFs",
        "badge": "Arraste ou selecione",
        "localNote": "100% local — nada sai do seu PC · € (1.234,56 €)",
        "readingProgress": "Lendo PDFs...",
        "formatHint": "<span class=\"font-bold\">Formato:</span> Data, Descrição, <b class=\"text-red-600\">Saída</b>, <b class=\"text-emerald-600\">Entrada</b>, Saldo. Só <b>Saídas</b> entram nos gráficos. Duplicatas são ignoradas automaticamente.",
        "formatHintExtra": "Testado com extratos <b>Revolut</b>. Datas numéricas (dd.mm.aaaa, comuns em bancos europeus como <b>BIL Luxembourg</b>) também são reconhecidas — se o seu extrato não importar corretamente, veja como reportar em <b>Configurações → Dados</b> ou ajuste manualmente na tabela.",
        "dragAnywhereHint": "Você também pode arrastar PDFs em qualquer lugar da página do dashboard."
      },
      "budget": {
        "cardTitle": "Orçamentos mensais",
        "hint": "Defina uma meta de gasto por categoria — habilita o modo \"Orçamento\" no comparativo do dashboard e alimenta a aba <b>Previsão</b> do Fluxo de caixa.",
        "incomeTargetLabel": "Meta de renda mensal",
        "incomeTargetPlaceholder": "Ex: 3000",
        "footerHint": "Categorias sem meta usam a média dos últimos meses na Previsão — não precisa preencher tudo."
      }
    },
    "openingBalance": {
      "title": "Saldo inicial",
      "date": "Data",
      "value": "Valor (€)",
      "save": "Salvar saldo inicial",
      "clear": "Limpar saldo inicial",
      "statusSet": "Definido: {value} em {date}",
      "statusNone": "Nenhum saldo inicial definido — o Fluxo de caixa acumulado começa do zero.",
      "invalidInput": "Informe uma data e um valor válidos.",
      "explanation": "Se o extrato começa no meio do caminho (ex: janeiro/2026) e falta uma entrada anterior a ele (ex: o salário de dezembro que pagou o começo de janeiro), informe aqui o saldo que você tinha um dia antes do primeiro extrato importado. Esse valor entra tanto no <b>Saldo atual</b> (topo do painel) quanto no início do gráfico de <b>Fluxo de caixa acumulado</b>. Alternativa: em vez de preencher aqui, lance uma <b>transação manual do tipo Entrada</b> em dezembro com o total que você tinha — dá no mesmo, mas não use os dois ao mesmo tempo pra não contar em dobro.",
      "dateLabel": "Saldo em",
      "valuePlaceholder": "Ex: 3200.00",
      "saveShort": "Salvar",
      "removeShort": "Remover"
    },
    "anomalies": {
      "title": "Gastos estranhos detectados",
      "subtitle": "Cobranças repetidas, valores fora do padrão e picos de gasto — vale conferir",
      "description": "Estas transações têm valores muito acima do padrão da categoria. Revise cada uma:",
      "accept": "Aceitar (é gasto real)",
      "alwaysAccept": "Sempre aceitar esta descrição",
      "reject": "Ignorar (não é gasto)",
      "close": "Fechar",
      "messages": {
        "exactDuplicate": "{n}× cobrança idêntica de {value} em \"{desc}\" no mesmo dia — pode ser cobrança duplicada.",
        "nearDuplicate": "Duas cobranças de {value} em \"{desc}\" com {days} dia(s) de intervalo — confira se não é duplicada.",
        "merchantOutlier": "{value} em \"{desc}\" ficou bem acima do habitual (média {avg}, {pct}% a mais).",
        "globalOutlier": "Gasto atípico para o período: {value} em \"{desc}\" (média geral {avg}).",
        "spikeDay": "{date} teve {total} em {count} transações — bem acima da média diária ({avg}).",
        "countFoundSingular": "{n} encontrado",
        "countFoundPlural": "{n} encontrados",
        "countNone": "nada fora do comum",
        "emptyTitle": "Nada fora do padrão",
        "emptyDetail": "Sem duplicidades, picos ou valores atípicos no período.",
        "resolveButton": "Resolver",
        "moreNotShown": "+ {n} outro(s) não exibido(s).",
        "noTxFound": "Nenhuma transação envolvida ainda existe (já foi excluída)."
      }
    },
    "printReport": {
      "title": "Gastos.AI — Relatório de Despesas",
      "subtitle": "Relatório de Despesas",
      "generated": "gerado em {date}",
      "categoryClause": " · categoria: {name}",
      "noExpensesInPeriod": "Sem saídas no período.",
      "noData": "Sem dados.",
      "printWithoutDataAlert": "Adicione dados antes de imprimir — importe PDFs ou use \"Ver com dados de exemplo\" em Configurações.",
      "kpis": {
        "totalExpenses": "TOTAL GASTO",
        "income": "ENTRADAS",
        "balance": "SALDO DO PERÍODO",
        "savingsRate": "TAXA DE POUPANÇA"
      },
      "sections": {
        "byCategory": "Gasto por categoria",
        "monthlyEvolution": "Evolução mensal",
        "topMerchants": "Top estabelecimentos",
        "statement": "Extrato — {count} transações{category}"
      },
      "tableHeaders": {
        "date": "Data",
        "description": "Descrição",
        "category": "Categoria",
        "expense": "Saída",
        "income": "Entrada"
      },
      "footer": "Gerado por Gastos.AI — 100% local e privado · {date}"
    },
    "categories": {
      "alimentacao": "Alimentação",
      "transporte": "Transporte",
      "moradia": "Moradia",
      "contas": "Contas & Serviços",
      "saude": "Saúde",
      "lazer": "Lazer",
      "compras": "Compras",
      "educacao": "Educação",
      "outros": "Outros",
      "transferencia": "Transferência interna",
      "cartao": "Pagamento de Cartão",
      "propagatedLog": "Propagado: {n} transações com descrição \"{desc}\" → {category}"
    },
    "bankTypes": {
      "REVOLUT": "Revolut",
      "BIL": "BIL",
      "BIL_CARD": "BIL Cartão",
      "OTHER": "Outro"
    },
    "months": {
      "short": [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez"
      ],
      "long": [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
      ]
    },
    "days": {
      "short": [
        "Dom",
        "Seg",
        "Ter",
        "Qua",
        "Qui",
        "Sex",
        "Sáb"
      ],
      "long": [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado"
      ]
    },
    "common": {
      "loading": "Carregando...",
      "error": "Erro",
      "success": "Sucesso",
      "cancel": "Cancelar",
      "confirm": "Confirmar",
      "save": "Salvar",
      "delete": "Excluir",
      "edit": "Editar",
      "close": "Fechar",
      "yes": "Sim",
      "no": "Não",
      "ok": "OK",
      "apply": "Aplicar",
      "reset": "Redefinir",
      "export": "Exportar CSV",
      "editItemTitle": "Editar {name}"
    }
  },
  "en": {
    "app": {
      "title": "Expenses<span style=\"color:#7c3aed;\">.AI</span>",
      "subtitle": "100% local & private expense dashboard"
    },
    "header": {
      "language": "Language",
      "theme": "Theme",
      "print": "Print report"
    },
    "dropZone": {
      "title": "Drag PDFs here or click to select",
      "subtitle": "Bank statements (Revolut, BIL, etc.) — text PDFs, not scanned images",
      "btnPickFiles": "Choose files",
      "btnPickFolder": "Choose folder"
    },
    "fileList": {
      "title": "Imported files",
      "reading": "Reading...",
      "error": "Read error",
      "noPdfs": "No PDFs found. Select .pdf files",
      "noValuesFound": "No values found in expected format (e.g., 12,34 € , € 1,234.56 or 1 234,56 €). Open the PDF and try selecting the amount with your mouse — if you can't select it, it's a scanned PDF (image) and needs OCR. Use \"Add manual transaction\" as an alternative.",
      "extractedText": "Extracted text (first 1200 chars) — copy and send if error persists:",
      "duplicatesSkipped": "duplicates skipped (identical date+description+value)",
      "enriched": "enriched with new details",
      "nothingNew": "Nothing new",
      "inheritedCategories": "inherited from saved categories",
      "readingStatus": "reading...",
      "readingProgress": "Reading {name} ({current}/{total})",
      "parsedCounts": "{expenses} expenses · {income} income",
      "parsedNone": "no values found",
      "bilCardTitle": "BIL card statement",
      "bilAccountTitle": "BIL account statement",
      "bilBadge": "BIL",
      "revolutTitle": "Revolut statement",
      "revolutBadge": "Revolut",
      "readError": "read error",
      "completed": "Done",
      "debugEmptyText": "(empty — PDF has no selectable text)",
      "duplicatesBanner": "⏭️ {n} duplicates skipped (identical date+description+value){extra}",
      "enrichedClause": " · {n} enriched with new details",
      "nothingNewProgress": "Nothing new",
      "nothingNewLog": "{n} duplicate transactions{enrichedClause} — nothing new imported.",
      "enrichedLogClause": " ({n} enriched with new details)",
      "inheritedBanner": "✨ {n} inherited from saved categories",
      "demoLoaded": "Demo data loaded — {n} expenses"
    },
    "kpis": {
      "balance": "Current balance",
      "totalExpenses": "Total spent",
      "count": "Transactions",
      "average": "Avg per expense",
      "topCategory": "Top category",
      "topCategoryValue": "Value & % of total",
      "insight": "Insight",
      "insightDetail": "Insight detail",
      "savingsRate": "Savings rate",
      "saved": "left over this period",
      "overspent": "over income",
      "noIncome": "no income this period",
      "balanceSubDefault": "Income − expenses from all history · set an opening balance in Settings if prior data is missing",
      "transactionsLabel": "{count} transactions",
      "avgTicket": "Avg ticket",
      "perTransaction": "per transaction",
      "insightTitle": "What weighs the most?",
      "insightDefault": "Add PDFs to see insights.",
      "balanceSubWithOpening": "Opening balance {value} ({date}) + income − expenses",
      "countBreakdown": "{expenses} expenses · {income} income{transfers} · {files} files",
      "countTransfersClause": " · {n} internal transfers",
      "topCategoryValueText": "{value} · {pct}% of total",
      "insightMainText": "{cat} is your biggest expense",
      "insightSubText": "{value} ({pct}%) — worth reviewing subscriptions and purchases in this category.",
      "savedText": "{value} left over this period",
      "overspentText": "{value} over income"
    },
    "filters": {
      "searchPlaceholder": "Search description, category, file...",
      "allCategories": "All categories",
      "allPeriods": "All periods",
      "typeAll": "All",
      "typeExpense": "Expenses only",
      "typeIncome": "Income only",
      "bankAll": "All account types",
      "bankNone": "No type identified",
      "periodChips": {
        "all": "All"
      },
      "yearOf": "Year {year}"
    },
    "table": {
      "columns": {
        "select": "Select",
        "date": "Date",
        "description": "Description",
        "expense": "Expense",
        "income": "Income",
        "category": "Category",
        "actions": "Actions"
      },
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
      "goToSettings": "Go to Settings",
      "empty": "No transactions in this filter.",
      "noValue": "—",
      "cardSettlement": "Card statement",
      "cardSettlementTitle": "Single card statement debit — not counted (individual purchases already counted)",
      "transferBetweenAccounts": "between accounts",
      "transferBetweenAccountsTitle": "Transfer between your accounts — not counted in Expenses/Income. See pair in Details.",
      "possibleTransfer": "possible transfer",
      "internalTransfer": "internal",
      "internalTransferTitle": "Internal movement — not counted",
      "summary": "transactions",
      "realExpenses": "Real expenses",
      "income": "Income",
      "internalTransfers": "Internal transfers",
      "monthlyAverage": "Monthly average",
      "pageInfo": "Page {current} / {total}",
      "prevPage": "Previous",
      "nextPage": "Next",
      "possibleTransferTitleText": "Auto-detected by beneficiary bank — likely transfer to {bank}. Check in Details.",
      "avgPerMonthTitle": "Total split across the {n} {monthWord} with activity in this category",
      "monthWordSingular": "month",
      "monthWordPlural": "months",
      "summaryInternalTransfersTitle": "Internal movements (pockets, Flexible Cash Funds) — not counted as expenses",
      "csvHeaders": [
        "date",
        "description",
        "expense",
        "income",
        "balance",
        "category",
        "file"
      ]
    },
    "actions": {
      "swap": "Swap Expense ↔ Income",
      "note": "Note",
      "details": "Details",
      "delete": "Delete transaction",
      "confirmDelete": "Delete this transaction?\n\n{desc}\n{date} · {value}",
      "bulkActions": "Bulk actions",
      "bulkCount": "{count} selected",
      "bulkClear": "Clear selection",
      "bulkDelete": "Delete selected",
      "bulkDeleteConfirm": "Delete {n} selected transaction(s)? This cannot be undone.",
      "bulkSwap": "Swap Expense/Income",
      "bulkCategory": "Category...",
      "bulkBank": "Account type...",
      "bulkNote": "Add note",
      "bulkLinkTransfer": "Link transfer",
      "selectTwoTransfers": "Select exactly 2 transactions: the outgoing one (e.g. in your BIL account) and the matching incoming one (e.g. in Revolut).",
      "selectOneExpenseOneIncome": "Select one Expense and one Income transaction — the two sides of the same transfer.",
      "alreadyLinked": "One of the selected transactions is already linked to another transfer. Unlink first (in Details) if you want to redo.",
      "differentValues": "Values differ ({expense} out vs {income} in) — normal if currency conversion or fees applied. Link anyway?",
      "linkTransferSuccess": "Transfer linked successfully",
      "unlinkTransfer": "Unlink transfer",
      "rejectAutoTransfer": "Reject auto-detection",
      "selectInOut": "Select an Outflow and an Inflow transaction — they are the two sides of the same transfer.",
      "linkTransferHint": "Select the outgoing (e.g. BIL) and incoming (e.g. Revolut) side of the same transfer",
      "linkTransferBetweenAccounts": "Transfer between accounts",
      "bulkCountSuffix": "selected",
      "nothingToExport": "Nothing to export yet."
    },
    "transactions": {
      "defaultDescription": "Transaction"
    },
    "modals": {
      "manualEntry": {
        "title": "Add manual transaction",
        "date": "Date",
        "value": "Amount",
        "description": "Description",
        "type": "Type",
        "typeExpense": "Expense (out)",
        "typeIncome": "Income (in)",
        "category": "Category",
        "cancel": "Cancel",
        "submit": "Add",
        "invalidValue": "Enter a valid amount",
        "valuePlaceholder": "123.45",
        "descriptionPlaceholder": "e.g. Supermarket"
      },
      "note": {
        "title": "Note for \"{desc}\"",
        "meta": "{date} · {value}{source}",
        "placeholder": "Write a note...",
        "cancel": "Cancel",
        "delete": "Delete note",
        "save": "Save",
        "dialogTitle": "Transaction note",
        "label": "Note",
        "deleteShort": "Remove"
      },
      "details": {
        "title": "Transaction details",
        "meta": "{date} · {value}",
        "sourceFile": "Source file",
        "bankType": "Account type",
        "notIdentified": "Not identified",
        "transferPair": "Linked to: {desc} · {date} · {value}{bank}",
        "autoTransferInfo": "Likely destination: {bank}",
        "close": "Close",
        "unlinkTransfer": "Unlink transfer",
        "rejectAutoTransfer": "Reject auto-detection",
        "transferBetweenAccounts": "Transfer between accounts",
        "possibleTransfer": "Possible transfer between accounts",
        "autoTransferHint": "Auto-detected from the beneficiary bank on the statement — not counted as an Expense. If that's correct, no action needed; if it's a real expense, undo it below.",
        "extractedData": "Data extracted from the statement",
        "unlinkShort": "Unlink",
        "rejectShort": "Not a transfer — restore category",
        "consideredDateLabel": "Month/budget date considered",
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
      },
      "anomaly": {
        "title": "Resolve unusual expense",
        "txListLabel": "Transactions involved",
        "hint": "Deleting removes the transaction from the statement for good. Accepting just marks this alert as reviewed.",
        "alwaysAcceptHint": "\"Always accept\" ignores this description forever — it won't show up as unusual again, even in future months.",
        "alwaysAcceptTitle": "Never warn about this description again"
      },
      "category": {
        "titleNew": "New category",
        "titleEdit": "Edit category",
        "name": "Name",
        "color": "Color",
        "icon": "Icon",
        "keywords": "Keywords (comma-separated)",
        "cancel": "Cancel",
        "submitNew": "Create category",
        "submitEdit": "Save changes",
        "namePlaceholder": "e.g. Pets, Subscriptions",
        "keywordsPlaceholder": "e.g. petshop, vet",
        "keywordsHelp": "Used to auto-classify. Only applies to future categorization — doesn't recategorize what already exists."
      },
      "bulkNote": {
        "title": "Add note to {count} transactions",
        "count": "{count} transactions",
        "placeholder": "Note for all selected...",
        "cancel": "Cancel",
        "save": "Save note",
        "dialogTitle": "Bulk note",
        "description": "Applies the same note to <span class=\"font-bold\">{count}</span> selected transactions, replacing each one's current note.",
        "saveShort": "Apply to all"
      },
      "bankType": {
        "titleNew": "New account type",
        "titleEdit": "Edit account type",
        "namePlaceholder": "e.g. N26, Chase",
        "submitNew": "Create account type"
      }
    },
    "charts": {
      "mode": {
        "donut": "Donut",
        "bar": "Bars",
        "waterfall": "Waterfall"
      },
      "compareMode": {
        "bars": "Grouped bars",
        "lines": "Overlaid lines"
      },
      "budgetScope": {
        "month": "Current month",
        "quarter": "Quarter",
        "year": "Year",
        "cumulative": "Cumulative"
      },
      "cashflowMode": {
        "monthly": "Monthly",
        "cumulative": "Cumulative",
        "forecast": "Forecast"
      },
      "cashflow": {
        "title": "Cash flow",
        "hintCumulative": "· cumulative balance over time",
        "subtitle": "Income − real expenses, excluding internal transfers. Green = surplus, red = drawing down reserves.",
        "hintMonthly": "· income − expenses per month",
        "hintForecast": "· forecast: {income} income − {expense} expense = {net}/month",
        "hintWithOpening": "· cumulative balance starting from {value} on {date}",
        "subtitleForecast": "Solid line = actual. Dashed line (purple) = forecast using the budget set in Settings, with the historical average for categories without a target.",
        "healthyTitle": "Healthy cash flow",
        "healthySubHasIncome": "Saving {pct}% of income last month — no month overspent income.",
        "healthySubNoIncome": "Not enough income to assess yet — no month overspent income.",
        "deficitMonthText": "Spent {value} more than earned that month.",
        "tightMarginText": "Only {pct}% of income was left ({value}).",
        "forecastPositiveTitle": "Surplus expected per month",
        "forecastNegativeTitle": "Shortfall expected per month",
        "forecastText": "Income {income} − expenses {expense} = {net}/month, at the budget's pace.",
        "estimatedBalanceTitle": "Estimated balance in {month}",
        "estimatedBalanceText": "Starting from {start} today, projects to {final} in {n} months.",
        "zeroBalanceTitle": "Balance may hit zero",
        "zeroBalanceTextSingular": "At this pace, the estimated balance turns negative in ~{n} month.",
        "zeroBalanceTextPlural": "At this pace, the estimated balance turns negative in ~{n} months.",
        "noIncomeTargetTitle": "No income target set",
        "noIncomeTargetText": "Using the average of recent income ({avg}/month) — set a target in Settings → Monthly budgets for a more intentional forecast.",
        "noBudgetCatsTitle": "Categories without a target",
        "noBudgetCatsText": "{n} categor(y/ies) without a budget use the historical average: {names}.",
        "forecastSuffix": " (forecast)"
      },
      "cashflowDatasetLabels": {
        "monthly": "Monthly balance",
        "forecast": "Balance (actual + forecast)",
        "cumulative": "Cumulative balance"
      },
      "category": {
        "title": "Where your money goes",
        "hintByCategory": "· by category",
        "hintWaterfall": "· from income down to balance, category by category"
      },
      "datasetLabels": {
        "expense": "Expense",
        "trend3m": "Trend (3m)"
      },
      "monthChart": {
        "title": "Monthly evolution",
        "legendLabel": "Monthly total ·"
      },
      "merchantChart": {
        "title": "Top merchants / descriptions",
        "subtitle": "Who took most of your money this period"
      },
      "histogram": {
        "title": "Value distribution",
        "badge": "Histogram",
        "hint": "Peaks show the most common spending range. Use it to spot recurring micro-expenses.",
        "tooltipTitle": "Range {range}",
        "tooltipLabel": "{n} transactions"
      },
      "trend": {
        "title": "Spending trend",
        "subtitle": "3-month moving average vs monthly spend",
        "upBadge": "▲ +{pct}% vs last month",
        "downBadge": "▼ -{pct}% vs last month"
      },
      "recurring": {
        "title": "Recurring charges detected",
        "subtitle": "Same description across several months — subscriptions and fixed costs",
        "messages": {
          "emptyState": "No recurring pattern detected yet — appears after 2+ months of data.",
          "monthsCountTitle": "{n} months with this expense",
          "itemSubtext": "{count}x total · average {avg}"
        }
      },
      "dow": {
        "subtitle": "Where your spending concentrates"
      },
      "calendar": {
        "title": "Spending calendar",
        "subtitle": "Stronger color = day with more spending — payday, weekend, etc.",
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
      },
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
      },
      "legends": {
        "compare": "Legend (click to isolate category)",
        "monthlyExpenses": "Monthly expenses",
        "byCategory": "By category",
        "byMerchant": "Top merchants",
        "distribution": "Distribution",
        "dayOfWeek": "By day of week",
        "compareCategoryMonth": "Category × Month",
        "trend": "Trend",
        "cashflow": "Cash flow"
      }
    },
    "dashboard": {
      "periodLabel": "Period",
      "periodExpenses": "Expenses this period:",
      "periodIncome": "Income:",
      "sectionOverview": "01 · Overview",
      "sectionWhereItGoes": "02 · Where it goes",
      "sectionPatterns": "03 · Patterns over time"
    },
    "budget": {
      "title": "Budget by category",
      "incomeTarget": "Monthly income target (€)",
      "placeholder": "No target",
      "summary": {
        "totalBudgeted": "Total budgeted",
        "incomeTarget": "Income target",
        "ofIncome": "% of income",
        "remaining": "Remaining",
        "shortfall": "Shortfall",
        "beyondIncome": "over income",
        "free": "free",
        "noIncomeTarget": "Set monthly income target above to see remaining and % committed.",
        "pctOfIncomeText": "{pct}% of income",
        "pctFreeOrOverText": "{pct}% {label}"
      }
    },
    "settings": {
      "title": "Settings",
      "backToDashboard": "← Back to dashboard",
      "tabs": {
        "general": "General",
        "data": "Data",
        "ai": "Local AI (Ollama)",
        "categories": "Categories",
        "banks": "Account types"
      },
      "general": {
        "demoData": "Load demo data",
        "exportCsv": "Export CSV",
        "clearAll": "Clear all",
        "clearConfirm": "Clear {count} transactions?"
      },
      "data": {
        "title": "Data persistence",
        "localStorage": "Saving in browser (localStorage)",
        "folder": "Saving to folder \"{name}\"",
        "folderSub": "gastos-data.json is written directly to your computer on every change.",
        "localStorageSub": "Choose a folder to save gastos-data.json directly on your computer.",
        "localStorageSubHtml": "Choose a folder to save <code>gastos-data.json</code> directly on your computer.",
        "compatNote": "Works in Chrome and Edge. Without a folder chosen, everything still saves automatically in the browser.",
        "quotaBannerHtml": "<span class=\"font-bold\">Browser storage full.</span> Choose a folder above or <button id=\"quotaDlBtn\" class=\"underline font-bold\">download JSON backup</button> and clear old data in <span class=\"font-mono\">localStorage</span>.",
        "chooseFolder": "Choose folder",
        "changeFolder": "Change folder",
        "saveNow": "Save now",
        "saveNowSuccess": "gastos-data.json saved to folder \"{name}\"",
        "saveNowSuccessLocal": "Saved in browser (localStorage). Click \"Choose folder\" to save directly on computer.",
        "exportJson": "Download JSON backup",
        "importJson": "Restore JSON backup",
        "importSuccess": "Backup restored: {count} transactions",
        "importError": "Invalid file: {error}",
        "storageFull": "Browser storage full — choose a folder or download backup",
        "folderApiUnsupported": "Choosing a folder works in Chrome and Edge. In this browser, data keeps saving automatically right here (localStorage).",
        "quotaFull": "⚠️ Browser storage full — choose a folder in Settings → Data or download a JSON backup.",
        "restoredFromFolder": "Restored from gastos-data.json ({count} transactions, {date})",
        "savedToFolderLog": "💾 gastos-data.json saved to folder \"{name}\"",
        "savedToLocalLog": "💾 saved in browser (localStorage) — use \"Choose folder\" in Settings → Data to save to your computer",
        "savedToFolderAlert": "✅ gastos-data.json saved to folder \"{name}\"",
        "savedToLocalAlert": "✅ Saved in browser (localStorage). Click \"Choose folder\" to save directly to your computer.",
        "fixedBilCardMigration": "🔧 {n} BIL card purchase(s), imported before the fix, were recategorized and now count as an Expense again.",
        "fixedTransfersMigration": "🔧 {n} transaction(s) identified as a transfer between your accounts (by beneficiary bank) — no longer counted as Expense/Income."
      },
      "ai": {
        "title": "Auto-categorization with local AI",
        "url": "Ollama URL",
        "model": "Model",
        "testConnection": "Test connection",
        "statusChecking": "checking...",
        "testButton": "Test",
        "saveJsonNowTitle": "Save gastos-data.json now",
        "footerNote": "100% offline · <span class=\"text-zinc-400\">{model}</span> already detected ({size}) · Nothing leaves your network.",
        "autoCategorize": "Auto-categorize on import",
        "categorizeNow": "Categorize with local AI",
        "categorizing": "Categorizing...",
        "status": {
          "online": "online",
          "offline": "offline",
          "busy": "categorizing...",
          "hasModel": "online · {model}",
          "none": "(none)"
        },
        "log": {
          "nothingToCategorize": "Nothing to categorize (no Expenses).",
          "allCategorized": "All {count} expenses already categorized — nothing to do. ✅",
          "starting": "Starting: {count} descriptions → {model} @ {url}",
          "batchProgress": "Batch {current}/{total}: {applied} categorized",
          "batchError": "Error in batch {batch}: {error}",
          "corsError": "CORS error — run: OLLAMA_ORIGINS=\"*\" ollama serve",
          "completed": "Done: {done} transactions re-categorized with {model}.",
          "healthCheckOk": "Ollama online. Models: {models}",
          "healthCheckFail": "Ollama offline: {error} — check: OLLAMA_ORIGINS=\"*\" ollama serve",
          "healthCheckHint": "Tip: brew services stop ollama && OLLAMA_ORIGINS=\"*\" ollama serve",
          "batchSummary": "{n} uncategorized will be sent to the AI · {already} already categorized were skipped",
          "batchUnparsable": "Batch {batch}: response had no JSON — \"{preview}\""
        }
      },
      "categories": {
        "add": "Add category",
        "addShort": "+ New",
        "hint": "Click a chart slice or the chip to filter the table below.",
        "edit": "Edit",
        "keywordsHelp": "Words that trigger auto-suggestion for this category"
      },
      "banks": {
        "title": "Account types / banks",
        "add": "Add type",
        "addShort": "+ New",
        "hint": "Auto-detected when importing PDFs (BIL, BIL Card, Revolut). Create other types if you use more accounts — shows discreetly under the description in the transactions table, and can be adjusted per transaction or in bulk.",
        "name": "Name",
        "icon": "Icon",
        "keywords": "Keywords for auto-detection"
      },
      "importPdfs": {
        "title": "Import PDFs",
        "badge": "Drag or select",
        "localNote": "100% local — nothing leaves your PC · € (1,234.56 €)",
        "readingProgress": "Reading PDFs...",
        "formatHint": "<span class=\"font-bold\">Format:</span> Date, Description, <b class=\"text-red-600\">Expense</b>, <b class=\"text-emerald-600\">Income</b>, Balance. Only <b>Expenses</b> feed the charts. Duplicates are skipped automatically.",
        "formatHintExtra": "Tested with <b>Revolut</b> statements. Numeric dates (dd.mm.yyyy, common at European banks like <b>BIL Luxembourg</b>) are also recognized — if your statement doesn't import correctly, see how to report it in <b>Settings → Data</b> or edit manually in the table.",
        "dragAnywhereHint": "You can also drag PDFs anywhere on the dashboard page."
      },
      "budget": {
        "cardTitle": "Monthly budgets",
        "hint": "Set a spending target per category — enables \"Budget\" mode in the dashboard comparison and feeds the cash flow <b>Forecast</b> tab.",
        "incomeTargetLabel": "Monthly income target",
        "incomeTargetPlaceholder": "e.g. 3000",
        "footerHint": "Categories without a target use the average of recent months in the Forecast — no need to fill in everything."
      }
    },
    "openingBalance": {
      "title": "Opening balance",
      "date": "Date",
      "value": "Value (€)",
      "save": "Save opening balance",
      "clear": "Clear opening balance",
      "statusSet": "Set: {value} on {date}",
      "statusNone": "No opening balance set — Cumulative cash flow starts from zero.",
      "invalidInput": "Enter a valid date and amount.",
      "explanation": "If the statement starts partway through (e.g. January/2026) and is missing an entry before it (e.g. December's salary that paid for the start of January), enter here the balance you had one day before the first imported statement. This value feeds both the <b>Current balance</b> (top of the dashboard) and the start of the <b>Cumulative cash flow</b> chart. Alternative: instead of filling this in, log a <b>manual Income transaction</b> in December with the total you had — same result, but don't use both at once or it'll double-count.",
      "dateLabel": "Balance on",
      "valuePlaceholder": "e.g. 3200.00",
      "saveShort": "Save",
      "removeShort": "Remove"
    },
    "anomalies": {
      "title": "Unusual expenses detected",
      "subtitle": "Repeated charges, out-of-pattern values and spending spikes — worth a look",
      "description": "These transactions have values far above the category pattern. Review each:",
      "accept": "Accept (real expense)",
      "alwaysAccept": "Always accept this description",
      "reject": "Ignore (not an expense)",
      "close": "Close",
      "messages": {
        "exactDuplicate": "{n}× identical charge of {value} for \"{desc}\" on the same day — might be a duplicate.",
        "nearDuplicate": "Two charges of {value} for \"{desc}\" {days} day(s) apart — check it isn't a duplicate.",
        "merchantOutlier": "{value} for \"{desc}\" was well above usual (average {avg}, {pct}% more).",
        "globalOutlier": "Atypical expense for the period: {value} for \"{desc}\" (overall average {avg}).",
        "spikeDay": "{date} had {total} across {count} transactions — well above the daily average ({avg}).",
        "countFoundSingular": "{n} found",
        "countFoundPlural": "{n} found",
        "countNone": "nothing out of the ordinary",
        "emptyTitle": "Nothing out of the ordinary",
        "emptyDetail": "No duplicates, spikes, or atypical values this period.",
        "resolveButton": "Resolve",
        "moreNotShown": "+ {n} more not shown.",
        "noTxFound": "No transaction involved still exists (already deleted)."
      }
    },
    "printReport": {
      "title": "Expenses.AI — Expense Report",
      "subtitle": "Expense Report",
      "generated": "generated on {date}",
      "categoryClause": " · category: {name}",
      "noExpensesInPeriod": "No expenses this period.",
      "noData": "No data.",
      "printWithoutDataAlert": "Add data before printing — import PDFs or use \"Load demo data\" in Settings.",
      "kpis": {
        "totalExpenses": "TOTAL SPENT",
        "income": "INCOME",
        "balance": "PERIOD BALANCE",
        "savingsRate": "SAVINGS RATE"
      },
      "sections": {
        "byCategory": "Expenses by category",
        "monthlyEvolution": "Monthly evolution",
        "topMerchants": "Top merchants",
        "statement": "Statement — {count} transactions{category}"
      },
      "tableHeaders": {
        "date": "Date",
        "description": "Description",
        "category": "Category",
        "expense": "Expense",
        "income": "Income"
      },
      "footer": "Generated by Expenses.AI — 100% local & private · {date}"
    },
    "categories": {
      "alimentacao": "Food & Groceries",
      "transporte": "Transport",
      "moradia": "Housing",
      "contas": "Bills & Services",
      "saude": "Health",
      "lazer": "Leisure",
      "compras": "Shopping",
      "educacao": "Education",
      "outros": "Other",
      "transferencia": "Internal transfer",
      "cartao": "Card Payment",
      "propagatedLog": "Propagated: {n} transactions with description \"{desc}\" → {category}"
    },
    "bankTypes": {
      "REVOLUT": "Revolut",
      "BIL": "BIL",
      "BIL_CARD": "BIL Card",
      "OTHER": "Other"
    },
    "months": {
      "short": [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ],
      "long": [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ]
    },
    "days": {
      "short": [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
      ],
      "long": [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ]
    },
    "common": {
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "cancel": "Cancel",
      "confirm": "Confirm",
      "save": "Save",
      "delete": "Delete",
      "edit": "Edit",
      "close": "Close",
      "yes": "Yes",
      "no": "No",
      "ok": "OK",
      "apply": "Apply",
      "reset": "Reset",
      "export": "Export CSV",
      "editItemTitle": "Edit {name}"
    }
  }
};
