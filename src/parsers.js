// ---------- Number parsing (handles both 1.234,56 € and 1,234.56 and 1 234,56) ----------
function parseEuroNumber(raw){
  let s = raw.replace(/\s/g,'').replace(/[€$]/g,'').trim();
  // remove currency letters EUR
  s = s.replace(/EUR/gi,'').trim();
  const hasDot = s.includes('.');
  const hasComma = s.includes(',');
  if(hasDot && hasComma){
    // last separator is decimal
    if(s.lastIndexOf(',') > s.lastIndexOf('.')){
      // EU: 1.234,56 -> 1234.56
      s = s.replace(/\./g,'').replace(',', '.');
    } else {
      // US: 1,234.56 -> 1234.56
      s = s.replace(/,/g,'');
    }
  } else if(hasComma){
    // 1234,56 -> 1234.56  (EU)  or 1,234 -> check: if comma + 2 decimals assume decimal
    if(/,\d{2}$/.test(s)) s = s.replace(/\./g,'').replace(',', '.');
    else s = s.replace(/,/g,'');
  } else {
    // only dots or plain
    if(hasDot && /\.\d{2}$/.test(s) && (s.match(/\./g)||[]).length===1){
      // 1234.56 stays
    } else if(hasDot){
      // 1.234 -> could be 1234
      const parts = s.split('.');
      if(parts[parts.length-1].length===2) { /* keep last dot as decimal */ }
      else s = s.replace(/\./g,'');
    }
  }
  // handle thin space as thousands: 1 234,56 already removed
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

// ---------- Parser para formato "pipe" (Revolut-style): Jul 1, 2026 | Auchan | €19.25 | - | €1,344.87 ----------
function parsePipeStatement(text, sourceName){
  const results=[];
  const months={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,
                jan:0,fev:1,mar:2,abr:3,mai:4,jun:5,jul:6,ago:7,set:8,out:9,nov:10,dez:11};
  // number like €19.25 or €1,344.87 or 1 344,87 — dot decimal + comma thousands OR comma decimal
  const amt = s => {
    if(!s || s==='-' ) return null;
    let t = s.replace(/[€\s]/g,'');
    const m = t.match(/^(-?)([\d.,]+)$/);
    if(!m) return null;
    let n = m[2];
    if(n.includes(',') && n.includes('.')){
      n = (n.lastIndexOf(',')>n.lastIndexOf('.')) ? n.replace(/\./g,'').replace(',','.') : n.replace(/,/g,'');
    } else if(n.includes(',')){
      n = /,\d{1,2}$/.test(n) ? n.replace(',','.') : n.replace(/,/g,'');
    }
    const v = parseFloat((m[1]||'')+n);
    return isNaN(v)?null:v;
  };
  for(let raw of text.split(/\n/)){
    const line = raw.trim();
    if(!line || !line.includes('|')) continue;
    const parts = line.split('|').map(p=>p.trim());
    if(parts.length < 4) continue;
    // date: "Jul 1, 2026" / "1 Jul 2026" / "01/07/2026"
    const dm = parts[0].match(/^([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})$/) || parts[0].match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/);
    let date=null;
    if(dm){
      const mon = months[dm[1].slice(0,3).toLowerCase()];
      if(mon!==undefined){
        // format "Jul 1, 2026": group1=month group2=day ; format "1 Jul 2026": group1=day group2=month
        const isMonthFirst = /^[A-Za-z]/.test(dm[1]);
        const day = isMonthFirst ? +dm[2] : +dm[1];
        date = new Date(+dm[3], mon, day);
      }
    }
    if(!date){
      const m2 = parts[0].match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
      if(m2) date = new Date(+m2[3], +m2[2]-1, +m2[1]);
    }
    if(!date) continue;
    const desc = parts[1];
    // find which of the remaining columns are filled: saida, entrada, saldo (in order)
    const restCols = parts.slice(2).map(c=>c);
    let saida=null, entrada=null, balanco=null;
    const vals = restCols.map(amt);
    if(restCols.length>=3){
      saida=vals[0]; entrada=vals[1]; balanco=vals[2];
    } else if(restCols.length===2){
      // saida|saldo or entrada|saldo — decide by "-" placeholder
      if(restCols[0]==='-'){ entrada=vals[1]; balanco=vals[0]; }
      else { saida=vals[0]; balanco=vals[1]; }
    } else {
      saida = vals[0];
    }
    // skip lines with no movement at all
    if(saida===null && entrada===null) continue;
    // skip pure internal transfers that cancel out? keep them but mark category outros
    results.push({
      id: `${sourceName}-pipe-${results.length}-${Math.random().toString(36).slice(2,6)}`,
      date, dateStr: parts[0],
      desc: desc.slice(0,90),
      saida: saida!=null ? Math.abs(saida) : null,
      entrada: entrada!=null ? Math.abs(entrada) : null,
      balanco: balanco!=null ? Math.abs(balanco) : null,
      amount: saida!=null ? Math.abs(saida) : 0,
      cat: isInternalTransfer(desc) ? 'transferencia' : (saida!=null ? categorize(desc) : 'outros'),
      internal: isInternalTransfer(desc),
      source: sourceName
    });
  }
  return results;
}

