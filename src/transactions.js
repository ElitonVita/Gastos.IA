let noteTarget=null;
function openNoteDialog(tx){
  noteTarget=tx;
  document.getElementById('noteTxDesc').textContent=tx.desc;
  document.getElementById('noteTxMeta').textContent=`${(tx.realDate||tx.date).toLocaleDateString(localeTag())} · ${tx.saida?fmtEUR(tx.saida):fmtEUR(tx.entrada||0)}${tx.source?' · '+tx.source:''}`;
  document.getElementById('noteText').value=tx.note||'';
  document.getElementById('btnNoteDelete').classList.toggle('hidden', !tx.note);
  noteDialog.showModal();
}
document.getElementById('btnNoteCancel')?.addEventListener('click', ()=>noteDialog.close());
document.getElementById('btnNoteDelete')?.addEventListener('click', ()=>{
  if(noteTarget){ noteTarget.note=undefined; }
  noteDialog.close(); renderTable(); persistState();
});
document.getElementById('noteForm')?.addEventListener('submit', e=>{
  e.preventDefault();
  if(noteTarget){
    const v=document.getElementById('noteText').value.trim();
    noteTarget.note = v||undefined;
    renderTable(); persistState();
  }
  noteDialog.close();
});

// Details modal — arquivo de origem + tudo que o parser conseguiu extrair (local, hora, referências bancárias etc.)
const detailsDialog=document.getElementById('detailsDialog');
let detailsTarget=null;
function getMetaLabels(){
  // Function (not a static object) so it re-reads the current language every
  // time it's called — a plain object built once at load time would freeze
  // in whatever language was active on page load.
  return window.i18n.tObject('modals.details.metaLabels');
}
function openDetailsDialog(tx){
  detailsTarget=tx;
  document.getElementById('detailsTxDesc').textContent=tx.desc;
  const displayDate = tx.realDate||tx.date;
  document.getElementById('detailsTxMeta').textContent=`${displayDate.toLocaleDateString(localeTag())} · ${tx.saida?fmtEUR(tx.saida):fmtEUR(tx.entrada||0)}`;
  const bSel=document.getElementById('detailsBankSelect');
  bSel.innerHTML = `<option value="">${window.i18n.t('modals.details.notIdentified')}</option>` + bankTypes.map(b=>`<option value="${b.id}" ${b.id===tx.bank?'selected':''}>${escapeHtml(bankDisplayName(b))}</option>`).join('');
  const transferBox=document.getElementById('detailsTransferBox');
  const pair = tx.transferGroupId ? transactions.find(t=>t.transferGroupId===tx.transferGroupId && t!==tx) : null;
  transferBox.classList.toggle('hidden', !pair);
  if(pair){
    document.getElementById('detailsTransferPair').textContent = window.i18n.t('modals.details.transferPair', {desc: pair.desc, date: (pair.realDate||pair.date).toLocaleDateString(localeTag()), value: fmtEUR(pair.saida||pair.entrada||0), bank: pair.bank?' · '+bankLabel(pair.bank):''});
  }
  const autoBox=document.getElementById('detailsAutoTransferBox');
  const showAuto = !!tx.autoTransfer && !pair;
  autoBox.classList.toggle('hidden', !showAuto);
  if(showAuto){
    const toBank = tx.meta && tx.meta.transferToBank ? bankLabel(tx.meta.transferToBank) : '';
    document.getElementById('detailsAutoTransferInfo').textContent = toBank ? window.i18n.t('modals.details.autoTransferInfo', {bank: toBank}) : '';
  }
  const rows=[[window.i18n.t('modals.details.sourceFile'), tx.source||'—']];
  if(tx.realDate && +tx.realDate!==+tx.date) rows.push([window.i18n.t('modals.details.consideredDateLabel'), tx.date.toLocaleDateString(localeTag())]);
  const meta=tx.meta||{};
  const labels = getMetaLabels();
  for(const k of Object.keys(labels)){ if(meta[k]) rows.push([labels[k], meta[k]]); }
  document.getElementById('detailsExtra').innerHTML = rows.map(([label,val])=>`
    <div class="flex items-start justify-between gap-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span class="text-zinc-500 shrink-0">${escapeHtml(label)}</span>
      <span class="font-medium text-right break-all text-zinc-900 dark:text-zinc-100">${escapeHtml(String(val))}</span>
    </div>`).join('');
  detailsDialog.showModal();
}
document.getElementById('btnDetailsClose')?.addEventListener('click', ()=>detailsDialog.close());
document.getElementById('btnAnomalyDialogClose')?.addEventListener('click', ()=>document.getElementById('anomalyDialog').close());
document.getElementById('btnAnomalyDialogCancel')?.addEventListener('click', ()=>document.getElementById('anomalyDialog').close());
document.getElementById('btnAnomalyAccept')?.addEventListener('click', acceptCurrentAnomaly);
document.getElementById('btnAnomalyAlwaysAccept')?.addEventListener('click', alwaysAcceptCurrentAnomaly);
document.getElementById('detailsBankSelect')?.addEventListener('change', e=>{
  if(detailsTarget){ detailsTarget.bank = e.target.value || null; renderTable(); persistState(); }
});
document.getElementById('btnUnlinkTransfer')?.addEventListener('click', ()=>{
  if(!detailsTarget) return;
  unlinkTransfer(detailsTarget);
  detailsDialog.close();
  renderTable(); renderCategoryChips(); updateCharts(); updateKPIs(); persistState();
});
document.getElementById('btnRejectAutoTransfer')?.addEventListener('click', ()=>{
  if(!detailsTarget) return;
  undoAutoTransfer(detailsTarget);
  detailsDialog.close();
  renderTable(); renderCategoryChips(); updateCharts(); updateKPIs(); persistState();
});

