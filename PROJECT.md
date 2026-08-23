# Gastos.IA

Dashboard local, em um único arquivo HTML, para transformar extratos bancários em PDF em gráficos e categorias de gastos — sem enviar nada para a nuvem.

Feito para resolver um problema pessoal: entender para onde vai o dinheiro entre contas em bancos diferentes (neste caso, **Revolut** e **BIL — Banque Internationale à Luxembourg**), sem depender de planilhas manuais nem de serviços de terceiros que exigem acesso à conta bancária.

## O que ele faz

- **Roda 100% no navegador, offline.** É um único `index.html` — sem backend, sem servidor, sem build. Abre com duplo clique.
- **Importa extratos em PDF** por drag-and-drop e extrai as transações (data, descrição, valor, saldo) usando `pdf.js` no próprio navegador.
- **Detecta automaticamente o banco/tipo de conta** pelo texto do PDF (conta corrente BIL, fatura de cartão BIL, conta Revolut) e ajusta o parser para o layout de cada um.
- **Categoriza transações**, manualmente ou com ajuda de um modelo de IA rodando localmente via **Ollama** (100% offline, nenhuma transação sai da máquina).
- **Detecta transferências entre as próprias contas** (ex.: BIL → Revolut) para não contar a mesma movimentação como gasto duas vezes.
- **Gera gráficos e um dashboard** de gastos por categoria, por mês, saída vs. entrada, com filtros e busca.
- **Exporta para CSV** e mantém os dados salvos localmente (`localStorage` do navegador), com backup/export em JSON.

## O que ele NÃO faz

- **Não é um produto genérico "conecte seu banco e pronto".** Os parsers de PDF foram construídos e testados **apenas com os extratos da Revolut e da BIL** que eu mesmo uso. Cada banco tem seu próprio layout de PDF (colunas, formato de data, cabeçalhos, texto de identificação), então o parser é, na prática, específico para esses dois formatos.
- **Não tem integração bancária (Open Banking, APIs, etc.).** Tudo é baseado em ler o PDF do extrato que você mesmo baixa do seu banco e arrasta para o navegador.
- **Não envia dados para nenhum servidor.** Não há telemetria, não há conta de usuário, não há sincronização em nuvem. A categorização por IA, quando usada, roda em um modelo local via Ollama — nada é enviado para APIs externas.
- **Não garante suporte a outros bancos.** Se você usar um extrato de um banco diferente, é bem provável que o parser não reconheça o formato corretamente (datas, colunas ou cabeçalhos diferentes) — vai exigir adaptação de código.

## Usando com o seu banco

Para o Gastos.IA funcionar de verdade com o **seu** extrato, normalmente é necessário adaptar o parser ao formato específico do seu banco: como as colunas aparecem no PDF (data, descrição, saída, entrada, saldo), o formato de data usado, e o texto que identifica o banco no documento. Isso está tudo dentro do próprio `index.html`, nas funções de parsing (procure por `extractBILStatement`, `parseCardStatement`, ou o parser "pipe" no estilo Revolut, como ponto de partida).

## Quer ajudar a expandir para outros bancos?

Se você tiver **modelos anonimizados** de extratos de outros bancos (PDF com os dados pessoais e valores removidos/substituídos, mantendo só a estrutura/layout), pode me enviar — com o tempo pretendo ir adicionando suporte a mais formatos ao projeto. Nunca envie um extrato real com seus dados — apenas uma versão anonimizada que preserve o layout.

## Stack

- HTML/JS puro, sem framework, sem etapa de build
- `pdf.js` para extração de texto de PDF no navegador
- Chart.js (ou equivalente) para os gráficos
- Ollama (opcional) para categorização assistida por IA local
- `localStorage` para persistência dos dados no navegador

## Aviso

Este é um projeto pessoal, feito para minhas próprias necessidades de organização financeira. Ele **não é um app comercial**, não foi auditado para segurança/produção em larga escala, e não deve ser tratado como conselho financeiro nem como solução pronta para qualquer banco. Use por sua conta e risco, revise o código antes de usar com dados reais.