// ---------- Extract from PDF text — handles 5-col extrato: Data | Descrição | Saída | Entrada | Saldo ----------
// Datas em extratos: nome do mês (Revolut: "Jul 1, 2026" / "1 Jul 2026") OU numérica dd.mm.yyyy,
// dd/mm/yyyy, dd-mm-yyyy (comum em bancos continentais europeus, ex: BIL Luxembourg).
function matchStatementDate(line, months){
  const dm = line.match(/^([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})/) || line.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/);
  if(dm){
    const mon = months[(dm[1].length>2?dm[1]:dm[2]).slice(0,3).toLowerCase()];
    if(mon!==undefined){
      const isMonthFirst = /^[A-Za-z]/.test(dm[1]);
      const day = isMonthFirst? +dm[2] : +dm[1];
      return { date:new Date(+dm[3],mon,day), matched:dm[0] };
    }
  }
  const dn = line.match(/^(\d{1,2})[\.\/\-](\d{1,2})[\.\/\-](\d{4})/) || line.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if(dn){
    if(dn[0].includes('-') && dn[1].length===4){
      return { date:new Date(+dn[1],+dn[2]-1,+dn[3]), matched:dn[0] }; // yyyy-mm-dd
    }
    return { date:new Date(+dn[3],+dn[2]-1,+dn[1]), matched:dn[0] }; // dd.mm.yyyy / dd/mm/yyyy / dd-mm-yyyy
  }
  return null;
}
function extractColumnStatement(structuredPages, sourceName){
  const results=[];
  const months={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
  const amtOf = s => {
    if(!s) return null;
    let t=s.replace(/[€\u00A0\s]/g,'').replace(/EUR/gi,'');
    const m=t.match(/^(-?)([\d.,]+)$/); if(!m) return null;
    let n=m[2];
    if(n.includes(',')&&n.includes('.')) n = n.lastIndexOf(',')>n.lastIndexOf('.') ? n.replace(/\./g,'').replace(',','.') : n.replace(/,/g,'');
    else if(n.includes(',')) n = /,\d{1,2}$/.test(n) ? n.replace(',','.') : n.replace(/,/g,'');
    else if(n.includes('.')){ const parts=n.split('.'); if(parts.length>2 || parts[parts.length-1].length!==2) n=n.replace(/\./g,''); }
    const v=parseFloat((m[1]||'')+n); return isNaN(v)?null:v;
  };
  // Pass 1: collect candidate transaction lines across all pages
  const candidates=[];
  for(const pg of (structuredPages||[])){
    const line=pg.text; if(!line) continue;
    // linha começa com data — nome de mês (Revolut) ou numérica dd.mm.yyyy (bancos continentais, ex: BIL)
    if(!matchStatementDate(line, months)) continue;
    candidates.push(pg);
  }
  if(candidates.length < 3) return []; // not this format

  // Pass 2: cluster X positions of money-looking items across candidate lines
  const xs=[];
  const moneyRe=/^[€$]?-?[\d][\d.,]*[.,]\d{2}$/;
  for(const pg of candidates){
    for(const it of pg.items){
      const s=it.str.trim();
      if(moneyRe.test(s) && amtOf(s)!==null) xs.push(it.x);
    }
  }
  if(xs.length<6) return [];
  xs.sort((a,b)=>a-b);
  // cluster with gap > 40px
  const clusters=[]; let cur=[xs[0]];
  for(let i=1;i<xs.length;i++){
    if(xs[i]-cur[cur.length-1] > 40){ clusters.push(cur); cur=[xs[i]]; } else cur.push(xs[i]);
  }
  clusters.push(cur);
  const colCenters=clusters.filter(c=>c.length>=3).map(c=>c.reduce((s,v)=>s+v,0)/c.length).sort((a,b)=>a-b);
  if(colCenters.length<2) return [];
  const nearest=(x)=>{ let best=null,bd=1e9; for(const c of colCenters){ const d=Math.abs(x-c); if(d<bd){bd=d;best=c;} } return {c:best,d:bd}; };

  // Column roles: rightmost cluster = SALDO. If 3 clusters: [SAIDA, ENTRADA, SALDO]. If 2: first is movement col (saida OR entrada decided by saldo delta later), second saldo.
  const saldoX = colCenters[colCenters.length-1];
  const moveCols = colCenters.slice(0,-1);

  // índice de cada linha em structuredPages — usado para varrer as linhas de detalhe (To:, Card:, câmbio) entre uma transação e a próxima
  const spIndexOf = new Map();
  (structuredPages||[]).forEach((p,i)=>spIndexOf.set(p,i));

  for(const pg of candidates){
    const line=pg.text;
    const dm = matchStatementDate(line, months);
    let date=null;
    if(dm){
      date = dm.date;
    }
    if(!date) continue;
    // gather money items with X
    const monItems=[];
    for(const it of pg.items){
      const s=it.str.trim();
      if(moneyRe.test(s)){
        const v=amtOf(s); if(v===null) continue;
        const nr=nearest(it.x);
        monItems.push({v,x:it.x,col:nr.c,isSaldoCol: Math.abs(nr.c-saldoX)<20});
      }
    }
    if(monItems.length===0) continue;
    // description = line text minus date minus money tokens
    let desc=line;
    for(const mi of monItems) desc=desc.replace(mi.v!==undefined?'':'','');
    desc=line.replace(/^([A-Za-z]{3,}\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}|\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{4}|\d{4}-\d{1,2}-\d{1,2})/,' ');
    for(const it of pg.items){ if(moneyRe.test(it.str.trim())) desc=desc.replace(it.str,' '); }
    desc=desc.replace(/[€]/g,' ').replace(/(^|\s)-\s*$/,'$1').replace(/\s{2,}/g,' ').trim();
    if(desc.length<2) desc='Movimento';
    if(desc.length>90) desc=desc.slice(0,90);

    let saida=null,entrada=null,balanco=null;
    const saldoItem=monItems.find(mi=>mi.isSaldoCol);
    if(saldoItem) balanco=Math.abs(saldoItem.v);
    const moveItems=monItems.filter(mi=>!mi.isSaldoCol);
    if(moveItems.length===1){
      // decide saida vs entrada by saldo delta when possible
      const idx=candidates.indexOf(pg);
      let prevSaldo=null;
      for(let k=idx-1;k>=0;k--){
        const l=candidates[k];
        const sim=[];
        for(const it of l.items){ const s=it.str.trim(); if(moneyRe.test(s)&&nearest(it.x).c!=null&&Math.abs(nearest(it.x).c-saldoX)<20) sim.push(amtOf(s)); }
        if(sim.length){ prevSaldo=Math.abs(sim[0]); break; }
      }
      const v=Math.abs(moveItems[0].v);
      if(prevSaldo!=null && balanco!=null){
        entrada = (balanco>prevSaldo) ? v : null;
        saida   = (balanco<=prevSaldo) ? v : null;
      } else {
        // heuristic: deposit keywords
        if(/deposit|payment from|transfer from|from .*funds|refund|interest/i.test(desc)) entrada=v; else saida=v;
      }
    } else if(moveItems.length>=2){
      // two movement cols: left=saida right=entrada (or vice versa by X)
      const sorted=[...moveItems].sort((a,b)=>a.x-b.x);
      saida=Math.abs(sorted[0].v); entrada=Math.abs(sorted[1].v);
      if(moveItems.length>2){
        // extra spurious: keep the two closest to movement columns
        const mcols=moveCols;
        const scored=moveItems.map(mi=>{
          let bd=1e9; for(const c of mcols) bd=Math.min(bd,Math.abs(mi.x-c));
          return {...mi,bd};
        }).sort((a,b)=>a.bd-b.bd).slice(0,2).sort((a,b)=>a.x-b.x);
        saida=Math.abs(scored[0].v); entrada=Math.abs(scored[1].v);
      }
    }

    // Linhas de detalhe abaixo da transação (comuns em extratos Revolut): "To: <local>", "Card: <últimos dígitos>",
    // "Revolut Rate ..." e o valor na moeda original (ex: "43.80 CHF") — varre até a próxima transação.
    const meta = {};
    const startIdx = spIndexOf.get(pg);
    if(startIdx!=null){
      const curCandIdx = candidates.indexOf(pg);
      const nextCand = candidates[curCandIdx+1];
      const endIdx = nextCand ? (spIndexOf.get(nextCand) ?? structuredPages.length) : structuredPages.length;
      for(let i=startIdx+1; i<endIdx; i++){
        const dl = (structuredPages[i]||{}).text; if(!dl) continue;
        let m;
        if(m = dl.match(/^To:\s*(.+)$/i)){
          const toVal = m[1].trim();
          meta.to = toVal;
          const parts = toVal.split(',');
          if(parts.length>1){ const town=parts[parts.length-1].trim(); if(town) meta.town = town; }
        } else if(m = dl.match(/^Card:\s*(.+)$/i)){
          meta.card = m[1].trim();
        } else if(m = dl.match(/^Revolut Rate\s+(.+)$/i)){
          meta.fxRate = m[1].trim();
        } else if(m = dl.match(/^([\d.,]+)\s+([A-Z]{3})$/)){
          if(m[2]!=='EUR') meta.originalAmount = `${m[1]} ${m[2]}`;
        }
      }
    }

    // Transferência para outra conta do usuário (ex: Revolut -> BIL): o "To:" do extrato às vezes nomeia o banco
    // de destino — sinal confiável de que não é um gasto de verdade, é o mesmo dinheiro mudando de conta.
    const crossAccountBank = !isInternalTransfer(desc) ? detectCrossAccountBank(`${desc||''} ${meta.to||''}`, 'REVOLUT') : null;
    if(crossAccountBank) meta.transferToBank = crossAccountBank;

    results.push({
      id:`${sourceName}-col-${results.length}-${Math.random().toString(36).slice(2,6)}`,
      date, dateStr:'', desc,
      saida: saida!=null?Math.abs(saida):null,
      entrada: entrada!=null?Math.abs(entrada):null,
      balanco: balanco!=null?Math.abs(balanco):null,
      amount: saida!=null?Math.abs(saida):0,
      cat: (crossAccountBank || isInternalTransfer(desc)) ? 'transferencia' : (saida!=null? categorize(desc): 'outros'),
      internal: !!crossAccountBank || isInternalTransfer(desc),
      autoTransfer: !!crossAccountBank,
      meta: Object.keys(meta).length ? meta : undefined,
      source: sourceName
    });
  }
  return results;
}