// ---------- Ações em massa na tabela de transações ----------
document.getElementById('selectAllTx')?.addEventListener('change', e=>{
  const ids = Array.from(document.querySelectorAll('#txBody .rowSelect')).map(cb=>cb.dataset.select);
  if(e.target.checked) ids.forEach(id=>selectedTxIds.add(id));
  else ids.forEach(id=>selectedTxIds.delete(id));
  renderTable();
});
document.getElementById('bulkClearBtn')?.addEventListener('click', ()=>{
  selectedTxIds.clear();
  renderTable();
});
document.getElementById('bulkDeleteBtn')?.addEventListener('click', ()=>{
  const n=selectedTxIds.size; if(n===0) return;
  if(!confirm(window.i18n.t('actions.bulkDeleteConfirm', {n}))) return;
  transactions = transactions.filter(t=>!selectedTxIds.has(t.id));
  selectedTxIds.clear();
  renderTable(); renderCategoryChips(); updateCharts(); updateKPIs(); persistState();
});
document.getElementById('bulkSwapBtn')?.addEventListener('click', ()=>{
  const targets = transactions.filter(t=>selectedTxIds.has(t.id));
  if(targets.length===0) return;
  targets.forEach(tx=>{
    const tmp=tx.saida; tx.saida=tx.entrada; tx.entrada=tmp;
    tx.amount = tx.saida||0;
    if(tx.saida && tx.cat==='outros') tx.cat=categorize(tx.desc);
    if(!tx.saida) tx.cat='outros';
  });
  renderTable(); renderCategoryChips(); updateCharts(); updateKPIs(); persistState();
});
// ---------- Transferência entre contas (ex: BIL -> Revolut) ----------
// O mesmo dinheiro sai de uma conta e entra em outra: não é Gasto nem Entrada de verdade, só precisa aparecer.
// Vincula as duas transações (saída + entrada) com um transferGroupId em comum e marca ambas como internas,
// reaproveitando o mecanismo já usado por "transferência interna" para excluir dos totais em todo o app.
function linkTransfer(saidaTx, entradaTx){
  const groupId = `xfer-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
  for(const tx of [saidaTx, entradaTx]){
    if(tx.cat!=='transferencia') tx.prevCat = tx.cat;
    tx.transferGroupId = groupId;
    tx.transferLinked = true;
    tx.cat = 'transferencia';
    tx.internal = true;
  }
}
function unlinkTransfer(tx){
  if(!tx.transferGroupId) return;
  const groupId = tx.transferGroupId;
  for(const t of transactions.filter(t=>t.transferGroupId===groupId)){
    delete t.transferGroupId;
    t.transferLinked = false;
    t.internal = false;
    t.cat = t.prevCat || (t.saida ? categorize(t.desc) : 'outros');
    delete t.prevCat;
  }
}
// Desfaz a detecção automática de transferência (banco do beneficiário) — volta a contar como Gasto normal.
function undoAutoTransfer(tx){
  if(!tx.autoTransfer) return;
  tx.autoTransfer = false;
  tx.internal = false;
  tx.cat = tx.saida!=null ? categorize(tx.desc) : 'outros';
  if(tx.meta) delete tx.meta.transferToBank;
}
document.getElementById('bulkLinkTransferBtn')?.addEventListener('click', ()=>{
  const targets = transactions.filter(t=>selectedTxIds.has(t.id));
  if(targets.length!==2){ alert(window.i18n.t('actions.selectTwoTransfers')); return; }
  const saidaTx = targets.find(t=>t.saida!=null && t.entrada==null);
  const entradaTx = targets.find(t=>t.entrada!=null && t.saida==null);
  if(!saidaTx || !entradaTx){ alert(window.i18n.t('actions.selectOneExpenseOneIncome')); return; }
  if(saidaTx.transferLinked || entradaTx.transferLinked){ alert(window.i18n.t('actions.alreadyLinked')); return; }
  const diffPct = Math.abs(saidaTx.saida - entradaTx.entrada) / Math.max(saidaTx.saida, entradaTx.entrada);
  if(diffPct > 0.02){
    if(!confirm(window.i18n.t('actions.differentValues', {expense: fmtEUR(saidaTx.saida), income: fmtEUR(entradaTx.entrada)}))) return;
  }
  linkTransfer(saidaTx, entradaTx);
  selectedTxIds.clear();
  renderTable(); renderCategoryChips(); updateCharts(); updateKPIs(); persistState();
});
document.getElementById('bulkCatSelect')?.addEventListener('change', e=>{
  const v=e.target.value; if(!v) return;
  const targets = transactions.filter(t=>selectedTxIds.has(t.id));
  targets.forEach(tx=>{ tx.cat=v; });
  e.target.value='';
  renderTable(); renderCategoryChips(); updateCharts(); updateKPIs(); persistState();
});
document.getElementById('bulkBankSelect')?.addEventListener('change', e=>{
  const v=e.target.value; if(!v) return;
  const targets = transactions.filter(t=>selectedTxIds.has(t.id));
  targets.forEach(tx=>{ tx.bank=v; });
  e.target.value='';
  renderTable(); persistState();
});
document.getElementById('bulkNoteBtn')?.addEventListener('click', ()=>{
  if(selectedTxIds.size===0) return;
  bulkNoteTarget = Array.from(selectedTxIds);
  document.getElementById('bulkNoteDesc').innerHTML = window.i18n.t('modals.bulkNote.description', {count: bulkNoteTarget.length});
  document.getElementById('bulkNoteText').value='';
  document.getElementById('bulkNoteDialog').showModal();
});
document.getElementById('btnBulkNoteCancel')?.addEventListener('click', ()=> document.getElementById('bulkNoteDialog').close());
document.getElementById('bulkNoteForm')?.addEventListener('submit', e=>{
  e.preventDefault();
  const v=document.getElementById('bulkNoteText').value.trim();
  if(bulkNoteTarget && bulkNoteTarget.length){
    const targetSet = new Set(bulkNoteTarget);
    transactions.forEach(tx=>{ if(targetSet.has(tx.id)) tx.note = v||undefined; });
    renderTable(); persistState();
  }
  bulkNoteTarget = null;
  document.getElementById('bulkNoteDialog').close();
});

// New / edit category — mesmo modal serve os dois casos; #cEditId decide o modo
const catDialog=document.getElementById('catDialog');
function openCategoryDialog(editId){
  const c = editId ? catById(editId) : null;
  document.getElementById('catDialogTitle').textContent = c ? window.i18n.t('modals.category.titleEdit') : window.i18n.t('modals.category.titleNew');
  document.getElementById('catSubmitBtn').textContent = c ? window.i18n.t('modals.category.submitEdit') : window.i18n.t('modals.category.submitNew');
  document.getElementById('cEditId').value = c ? c.id : '';
  document.getElementById('cName').value = c ? c.name : '';
  document.getElementById('cColor').value = c ? c.color : '#6366f1';
  document.getElementById('cKeys').value = c ? (c.keys||[]).join(', ') : '';
  const icon = c ? catIcon(c) : ICON_CHOICES[0];
  document.getElementById('cIcon').value = icon;
  renderIconPicker(icon);
  catDialog.showModal();
}
document.getElementById('btnAddCat').addEventListener('click', ()=> openCategoryDialog(null));
document.getElementById('btnCancelCat').addEventListener('click', ()=> catDialog.close());
document.getElementById('catForm').addEventListener('submit', e=>{
  e.preventDefault();
  const name=document.getElementById('cName').value.trim(); if(!name) return;
  const color=document.getElementById('cColor').value;
  const icon=document.getElementById('cIcon').value || 'ri-price-tag-3-fill';
  const keys=document.getElementById('cKeys').value.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  const editId=document.getElementById('cEditId').value;
  if(editId){
    // edita no lugar — mantém o id, então todas as transações já categorizadas continuam ligadas e refletem nome/cor/ícone/palavras-chave novos
    const c=catById(editId);
    c.name=name; c.color=color; c.icon=icon; c.keys=keys;
  } else {
    const id=name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    categories.push({id,name,color,icon,keys});
  }
  sortCategoriesAlpha(); // nome pode ter mudado (edição) ou é categoria nova — reordena pra manter A-Z sempre
  catDialog.close(); document.getElementById('cName').value=''; document.getElementById('cKeys').value=''; document.getElementById('cEditId').value='';
  renderCategoryChips(); renderTable(); updateCharts(); persistState();
});

