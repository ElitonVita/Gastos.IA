// ---------- Relatório para impressão (A4, formato executivo) ----------
function getReportRows(){
  let rows = transactions.slice();
  if(activeCatFilter) rows = rows.filter(t=>t.cat===activeCatFilter);
  rows = rows.filter(inPeriod);
  const filterType=document.getElementById('filterType')?.value||'';
  if(filterType==='saida') rows = rows.filter(t=>t.saida!=null && t.saida>0);
  if(filterType==='entrada') rows = rows.filter(t=>t.entrada!=null && t.entrada>0);
  const filterBank=document.getElementById('filterBank')?.value||'';
  if(filterBank==='__none__') rows = rows.filter(t=>!t.bank);
  else if(filterBank) rows = rows.filter(t=>t.bank===filterBank);
  const q=(document.getElementById('searchTx')?.value||'').toLowerCase();
  if(q) rows = rows.filter(t=> (t.desc+' '+t.source+' '+catDisplayName(catById(t.cat))+' '+(t.saida||'')+' '+(t.entrada||'')).toLowerCase().includes(q));
  rows.sort((a,b)=> (b.realDate||b.date) - (a.realDate||a.date)); // ordena pela data real do gasto, não pela data de pagamento da fatura
  return rows;
}
function prKpiBox(label,val,color){
  return `<div style="border:1px solid #e4e4e7;border-radius:10px;padding:10px 12px;">
    <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#a1a1aa;">${label}</div>
    <div style="font-size:17px;font-weight:800;color:${color};margin-top:2px;">${val}</div>
  </div>`;
}
function buildPrintReport(){
  const rows = getReportRows(); // extrato: respeita todos os filtros da tabela (período, categoria, saída/entrada, busca)

  let periodLabel=t('filters.allPeriods');
  if(typeof periodFilter==='string' && /^\d{4}-\d{2}$/.test(periodFilter)) periodLabel = monthLabel(periodFilter);
  else if(typeof periodFilter==='string' && periodFilter.startsWith('year:')) periodLabel = periodFilter.slice(5);
  const catFilterLabel = activeCatFilter ? catDisplayName(catById(activeCatFilter)) : null;

  // resumo (KPIs, categoria, evolução, top estabelecimentos) segue período + categoria selecionada,
  // mas NÃO o filtro Saída/Entrada da tabela — senão "Entradas" sempre daria 0 com "Só Saídas" ativo
  const periodAll = transactions.filter(inPeriod);
  const summaryRows = activeCatFilter ? periodAll.filter(t=>t.cat===activeCatFilter) : periodAll;
  const totalSaida = summaryRows.filter(t=>t.saida && !t.internal).reduce((s,t)=>s+t.saida,0);
  const totalEntrada = summaryRows.filter(t=>t.entrada && !t.internal).reduce((s,t)=>s+t.entrada,0);
  const saldo = Math.round((totalEntrada-totalSaida)*100)/100;
  const savingsRate = totalEntrada>0 ? Math.round(saldo/totalEntrada*100) : null;

  // "Gasto por categoria" só faz sentido sem filtro de categoria (com filtro, seria 1 linha em 100%)
  const byCat={};
  periodAll.forEach(t=>{ if(t.saida && !t.internal) byCat[t.cat]=(byCat[t.cat]||0)+t.saida; });
  const catEntries=Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  const catTotal=catEntries.reduce((s,[,v])=>s+v,0);

  // evolução mensal e top estabelecimentos respeitam a categoria selecionada
  const byMonth={};
  summaryRows.forEach(t=>{ if(t.saida && !t.internal){ const k=monthKey(t.date); byMonth[k]=(byMonth[k]||0)+t.saida; } });
  const months=Object.keys(byMonth).sort();

  const byDesc={};
  summaryRows.forEach(t=>{ if(t.saida && !t.internal){ const k=t.desc.slice(0,40); byDesc[k]=(byDesc[k]||0)+t.saida; } });
  const topMerch=Object.entries(byDesc).sort((a,b)=>b[1]-a[1]).slice(0,8);

  const now = new Date();
  const genStr = now.toLocaleDateString('pt-BR')+' '+now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});

  document.getElementById('printReport').innerHTML = `
    <div style="max-width:800px;margin:0 auto;color:#18181b;">
      <div style="display:flex;align-items:center;gap:10px;border-bottom:3px solid #6366f1;padding-bottom:12px;margin-bottom:20px;">
        <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;">€</div>
        <div>
          <div style="font-size:18px;font-weight:800;">Gastos<span style="color:#7c3aed;">.AI</span> — ${t('printReport.subtitle')}</div>
          <div style="font-size:11px;color:#71717a;">${periodLabel}${catFilterLabel?t('printReport.categoryClause',{name:escapeHtml(catFilterLabel)}):''} · ${t('printReport.generated',{date:genStr})}</div>
        </div>
      </div>

      <div class="pr-avoid-break" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
        ${prKpiBox(t('printReport.kpis.totalExpenses'), fmtEUR(totalSaida), '#dc2626')}
        ${prKpiBox(t('printReport.kpis.income'), fmtEUR(totalEntrada), '#059669')}
        ${prKpiBox(t('printReport.kpis.balance'), fmtEUR(saldo), saldo>=0?'#059669':'#dc2626')}
        ${prKpiBox(t('printReport.kpis.savingsRate'), savingsRate!=null?`${savingsRate}%`:'—', (savingsRate!=null&&savingsRate>=0)?'#059669':'#dc2626')}
      </div>

      ${!activeCatFilter ? `
      <div class="pr-avoid-break" style="margin-bottom:20px;">
        <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#3f3f46;margin-bottom:8px;">${t('printReport.sections.byCategory')}</div>
        ${catEntries.map(([id,v])=>{
          const c=catById(id); const pct=catTotal>0?Math.round(v/catTotal*100):0;
          return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;font-size:11px;">
            <span style="width:10px;height:10px;border-radius:50%;background:${c.color};flex-shrink:0;"></span>
            <span style="width:150px;font-weight:600;">${escapeHtml(catDisplayName(c))}</span>
            <span style="flex:1;background:#f4f4f5;border-radius:4px;height:8px;overflow:hidden;"><span style="display:block;height:100%;width:${pct}%;background:${c.color};"></span></span>
            <span style="width:80px;text-align:right;font-weight:700;font-family:monospace;">${fmtEUR(v)}</span>
            <span style="width:36px;text-align:right;color:#71717a;">${pct}%</span>
          </div>`;
        }).join('') || `<p style="font-size:11px;color:#a1a1aa;">${t('printReport.noExpensesInPeriod')}</p>`}
      </div>` : ''}

      ${months.length>1 ? `
      <div class="pr-avoid-break" style="margin-bottom:20px;">
        <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#3f3f46;margin-bottom:8px;">${t('printReport.sections.monthlyEvolution')}</div>
        <table><thead><tr style="border-bottom:1px solid #e4e4e7;">
          ${months.map(m=>`<th style="text-align:right;padding:4px 8px;font-size:11px;color:#71717a;font-weight:600;">${monthLabel(m)}</th>`).join('')}
        </tr></thead><tbody><tr>
          ${months.map(m=>`<td style="text-align:right;padding:4px 8px;font-size:11px;font-weight:700;font-family:monospace;">${fmtEUR(byMonth[m])}</td>`).join('')}
        </tr></tbody></table>
      </div>` : ''}

      <div class="pr-avoid-break" style="margin-bottom:24px;">
        <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#3f3f46;margin-bottom:8px;">${t('printReport.sections.topMerchants')}</div>
        <table style="width:100%;">
          ${topMerch.map(([d,v])=>`<tr><td style="padding:3px 0;font-size:11px;">${escapeHtml(d)}</td><td style="text-align:right;padding:3px 0;font-size:11px;font-weight:700;font-family:monospace;">${fmtEUR(v)}</td></tr>`).join('') || `<tr><td style="font-size:11px;color:#a1a1aa;">${t('printReport.noData')}</td></tr>`}
        </table>
      </div>

      <div>
        <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#3f3f46;margin-bottom:8px;">${t('printReport.sections.statement', {count: rows.length, category: catFilterLabel?t('printReport.categoryClause',{name:escapeHtml(catFilterLabel)}):''})}</div>
        <table style="width:100%;">
          <thead><tr style="border-bottom:2px solid #27272a;">
            <th style="text-align:left;padding:5px 6px;font-size:10px;">${t('printReport.tableHeaders.date')}</th>
            <th style="text-align:left;padding:5px 6px;font-size:10px;">${t('printReport.tableHeaders.description')}</th>
            <th style="text-align:left;padding:5px 6px;font-size:10px;">${t('printReport.tableHeaders.category')}</th>
            <th style="text-align:right;padding:5px 6px;font-size:10px;color:#dc2626;">${t('printReport.tableHeaders.expense')}</th>
            <th style="text-align:right;padding:5px 6px;font-size:10px;color:#059669;">${t('printReport.tableHeaders.income')}</th>
          </tr></thead>
          <tbody>
            ${rows.map(t=>{
              const c=catById(t.cat);
              return `<tr style="border-bottom:1px solid #f4f4f5;">
                <td style="padding:4px 6px;font-size:10px;font-family:monospace;white-space:nowrap;">${(t.realDate||t.date).toLocaleDateString('pt-BR')}</td>
                <td style="padding:4px 6px;font-size:10px;">${escapeHtml(t.desc.slice(0,50))}</td>
                <td style="padding:4px 6px;font-size:10px;white-space:nowrap;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${c.color};margin-right:4px;"></span>${escapeHtml(catDisplayName(c))}</td>
                <td style="padding:4px 6px;font-size:10px;text-align:right;font-family:monospace;color:#dc2626;font-weight:600;">${t.saida?fmtEUR(t.saida):''}</td>
                <td style="padding:4px 6px;font-size:10px;text-align:right;font-family:monospace;color:#059669;font-weight:600;">${t.entrada?fmtEUR(t.entrada):''}</td>
              </tr>`;
            }).join('') || `<tr><td colspan="5" style="padding:12px 6px;font-size:11px;color:#a1a1aa;text-align:center;">${t('table.empty')}</td></tr>`}
          </tbody>
        </table>
      </div>

      <div style="margin-top:24px;padding-top:10px;border-top:1px solid #e4e4e7;font-size:10px;color:#a1a1aa;text-align:center;">
        ${t('printReport.footer', {date: genStr})}
      </div>
    </div>
  `;
}
document.getElementById('btnPrint')?.addEventListener('click', ()=>{
  if(!transactions.length){ alert(t('printReport.printWithoutDataAlert')); return; }
  buildPrintReport();
  setTimeout(()=>window.print(), 50);
});