// ---------- Identifica o banco/tipo do extrato pelo texto de cabeçalho/rodapé ----------
// BIL_CARD (fatura de cartão BIL) vs BIL (conta corrente, Banque Internationale à Luxembourg) vs Revolut (Revolut Bank UAB)
function detectBankType(fullText){
  if(/Card\s+statement|Card\s+transactions/i.test(fullText)) return 'BIL_CARD';
  if(/Banque\s+Internationale\s*.{0,3}\s*Luxembourg/i.test(fullText)) return 'BIL';
  if(/Revolut\s+Bank\s+UAB/i.test(fullText)) return 'REVOLUT';
  return null;
}

// Detecta se um texto (banco do beneficiário, "To:", etc.) menciona outro Tipo de conta já cadastrado pelo
// usuário — sinal forte de transferência entre as próprias contas, não um gasto de verdade.
// ownBankId(s): id(s) do banco do extrato atual, para não "detectar" o próprio banco como destino.
function detectCrossAccountBank(text, ownBankIds){
  if(!text) return null;
  const own = Array.isArray(ownBankIds) ? ownBankIds : [ownBankIds];
  const t = text.toLowerCase();
  for(const b of bankTypes){
    if(own.includes(b.id)) continue; // é o próprio banco deste extrato, não conta
    if(b.name && b.name.length>=3 && t.includes(b.name.toLowerCase())) return b.id;
  }
  return null;
}

