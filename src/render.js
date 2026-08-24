// ---------- Rendering ----------
let catChart, monthChart, merchantChart, histChart, trendChart, dowChart, compareChart, cashflowChart;

function renderCategoryChips(){
  if(typeof refreshPeriodOptions==='function') try{ refreshPeriodOptions(); }catch{}
  const wrap=document.getElementById('categoryChips');
  const sel=document.getElementById('filterCat');
  const mSel=document.getElementById('mCat');
  wrap.innerHTML=''; sel.innerHTML=`<option value="">${window.i18n.t('filters.allCategories')}</option>`; mSel.innerHTML='';
  categories.forEach(c=>{
    const active = activeCatFilter===c.id;
    const item=document.createElement('span');
    item.className='inline-flex items-center gap-1';
    const chip=document.createElement('button');
    chip.type='button';
    chip.className=`inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-xs font-bold border transition ${active?'text-white shadow-md':'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'}`;
    chip.style.background = active? c.color : '';
    chip.style.borderColor = active? c.color : c.color+'40';
    chip.innerHTML=`<span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0" style="background:${active?'rgba(255,255,255,0.25)':c.color};color:${active?'white':'white'}"><i class="${catIcon(c)}"></i></span>${escapeHtml(c.name)} <span class="opacity-60 font-mono">${transactions.filter(t=>t.cat===c.id).length||0}</span>`;
    chip.onclick=()=>{ activeCatFilter = activeCatFilter===c.id? null : c.id; renderCategoryChips(); renderTable(); updateCharts(); };
    item.appendChild(chip);
    const editBtn=document.createElement('button');
    editBtn.type='button';
    editBtn.title=window.i18n.t('common.editItemTitle', {name: escapeHtml(c.name)});
    editBtn.className='w-7 h-7 shrink-0 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-700 flex items-center justify-center text-[12px] transition';
    editBtn.innerHTML='<i class="ri-pencil-fill"></i>';
    editBtn.onclick=(e)=>{ e.stopPropagation(); openCategoryDialog(c.id); };
    item.appendChild(editBtn);
    wrap.appendChild(item);
    const o=document.createElement('option'); o.value=c.id; o.textContent=c.name;
    if(mSel) mSel.appendChild(o.cloneNode(true));
  });
  // filtro de categoria da tabela de transações — em ordem alfabética, separado da ordem dos chips
  [...categories].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).forEach(c=>{
    const o=document.createElement('option'); o.value=c.id; o.textContent=c.name;
    sel.appendChild(o);
  });
  sel.value = activeCatFilter||'';
  renderBudgetList();
}
function renderBudgetList(){
  const wrap=document.getElementById('budgetList');
  if(!wrap) return;
  const incomeInput = document.getElementById('incomeTargetInput');
  if(incomeInput && document.activeElement!==incomeInput) incomeInput.value = incomeTarget || '';
  wrap.innerHTML = categories.filter(c=>c.id!=='outros').map(c=>`
    <label class="flex items-center gap-3 py-1">
      <span class="flex items-center gap-2 flex-1 min-w-0 text-[13px] font-semibold">
        <span class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] text-white shrink-0" style="background:${c.color}"><i class="${catIcon(c)}"></i></span>
        <span class="truncate">${escapeHtml(c.name)}</span>
      </span>
      <span class="relative shrink-0 w-[110px]">
        <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400">€</span>
        <input type="number" min="0" step="10" data-budget="${c.id}" value="${c.budget||''}" placeholder="Sem meta" class="budgetInput w-full pl-6 pr-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400">
      </span>
    </label>
  `).join('');
  wrap.querySelectorAll('.budgetInput').forEach(inp=>{
    inp.addEventListener('change', e=>{
      const c=catById(e.target.dataset.budget);
      c.budget = Math.max(0, parseFloat(e.target.value)||0);
      e.target.value = c.budget || '';
      updateBudgetSummary();
      persistState(); updateCharts();
    });
  });
  updateBudgetSummary();
}
// Resumo do orçamento: soma de todas as metas por categoria, comparada com a meta de renda mensal —
// quanto já está comprometido e quanto ainda sobra, em € e em %.
function updateBudgetSummary(){
  const el = document.getElementById('budgetSummaryBox');
  if(!el) return;
  const budgeted = categories.filter(c=>c.budget>0);
  if(!budgeted.length){ el.innerHTML=''; return; }
  const totalBudget = Math.round(budgeted.reduce((s,c)=>s+c.budget,0)*100)/100;
  if(incomeTarget>0){
    const remaining = Math.round((incomeTarget-totalBudget)*100)/100;
    const pctUsed = Math.round(totalBudget/incomeTarget*100);
    const over = remaining<0;
    const remColor = over ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400';
    el.innerHTML = `<div class="grid grid-cols-3 gap-2 text-center">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wide text-zinc-500">${window.i18n.t('budget.summary.totalBudgeted')}</p>
        <p class="font-mono font-bold text-sm mt-0.5">${fmtEUR(totalBudget)}</p>
        <p class="text-[10px] text-zinc-500 mt-0.5">${window.i18n.t('budget.summary.pctOfIncomeText', {pct: pctUsed})}</p>
      </div>
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wide text-zinc-500">${window.i18n.t('budget.summary.incomeTarget')}</p>
        <p class="font-mono font-bold text-sm mt-0.5">${fmtEUR(incomeTarget)}</p>
        <p class="text-[10px] text-zinc-500 mt-0.5">100%</p>
      </div>
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wide ${remColor}">${over?window.i18n.t('budget.summary.shortfall'):window.i18n.t('budget.summary.remaining')}</p>
        <p class="font-mono font-bold text-sm mt-0.5 ${remColor}">${fmtEUR(Math.abs(remaining))}</p>
        <p class="text-[10px] ${remColor} mt-0.5">${window.i18n.t('budget.summary.pctFreeOrOverText', {pct: Math.abs(100-pctUsed), label: over ? window.i18n.t('budget.summary.beyondIncome') : window.i18n.t('budget.summary.free')})}</p>
      </div>
    </div>`;
  } else {
    el.innerHTML = `<div class="flex items-center justify-between text-xs">
        <span class="font-semibold flex items-center gap-1.5"><i class="ri-calculator-line text-zinc-400"></i> ${window.i18n.t('budget.summary.totalBudgeted')}</span>
        <span class="font-mono font-bold">${fmtEUR(totalBudget)}</span>
      </div>
      <p class="text-[10px] text-zinc-500 mt-1">${window.i18n.t('budget.summary.noIncomeTarget')}</p>`;
  }
}
document.getElementById('incomeTargetInput')?.addEventListener('change', e=>{
  incomeTarget = Math.max(0, parseFloat(e.target.value)||0) || null;
  e.target.value = incomeTarget || '';
  updateBudgetSummary();
  persistState(); updateCharts();
});

