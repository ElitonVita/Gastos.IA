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
      "inheritedCategories": "herdados de categorias já salvas"
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
      "balanceSubDefault": "Entradas − saídas de todo o histórico · defina um saldo inicial em Configurações se faltar dado anterior"
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
      }
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
      "empty": "Nenhuma transação nesse filtro.",
      "noValue": "—",
      "cardSettlement": "Fatura do cartão",
      "cardSettlementTitle": "Débito único da fatura do cartão — não contabilizado (as compras já foram contadas individualmente)",
      "transferBetweenAccounts": "entre contas",
      "transferBetweenAccountsTitle": "Transferência entre suas contas — não contabilizada em Gastos/Entradas. Veja o par em Detalhes.",
      "possibleTransfer": "possível transferência",
      "possibleTransferTitlePrefix": "Detectado automaticamente pelo banco do beneficiário — provável transferência para ",
      "internalTransfer": "interna",
      "internalTransferTitle": "Movimentação interna — não contabilizada",
      "summary": "movimentos",
      "realExpenses": "Gastos reais",
      "income": "Entradas",
      "internalTransfers": "Transf. internas",
      "monthlyAverage": "Média mensal",
      "pageInfo": "Página {current} / {total}",
      "prevPage": "Anterior",
      "nextPage": "Próxima"
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
      "selectInOut": "Selecione uma transação de Saída e uma de Entrada — são os dois lados da mesma transferência."
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
        "invalidValue": "Informe um valor válido"
      },
      "note": {
        "title": "Nota para \"{desc}\"",
        "meta": "{date} · {value}{source}",
        "placeholder": "Escreva uma nota...",
        "cancel": "Cancelar",
        "delete": "Apagar nota",
        "save": "Salvar"
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
        "rejectAutoTransfer": "Rejeitar detecção automática"
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
        "submitEdit": "Salvar alterações"
      },
      "bulkNote": {
        "title": "Adicionar nota a {count} transações",
        "count": "{count} transações",
        "placeholder": "Nota para todas as selecionadas...",
        "cancel": "Cancelar",
        "save": "Salvar nota"
      }
    },
    "charts": {
      "mode": {
        "donut": "Rosca",
        "bar": "Barras"
      },
      "compareMode": {
        "bars": "Barras agrupadas",
        "lines": "Linhas sobrepostas"
      },
      "budgetScope": {
        "month": "Mês atual",
        "quarter": "Trimestre",
        "year": "Ano"
      },
      "cashflowMode": {
        "monthly": "Mensal",
        "cumulative": "Acumulado"
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
        "noIncomeTarget": "Defina a meta de renda mensal acima pra ver quanto sobra e a porcentagem comprometida."
      }
    },
    "settings": {
      "title": "Configurações",
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
        "chooseFolder": "Escolher pasta",
        "changeFolder": "Trocar pasta",
        "saveNow": "Salvar agora",
        "saveNowSuccess": "gastos-data.json salvo na pasta \"{name}\"",
        "saveNowSuccessLocal": "Salvo no navegador (localStorage). Clique em \"Escolher pasta\" para gravar direto no computador.",
        "exportJson": "Baixar backup JSON",
        "importJson": "Restaurar backup JSON",
        "importSuccess": "Backup restaurado: {count} transações",
        "importError": "Arquivo inválido: {error}",
        "storageFull": "Armazenamento do navegador cheio — escolha uma pasta ou baixe backup"
      },
      "ai": {
        "title": "Categorização automática com IA local",
        "url": "URL do Ollama",
        "model": "Modelo",
        "testConnection": "Testar conexão",
        "autoCategorize": "Categorizar automaticamente ao importar",
        "categorizeNow": "Categorizar com IA local",
        "categorizing": "Categorizando...",
        "status": {
          "online": "online",
          "offline": "offline",
          "busy": "a categorizar...",
          "hasModel": "online · {model}"
        },
        "log": {
          "nothingToCategorize": "Nada para categorizar (sem Saídas).",
          "allCategorized": "Todas as {count} saídas já estão categorizadas — nada a fazer. ✅",
          "starting": "Iniciando: {count} descrições → {model} @ {url}",
          "batchProgress": "Lote {current}/{total}: {applied} categorizadas",
          "batchError": "Erro no lote {batch}: {error}",
          "corsError": "Erro de CORS — rode: OLLAMA_ORIGINS=\"*\" ollama serve",
          "completed": "Concluído: {done} transações re-categorizadas com {model}."
        }
      },
      "categories": {
        "add": "Adicionar categoria",
        "edit": "Editar",
        "keywordsHelp": "Palavras que fazem a categoria ser sugerida automaticamente"
      },
      "banks": {
        "title": "Tipos de conta / banco",
        "add": "Adicionar tipo",
        "name": "Nome",
        "icon": "Ícone",
        "keywords": "Palavras-chave para detecção automática"
      }
    },
    "openingBalance": {
      "title": "Saldo inicial",
      "date": "Data",
      "value": "Valor (€)",
      "save": "Salvar saldo inicial",
      "clear": "Limpar saldo inicial",
      "statusSet": "Definido: {value} em {date}",
      "statusNone": "Nenhum saldo inicial definido — o Fluxo de caixa acumulado começa do zero."
    },
    "anomalies": {
      "title": "Gastos estranhos detectados",
      "description": "Estas transações têm valores muito acima do padrão da categoria. Revise cada uma:",
      "accept": "Aceitar (é gasto real)",
      "alwaysAccept": "Sempre aceitar esta descrição",
      "reject": "Ignorar (não é gasto)",
      "close": "Fechar"
    },
    "printReport": {
      "title": "Gastos.AI — Relatório de Despesas",
      "generated": "gerado em {date}",
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
      "cartao": "Pagamento de Cartão"
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
      "export": "Exportar CSV"
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
      "inheritedCategories": "inherited from saved categories"
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
      "balanceSubDefault": "Income − expenses from all history · set an opening balance in Settings if prior data is missing"
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
      }
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
      "empty": "No transactions in this filter.",
      "noValue": "—",
      "cardSettlement": "Card statement",
      "cardSettlementTitle": "Single card statement debit — not counted (individual purchases already counted)",
      "transferBetweenAccounts": "between accounts",
      "transferBetweenAccountsTitle": "Transfer between your accounts — not counted in Expenses/Income. See pair in Details.",
      "possibleTransfer": "possible transfer",
      "possibleTransferTitlePrefix": "Auto-detected by beneficiary bank — likely transfer to ",
      "internalTransfer": "internal",
      "internalTransferTitle": "Internal movement — not counted",
      "summary": "transactions",
      "realExpenses": "Real expenses",
      "income": "Income",
      "internalTransfers": "Internal transfers",
      "monthlyAverage": "Monthly average",
      "pageInfo": "Page {current} / {total}",
      "prevPage": "Previous",
      "nextPage": "Next"
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
      "selectInOut": "Select an Outflow and an Inflow transaction — they are the two sides of the same transfer."
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
        "invalidValue": "Enter a valid amount"
      },
      "note": {
        "title": "Note for \"{desc}\"",
        "meta": "{date} · {value}{source}",
        "placeholder": "Write a note...",
        "cancel": "Cancel",
        "delete": "Delete note",
        "save": "Save"
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
        "rejectAutoTransfer": "Reject auto-detection"
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
        "submitEdit": "Save changes"
      },
      "bulkNote": {
        "title": "Add note to {count} transactions",
        "count": "{count} transactions",
        "placeholder": "Note for all selected...",
        "cancel": "Cancel",
        "save": "Save note"
      }
    },
    "charts": {
      "mode": {
        "donut": "Donut",
        "bar": "Bars"
      },
      "compareMode": {
        "bars": "Grouped bars",
        "lines": "Overlaid lines"
      },
      "budgetScope": {
        "month": "Current month",
        "quarter": "Quarter",
        "year": "Year"
      },
      "cashflowMode": {
        "monthly": "Monthly",
        "cumulative": "Cumulative"
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
        "noIncomeTarget": "Set monthly income target above to see remaining and % committed."
      }
    },
    "settings": {
      "title": "Settings",
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
        "chooseFolder": "Choose folder",
        "changeFolder": "Change folder",
        "saveNow": "Save now",
        "saveNowSuccess": "gastos-data.json saved to folder \"{name}\"",
        "saveNowSuccessLocal": "Saved in browser (localStorage). Click \"Choose folder\" to save directly on computer.",
        "exportJson": "Download JSON backup",
        "importJson": "Restore JSON backup",
        "importSuccess": "Backup restored: {count} transactions",
        "importError": "Invalid file: {error}",
        "storageFull": "Browser storage full — choose a folder or download backup"
      },
      "ai": {
        "title": "Auto-categorization with local AI",
        "url": "Ollama URL",
        "model": "Model",
        "testConnection": "Test connection",
        "autoCategorize": "Auto-categorize on import",
        "categorizeNow": "Categorize with local AI",
        "categorizing": "Categorizing...",
        "status": {
          "online": "online",
          "offline": "offline",
          "busy": "categorizing...",
          "hasModel": "online · {model}"
        },
        "log": {
          "nothingToCategorize": "Nothing to categorize (no Expenses).",
          "allCategorized": "All {count} expenses already categorized — nothing to do. ✅",
          "starting": "Starting: {count} descriptions → {model} @ {url}",
          "batchProgress": "Batch {current}/{total}: {applied} categorized",
          "batchError": "Error in batch {batch}: {error}",
          "corsError": "CORS error — run: OLLAMA_ORIGINS=\"*\" ollama serve",
          "completed": "Done: {done} transactions re-categorized with {model}."
        }
      },
      "categories": {
        "add": "Add category",
        "edit": "Edit",
        "keywordsHelp": "Words that trigger auto-suggestion for this category"
      },
      "banks": {
        "title": "Account types / banks",
        "add": "Add type",
        "name": "Name",
        "icon": "Icon",
        "keywords": "Keywords for auto-detection"
      }
    },
    "openingBalance": {
      "title": "Opening balance",
      "date": "Date",
      "value": "Value (€)",
      "save": "Save opening balance",
      "clear": "Clear opening balance",
      "statusSet": "Set: {value} on {date}",
      "statusNone": "No opening balance set — Cumulative cash flow starts from zero."
    },
    "anomalies": {
      "title": "Unusual expenses detected",
      "description": "These transactions have values far above the category pattern. Review each:",
      "accept": "Accept (real expense)",
      "alwaysAccept": "Always accept this description",
      "reject": "Ignore (not an expense)",
      "close": "Close"
    },
    "printReport": {
      "title": "Expenses.AI — Expense Report",
      "generated": "generated on {date}",
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
      "cartao": "Card Payment"
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
      "export": "Export CSV"
    }
  }
};