// ---------- Parser dedicado para faturas de cartão BIL ("Card statement") ----------
// Formato: Transaction date | Date processed | Description of the transaction | Town | Amount in foreign currency | Amount in EUR
// Cada compra é um Gasto normal (categorizado como qualquer transação) — o que NÃO deve contar é o débito único
// "Monthly Visa payment" que aparece depois no extrato da conta corrente BIL pagando a fatura inteira; ver extractBILStatement.
// statementDate ("Card statement at DD/MM/YYYY", extraído do cabeçalho) é usado como data de referência (mês em que a
// fatura foi paga), mas a data real da compra é preservada em realDate/dateStr para exibição.
function extractBILCardStatement(structuredPages, sourceName, statementDate){
  if(!structuredPages || structuredPages.length < 3) return [];
  const lines = structuredPages.map(pg=>pg.text);
  // "DD/MM/YYYY DD/MM/YYYY <descrição> <cidade> <valor>" — valor sempre o último token puramente numérico da linha
  const rowRe = /^(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?[\d.,]+)\s*$/;
  const results=[];
  for(const line of lines){
    const m = line.match(rowRe);
    if(!m) continue;
    const [, txDateStr, dateProcessedStr, rest, amtRaw] = m;
    const amount = parseEuroNumber(amtRaw);
    if(amount===null) continue;
    const [dd,mm,yyyy] = txDateStr.split('/');
    const realDate = new Date(+yyyy, +mm-1, +dd);
    // separa descrição / cidade: último "token" da coluna combinada é a cidade
    const words = rest.trim().split(/\s+/);
    let desc = rest.trim(), town = '';
    if(words.length > 1){ town = words[words.length-1]; desc = `${words.slice(0,-1).join(' ')} · ${town}`; }
    if(desc.length>90) desc = desc.slice(0,90).trim();
    const isRefund = amount > 0; // valores no cartão vêm negativos ("-4,99"); positivo = estorno/crédito no cartão
    const meta = {};
    if(town) meta.town = town;
    if(dateProcessedStr && dateProcessedStr!==txDateStr) meta.dateProcessed = dateProcessedStr;
    if(statementDate) meta.paymentDate = fmtTransactionDate(statementDate);
    results.push({
      id: `${sourceName}-bilcard-${results.length}-${Math.random().toString(36).slice(2,6)}`,
      // data usada em relatórios/orçamentos mensais = data em que o cartão foi pago (se conhecida); a tabela mostra a data real via realDate
      date: statementDate || realDate,
      realDate, dateStr: txDateStr,
      desc,
      saida: isRefund ? null : Math.abs(amount),
      entrada: null, // pagamento de cartão nunca é receita
      balanco: null,
      amount: isRefund ? 0 : Math.abs(amount),
      cat: isRefund ? 'outros' : categorize(desc), // compra normal — categoriza igual a qualquer gasto
      internal: false, // conta como Gasto normal; quem é ignorado é o débito único da fatura na conta corrente
      cardPayment: true, // só para o selo "💳 Cartão BIL" — indica o meio de pagamento, não exclui do total
      meta,
      source: sourceName
    });
  }
  return results;
}