let periodFilter=''; // '' = todos | 'YYYY-MM' mês | '2026-01:2026-03' range | 'year:2026' ano inteiro
function refreshPeriodOptions(){
  const months=[...new Set(transactions.map(t=>monthKey(t.date)))].sort().reverse();
  const sels=[document.getElementById('filterPeriod'), document.getElementById('filterPeriodTop')].filter(Boolean);
  for(const sel of sels){
    const cur=periodFilter;
    sel.innerHTML=`<option value="">${window.i18n.t('filters.allPeriods')}</option>`;
    for(const m of months){
      const o=document.createElement('option');
      o.value=m; o.textContent=monthLabel(m);
      sel.appendChild(o);
    }
    sel.value = months.includes(cur)? cur : '';
  }
  // chips
  const chipWrap=document.getElementById('periodChips');
  if(chipWrap){
    chipWrap.innerHTML='';
    const mk=(label,val,title)=>{
      const b=document.createElement('button');
      b.className='periodChip px-3 py-1.5 rounded-lg text-xs font-bold transition '+(periodFilter===val?'bg-white dark:bg-zinc-700 shadow-sm text-violet-600 dark:text-violet-300':'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200');
      b.dataset.period=val; b.textContent=label; if(title) b.title=title;
      b.onclick=()=>setPeriod(val);
      chipWrap.appendChild(b);
    };
    mk(window.i18n.t('filters.periodChips.all'),'');
    const years=[...new Set(transactions.map(t=>t.date.getFullYear()))].sort((a,b)=>b-a);
    for(const y of years) mk(String(y), `year:${y}`, window.i18n.t('filters.yearOf', {year: y}));
    const recentMonths=months.slice(0,3);
    for(const m of recentMonths) mk(monthLabel(m), m);
    if(periodFilter && periodFilter!=='' && !periodFilter.startsWith('year:') && !recentMonths.includes(periodFilter)) mk(monthLabel(periodFilter), periodFilter);
  }
}
function setPeriod(v){
  periodFilter=v||'';
  currentPage=1;
  refreshPeriodOptions(); renderTable(); updateCharts();
}
function inPeriod(t){
  if(!periodFilter || periodFilter==='') return true;
  if(periodFilter.startsWith('year:')) return t.date.getFullYear()===Number(periodFilter.slice(5));
  const k=monthKey(t.date);
  if(periodFilter.includes(':')){
    const [a,b]=periodFilter.split(':');
    return (!a||k>=a)&&(!b||k<=b);
  }
  return k===periodFilter;
}
function updateSelectAllState(pageIds){
  const cb = document.getElementById('selectAllTx');
  if(!cb) return;
  if(pageIds.length===0){ cb.checked=false; cb.indeterminate=false; return; }
  const selectedCount = pageIds.filter(id=>selectedTxIds.has(id)).length;
  cb.checked = selectedCount===pageIds.length;
  cb.indeterminate = selectedCount>0 && selectedCount<pageIds.length;
}
function renderBulkBar(){
  const bar=document.getElementById('bulkBar');
  if(!bar) return;
  const n=selectedTxIds.size;
  bar.classList.toggle('hidden', n===0);
  const countEl=document.getElementById('bulkCount'); if(countEl) countEl.textContent=n;
  const catSel=document.getElementById('bulkCatSelect');
  if(catSel) catSel.innerHTML = `<option value="">${window.i18n.t('actions.bulkCategory')}</option>` + categories.map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  const bankSel=document.getElementById('bulkBankSelect');
  if(bankSel) bankSel.innerHTML = `<option value="">${window.i18n.t('actions.bulkBank')}</option>` + bankTypes.map(b=>`<option value="${b.id}">${escapeHtml(b.name)}</option>`).join('');
}
function renderTable(){
  // remove da seleção ids que não existem mais (ex: após restaurar backup)
  const liveIds = new Set(transactions.map(t=>t.id));
  for(const id of Array.from(selectedTxIds)) if(!liveIds.has(id)) selectedTxIds.delete(id);

  const q=(document.getElementById('searchTx').value||'').toLowerCase();
  const filterType=document.getElementById('filterType')?.value||'';
  const filterBank=document.getElementById('filterBank')?.value||'';
  const body=document.getElementById('txBody');
  const empty=document.getElementById('emptyTx');
  const footer=document.getElementById('txFooter');
  let rows = transactions.slice();
  if(activeCatFilter) rows = rows.filter(t=>t.cat===activeCatFilter);
  rows = rows.filter(inPeriod);
  if(filterType==='saida') rows = rows.filter(t=>t.saida!=null && t.saida>0);
  if(filterType==='entrada') rows = rows.filter(t=>t.entrada!=null && t.entrada>0);
  if(filterBank==='__none__') rows = rows.filter(t=>!t.bank);
  else if(filterBank) rows = rows.filter(t=>t.bank===filterBank);
  if(q) rows = rows.filter(t=> (t.desc+' '+t.source+' '+catById(t.cat).name+' '+(t.saida||'')+' '+(t.entrada||'')).toLowerCase().includes(q));
  // ordenação clicável pelos títulos das colunas (data, descrição, saída, entrada, categoria) — tableSort guarda a escolha atual
  const sortComparators = {
    date: (a,b)=> (a.realDate||a.date) - (b.realDate||b.date), // data real do gasto, não a data de pagamento da fatura
    desc: (a,b)=> (a.desc||'').localeCompare(b.desc||'','pt-BR'),
    saida: (a,b)=> (a.saida||0) - (b.saida||0),
    entrada: (a,b)=> (a.entrada||0) - (b.entrada||0),
    cat: (a,b)=> catById(a.cat).name.localeCompare(catById(b.cat).name,'pt-BR'),
  };
  const sortCmp = sortComparators[tableSort.key] || sortComparators.date;
  rows.sort((a,b)=> tableSort.dir==='asc' ? sortCmp(a,b) : -sortCmp(a,b));
  document.querySelectorAll('.sortArrow').forEach(el=>{
    el.textContent = tableSort.key===el.dataset.key ? (tableSort.dir==='asc'?'▲':'▼') : '';
  });
  const totalRows = rows.length;
  document.getElementById('txCount').textContent = totalRows;
  if(totalRows===0){
    body.innerHTML=''; empty.classList.remove('hidden'); footer.classList.add('hidden');
    updateSelectAllState([]); renderBulkBar();
    return;
  }
  empty.classList.add('hidden');
  // pagination
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  if(currentPage>totalPages) currentPage=totalPages;
  const start = (currentPage-1)*PAGE_SIZE;
  const pageRows = rows.slice(start, start+PAGE_SIZE);
  body.innerHTML = pageRows.map(t=>{
    const c=catById(t.cat);
    const d=(t.realDate||t.date).toLocaleDateString('pt-BR'); // mostra a data real do gasto (mesmo quando t.date é a data de pagamento da fatura)
    const saidaStr = t.saida!=null ? fmtEUR(t.saida) : '<span class="text-zinc-300">—</span>';
    const entradaStr = t.entrada!=null ? fmtEUR(t.entrada) : '<span class="text-zinc-300">—</span>';
    const hasValue = (t.saida!=null && t.saida>0) || (t.entrada!=null && t.entrada>0);
    // mostra o seletor de categoria pra saída e entrada — inclusive já marcadas como "Transferência interna" manualmente,
    // pra dar pra reverter direto aqui. Só fica de fora quem tem fluxo próprio: fatura consolidada e par já vinculado.
    const needCat = hasValue && !t.cardSettlement && !t.transferLinked;
    // "Cartão BIL"/tipo de conta já aparece discreto embaixo da descrição (bankBadge) — aqui só sinaliza o que é
    // relevante além disso: a fatura consolidada não contabilizada, uma transferência entre contas, ou uma transferência interna comum.
    const intBadge = t.cardSettlement
      ? ` <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold align-middle" title="${window.i18n.t('table.cardSettlementTitleText')}"><i class="ri-bank-card-fill"></i> ${window.i18n.t('table.cardSettlementText')}</span>`
      : (t.transferLinked
        ? ` <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold align-middle" title="${window.i18n.t('table.transferBetweenAccountsTitleText')}"><i class="ri-arrow-left-right-line"></i> ${window.i18n.t('table.transferBetweenAccountsText')}</span>`
        : (t.autoTransfer
          ? ` <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-dashed border-cyan-300 dark:border-cyan-800 text-[10px] font-bold align-middle" title="${window.i18n.t('table.possibleTransferTitleText', {bank: escapeHtml(bankLabel(t.meta&&t.meta.transferToBank))})}"><i class="ri-arrow-left-right-line"></i> ${window.i18n.t('table.possibleTransferText')}</span>`
          : (t.internal ? ` <span class="inline-flex items-center px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold align-middle" title="${window.i18n.t('table.internalTransferTitleText')}">${window.i18n.t('table.internalTransferText')}</span>` : '')));
    const bankBadge = t.bank ? `<div class="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 mt-0.5"><i class="${bankIcon(t.bank)}"></i> ${escapeHtml(bankLabel(t.bank))}</div>` : '';
    return `<tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition ${t.internal?'opacity-70':''} ${selectedTxIds.has(t.id)?'bg-violet-50 dark:bg-violet-950/30':''}">
      <td class="px-3 py-2.5 text-center"><input type="checkbox" class="rowSelect rounded border-zinc-300 dark:border-zinc-600 text-violet-600 focus:ring-violet-500/40" data-select="${t.id}" ${selectedTxIds.has(t.id)?'checked':''}></td>
      <td class="px-4 py-2.5 font-mono text-xs whitespace-nowrap">${d}</td>
      <td class="px-3 py-2.5"><div class="font-medium text-[13px] leading-tight line-clamp-2" title="${escapeHtml(t.desc)}">${escapeHtml(t.desc)}${intBadge}</div>${t.note?`<div class="text-[11px] text-amber-600 dark:text-amber-400 italic mt-0.5 flex items-center gap-1"><i class="ri-sticky-note-line"></i>${escapeHtml(t.note)}</div>`:''}${bankBadge}</td>
      <td class="px-3 py-2.5 text-right font-bold font-mono text-[13px] whitespace-nowrap ${t.saida?'text-red-600 dark:text-red-400':''}">${saidaStr}</td>
      <td class="px-3 py-2.5 text-right font-bold font-mono text-[13px] whitespace-nowrap ${t.entrada?'text-emerald-600 dark:text-emerald-400':''}">${entradaStr}</td>
      <td class="px-3 py-2.5">
        ${needCat ? `<select data-id="${t.id}" class="catSelect w-full text-[11px] font-bold px-2 py-1 rounded-full border text-white shadow-sm" style="background:${c.color};border-color:${c.color}">
          ${categories.map(cc=>`<option value="${cc.id}" ${cc.id===t.cat?'selected':''} style="color:#111">${cc.name}</option>`).join('')}
        </select>` : `<span class="text-[11px] text-zinc-400">—</span>`}
      </td>
      <td class="px-4 py-2.5">
        <div class="flex items-center justify-end gap-1">
          <button title="${window.i18n.t('table.swapTitle')}" data-swap="${t.id}" class="swapBtn w-6 h-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-[11px] hover:bg-zinc-50 dark:hover:bg-zinc-700" style="display:${(t.saida||t.entrada)?'flex':'none'}"><i class="ri-swap-line"></i></button>
          <button title="${window.i18n.t('table.noteTitle')}" data-note="${t.id}" class="noteBtn w-6 h-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-[11px] hover:bg-zinc-50 dark:hover:bg-zinc-700 ${t.note?'text-amber-500 border-amber-300':''}"><i class="ri-sticky-note-line"></i></button>
          <button title="${window.i18n.t('table.detailsTitle')}" data-details="${t.id}" class="detailsBtn w-6 h-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-[11px] hover:bg-zinc-50 dark:hover:bg-zinc-700"><i class="ri-information-line"></i></button>
          <button title="${window.i18n.t('table.deleteTitle')}" data-del="${t.id}" class="delBtn w-6 h-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-[11px] text-zinc-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-900 transition"><i class="ri-delete-bin-line"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
  body.querySelectorAll('.detailsBtn').forEach(b=>{
    b.addEventListener('click', e=>{
      const id=e.currentTarget.dataset.details;
      const tx=transactions.find(x=>x.id===id); if(!tx) return;
      openDetailsDialog(tx);
    });
  });
  body.querySelectorAll('.noteBtn').forEach(b=>{
    b.addEventListener('click', e=>{
      const id=e.currentTarget.dataset.note;
      const tx=transactions.find(x=>x.id===id); if(!tx) return;
      openNoteDialog(tx);
    });
  });
  body.querySelectorAll('.swapBtn').forEach(b=>{
    b.addEventListener('click', e=>{
      const id=e.currentTarget.dataset.swap; const tx=transactions.find(x=>x.id===id); if(!tx) return;
      // swap saida/entrada
      const tmp=tx.saida; tx.saida=tx.entrada; tx.entrada=tmp;
      tx.amount = tx.saida||0;
      // fix cat: if now entrada (no saida) set to outros, if now saida restore categorization
      if(tx.saida && tx.cat==='outros') tx.cat=categorize(tx.desc);
      if(!tx.saida) tx.cat='outros';
      currentPage=1; renderTable(); renderCategoryChips(); updateCharts(); updateKPIs(); persistState();
    });
  });
  body.querySelectorAll('.delBtn').forEach(b=>{
    b.addEventListener('click', e=>{
      const id=e.currentTarget.dataset.del; const tx=transactions.find(x=>x.id===id); if(!tx) return;
      if(!confirm(window.i18n.t('table.deleteConfirm', {desc: tx.desc, date: (tx.realDate||tx.date).toLocaleDateString('pt-BR'), value: fmtEUR(tx.saida||tx.entrada||0)}))) return;
      transactions = transactions.filter(x=>x.id!==id);
      selectedTxIds.delete(id);
      renderTable(); renderCategoryChips(); updateCharts(); updateKPIs(); persistState();
    });
  });
  body.querySelectorAll('.catSelect').forEach(s=>{
    s.addEventListener('change', e=>{
      const id=e.target.dataset.id; const v=e.target.value;
      const tx=transactions.find(x=>x.id===id); if(!tx) return;
      tx.cat=v;
      if(v==='transferencia'){
        // marca manualmente como transferência interna (saída OU entrada) — some dos totais em todo o app,
        // do jeito que a auto-detecção de "possível transferência" já faz, sem precisar casar as duas pontas.
        tx.internal = true;
      } else if(tx.internal){
        // usuário tirou manualmente de "Transferência interna" (ou corrigiu uma detecção automática errada) — volta a contar normalmente
        tx.internal = false;
        if(tx.autoTransfer){ tx.autoTransfer = false; if(tx.meta) delete tx.meta.transferToBank; }
      }
      renderTable(); renderCategoryChips(); updateKPIs(); updateCharts(); persistState();
      applySameDescription(tx);
    });
  });
  body.querySelectorAll('.rowSelect').forEach(cb=>{
    cb.addEventListener('change', e=>{
      const id=e.target.dataset.select;
      if(e.target.checked) selectedTxIds.add(id); else selectedTxIds.delete(id);
      e.target.closest('tr')?.classList.toggle('bg-violet-50', e.target.checked);
      e.target.closest('tr')?.classList.toggle('dark:bg-violet-950/30', e.target.checked);
      updateSelectAllState(pageRows.map(r=>r.id));
      renderBulkBar();
    });
  });
  updateSelectAllState(pageRows.map(r=>r.id));
  renderBulkBar();
  // footer pagination
  footer.classList.remove('hidden');
  const realSaidas = rows.filter(r=>r.saida && !r.internal);
  const saidaSum = realSaidas.reduce((s,r)=>s+r.saida,0);
  const entradaSum = rows.filter(r=>r.entrada && !r.internal).reduce((s,r)=>s+r.entrada,0);
  const transfSum = rows.filter(r=>r.internal && r.saida).reduce((s,r)=>s+r.saida,0);
  // com uma categoria filtrada, mostra também a média mensal (gasto/entrada dividido pelos meses com movimento
  // nessa categoria) — dá o "quanto por mês em média" que o total sozinho não mostra
  let avgLabel = '';
  if(activeCatFilter){
    const catMonths = new Set(rows.map(r=>monthKey(r.date))).size;
    if(catMonths>0 && (saidaSum>0 || entradaSum>0)){
      const parts = [];
      if(saidaSum>0) parts.push(`<span class="text-red-600 font-bold">${fmtEUR(saidaSum/catMonths)}</span>`);
      if(entradaSum>0) parts.push(`<span class="text-emerald-600 font-bold">${fmtEUR(entradaSum/catMonths)}</span>`);
      const monthWord = catMonths===1 ? window.i18n.t('table.monthWordSingular') : window.i18n.t('table.monthWordPlural');
      avgLabel = ` · <span title="${window.i18n.t('table.avgPerMonthTitle', {n: catMonths, monthWord})}">${window.i18n.t('table.avgPerMonthLabel')}${parts.join(' / ')}</span>`;
    }
  }
  document.getElementById('txSummary').innerHTML = `<span class="font-semibold">${window.i18n.t('table.summaryMovements', {n: totalRows})}</span> · ${window.i18n.t('table.summaryRealExpenses')}: <span class="text-red-600 font-bold">${fmtEUR(saidaSum)}</span> · ${window.i18n.t('table.summaryIncome')}: <span class="text-emerald-600 font-bold">${fmtEUR(entradaSum)}</span>${transfSum?` · <span title="${window.i18n.t('table.summaryInternalTransfersTitle')}">${window.i18n.t('table.summaryInternalTransfers')}: ${fmtEUR(transfSum)}</span>`:''}${avgLabel}`;
  document.getElementById('pageInfo').textContent = window.i18n.t('table.pageInfoText', {current: currentPage, total: totalPages});
  document.getElementById('prevPage').disabled = currentPage<=1;
  document.getElementById('nextPage').disabled = currentPage>=totalPages;
}
function escapeHtml(s){ return s.replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// Saldo atual "de verdade": pega o Saldo que o próprio extrato bancário informa (coluna Saldo/Balanço,
// já capturada por transação) e usa o mais recente por conta — não depende de somar entradas/saídas
// nem de ter todo o histórico importado, então não é afetado por um extrato começar no meio do caminho.
// Contas de cartão de crédito ficam de fora: o "saldo" delas é fatura/dívida, não dinheiro disponível.
// Saldo atual = saldo inicial (Configurações → Saldo inicial, ou uma entrada manual lançada antes do
// 1º extrato) + entradas − saídas reais de TODO o histórico (sem filtro de período, sem transferências
// internas). Não usa o Saldo que vem do próprio extrato bancário — ele ignora subcontas/poupança que o
// banco não lista nas mesmas linhas (ex: pockets da Revolut, poupança da BIL), então nunca bate com o real.
function computeCurrentBalance(){
  const base = (openingBalance && openingBalance.value!=null) ? openingBalance.value : 0;
  let inc=0, exp=0;
  transactions.forEach(t=>{
    if(t.internal) return;
    if(t.entrada) inc+=t.entrada;
    if(t.saida) exp+=t.saida;
  });
  const total = Math.round((base+inc-exp)*100)/100;
  return { total, base, inc:Math.round(inc*100)/100, exp:Math.round(exp*100)/100 };
}
function updateKPIs(){
  const scoped = typeof inPeriod==='function' ? transactions.filter(inPeriod) : transactions;
  // Saldo atual não respeita o filtro de período — é sempre "quanto eu tenho hoje" (saldo inicial + entradas − saídas de todo o histórico)
  {
    const bal = computeCurrentBalance();
    const el=document.getElementById('kpiBalance'), subEl=document.getElementById('kpiBalanceSub');
    if(el && subEl){
      el.textContent = fmtEUR(bal.total);
      subEl.textContent = (openingBalance && openingBalance.value!=null)
        ? window.i18n.t('kpis.balanceSubWithOpening', {value: fmtEUR(bal.base), date: openingBalance.date.toLocaleDateString('pt-BR')})
        : window.i18n.t('kpis.balanceSubDefault');
    }
  }
  const saidas = scoped.filter(t=>t.saida!=null && !t.internal);
  const total = saidas.reduce((s,t)=>s+(t.saida||0),0);
  const avg = saidas.length? total/saidas.length : 0;
  document.getElementById('kpiTotal').textContent = fmtEUR(total);
  const saidasCount = scoped.filter(t=>t.saida && !t.internal).length;
  const entradasCount = scoped.filter(t=>t.entrada && !t.internal).length;
  const transfCount = scoped.filter(t=>t.internal).length;
  const transfClause = transfCount ? window.i18n.t('kpis.countTransfersClause', {n: transfCount}) : '';
  document.getElementById('kpiCount').textContent = window.i18n.t('kpis.countBreakdown', {expenses: saidasCount, income: entradasCount, transfers: transfClause, files: new Set(transactions.map(t=>t.source)).size});
  document.getElementById('kpiAvg').textContent = fmtEUR(avg);
  // top category
  const byCat={}; scoped.forEach(t=>{ if(t.saida && !t.internal) byCat[t.cat]=(byCat[t.cat]||0)+t.saida; });
  const top = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];
  if(top){
    const c=catById(top[0]);
    document.getElementById('kpiTopCat').innerHTML = `<span class="inline-flex w-5 h-5 rounded-full items-center justify-center text-[10px] text-white align-middle mr-1" style="background:${c.color}"><i class="${catIcon(c)}"></i></span>${escapeHtml(c.name)}`;
    document.getElementById('kpiTopCatVal').textContent = window.i18n.t('kpis.topCategoryValueText', {value: fmtEUR(top[1]), pct: Math.round(top[1]/total*100)});
    document.getElementById('kpiInsight').textContent = window.i18n.t('kpis.insightMainText', {cat: c.name});
    document.getElementById('kpiInsightSub').textContent = window.i18n.t('kpis.insightSubText', {value: fmtEUR(top[1]), pct: Math.round(top[1]/total*100)});
  } else {
    document.getElementById('kpiTopCat').textContent='—';
    document.getElementById('kpiTopCatVal').textContent='—';
    document.getElementById('kpiInsight').textContent=window.i18n.t('kpis.insightDefault');
    document.getElementById('kpiInsightSub').textContent='';
  }
  // taxa de poupança: (entradas - saídas reais) / entradas, sem transferências internas
  const income = scoped.filter(t=>t.entrada && !t.internal).reduce((s,t)=>s+t.entrada,0);
  const saved = income - total;
  const kpiSavingsEl=document.getElementById('kpiSavings'), kpiSavingsSubEl=document.getElementById('kpiSavingsSub');
  if(kpiSavingsEl && kpiSavingsSubEl){
    if(income>0){
      const rate = Math.round(saved/income*100);
      kpiSavingsEl.textContent = `${rate}%`;
      kpiSavingsEl.className = 'font-extrabold text-2xl tracking-tight mt-1 ' + (rate>=0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400');
      kpiSavingsSubEl.textContent = rate>=0 ? window.i18n.t('kpis.savedText', {value: fmtEUR(saved)}) : window.i18n.t('kpis.overspentText', {value: fmtEUR(Math.abs(saved))});
    } else {
      kpiSavingsEl.textContent = '—';
      kpiSavingsEl.className = 'font-extrabold text-2xl tracking-tight mt-1';
      kpiSavingsSubEl.textContent = window.i18n.t('kpis.noIncome');
    }
  }
}

function ensureCharts(){
  const catCtx=document.getElementById('catChart');
  const monthCtx=document.getElementById('monthChart');
  const merchCtx=document.getElementById('merchantChart');
  const histCtx=document.getElementById('histChart');
  Chart.defaults.font.family='Inter';
  Chart.defaults.color='#71717a';
  if(catChart) catChart.destroy();
  if(monthChart) monthChart.destroy();
  if(merchantChart) merchantChart.destroy();
  if(histChart) histChart.destroy();

  catChart = new Chart(catCtx, { type: chartMode==='doughnut'?'doughnut':'bar', data:{labels:[],datasets:[]}, options: catOptions() });
  monthChart = new Chart(monthCtx, { type:'line', data:{labels:[],datasets:[]}, options: monthOptions() });
  merchantChart = new Chart(merchCtx, { type:'bar', data:{labels:[],datasets:[]}, options: merchantOptions() });
  histChart = new Chart(histCtx, { type:'bar', data:{labels:[],datasets:[]}, options: histOptions() });
  if(trendChart) trendChart.destroy();
  trendChart = new Chart(document.getElementById('trendChart'), { type:'line', data:{labels:[],datasets:[]}, options: monthOptions() });
  if(dowChart) dowChart.destroy();
  dowChart = new Chart(document.getElementById('dowChart'), { type:'bar', data:{labels:['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],datasets:[]}, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{callbacks:{label:(c)=>` ${fmtEUR(c.parsed.y)}`}}}, scales:{ x:{grid:{display:false}}, y:{grid:{color:'rgba(128,128,128,0.18)'}, ticks:{callback:v=>'€ '+v}} } } });
  if(compareChart) compareChart.destroy();
  compareChart = new Chart(document.getElementById('compareChart'), { type: compareMode==='lines'?'line':'bar', data:{labels:[],datasets:[]}, options:compareOptions() });
  if(cashflowChart) cashflowChart.destroy();
  cashflowChart = new Chart(document.getElementById('cashflowChart'), { type: cashflowMode==='monthly'?'bar':'line', data:{labels:[],datasets:[]}, options:cashflowOptions() });
}
// Usada só pelos modos Barras/Linhas — Orçamento agora renderiza HTML/CSS próprio (#budgetProgressList),
// não Chart.js, então não precisa mais do indexAxis/scales alternativos que existiam aqui pra ele.
function compareOptions(){
  return {
    responsive:true, maintainAspectRatio:false,
    interaction: compareMode==='lines' ? { mode:'index', intersect:false } : undefined,
    plugins:{
      legend:{display:false}, // legenda própria em #compareLegend — mais compacta e clicável
      tooltip:{ callbacks:{ label:(c)=>` ${c.dataset.label}: ${fmtEUR(c.parsed.y)}` } }
    },
    scales: {
      x:{ grid:{display: compareMode==='lines', color:'rgba(128,128,128,0.10)'}, ticks:{font:{size:11, weight:'600'}} },
      y:{ grid:{color:'rgba(128,128,128,0.18)'}, ticks:{callback:v=>'€ '+v} }
    }
  };
}
function cashflowOptions(){
  const isMonthly = cashflowMode==='monthly';
  return {
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{display:false},
      tooltip:{ callbacks:{ label:(c)=>` ${fmtEUR(c.parsed.y)}` } }
    },
    scales:{
      x:{ grid:{display:false}, ticks:{font:{size:11}} },
      y:{ grid:{color:'rgba(128,128,128,0.18)'}, ticks:{callback:v=>'€ '+v} }
    },
    elements:{ line:{ tension:0.3, borderWidth:2.5 }, point:{ radius:3, hitRadius:12 } }
  };
}
window._toggleCompareDataset=(i)=>{
  if(compareChart.isDatasetVisible(i)) compareChart.hide(i); else compareChart.show(i);
  renderCompareLegend();
};
function renderCompareLegend(){
  // legenda compacta, clicável para isolar categoria (funciona nos dois modos)
  const cLegend=document.getElementById('compareLegend');
  if(!cLegend || !compareChart) return;
  cLegend.innerHTML = compareChart.data.datasets.map((d,i)=>{
    const off=!compareChart.isDatasetVisible(i);
    const color=d.backgroundColor||d.borderColor;
    const icon = d.catId ? catIcon(catById(d.catId)) : null;
    return `<button onclick="window._toggleCompareDataset(${i})" class="flex items-center gap-1.5 text-[11px] font-semibold transition ${off?'opacity-35':''}">
      <span class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white shrink-0" style="background:${color}">${icon?`<i class="${icon}"></i>`:''}</span>${escapeHtml(d.label)}
    </button>`;
  }).join('');
}
function catOptions(){
  const isWaterfall = chartMode==='waterfall';
  return {
    responsive:true, maintainAspectRatio:false,
    cutout: chartMode==='doughnut'?'62%':undefined,
    plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:(c)=>{
        if(isWaterfall){ const [lo,hi]=c.raw; return ` ${c.label}: ${fmtEUR(Math.abs(hi-lo))}`; }
        const v = typeof c.parsed==='object' ? (chartMode==='bar' ? c.parsed.y : c.parsed) : c.parsed;
        const total = c.dataset.data.reduce((a,b)=>a+(typeof b==='number'?b:0),0);
        const pct = total>0 ? Math.round(v/total*100) : 0;
        return ` ${c.label}: ${fmtEUR(v)} (${pct}%)`;
    } } } },
    scales: (chartMode==='bar'||isWaterfall)? { x:{ grid:{display:false}, ticks:{ font:{size:isWaterfall?10:11}} }, y:{ grid:{color:'rgba(128,128,128,0.18)'}, ticks:{ callback:(v)=>fmtEUR(v) } } } : undefined,
    onClick:(e, els)=>{ if(els.length){ const idx=els[0].index; const id=catChart.data.ids[idx]; if(!id) return; activeCatFilter = activeCatFilter===id? null : id; renderCategoryChips(); renderTable(); } }
  };
}
function monthOptions(){
  return {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:(c)=>` ${fmtEUR(c.parsed.y)}` } } },
    scales:{
      x:{ grid:{display:false}, ticks:{ font:{size:11}} },
      y:{ grid:{color:'rgba(128,128,128,0.18)'}, ticks:{ callback:(v)=>'€ '+v } }
    },
    elements:{ line:{ tension:0.35, borderWidth:2.5 }, point:{ radius:4, hitRadius:12 } }
  };
}
function merchantOptions(){
  return {
    indexAxis:'y', responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:(c)=>` ${fmtEUR(c.parsed.x)}` } } },
    scales:{
      x:{ grid:{color:'rgba(128,128,128,0.18)'}, ticks:{ callback:(v)=>'€ '+v } },
      y:{ grid:{display:false}, ticks:{ font:{size:11}, autoSkip:false } }
    }
  };
}
function histOptions(){
  return {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{ callbacks:{ title:(a)=>`Faixa ${a[0].label}`, label:(c)=>` ${c.parsed.y} transações` } } },
    scales:{
      x:{ grid:{display:false}, ticks:{ font:{size:10}, maxRotation:0 } },
      y:{ grid:{color:'rgba(128,128,128,0.18)'}, ticks:{ stepSize:1 } }
    }
  };
}

const dayKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

// Detecta gastos "estranhos" dentro do período filtrado (txP já vem sem transferências para saída/entrada nas chamadas):
//  1) cobrança idêntica (mesma descrição + mesmo valor) repetida no mesmo dia — possível duplicidade
//  2) cobrança idêntica repetida em poucos dias (<=3) — possível cobrança duplicada não detectada acima
//  3) valor muito acima do habitual para aquele mesmo estabelecimento (z-score sobre o próprio histórico)
//  4) valor muito acima da média geral de gastos do período (outlier global)
//  5) dia com soma de gastos muito acima da média diária do período (pico de gastos no dia)
// Assinatura de CONTEÚDO de uma transação (desc + valor + dia) — ao contrário de t.id, não muda quando a
// página recarrega: transações restauradas do localStorage/gastos-data.json ganham um id novo a cada carga
// (applyState), então usar t.id no "aid" fazia todo gasto estranho já resolvido reaparecer no refresh seguinte.
function txSignature(t){
  return `${normalizeDescKey(t.desc)}#${Math.round((t.saida||t.entrada||0)*100)}#${dayKey(t.date)}`;
}
function anomalyId(type, txs, date){
  // assinatura estável da anomalia (sobrevive a reload da página): tipo + conteúdo das transações envolvidas + dia
  return `${type}|${txs.map(txSignature).sort().join(',')}|${dayKey(date)}`;
}
function detectAnomalies(txP){
  const spend = txP.filter(t=>t.saida && !t.internal);
  const anomalies = [];
  const mean = arr => arr.reduce((a,b)=>a+b,0)/arr.length;
  const stdDev = (arr,m) => Math.sqrt(arr.reduce((a,b)=>a+(b-m)**2,0)/arr.length);

  // 1) mesma descrição + mesmo valor, mesmo dia
  const byDescAmountDay = {};
  spend.forEach(t=>{
    const k = `${normalizeDescKey(t.desc)}|${Math.round(t.saida*100)}|${dayKey(t.date)}`;
    (byDescAmountDay[k] ??= []).push(t);
  });
  const flaggedIds = new Set();
  Object.values(byDescAmountDay).forEach(g=>{
    if(g.length>1){
      g.forEach(t=>flaggedIds.add(t.id));
      anomalies.push({ type:'duplicate', severity:'high', txs:g, date:g[0].date, aid:anomalyId('duplicate',g,g[0].date), descKey:normalizeDescKey(g[0].desc),
        text:`${g.length}× cobrança idêntica de ${fmtEUR(g[0].saida)} em "${g[0].desc}" no mesmo dia — pode ser cobrança duplicada.` });
    }
  });

  // 2) mesma descrição + mesmo valor, dentro de 3 dias (e ainda não sinalizado acima)
  const byDescAmount = {};
  spend.forEach(t=>{ const k=`${normalizeDescKey(t.desc)}|${Math.round(t.saida*100)}`; (byDescAmount[k] ??= []).push(t); });
  Object.values(byDescAmount).forEach(list=>{
    if(list.length<2) return;
    const sorted=[...list].sort((a,b)=>a.date-b.date);
    for(let i=1;i<sorted.length;i++){
      const a=sorted[i-1], b=sorted[i];
      if(flaggedIds.has(a.id) && flaggedIds.has(b.id)) continue; // já coberto pela regra 1
      const days=(b.date-a.date)/86400000;
      if(days>0 && days<=3){
        anomalies.push({ type:'near-duplicate', severity:'medium', txs:[a,b], date:b.date, aid:anomalyId('near-duplicate',[a,b],b.date), descKey:normalizeDescKey(b.desc),
          text:`Duas cobranças de ${fmtEUR(b.saida)} em "${b.desc}" com ${Math.round(days)} dia(s) de intervalo — confira se não é duplicada.` });
      }
    }
  });

  // 3) outlier por estabelecimento (precisa de histórico mínimo)
  const byDesc = {};
  spend.forEach(t=>{ (byDesc[normalizeDescKey(t.desc)] ??= []).push(t); });
  Object.values(byDesc).forEach(list=>{
    if(list.length<4) return;
    const vals=list.map(t=>t.saida), m=mean(vals), sd=stdDev(vals,m);
    if(sd<0.01) return;
    list.forEach(t=>{
      const z=(t.saida-m)/sd;
      if(z>=2.5 && t.saida>m*1.5){
        anomalies.push({ type:'outlier-merchant', severity: z>=4?'high':'medium', txs:[t], date:t.date, aid:anomalyId('outlier-merchant',[t],t.date), descKey:normalizeDescKey(t.desc),
          text:`${fmtEUR(t.saida)} em "${t.desc}" ficou bem acima do habitual (média ${fmtEUR(m)}, ${Math.round(t.saida/m*100-100)}% a mais).` });
      }
    });
  });

  // 4) outlier global de valor (transação muito alta perto do resto do período)
  if(spend.length>=10){
    const vals=spend.map(t=>t.saida), m=mean(vals), sd=stdDev(vals,m);
    if(sd>0.01){
      spend.forEach(t=>{
        const z=(t.saida-m)/sd;
        if(z>=3.5 && !anomalies.some(a=>a.txs.some(x=>x.id===t.id))){
          anomalies.push({ type:'outlier-global', severity:'high', txs:[t], date:t.date, aid:anomalyId('outlier-global',[t],t.date), descKey:normalizeDescKey(t.desc),
            text:`Gasto atípico para o período: ${fmtEUR(t.saida)} em "${t.desc}" (média geral ${fmtEUR(m)}).` });
        }
      });
    }
  }

  // 5) pico de gasto diário (soma do dia muito acima da média dos dias com gasto)
  const byDay = {};
  spend.forEach(t=>{ const k=dayKey(t.date); (byDay[k] ??= {total:0,count:0,date:t.date}); byDay[k].total+=t.saida; byDay[k].count++; });
  const days = Object.values(byDay);
  if(days.length>=7){
    const totals=days.map(d=>d.total), m=mean(totals), sd=stdDev(totals,m);
    if(sd>0.01){
      days.forEach(d=>{
        const z=(d.total-m)/sd;
        if(z>=3 && d.total>m*2){
          const dayTxs = spend.filter(t=>dayKey(t.date)===dayKey(d.date));
          anomalies.push({ type:'spike-day', severity:'medium', txs:dayTxs, date:d.date, aid:anomalyId('spike-day',[],d.date),
            text:`${d.date.toLocaleDateString('pt-BR')} teve ${fmtEUR(d.total)} em ${d.count} transações — bem acima da média diária (${fmtEUR(m)}).` });
        }
      });
    }
  }

  const order={high:0,medium:1,low:2};
  const surviving = anomalies.filter(a=>!(a.descKey && ignoredAnomalyDescKeys.has(a.descKey)));
  surviving.sort((a,b)=> order[a.severity]-order[b.severity] || b.date-a.date);
  return surviving;
}

function renderAnomalies(txP){
  const el=document.getElementById('anomalyList'), countEl=document.getElementById('anomalyCount');
  if(!el) return;
  const anomalies = detectAnomalies(txP).filter(a=>!dismissedAnomalyIds.has(a.aid));
  currentAnomalies = anomalies; // guarda para o botão "Resolver" reabrir pelo aid
  if(countEl) countEl.textContent = anomalies.length ? `${anomalies.length} encontrado${anomalies.length>1?'s':''}` : 'nada fora do comum';
  if(anomalies.length===0){
    el.innerHTML = '<div class="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30"><p class="text-[12px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"><i class="ri-checkbox-circle-fill"></i> Nada fora do padrão</p><p class="text-[11px] text-emerald-700/80 dark:text-emerald-400/70 mt-1 leading-relaxed">Sem duplicidades, picos ou valores atípicos no período.</p></div>';
    return;
  }
  const icons={ duplicate:'ri-file-copy-2-fill', 'near-duplicate':'ri-file-copy-2-line', 'outlier-merchant':'ri-arrow-up-circle-fill', 'outlier-global':'ri-flashlight-fill', 'spike-day':'ri-calendar-event-fill' };
  el.innerHTML = anomalies.slice(0,30).map(a=>{
    const high=a.severity==='high';
    return `<div class="p-3 rounded-xl border ${high?'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30':'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30'}">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[12px] font-bold ${high?'text-red-700 dark:text-red-400':'text-amber-700 dark:text-amber-400'} flex items-center gap-1.5"><i class="${icons[a.type]||'ri-error-warning-fill'}"></i> ${a.date.toLocaleDateString('pt-BR')}</p>
          <p class="text-[11px] ${high?'text-red-700/80 dark:text-red-400/70':'text-amber-700/80 dark:text-amber-400/70'} mt-1 leading-relaxed">${escapeHtml(a.text)}</p>
        </div>
        <button type="button" class="anomalyResolveBtn shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${high?'bg-red-600 hover:bg-red-700':'bg-amber-600 hover:bg-amber-700'} text-white whitespace-nowrap" data-aid="${escapeHtml(a.aid)}">Resolver</button>
      </div>
    </div>`;
  }).join('') + (anomalies.length>30 ? `<p class="text-[11px] text-zinc-500 pt-1">+ ${anomalies.length-30} outro(s) não exibido(s).</p>` : '');
  el.querySelectorAll('.anomalyResolveBtn').forEach(b=>{
    b.addEventListener('click', e=>{ openAnomalyDialog(e.currentTarget.dataset.aid); });
  });
}

// ---- Dialog "Resolver anomalia": mostra as transações envolvidas para aceitar (ignorar) ou excluir ----
function openAnomalyDialog(aid){
  const a = currentAnomalies.find(x=>x.aid===aid);
  if(!a) return;
  const dlg = document.getElementById('anomalyDialog');
  dlg.dataset.aid = aid;
  renderAnomalyDialogBody(a);
  dlg.showModal();
}
function renderAnomalyDialogBody(a){
  const high=a.severity==='high';
  document.getElementById('anomalyDialogSummary').innerHTML =
    `<p class="text-[12px] font-bold ${high?'text-red-700 dark:text-red-400':'text-amber-700 dark:text-amber-400'} flex items-center gap-1.5"><i class="ri-${high?'alarm-warning-fill':'error-warning-fill'}"></i> ${a.date.toLocaleDateString('pt-BR')}</p>
     <p class="text-[12px] text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">${escapeHtml(a.text)}</p>`;
  // "Sempre aceitar" só faz sentido quando a anomalia gira em torno de UMA descrição (duplicidade, outlier de
  // estabelecimento/global) — pico de gasto num dia não tem uma descrição única pra generalizar.
  const alwaysBtn = document.getElementById('btnAnomalyAlwaysAccept'), alwaysHint = document.getElementById('anomalyAlwaysHint');
  const canAlways = !!a.descKey;
  if(alwaysBtn) alwaysBtn.classList.toggle('hidden', !canAlways);
  if(alwaysHint) alwaysHint.classList.toggle('hidden', !canAlways);
  const listEl = document.getElementById('anomalyDialogTxList');
  const liveIds = new Set(a.txs.map(t=>t.id));
  const rows = transactions.filter(t=>liveIds.has(t.id)).sort((x,y)=>x.date-y.date);
  if(rows.length===0){
    listEl.innerHTML = '<p class="text-xs text-zinc-500 py-4 text-center">Nenhuma transação envolvida ainda existe (já foi excluída).</p>';
  } else {
    listEl.innerHTML = rows.map(t=>{
      const c=catById(t.cat);
      return `<div class="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800" data-txrow="${t.id}">
        <span class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white" style="background:${c.color}"><i class="${catIcon(c)}"></i></span>
        <span class="flex-1 min-w-0">
          <span class="block text-[13px] font-semibold truncate">${escapeHtml(t.desc)}</span>
          <span class="text-[11px] text-zinc-500">${(t.realDate||t.date).toLocaleDateString('pt-BR')} · ${escapeHtml(c.name)}${t.bank?` · ${escapeHtml(bankLabel(t.bank))}`:''}${t.note?` · ${escapeHtml(t.note)}`:''}</span>
        </span>
        <span class="font-bold font-mono text-[13px] shrink-0 text-red-600 dark:text-red-400">${fmtEUR(t.saida||t.entrada||0)}</span>
        <button type="button" class="anomalyTxDelBtn shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" data-id="${t.id}" title="Excluir esta transação"><i class="ri-delete-bin-line"></i></button>
      </div>`;
    }).join('');
    listEl.querySelectorAll('.anomalyTxDelBtn').forEach(b=>{
      b.addEventListener('click', e=>{
        const id=e.currentTarget.dataset.id;
        const tx=transactions.find(x=>x.id===id); if(!tx) return;
        if(!confirm(window.i18n.t('table.deleteConfirm', {desc: tx.desc, date: (tx.realDate||tx.date).toLocaleDateString('pt-BR'), value: fmtEUR(tx.saida||tx.entrada||0)}))) return;
        transactions = transactions.filter(x=>x.id!==id);
        selectedTxIds.delete(id);
        renderTable(); renderCategoryChips(); updateCharts(); updateKPIs(); persistState();
        renderAnomalyDialogBody(a); // re-renderiza a lista de dentro do modal sem fechar
      });
    });
  }
}
function acceptCurrentAnomaly(){
  const dlg = document.getElementById('anomalyDialog');
  const aid = dlg.dataset.aid;
  if(aid){ dismissedAnomalyIds.add(aid); persistState(); }
  dlg.close();
  updateCharts();
}
// "Sempre aceitar essa descrição" — reconhece de forma permanente: nunca mais vira gasto estranho,
// nem em ocorrências futuras (datas/valores diferentes) com a mesma descrição normalizada.
function alwaysAcceptCurrentAnomaly(){
  const dlg = document.getElementById('anomalyDialog');
  const aid = dlg.dataset.aid;
  const a = currentAnomalies.find(x=>x.aid===aid);
  if(a && a.descKey) ignoredAnomalyDescKeys.add(a.descKey);
  if(aid) dismissedAnomalyIds.delete(aid); // não precisa mais da lista de exceções pontuais pra essa
  persistState();
  dlg.close();
  updateCharts();
}

function periodTx(){ return transactions.filter(inPeriod); }
function renderCalHeatmap(txP){
  const el = document.getElementById('calHeatmap');
  const labelEl = document.getElementById('heatmapMonthLabel');
  const hlEl = document.getElementById('calHeatmapHighlights');
  if(!el) return;
  // usa o mês selecionado no filtro de período, se for um único mês; senão o mês mais recente com dados
  let monthK = (typeof periodFilter==='string' && /^\d{4}-\d{2}$/.test(periodFilter)) ? periodFilter : null;
  if(!monthK){
    const months=[...new Set(txP.map(t=>monthKey(t.date)))].sort();
    monthK = months[months.length-1];
  }
  if(!monthK){
    el.innerHTML='<p class="text-xs text-zinc-500 py-8 text-center">Sem dados ainda.</p>';
    if(labelEl) labelEl.textContent='';
    if(hlEl) hlEl.innerHTML='';
    return;
  }
  if(labelEl) labelEl.textContent = monthLabel(monthK);
  const [y,m] = monthK.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const byDay = {};
  txP.forEach(t=>{ if(t.saida && !t.internal && monthKey(t.date)===monthK){ const d=t.date.getDate(); byDay[d]=(byDay[d]||0)+t.saida; } });
  const max = Math.max(0, ...Object.values(byDay));
  const firstDow = new Date(y, m-1, 1).getDay();
  const weekDows = ['D','S','T','Q','Q','S','S'];
  let cells = weekDows.map(d=>`<div class="text-[9px] font-bold text-zinc-400 text-center">${d}</div>`).join('');
  for(let i=0;i<firstDow;i++) cells += `<div></div>`;
  for(let d=1; d<=daysInMonth; d++){
    const v = Math.round((byDay[d]||0)*100)/100;
    const intensity = max>0 ? v/max : 0;
    const bg = v>0 ? `rgba(139,92,246,${(0.12 + intensity*0.72).toFixed(2)})` : 'rgba(128,128,128,0.08)';
    const style = `background:${bg};${intensity>0.55?'color:#fff':''}`;
    cells += `<div class="aspect-square rounded flex items-center justify-center text-[9px] font-semibold" style="${style}" title="${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}: ${fmtEUR(v)}">${d}</div>`;
  }
  el.innerHTML = `<div class="grid grid-cols-7 gap-1 max-w-[240px] mx-auto">${cells}</div>`;

  // ---- Highlights do mês: dia mais caro, média por dia com gasto, dias sem gasto, fim de semana x dia útil ----
  if(hlEl){
    const activeDays = Object.keys(byDay).map(Number);
    if(activeDays.length===0){
      hlEl.innerHTML = '<p class="text-[11px] text-zinc-500 text-center">Sem gastos nesse mês.</p>';
    } else {
      const total = activeDays.reduce((s,d)=>s+byDay[d],0);
      const biggestDay = activeDays.reduce((a,b)=> byDay[b]>byDay[a] ? b : a);
      const daysWithoutSpend = daysInMonth - activeDays.length;
      let weekdaySum=0, weekdayCount=0, weekendSum=0, weekendCount=0;
      for(let d=1; d<=daysInMonth; d++){
        const dow = new Date(y, m-1, d).getDay();
        const isWeekend = dow===0 || dow===6;
        if(isWeekend){ weekendSum += byDay[d]||0; weekendCount++; }
        else { weekdaySum += byDay[d]||0; weekdayCount++; }
      }
      const avgWeekday = weekdayCount ? weekdaySum/weekdayCount : 0;
      const avgWeekend = weekendCount ? weekendSum/weekendCount : 0;

      const boxes = [];
      boxes.push({ icon:'ri-flashlight-fill', color:'violet', title:'Dia mais caro',
        text:`${String(biggestDay).padStart(2,'0')}/${String(m).padStart(2,'0')} — ${fmtEUR(byDay[biggestDay])}` });
      boxes.push({ icon:'ri-bar-chart-2-line', color:'zinc', title:'Média por dia com gasto',
        text:`${fmtEUR(total/activeDays.length)} em ${activeDays.length} de ${daysInMonth} dias` });
      if(weekdayCount && weekendCount && (avgWeekday>0 || avgWeekend>0)){
        const weekendHigher = avgWeekend > avgWeekday;
        const bigger = weekendHigher ? avgWeekend : avgWeekday, smaller = weekendHigher ? avgWeekday : avgWeekend;
        const pct = smaller>0 ? Math.round((bigger/smaller-1)*100) : null;
        boxes.push({ icon:'ri-calendar-event-line', color: weekendHigher?'amber':'zinc', title: weekendHigher?'Fim de semana pesa mais':'Dias úteis pesam mais',
          text: pct!=null ? `${fmtEUR(avgWeekday)}/dia útil vs ${fmtEUR(avgWeekend)}/dia de fim de semana — ${pct}% a mais ${weekendHigher?'no fim de semana':'em dias úteis'}.` : `Só há gasto ${weekendHigher?'no fim de semana':'em dias úteis'} até agora.` });
      }
      if(daysWithoutSpend>0){
        boxes.push({ icon:'ri-checkbox-blank-circle-line', color:'emerald', title:'Dias sem gasto', text:`${daysWithoutSpend} de ${daysInMonth} dias sem nenhuma saída registrada.` });
      }
      const colorCls = { violet:['border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/30','text-violet-700 dark:text-violet-400'],
        amber:['border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30','text-amber-700 dark:text-amber-400'],
        emerald:['border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30','text-emerald-700 dark:text-emerald-400'],
        zinc:['border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50','text-zinc-700 dark:text-zinc-300'] };
      hlEl.innerHTML = boxes.slice(0,4).map(b=>{
        const [box,txt] = colorCls[b.color];
        return `<div class="p-2 rounded-lg border ${box}">
          <p class="text-[11px] font-bold ${txt} flex items-center gap-1.5"><i class="${b.icon}"></i> ${escapeHtml(b.title)}</p>
          <p class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">${escapeHtml(b.text)}</p>
        </div>`;
      }).join('');
    }
  }
}
function updateCharts(){
  if(!catChart) ensureCharts();
  const txP = periodTx();
  // guard empty
  if(transactions.length===0){
    catChart.data.labels=[]; catChart.data.datasets=[]; catChart.update();
    monthChart.data.labels=[]; monthChart.data.datasets=[]; monthChart.update();
    merchantChart.data.labels=[]; merchantChart.data.datasets=[]; merchantChart.update();
    histChart.data.labels=[]; histChart.data.datasets=[]; histChart.update();
    document.getElementById('catLegend').innerHTML='<span class="text-xs text-zinc-500">Sem dados ainda — adicione PDFs ou use o exemplo.</span>';
    document.getElementById('monthRange').textContent='';
    if(cashflowChart){ cashflowChart.data.labels=[]; cashflowChart.data.datasets=[]; cashflowChart.update(); }
    const cfTipsEl=document.getElementById('cashflowTips'); if(cfTipsEl) cfTipsEl.innerHTML='';
    if(compareChart){ compareChart.data.labels=[]; compareChart.data.datasets=[]; compareChart.update(); }
    const budgetListEmptyEl=document.getElementById('budgetProgressList'); if(budgetListEmptyEl) budgetListEmptyEl.innerHTML='';
    const budgetScopeEmptyEl=document.getElementById('budgetScopeToggle'); if(budgetScopeEmptyEl) budgetScopeEmptyEl.classList.add('hidden');
    renderCalHeatmap([]);
    updateKPIs();
    return;
  }
  // filter for charts respects activeCatFilter? No, charts show overall; table filters. But highlight.
  const byCat={}; const byCatCount={};
  txP.forEach(t=>{ if(t.saida && !t.internal){ byCat[t.cat]=(byCat[t.cat]||0)+t.saida; byCatCount[t.cat]=(byCatCount[t.cat]||0)+1; }});
  const catEntries=Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  const labels=catEntries.map(([id])=>catById(id).name);
  const ids=catEntries.map(([id])=>id);
  const vals=catEntries.map(([,v])=>Math.round(v*100)/100);
  const colors=catEntries.map(([id])=>catById(id).color);

  // update type if needed
  const wantType = chartMode==='doughnut'?'doughnut':'bar';
  if(catChart.config.type!==wantType){ catChart.destroy(); catChart=new Chart(document.getElementById('catChart'),{type:wantType,data:{labels:[],datasets:[]},options:catOptions()}); }

  const catModeHintEl = document.getElementById('catModeHint');
  if(chartMode==='waterfall'){
    if(catModeHintEl) catModeHintEl.textContent = '· da renda até o saldo, categoria por categoria';
    const totalIncome = txP.filter(t=>t.entrada && !t.internal).reduce((s,t)=>s+t.entrada,0);
    const TOP_N = 6;
    const top = catEntries.slice(0, TOP_N);
    const restVal = catEntries.slice(TOP_N).reduce((s,[,v])=>s+v,0);
    const wLabels=['Renda']; const wRanges=[[0,totalIncome]]; const wColors=['#10b981']; const wIds=[null];
    let running = totalIncome;
    top.forEach(([id,v])=>{
      const c=catById(id); const start = running-v;
      wRanges.push([start, running]); wColors.push(c.color); wLabels.push(c.name); wIds.push(id);
      running = start;
    });
    if(restVal>0.005){
      const start = running-restVal;
      wRanges.push([start, running]); wColors.push('#a1a1aa'); wLabels.push('Outras categorias'); wIds.push(null);
      running = start;
    }
    wLabels.push('Saldo'); wRanges.push([0, running]); wColors.push(running>=0?'#10b981':'#ef4444'); wIds.push(null);

    catChart.data.labels=wLabels; catChart.data.ids=wIds;
    catChart.data.datasets=[{ data:wRanges, backgroundColor:wColors, borderRadius:6, barThickness: wLabels.length>8?18:28 }];
    catChart.update();
    document.getElementById('catLegend').innerHTML = `<div class="text-[12px] leading-relaxed p-2.5 space-y-2">
      <p class="text-zinc-600 dark:text-zinc-300"><span class="font-bold">Como ler:</span> começa na sua renda do período e desce categoria por categoria até o que sobrou.</p>
      <p class="flex items-center gap-1.5 text-zinc-500"><span class="w-2 h-2 rounded-full inline-block" style="background:#10b981"></span> Renda / saldo positivo</p>
      <p class="flex items-center gap-1.5 text-zinc-500"><span class="w-2 h-2 rounded-full inline-block" style="background:#ef4444"></span> Saldo negativo</p>
      <p class="flex items-center gap-1.5 text-zinc-500"><span class="w-2 h-2 rounded-full inline-block" style="background:#a1a1aa"></span> Outras categorias agrupadas</p>
    </div>`;
  } else {
    if(catModeHintEl) catModeHintEl.textContent = '· por categoria';
    catChart.data.labels=labels; catChart.data.ids=ids;
    if(wantType==='doughnut'){
      catChart.data.datasets=[{ data:vals, backgroundColor:colors, borderWidth:0, hoverOffset:8 }];
    } else {
      catChart.data.datasets=[{ data:vals, backgroundColor:colors, borderRadius:10, barThickness:18 }];
    }
    catChart.update();
    // legend
    const total=vals.reduce((a,b)=>a+b,0);
    document.getElementById('catLegend').innerHTML = catEntries.map(([id,v])=>{
      const c=catById(id); const pct= total>0? Math.round(v/total*100):0;
      const active=activeCatFilter===id;
      const count=(byCatCount[id]||0);
      return `<button onclick="window._toggleCat('${id}')" class="w-full text-left group">
        <div class="flex items-center justify-between gap-3 pl-2.5 pr-3 py-1.5 rounded-lg border transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${active?'shadow-sm':''}" style="${active?`background:${c.color}14;border-color:${c.color}`:'border-color:transparent'}">
          <span class="flex items-center gap-2 min-w-0">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white shrink-0" style="background:${c.color}"><i class="${catIcon(c)}"></i></span>
            <span class="text-[13px] font-semibold truncate">${escapeHtml(c.name)}</span>
            <span class="text-[10px] text-zinc-400 font-mono shrink-0">${count}</span>
          </span>
          <span class="flex items-baseline gap-1.5 shrink-0">
            <span class="text-[13px] font-extrabold font-mono">${fmtEUR(v)}</span>
            <span class="text-[10px] text-zinc-400 font-bold w-8 text-right">${pct}%</span>
          </span>
        </div>
      </button>`;
    }).join('');
  }

  // Monthly
  const byMonth={}; txP.forEach(t=>{ if(t.saida && !t.internal){ const k=monthKey(t.date); byMonth[k]=(byMonth[k]||0)+t.saida; }});
  const months=Object.keys(byMonth).sort();
  monthChart.data.labels=months.map(monthLabel);
  monthChart.data.datasets=[{ label:'Gasto', data:months.map(k=>Math.round(byMonth[k]*100)/100), borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.12)', fill:true, tension:0.35 }];
  monthChart.update();
  document.getElementById('monthRange').textContent = months.length? `${monthLabel(months[0])} → ${monthLabel(months[months.length-1])}` : '';

  // Merchants
  const byDesc={}; txP.forEach(t=>{ if(t.saida && !t.internal){ const k=t.desc.slice(0,36); byDesc[k]=(byDesc[k]||0)+t.saida; }});
  const topMerch=Object.entries(byDesc).sort((a,b)=>b[1]-a[1]).slice(0,8).reverse(); // reverse for horizontal bar top at top
  merchantChart.data.labels=topMerch.map(([k])=>k);
  merchantChart.data.datasets=[{ data:topMerch.map(([,v])=>Math.round(v*100)/100), backgroundColor:'#0ea5e9', borderRadius:8, barThickness:14 }];
  merchantChart.update();

  // Histogram — faixas fixas e legíveis (em vez de bins de largura igual, que ficam
  // todos esmagados no primeiro bin quando há 1-2 valores muito altos, ex: aluguel)
  const amounts=txP.filter(t=>t.saida && !t.internal).map(t=>t.saida);
  const HIST_EDGES=[5,10,25,50,100,200,500,1000,Infinity];
  const histLabels=[]; const histData=[];
  let histLo=0;
  HIST_EDGES.forEach(hi=>{
    const label = hi===Infinity ? `> € ${histLo}` : `€ ${histLo}–${hi}`;
    histLabels.push(label);
    histData.push(amounts.filter(v=> v>histLo && v<=hi).length);
    histLo=hi;
  });
  histChart.data.labels=histLabels; histChart.data.datasets=[{ data:histData, backgroundColor:'rgba(99,102,241,0.85)', borderRadius:8 }];
  histChart.update();

  // ---- Tendência: gasto mensal + média móvel 3m ----
  {
    const mSaidas={}; txP.forEach(t=>{ if(t.saida && !t.internal){ const k=monthKey(t.date); mSaidas[k]=(mSaidas[k]||0)+t.saida; }});
    const ms=Object.keys(mSaidas).sort();
    const valsM=ms.map(k=>Math.round(mSaidas[k]*100)/100);
    const ma=valsM.map((_,i)=>{ const s=Math.max(0,i-2); const win=valsM.slice(s,i+1); return Math.round(win.reduce((a,b)=>a+b,0)/win.length*100)/100; });
    trendChart.data.labels=ms.map(monthLabel);
    trendChart.data.datasets=[
      { label:'Gasto', data:valsM, borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.10)', fill:true, tension:0.35 },
      { label:'Tendência (3m)', data:ma, borderColor:'#f59e0b', borderDash:[6,4], pointRadius:0, tension:0.35 }
    ];
    trendChart.update();
    const badge=document.getElementById('trendBadge');
    if(badge && valsM.length>=2){
      // compara último mês vs anterior
      const diff = valsM[valsM.length-1]-valsM[valsM.length-2];
      const pctPrev = valsM[valsM.length-2]>0 ? Math.round(Math.abs(diff)/valsM[valsM.length-2]*100) : 0;
      if(diff>0){ badge.textContent=`▲ +${pctPrev}% vs mês anterior`; badge.className='text-[11px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400'; }
      else { badge.textContent=`▼ -${pctPrev}% vs mês anterior`; badge.className='text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'; }
    } else if(badge){ badge.textContent=''; }
  }

  // ---- Dia da semana ----
  {
    const dow=[0,0,0,0,0,0,0];
    txP.forEach(t=>{ if(t.saida && !t.internal) dow[t.date.getDay()]+=t.saida; });
    dowChart.data.datasets=[{ data:dow.map(v=>Math.round(v*100)/100), backgroundColor:['#fbbf24','#6366f1','#6366f1','#6366f1','#6366f1','#6366f1','#ec4899'], borderRadius:8 }];
    dowChart.update();
  }

  // ---- Comparativo por categoria (últimos N meses) ----
  {
    const monthsAll=[...new Set(txP.map(t=>monthKey(t.date)))].sort();
    const lastN=monthsAll.slice(-6);
    const catTotals={};
    txP.forEach(t=>{ if(t.saida&&!t.internal) catTotals[t.cat]=(catTotals[t.cat]||0)+t.saida; });
    // maior categoria primeiro — mantém a mesma ordem em barras, linhas e legenda
    const catsInPeriod=[...new Set(txP.filter(t=>t.saida&&!t.internal).map(t=>t.cat))].sort((a,b)=>(catTotals[b]||0)-(catTotals[a]||0));
    const budgetEmptyEl=document.getElementById('compareBudgetEmpty');
    const chartWrapEl=document.getElementById('compareChartWrap');
    const budgetListEl=document.getElementById('budgetProgressList');
    if(compareMode==='budget'){
      // Orçamento: uma barra por categoria, gasto real sobreposto à meta (em vez de duas barras lado a lado) —
      // dá pra ver de cara quanto ainda falta. HTML/CSS puro (não Chart.js) pra crescer na vertical sem espremer
      // e permitir o degradê cor-da-categoria → vermelho, com o pedaço que passou da meta sempre em vermelho sólido.
      if(chartWrapEl) chartWrapEl.classList.add('hidden');
      if(budgetListEl) budgetListEl.classList.remove('hidden');
      document.getElementById('compareLegend').innerHTML='';
      const budgetScopeToggleEl=document.getElementById('budgetScopeToggle');
      if(budgetScopeToggleEl) budgetScopeToggleEl.classList.remove('hidden');
      const budgeted = categories.filter(c=>c.budget>0);
      const cmpMonth = lastN[lastN.length-1];
      // "Este mês": só o mês mais recente, como antes. "Acumulado": soma orçamento e gasto real de TODOS os
      // meses do período em exibição — um mês fora da curva (ex: férias, gasto puxado em Lazer) some dentro
      // da média em vez de aparecer como um estouro isolado que nunca se repete nos outros meses.
      const scopeMonths = budgetScope==='cumulative' ? monthsAll : (cmpMonth ? [cmpMonth] : []);
      if(!budgeted.length || !scopeMonths.length){
        budgetListEl.innerHTML='';
        if(budgetEmptyEl) budgetEmptyEl.classList.remove('hidden');
      } else {
        if(budgetEmptyEl) budgetEmptyEl.classList.add('hidden');
        const scopeMonthSet = new Set(scopeMonths);
        const rows = budgeted.map(c=>{
          let real=0; txP.forEach(t=>{ if(t.cat===c.id&&t.saida&&!t.internal&&scopeMonthSet.has(monthKey(t.date))) real+=t.saida; });
          real=Math.round(real*100)/100;
          const budgetTotal = Math.round(c.budget*scopeMonths.length*100)/100;
          return { c, real, budgetTotal, pct: budgetTotal>0 ? real/budgetTotal : 0 };
        }).sort((a,b)=>b.pct-a.pct); // categoria mais estourada/mais perto do limite primeiro
        budgetListEl.innerHTML = rows.map(({c,real,budgetTotal,pct})=>{
          const over = real>budgetTotal;
          // sem estouro: a barra representa 0→orçamento, e o preenchido é o quanto já foi gasto dele.
          // com estouro: a régua cresce pra caber o gasto real, a marca do orçamento "encolhe" pra dentro,
          // e o pedaço que passou dela vem sempre em vermelho sólido — não faz parte do degradê.
          const displayMax = Math.max(real, budgetTotal, 0.01);
          const budgetMarkerPct = Math.min(100, (budgetTotal/displayMax)*100); // onde fica a linha do orçamento na régua
          const realPct = Math.min(100,(real/displayMax)*100); // até onde o gasto real preenche a régua
          const baseWidth = over ? budgetMarkerPct : realPct; // trecho com degradê cor-da-categoria → vermelho
          const overflowWidth = over ? (realPct-budgetMarkerPct) : 0; // trecho vermelho sólido além da meta
          const pctLabel = Math.round(pct*100);
          return `<div>
            <div class="flex items-center justify-between gap-3 text-xs mb-1.5">
              <span class="font-semibold flex items-center gap-1.5 min-w-0">
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white shrink-0" style="background:${c.color}"><i class="${catIcon(c)}"></i></span>
                <span class="truncate">${escapeHtml(c.name)}</span>
              </span>
              <span class="font-mono shrink-0 ${over?'text-red-600 dark:text-red-400 font-bold':'text-zinc-500'}">${fmtEUR(real)} / ${fmtEUR(budgetTotal)} <span class="opacity-70">(${pctLabel}%)</span></span>
            </div>
            <div class="relative h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div class="absolute inset-y-0 left-0 rounded-full" style="width:${baseWidth}%; background:linear-gradient(90deg, ${c.color}, #4c0519)"></div>
              ${over ? `<div class="absolute inset-y-0" style="left:${budgetMarkerPct}%; width:${overflowWidth}%; background:repeating-linear-gradient(135deg, #4c0519, #4c0519 5px, #1a0505 5px, #1a0505 10px)"></div>` : ''}
              ${over ? `<div class="absolute inset-y-0 w-[3px] bg-white" style="left:${budgetMarkerPct}%; box-shadow:0 0 0 1px rgba(0,0,0,0.55)" title="Aqui é onde a meta de ${fmtEUR(budgetTotal)} acabou"></div>` : ''}
            </div>
          </div>`;
        }).join('');
      }
      document.getElementById('compareRange').textContent = budgetScope==='cumulative'
        ? (scopeMonths.length ? `${monthLabel(scopeMonths[0])} – ${monthLabel(scopeMonths[scopeMonths.length-1])}` : '')
        : (cmpMonth ? monthLabel(cmpMonth) : '');
      document.getElementById('compareModeHint').textContent = budgetScope==='cumulative'
        ? `· real sobreposto à meta acumulada dos ${scopeMonths.length} meses do período — suaviza picos isolados (férias, etc.)`
        : '· real sobreposto à meta definida em Configurações, mês mais recente';
    } else {
      if(chartWrapEl) chartWrapEl.classList.remove('hidden');
      if(budgetListEl) budgetListEl.classList.add('hidden');
      if(budgetEmptyEl) budgetEmptyEl.classList.add('hidden');
      const budgetScopeToggleOffEl=document.getElementById('budgetScopeToggle'); if(budgetScopeToggleOffEl) budgetScopeToggleOffEl.classList.add('hidden');
      // No modo Linhas, passar o mouse mostra TODAS as categorias daquele mês numa tooltip só (pra comparar) —
      // com muitas categorias, essa lista fica mais alta que os 300px fixos do canvas e o Chart.js corta o
      // final dela (é desenhado direto no canvas, não dá pra "vazar" pra fora). Cresce a altura do gráfico
      // conforme o número de categorias pra sempre sobrar espaço pra tooltip inteira aparecer.
      if(chartWrapEl){
        chartWrapEl.style.height = compareMode==='lines'
          ? `${Math.min(560, Math.max(300, 70 + catsInPeriod.length*20))}px`
          : '300px';
      }
      const wantType = compareMode==='lines' ? 'line' : 'bar';
      if(compareChart.config.type!==wantType || compareChart.options.indexAxis!=='x'){
        compareChart.destroy();
        compareChart = new Chart(document.getElementById('compareChart'), { type:wantType, data:{labels:[],datasets:[]}, options:compareOptions() });
      }
      compareChart.resize();
      compareChart.data.labels=lastN.map(monthLabel);
      compareChart.data.datasets=catsInPeriod.map(cid=>{
        const c=catById(cid);
        const data=lastN.map(k=>{ let s=0; txP.forEach(t=>{ if(t.cat===cid&&t.saida&&!t.internal&&monthKey(t.date)===k) s+=t.saida; }); return Math.round(s*100)/100; });
        return compareMode==='lines'
          ? { label:c.name, catId:cid, data, borderColor:c.color, backgroundColor:c.color, pointRadius:3, pointHoverRadius:5, borderWidth:2.5, tension:0.35, fill:false }
          : { label:c.name, catId:cid, data, backgroundColor:c.color, borderRadius:6 };
      });
      compareChart.update();
      document.getElementById('compareRange').textContent = lastN.length? lastN.map(monthLabel).join(' · ') : '';
      document.getElementById('compareModeHint').textContent = compareMode==='lines' ? '· tendência de cada categoria mês a mês' : '· barras lado a lado por mês';
      renderCompareLegend();
    }
  }

  // ---- Fluxo de caixa (mensal / acumulado / previsão) ----
  let forecastState = null; // preenchido no modo "forecast", lido pelos boxes de destaque logo abaixo
  {
    const monthsAll=[...new Set(txP.map(t=>monthKey(t.date)))].sort();
    const incByMonth=[], expByMonth=[];
    monthsAll.forEach(k=>{
      let inc=0, exp=0;
      txP.forEach(t=>{ if(monthKey(t.date)!==k) return; if(t.entrada && !t.internal) inc+=t.entrada; if(t.saida && !t.internal) exp+=t.saida; });
      incByMonth.push(Math.round(inc*100)/100); expByMonth.push(Math.round(exp*100)/100);
    });
    const netByMonth = incByMonth.map((inc,i)=>Math.round((inc-expByMonth[i])*100)/100);
    const wantCfType = cashflowMode==='monthly' ? 'bar' : 'line';
    if(cashflowChart.config.type!==wantCfType){
      cashflowChart.destroy();
      cashflowChart = new Chart(document.getElementById('cashflowChart'), { type:wantCfType, data:{labels:[],datasets:[]}, options:cashflowOptions() });
    }
    const subEl = document.getElementById('cashflowSub');
    if(cashflowMode==='monthly'){
      cashflowChart.data.labels = monthsAll.map(monthLabel);
      cashflowChart.data.datasets=[{ label:'Saldo do mês', data:netByMonth, backgroundColor: netByMonth.map(v=>v>=0?'#10b981':'#ef4444'), borderRadius:6 }];
      document.getElementById('cashflowHint').textContent = '· entradas − saídas por mês';
      if(subEl) subEl.textContent = 'Entradas − saídas reais, sem transferências internas. Verde = sobrando, vermelho = consumindo reserva.';
    } else {
      // Se houver um saldo inicial definido (Configurações → Saldo inicial), a curva parte dele em vez de
      // zero — soma também o net de qualquer mês entre o saldo inicial e o começo do período mostrado, pra
      // funcionar mesmo com filtro de período ativo (ex: olhando só a partir de março). Compartilhado por
      // Acumulado e Previsão — a previsão continua exatamente de onde o saldo real parou.
      let baseline = 0;
      if(openingBalance && openingBalance.value!=null && monthsAll[0]){
        baseline = openingBalance.value;
        const obKey = monthKey(openingBalance.date);
        const firstShown = monthsAll[0];
        const priorMonths = [...new Set(transactions.map(t=>monthKey(t.date)))].filter(k=>k>=obKey && k<firstShown);
        priorMonths.forEach(k=>{
          let inc=0, exp=0;
          transactions.forEach(t=>{ if(monthKey(t.date)!==k) return; if(t.entrada && !t.internal) inc+=t.entrada; if(t.saida && !t.internal) exp+=t.saida; });
          baseline += (inc-exp);
        });
      }
      let cum=baseline; const cumData = netByMonth.map(v=>{ cum+=v; return Math.round(cum*100)/100; });

      if(cashflowMode==='forecast'){
        // ---- Previsão: usa o orçamento por categoria (Configurações → Orçamentos mensais) como gasto
        // esperado; categoria sem meta cai pra média real dos últimos 3 meses. Renda usa a meta definida,
        // ou a média das últimas 3 entradas mensais se não houver meta. ----
        const catMonthlyAvg = catId => {
          const byMonth={};
          transactions.forEach(t=>{ if(t.cat===catId && t.saida && !t.internal){ const k=monthKey(t.date); byMonth[k]=(byMonth[k]||0)+t.saida; } });
          const keys=Object.keys(byMonth).sort().slice(-3);
          return keys.length ? keys.reduce((s,k)=>s+byMonth[k],0)/keys.length : 0;
        };
        const catEstimates = categories.filter(c=>c.id!=='transferencia').map(c=>({
          name:c.name, usesBudget: c.budget>0, value: c.budget>0 ? c.budget : catMonthlyAvg(c.id)
        })).filter(c=>c.value>0.005);
        const projectedMonthlyExpense = Math.round(catEstimates.reduce((s,c)=>s+c.value,0)*100)/100;
        const noBudgetCats = catEstimates.filter(c=>!c.usesBudget);

        const last3Inc = incByMonth.slice(-3);
        const avgIncome = last3Inc.length ? last3Inc.reduce((a,b)=>a+b,0)/last3Inc.length : 0;
        const usesIncomeTarget = incomeTarget>0;
        const projectedMonthlyIncome = Math.round((usesIncomeTarget ? incomeTarget : avgIncome)*100)/100;
        const projectedNet = Math.round((projectedMonthlyIncome-projectedMonthlyExpense)*100)/100;

        const FORECAST_MONTHS = 6;
        const forecastKeys=[];
        let [fy,fm] = (monthsAll.length ? monthsAll[monthsAll.length-1] : monthKey(new Date())).split('-').map(Number);
        for(let i=0;i<FORECAST_MONTHS;i++){ fm++; if(fm>12){fm=1; fy++;} forecastKeys.push(`${fy}-${String(fm).padStart(2,'0')}`); }
        const startSaldo = cumData.length ? cumData[cumData.length-1] : baseline;
        let fCum = startSaldo;
        const forecastData = forecastKeys.map(()=>{ fCum = Math.round((fCum+projectedNet)*100)/100; return fCum; });

        const combined = cumData.concat(forecastData);
        const splitIdx = cumData.length; // a partir daqui é projeção, não histórico real
        cashflowChart.data.labels = monthsAll.concat(forecastKeys).map((k,i)=> i<splitIdx ? monthLabel(k) : monthLabel(k)+' (prev.)');
        cashflowChart.data.datasets=[{
          label:'Saldo (real + previsto)', data: combined, fill:true, tension:0.3,
          borderColor: '#8b5cf6',
          segment:{
            borderDash: ctx => ctx.p1DataIndex >= splitIdx ? [6,4] : undefined,
            borderColor: ctx => ctx.p1DataIndex >= splitIdx ? '#8b5cf6' : ((ctx.p0.parsed.y<0 || ctx.p1.parsed.y<0) ? '#ef4444' : '#10b981')
          },
          backgroundColor: 'rgba(139,92,246,0.10)',
          pointBackgroundColor: combined.map((v,i)=> i>=splitIdx ? '#8b5cf6' : (v>=0?'#10b981':'#ef4444')),
          pointStyle: combined.map((v,i)=> i>=splitIdx ? 'rectRot' : 'circle'),
          pointRadius: combined.map((v,i)=> i>=splitIdx ? 4 : 3)
        }];
        document.getElementById('cashflowHint').textContent =
          `· projeção: ${fmtEUR(projectedMonthlyIncome)} renda − ${fmtEUR(projectedMonthlyExpense)} gasto = ${projectedNet>=0?'+':''}${fmtEUR(projectedNet)}/mês`;
        if(subEl) subEl.textContent = 'Linha sólida = real. Linha tracejada (roxa) = projeção usando o orçamento definido em Configurações, com média histórica pra categorias sem meta.';
        forecastState = { projectedMonthlyIncome, projectedMonthlyExpense, projectedNet, usesIncomeTarget, avgIncome, noBudgetCats, forecastKeys, startSaldo, finalForecast: forecastData[forecastData.length-1] };
      } else {
        cashflowChart.data.labels = monthsAll.map(monthLabel);
        cashflowChart.data.datasets=[{
          label:'Saldo acumulado', data:cumData, fill:true, tension:0.3,
          borderColor:ctx=>{ const v=ctx.p1?.parsed?.y ?? cumData[cumData.length-1] ?? 0; return v<0?'#ef4444':'#10b981'; },
          backgroundColor: cumData[cumData.length-1]>=0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          segment:{ borderColor: ctx => (ctx.p0.parsed.y<0 || ctx.p1.parsed.y<0) ? '#ef4444' : '#10b981' },
          pointBackgroundColor: cumData.map(v=>v>=0?'#10b981':'#ef4444')
        }];
        document.getElementById('cashflowHint').textContent = (openingBalance && openingBalance.value!=null)
          ? `· saldo acumulado a partir de ${fmtEUR(openingBalance.value)} em ${openingBalance.date.toLocaleDateString('pt-BR')}`
          : '· saldo acumulado ao longo do tempo';
        if(subEl) subEl.textContent = 'Entradas − saídas reais, sem transferências internas. Verde = sobrando, vermelho = consumindo reserva.';
      }
    }
    cashflowChart.update();

    // Boxes de destaque: no modo Previsão mostram a projeção; nos outros modos, meses que estouraram a renda
    const tipsEl=document.getElementById('cashflowTips');
    if(tipsEl && cashflowMode==='forecast' && forecastState){
      const f = forecastState;
      const boxes = [];
      const positive = f.projectedNet>=0;
      boxes.push({ level: positive?'ok':'danger',
        title: positive ? 'Sobra prevista por mês' : 'Falta prevista por mês',
        text: `Renda ${fmtEUR(f.projectedMonthlyIncome)} − gastos ${fmtEUR(f.projectedMonthlyExpense)} = ${positive?'+':''}${fmtEUR(f.projectedNet)}/mês, no ritmo do orçamento.` });
      const finalPositive = f.finalForecast>=0;
      boxes.push({ level: finalPositive?'ok':'danger',
        title: `Saldo estimado em ${monthLabel(f.forecastKeys[f.forecastKeys.length-1])}`,
        text: `Partindo de ${fmtEUR(f.startSaldo)} hoje, projeta-se ${fmtEUR(f.finalForecast)} em ${f.forecastKeys.length} meses.` });
      if(f.projectedNet<0 && f.startSaldo>0){
        const monthsToZero = Math.ceil(f.startSaldo / -f.projectedNet);
        if(monthsToZero<=24) boxes.push({ level:'danger', title:'Saldo pode zerar', text:`Nesse ritmo, o saldo estimado fica negativo em ~${monthsToZero} ${monthsToZero===1?'mês':'meses'}.` });
      }
      if(!f.usesIncomeTarget) boxes.push({ level:'warn', title:'Meta de renda não definida', text:`Usando a média das últimas entradas (${fmtEUR(f.avgIncome)}/mês) — defina uma meta em Configurações → Orçamentos mensais pra uma previsão mais intencional.` });
      if(f.noBudgetCats.length) boxes.push({ level:'warn', title:'Categorias sem meta', text:`${f.noBudgetCats.length} categoria(s) sem orçamento usam a média histórica: ${f.noBudgetCats.map(c=>c.name).join(', ')}.` });
      tipsEl.innerHTML = boxes.slice(0,4).map(b=>{
        const cls = b.level==='ok' ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30'
          : b.level==='danger' ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30'
          : 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30';
        const textCls = b.level==='ok' ? 'text-emerald-700 dark:text-emerald-400' : b.level==='danger' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400';
        const subCls = b.level==='ok' ? 'text-emerald-700/80 dark:text-emerald-400/70' : b.level==='danger' ? 'text-red-700/80 dark:text-red-400/70' : 'text-amber-700/80 dark:text-amber-400/70';
        const icon = b.level==='ok' ? 'ri-checkbox-circle-fill' : b.level==='danger' ? 'ri-alarm-warning-fill' : 'ri-error-warning-fill';
        return `<div class="p-3 rounded-xl border ${cls}">
          <p class="text-[12px] font-bold ${textCls} flex items-center gap-1.5"><i class="${icon}"></i> ${escapeHtml(b.title)}</p>
          <p class="text-[11px] ${subCls} mt-1 leading-relaxed">${escapeHtml(b.text)}</p>
        </div>`;
      }).join('');
    } else if(tipsEl){
      // Dicas de atenção: meses em que os gastos ficaram perto de, ou passaram, a entrada
      const tips=[];
      for(let i=monthsAll.length-1; i>=0 && tips.length<4; i--){
        const inc=incByMonth[i], exp=expByMonth[i], net=netByMonth[i];
        if(inc<=0) continue; // sem entradas no mês, não dá pra avaliar margem
        const ratio=exp/inc;
        if(net<0) tips.push({ level:'danger', month:monthsAll[i], text:`Gastou ${fmtEUR(Math.abs(net))} a mais do que ganhou nesse mês.` });
        else if(ratio>=0.9) tips.push({ level:'warn', month:monthsAll[i], text:`Só sobrou ${Math.max(0,Math.round((1-ratio)*100))}% da renda (${fmtEUR(net)}).` });
      }
      if(tips.length===0){
        const lastIdx=incByMonth.length-1;
        const rate = (lastIdx>=0 && incByMonth[lastIdx]>0) ? Math.round(netByMonth[lastIdx]/incByMonth[lastIdx]*100) : null;
        tipsEl.innerHTML = `<div class="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30">
          <p class="text-[12px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"><i class="ri-checkbox-circle-fill"></i> Fluxo saudável</p>
          <p class="text-[11px] text-emerald-700/80 dark:text-emerald-400/70 mt-1 leading-relaxed">${rate!=null?`Guardando ${rate}% da renda no último mês`:'Sem entradas suficientes para avaliar ainda'} — nenhum mês estourou a renda.</p>
        </div>`;
      } else {
        tipsEl.innerHTML = tips.map(t=>{
          const d=t.level==='danger';
          return `<div class="p-3 rounded-xl border ${d?'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30':'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30'}">
            <p class="text-[12px] font-bold ${d?'text-red-700 dark:text-red-400':'text-amber-700 dark:text-amber-400'} flex items-center gap-1.5"><i class="ri-${d?'alarm-warning-fill':'error-warning-fill'}"></i> ${monthLabel(t.month)}</p>
            <p class="text-[11px] ${d?'text-red-700/80 dark:text-red-400/70':'text-amber-700/80 dark:text-amber-400/70'} mt-1 leading-relaxed">${t.text}</p>
          </div>`;
        }).join('');
      }
    }
  }

  // ---- Calendário de gastos (heatmap do mês) ----
  renderCalHeatmap(txP);

  // ---- Recorrentes: mesma descKey em >=2 meses distintos ----
  {
    const byKey={};
    txP.forEach(t=>{ if(t.saida && !t.internal){ const k=normalizeDescKey(t.desc); (byKey[k]??=({months:new Set(), total:0, count:0, desc:t.desc})); byKey[k].months.add(monthKey(t.date)); byKey[k].total+=t.saida; byKey[k].count++; }});
    const rec=Object.values(byKey).filter(x=>x.months.size>=2).sort((a,b)=>b.months.size-a.months.size || b.count-a.count || b.total-a.total).slice(0,10);
    const rl=document.getElementById('recurringList');
    if(rec.length===0){ rl.innerHTML='<span class="text-xs text-zinc-500">Nenhum padrão recorrente detectado ainda — aparece depois de 2+ meses de dados.</span>'; }
    else{
      rl.innerHTML=rec.map(r=>{
        const c=catById(categorize(r.desc));
        const avg=r.total/r.count;
        return `<div class="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
          <span class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold font-mono" style="background:${c.color}1a;color:${c.color}" title="${r.months.size} meses com esse gasto">${r.months.size}×</span>
          <span class="flex-1 min-w-0"><span class="block text-[13px] font-semibold truncate">${escapeHtml(r.desc)}</span><span class="text-[11px] text-zinc-500">${r.count}x no total · média ${fmtEUR(avg)}</span></span>
          <span class="font-bold font-mono text-[13px] shrink-0">${fmtEUR(r.total)}</span>
        </div>`;
      }).join('');
    }
  }

  // ---- Anomalias: cobranças duplicadas, valores fora do padrão, picos de gasto ----
  renderAnomalies(txP);

  updateKPIs();
  // totals no sticky bar
  const pt=document.getElementById('periodTotal'), pi=document.getElementById('periodIn');
  if(pt){ pt.textContent=fmtEUR(txP.filter(t=>t.saida&&!t.internal).reduce((s,t)=>s+t.saida,0)); }
  if(pi){ pi.textContent=fmtEUR(txP.filter(t=>t.entrada&&!t.internal).reduce((s,t)=>s+(t.entrada||0),0)); }
}
window._toggleCat=(id)=>{ activeCatFilter = activeCatFilter===id? null : id; renderCategoryChips(); renderTable(); updateCharts(); };