// ---------- Parser dedicado para extratos BIL (formato Data | Communication | Value | Amount) ----------
// Cada transação tem um bloco de linhas; a linha de cabeçalho termina com "<valor> +" (entrada) ou "<valor> -" (saída).
// Regra de descrição pedida pelo usuário:
//  - Entrada (+): usa o campo "By order of:" (quem enviou o dinheiro)
//  - Saída (-):   usa o campo "Beneficiary:" (para quem foi o dinheiro)
function extractBILStatement(structuredPages, sourceName){
  if(!structuredPages || structuredPages.length===0) return [];
  const lines = structuredPages.map(pg=>pg.text);
  // Cabeçalho BIL: "DD/MM/YYYY <tipo> DD/MM/YYYY <valor> +|-".
  // Alguns PDFs colocam fragmentos da mesma linha em baselines ligeiramente
  // diferentes. Por isso, além da linha normal, tentamos a combinação das duas
  // linhas seguintes. O texto entre as datas continua preservado em meta.type
  // (por exemplo, "Charge"): é o tipo bancário da transação, não uma descrição,
  // categoria ou indicação de recorrência.
  const headerRe = /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+(-?[\d.,]+)\s*([+\-])\s*$/;
  const headers=[];
  for(let i=0;i<lines.length;i++){
    for(let span=1;span<=3 && i+span<=lines.length;span++){
      const candidate = lines.slice(i,i+span).join(' ').replace(/\s+/g,' ').trim();
      const match = candidate.match(headerRe);
      if(match){
        headers.push({start:i, match});
        break;
      }
    }
  }
  if(headers.length===0) return [];

  const stopLabelRe = /^(Remittance Info|By order of|Beneficiary|At:|Paying bank|End-to-end|Mandate reference|Creditor transaction|Payment initiation|Our Reference)/i;
  const codeLikeRe = /^[A-Z]{2,6}\d/; // referências tipo NCOR2607..., NSCT2607...

  const getField = (blockLines, re) => {
    for(let i=0;i<blockLines.length;i++){
      const m = blockLines[i].match(re);
      if(m){
        let val = m[1].trim();
        const next = blockLines[i+1];
        // junta uma linha de continuação do nome (ex: "S.A." na linha seguinte), mas não referências/códigos
        if(next && !next.includes(':') && !codeLikeRe.test(next) && next.length < 40 && !stopLabelRe.test(next)){
          val += ' ' + next.trim();
        }
        return val.replace(/\s{2,}/g,' ').trim();
      }
    }
    return null;
  };
  // igual ao getField, mas para campos de referência: se o valor vier vazio na mesma linha ("Rótulo :"),
  // pega a linha seguinte inteira (é onde o código longo aparece quebrado, ex: "Creditor transaction reference :\nNCOR2607...")
  const getRefField = (blockLines, re) => {
    for(let i=0;i<blockLines.length;i++){
      const m = blockLines[i].match(re);
      if(m){
        let val = (m[1]||'').trim();
        if(!val && blockLines[i+1] && !stopLabelRe.test(blockLines[i+1])) val = blockLines[i+1].trim();
        return val || null;
      }
    }
    return null;
  };

  const results=[];
  for(let k=0;k<headers.length;k++){
    const start = headers[k].start;
    const end = (k+1<headers.length) ? headers[k+1].start : lines.length;
    const header = headers[k].match;
    const dateStr = header[1];
    const [dd,mm,yyyy] = dateStr.split('/');
    const date = new Date(+yyyy, +mm-1, +dd);
    const amount = parseEuroNumber(header[4]);
    if(amount===null) continue;
    const sign = header[5];
    const type = (header[2]||'').trim();
    const blockLines = lines.slice(start, end);

    const beneficiary = getField(blockLines, /^Beneficiary:\s*(.+)$/i);
    const byOrderOf = getField(blockLines, /^By order of:\s*(.+)$/i);
    const remittance = getField(blockLines, /^Remittance Info:\s*(.+)$/i);
    const beneficiaryAccount = getRefField(blockLines, /^Beneficiary account:\s*(.*)$/i);
    const atBank = getRefField(blockLines, /^At:\s*(.*)$/i);
    const mandateRef = getRefField(blockLines, /^Mandate reference\s*:\s*(.*)$/i);
    const endToEnd = getRefField(blockLines, /^End-to-end Identification:\s*(.*)$/i);
    const ourRef = getRefField(blockLines, /^Our Reference:\s*(.*)$/i);

    let desc;
    if(sign === '+'){
      desc = byOrderOf || beneficiary || remittance || type || 'Movimento';
    } else {
      desc = beneficiary || byOrderOf || remittance || type || 'Movimento';
    }
    if(desc.length>90) desc = desc.slice(0,90).trim();

    const saida = sign==='-' ? Math.abs(amount) : null;
    const entrada = sign==='+' ? Math.abs(amount) : null;

    // Débito único da fatura do cartão (ex: "Monthly Visa payment") — já foi contado compra a compra ao importar
    // o "Card statement" do cartão; contar de novo aqui duplicaria o gasto. Ignora do somatório mas mantém visível.
    const isCardSettlement = /^(monthly\s+)?(visa|mastercard|card)\s+payment$/i.test(type);

    // Transferência para outra conta do próprio usuário (ex: BIL -> Revolut): o extrato BIL identifica o BANCO do
    // beneficiário (ex: "At: REVOLT21XXX - REVOLUT BANK UAB"), que é um sinal confiável — não é o merchant, é o
    // banco de destino de verdade. Se bater com o nome de outro Tipo de conta já cadastrado, é quase certo que é
    // uma transferência entre contas do usuário, não um gasto — evita contar como despesa.
    const crossAccountBank = (!isCardSettlement && !isInternalTransfer(desc))
      ? detectCrossAccountBank(`${atBank||''} ${beneficiary||''} ${byOrderOf||''}`, 'BIL')
      : null;

    const meta = {};
    if(type) meta.type = type;
    if(remittance) meta.remittance = remittance;
    if(beneficiary) meta.beneficiary = beneficiary;
    if(byOrderOf) meta.byOrderOf = byOrderOf;
    if(beneficiaryAccount) meta.beneficiaryAccount = beneficiaryAccount;
    if(atBank) meta.atBank = atBank;
    if(mandateRef) meta.mandateRef = mandateRef;
    if(endToEnd) meta.endToEnd = endToEnd;
    if(ourRef) meta.ourRef = ourRef;
    if(crossAccountBank) meta.transferToBank = crossAccountBank;
    if(isCardSettlement){
      for(const bl of blockLines){
        const s = bl.trim();
        if(/^\d{12,19}$/.test(s)) meta.cardNumber = s;
        else if(/^\d{2}\/\d{2}\/\d{4}$/.test(s) && s!==dateStr) meta.cardStatementDate = s;
      }
    }

    results.push({
      id: `${sourceName}-bil-${results.length}-${Math.random().toString(36).slice(2,6)}`,
      date, dateStr,
      desc,
      saida, entrada, balanco:null,
      amount: saida!=null ? Math.abs(saida) : 0,
      cat: isCardSettlement ? 'cartao' : (crossAccountBank || isInternalTransfer(desc) ? 'transferencia' : (saida!=null ? categorize(desc) : 'outros')),
      internal: isCardSettlement || !!crossAccountBank || isInternalTransfer(desc),
      cardSettlement: isCardSettlement, // débito único que quita a fatura do cartão — não contabilizado (evita duplicar as compras)
      autoTransfer: !!crossAccountBank, // detectado automaticamente pelo banco do beneficiário — usuário pode desfazer em Detalhes
      meta,
      source: sourceName
    });
  }
  return results;
}

// Marca todas as transações de um lote com a conta/banco de origem (usado no import e na edição em massa)
function tagBank(arr, bank){
  for(const t of arr){ if(bank) t.bank = bank; }
  return arr;
}
function extractTransactionsFromText(fullText, sourceName, structuredPages=null){
  // Fast path 0: extrato BIL (Banque Internationale à Luxembourg) ou fatura de cartão BIL — detectado pelo texto do documento
  const bankType = detectBankType(fullText);
  if(bankType==='BIL_CARD' && structuredPages && structuredPages.length > 3){
    try{
      // "Card statement at DD/MM/YYYY" — data em que a fatura fecha/é paga; usada como data de referência das transações
      let statementDate = null;
      const sm = fullText.match(/Card\s+statement\s+at\s+(\d{2})\/(\d{2})\/(\d{4})/i);
      if(sm) statementDate = new Date(+sm[3], +sm[2]-1, +sm[1]);
      const cardParsed = extractBILCardStatement(structuredPages, sourceName, statementDate);
      if(cardParsed.length > 0) return tagBank(cardParsed, 'BIL_CARD');
    }catch(e){ console.warn('BIL card parser failed', e); }
  }
  if(bankType==='BIL' && structuredPages && structuredPages.length > 3){
    try{
      const bilParsed = extractBILStatement(structuredPages, sourceName);
      if(bilParsed.length > 0) return tagBank(bilParsed, 'BIL');
    }catch(e){ console.warn('BIL parser failed', e); }
  }
  // Fast path 1: pasted pipe format ("Jul 1, 2026 | Merchant | €x | - | €y")
  if((fullText.match(/\|/g)||[]).length >= 5 && /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(fullText)){
    const piped = parsePipeStatement(fullText, sourceName);
    if(piped.length > 0) return tagBank(piped, bankType || 'REVOLUT');
  }
  // Fast path 2: REAL PDF with 5-column layout detected by X-position clustering
  if(structuredPages && structuredPages.length > 3){
    try{
      const colParsed = extractColumnStatement(structuredPages, sourceName);
      if(colParsed.length > 0) return tagBank(colParsed, bankType || 'REVOLUT');
    }catch(e){ console.warn('column parser failed', e); }
  }
  let norm = fullText.replace(/\u00A0/g,' ').replace(/EUR/gi,'€').replace(/\s+€/g,' €');
  const lines = norm.split(/\n/).map(l=>l.trim()).filter(Boolean);
  const results=[];
  const dateRe = /(\d{2}[\/\.\-]\d{2}[\/\.\-]\d{4}|\d{4}-\d{2}-\d{2})/;
  const parseDateEU = s => {
    if(!s) return null;
    let m;
    if(m=s.match(/(\d{2})\.(\d{2})\.(\d{4})/)) return new Date(m[3],m[2]-1,m[1]);
    if(m=s.match(/(\d{2})\/(\d{2})\/(\d{4})/)) return new Date(m[3],m[2]-1,m[1]);
    if(m=s.match(/(\d{2})-(\d{2})-(\d{4})/)) return new Date(m[3],m[2]-1,m[1]);
    if(m=s.match(/(\d{4})-(\d{2})-(\d{2})/)) return new Date(m[1],m[2]-1,m[3]);
    return parseDate(s);
  };
  // amount regex: captures numbers with 2 decimals, optional €/EUR/R$
  const amountRe = /-?\d{1,3}(?:[\.\s]\d{3})*[\.,]\d{2}/g;

  for(let i=0;i<lines.length;i++){
    let line = lines[i];
    // skip header lines — inclui termos em francês/alemão (bancos continentais, ex: BIL Luxembourg)
    if(/^(data|date|descri.*o|libell|communication|saída|saida|entrada|saldo|solde|balanço|balance|datum|beschreibung|ausgang|eingang|débit|debit|crédit|credit|valeur)/i.test(line) && line.length<80) continue;
    if(/^(página|page|total|extrato|kontoauszug|umsatz|relevé|releve|compte|solde final|solde initial)/i.test(line) && line.length<60) continue;

    const dateMatch = line.match(dateRe);
    if(!dateMatch) continue; // extrato lines must start with a date — this filters out junk

    const dateStr = dateMatch[0];
    const date = parseDateEU(dateStr) || parseDate(dateStr) || new Date();
    // remove date from line for further parsing
    let rest = line.replace(dateStr,'').trim();

    // collect all monetary amounts on this line
    const amounts = [];
    let m;
    amountRe.lastIndex=0;
    while((m=amountRe.exec(rest))!==null){
      const raw = m[0];
      // skip fragments that are part of date (already removed) — but safe check
      if(/\d{2}[\.\/]\d{2}[\.\/]/.test(raw)) continue;
      const n = parseEuroNumber(raw);
      if(n===null || Math.abs(n)<0.01) continue;
      // balances can be large but transaction amounts typically < 50000 — keep both
      if(Math.abs(n)>1000000) continue;
      amounts.push({raw, val: Math.abs(n), idx: m.index});
    }
    if(amounts.length===0) continue;

    // Heuristic for 5-col layout — now X-aware when structuredPages provided
    let saida=null, entrada=null, balanco=null;
    // Build X-aware amounts if we have structuredPages
    let amountsWithX=null;
    if(structuredPages){
      const sp = structuredPages.find(s=> s.text===line);
      if(sp){
        // find amount items by matching raw strings
        amountsWithX = amounts.map(a=>{
          // find item whose str contains this amount (or close)
          const item = sp.items.find(it=> it.str.includes(a.raw.replace(/\s/g,'')) || a.raw.includes(it.str)) || null;
          return {...a, x: item? item.x : null, pageWidth: sp.pageWidth};
        });
        // sort by X (left to right) — Saída left, Entrada middle, Saldo right
        const withX = amountsWithX.filter(a=>a.x!==null).sort((a,b)=>a.x-b.x);
        if(withX.length){
          // last is Saldo (rightmost)
          const w = withX[0].pageWidth || 550;
          // thresholds: <68% = Saída, 68-84% = Entrada, >84% = Saldo
          // For 2 amounts: left of 84% is transaction, right is Saldo
          // For 1 amount: decide by X
          if(withX.length===1){
            const a=withX[0];
            if(a.x > w*0.84) { balanco=a.val; }
            else if(a.x > w*0.68) { entrada=a.val; }
            else { saida=a.val; }
          } else if(withX.length===2){
            const left=withX[0], right=withX[1];
            balanco = right.val; // rightmost is always Saldo when 2 amounts
            if(left.x > w*0.68) entrada = left.val; else saida = left.val;
          } else if(withX.length>=3){
            // 3: Saída, Entrada, Saldo (in X order)
            balanco = withX[withX.length-1].val;
            // first two are Saída/Entrada (could be swapped but X tells)
            for(let k=0;k<withX.length-1;k++){
              const a=withX[k];
              if(a.x > w*0.68) { if(entrada===null) entrada=a.val; }
              else { if(saida===null) saida=a.val; }
            }
            // fallback if both ended same side: treat first as Saída, second as Entrada
            if(saida===null && entrada!==null && withX.length===3){ saida=withX[0].val; }
          }
          // if we classified via X, skip keyword fallback
          if(saida!==null || entrada!==null || balanco!==null){
            // success — skip old logic
          } else {
            // fallback to keyword logic below
            amountsWithX=null; // force fallback
          }
        }
      }
    }
    if(saida===null && entrada===null && balanco===null){
      // Fallback keyword/gap heuristic (when no X info or unstructured)
      if(amounts.length===1){
        const isEntradaHint = /(entrada|crédito|credito|reembolso|gutschrift|eingang|einnahme|salary|salário|ordenado|transfer.*receb)/i.test(rest);
        if(isEntradaHint) entrada = amounts[0].val; else saida = amounts[0].val;
      } else if(amounts.length===2){
        balanco = amounts[1].val;
        const candidate = amounts[0].val;
        const isEntradaHint = /(entrada|recebido|einnahme|gutschrift|salary|ordenado)/i.test(rest);
        // Also check gap: if there was double-space before amount, it was Entrada column
        const gapIsEntrada = line.includes('  ') && amounts[0].idx > line.indexOf('  ');
        if(isEntradaHint || gapIsEntrada) entrada = candidate; else saida = candidate;
      } else if(amounts.length>=3){
        balanco = amounts[amounts.length-1].val;
        saida = amounts[0].val;
        if(amounts.length===3) entrada = amounts[1].val;
        else entrada = amounts[amounts.length-2].val;
        if(entrada===saida) entrada=null;
      }
    }
    // Safety: if both saida and entrada filled with same value due to mis-parse, keep only one
    if(saida!==null && entrada!==null && saida===entrada && amounts.length===2){
      // likely only one column filled — decide by keyword
      const isEntradaHint = /(entrada|recebido|ordenado|salary)/i.test(rest);
      if(isEntradaHint){ saida=null; } else { entrada=null; }
    }

    // Build description: rest without amounts, trimmed
    let desc = rest;
    for(const a of amounts){ desc = desc.replace(a.raw,' '); }
    desc = desc.replace(/€|EUR|R\$/gi,' ').replace(/\s{2,}/g,' ').trim();
    desc = desc.replace(/^[-•·\s]+/,'').trim();
    if(desc.length<2) desc = 'Movimento';
    if(desc.length>90) desc = desc.slice(0,90).trim();
    if(/^[\d\s.,€\/\-]+$/.test(desc)) desc = 'Movimento';

    // amount for charts = Saída (expenses only). If only Entrada, amount=0 so it won't pollute expense charts
    const amount = saida || 0;

    results.push({
      id: `${sourceName}-${i}-${Math.random().toString(36).slice(2,6)}`,
      date, dateStr, desc,
      saida, entrada, balanco,
      amount,
      cat: saida ? categorize(desc) : 'outros',
      source: sourceName
    });
  }

  // Fallback: if we required date and found nothing (PDF without date column), use tolerant old extractor
  if(results.length===0){
    const valueRe = /(?:€\s*)?(-?\s*\d{1,3}(?:[.\s]\d{3})*[.,]\d{2})\s*(?:€|EUR)?/g;
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      if(line.length<10) continue;
      let mm; valueRe.lastIndex=0;
      while((mm=valueRe.exec(line))!==null){
        const n=parseEuroNumber(mm[1]); if(n===null) continue;
        if(Math.abs(n)<0.5 || Math.abs(n)>1000000) continue;
        results.push({
          id: `${sourceName}-fb-${i}-${mm.index}-${Math.random().toString(36).slice(2,4)}`,
          date: new Date(), dateStr:'', desc: line.replace(mm[0],'').slice(0,80)||'Despesa',
          saida: Math.abs(n), entrada:null, balanco:null, amount: Math.abs(n),
          cat: categorize(line), source: sourceName
        });
        if(results.length>=40) break;
      }
    }
  }

  // dedup
  const seen=new Set(); const dedup=[];
  for(const r of results){
    const k=transactionContentSignature(r);
    if(seen.has(k)) continue; seen.add(k); dedup.push(r);
  }
  return tagBank(dedup, bankType);
}
