// ---------- Persistência: salva tudo num gastos-data.json ao lado do HTML ----------
const STORAGE_KEY='gastos-ai-state-v1';
let fsDirHandle=null; // File System Access API (quando disponível)
let saveTimer=null;

async function idbOpen(){
  return new Promise((res)=>{
    const req=indexedDB.open('gastos-fs',1);
    req.onupgradeneeded=()=>{ req.result.createObjectStore('kv'); };
    req.onsuccess=()=>res(req.result);
    req.onerror=()=>res(null);
  });
}
async function initFsDir(){
  // Restauração SILENCIOSA de uma pasta escolhida em sessão anterior — nunca abre o
  // seletor de pastas aqui, porque showDirectoryPicker() exige gesto do usuário (clique)
  // e falha sempre que chamado sozinho no carregamento da página.
  try{
    const idb = await idbOpen();
    if(idb){
      const has = await new Promise((res)=>{
        try{
          const tx=idb.transaction('kv','readonly');
          const r=tx.objectStore('kv').get('dir');
          r.onsuccess=()=>res(r.result||null); r.onerror=()=>res(null);
        }catch{ res(null); }
      });
      if(has){
        const perm = await has.queryPermission({mode:'readwrite'});
        if(perm==='granted') fsDirHandle=has;
        // se for 'prompt', não insiste sozinho — o usuário clica "Escolher pasta" de novo se quiser
      }
    }
  }catch(e){ /* sem suporte — usa localStorage */ }
  updateFsStatus();
}
async function chooseFolder(){
  if(!('showDirectoryPicker' in window)){
    alert(t('settings.data.folderApiUnsupported'));
    return;
  }
  try{
    const handle = await window.showDirectoryPicker({id:'gastos-ai', startIn:'documents'});
    const perm = await handle.requestPermission({mode:'readwrite'});
    if(perm!=='granted') return;
    fsDirHandle = handle;
    const idb = await idbOpen();
    if(idb){ try{ const tx=idb.transaction('kv','readwrite'); tx.objectStore('kv').put(handle,'dir'); }catch{} }
    await persistState();
    updateFsStatus();
  }catch(e){ /* usuário cancelou o seletor */ }
}
function updateFsStatus(){
  const dot=document.getElementById('fsStatusDot'), text=document.getElementById('fsStatusText'), sub=document.getElementById('fsStatusSub'), btn=document.getElementById('btnChooseFolder');
  if(!text) return;
  if(fsDirHandle){
    dot.className='w-2 h-2 rounded-full shrink-0 bg-emerald-500';
    text.textContent=t('settings.data.folder', {name: fsDirHandle.name});
    sub.textContent=t('settings.data.folderSub');
    if(btn) btn.innerHTML='<i class="ri-folder-open-line"></i> '+t('settings.data.changeFolder');
  } else {
    dot.className='w-2 h-2 rounded-full shrink-0 bg-zinc-400';
    text.textContent=t('settings.data.localStorage');
    sub.textContent=t('settings.data.localStorageSub');
    if(btn) btn.innerHTML='<i class="ri-folder-open-line"></i> '+t('settings.data.chooseFolder');
  }
}

function updateOpeningBalanceStatus(){
  const statusEl=document.getElementById('obStatus'), dateEl=document.getElementById('obDate'), valEl=document.getElementById('obValue');
  if(!statusEl) return;
  if(openingBalance && openingBalance.value!=null){
    statusEl.textContent = t('openingBalance.statusSet', {value: fmtEUR(openingBalance.value), date: fmtTransactionDate(openingBalance.date)});
    if(dateEl) dateEl.value = dayKey(openingBalance.date);
    if(valEl) valEl.value = openingBalance.value;
  } else {
    statusEl.textContent = t('openingBalance.statusNone');
  }
}
document.getElementById('btnSaveOpeningBalance')?.addEventListener('click', ()=>{
  const dStr = document.getElementById('obDate').value;
  const v = parseFloat(document.getElementById('obValue').value);
  if(!dStr || isNaN(v)){ alert(t('openingBalance.invalidInput')); return; }
  openingBalance = { date: new Date(dStr+'T12:00:00'), value: v };
  updateOpeningBalanceStatus();
  updateCharts(); persistState();
});
document.getElementById('btnClearOpeningBalance')?.addEventListener('click', ()=>{
  openingBalance = { date:null, value:null };
  const dateEl=document.getElementById('obDate'), valEl=document.getElementById('obValue');
  if(dateEl) dateEl.value=''; if(valEl) valEl.value='';
  updateOpeningBalanceStatus();
  updateCharts(); persistState();
});

function buildState(){
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    categories: categories,
    bankTypes: bankTypes,
    dismissedAnomalies: Array.from(dismissedAnomalyIds),
    ignoredAnomalyDescKeys: Array.from(ignoredAnomalyDescKeys),
    openingBalance: (openingBalance && openingBalance.value!=null) ? { date: dayKey(openingBalance.date), value: openingBalance.value } : null,
    incomeTarget: (incomeTarget!=null && incomeTarget>0) ? incomeTarget : null,
    // dayKey() (baseado em getFullYear/getMonth/getDate LOCAIS) em vez de toISOString() — em fusos à frente de
    // UTC (ex: Europa), toISOString() de uma meia-noite local "volta" pro dia anterior, e cada transação
    // (e qualquer "gasto estranho" já resolvido, cujo id embute a data) perdia um dia a cada save/reload.
    transactions: transactions.map(t=>({
      date: dayKey(t.date),
      realDate: t.realDate ? dayKey(t.realDate) : null,
      desc: t.desc,
      saida: t.saida, entrada: t.entrada, balanco: t.balanco,
      note: t.note,
      cat: t.cat, internal: !!t.internal, cardPayment: !!t.cardPayment, cardSettlement: !!t.cardSettlement,
      transferGroupId: t.transferGroupId||null, transferLinked: !!t.transferLinked, autoTransfer: !!t.autoTransfer, transferApproved: !!t.transferApproved, prevCat: t.prevCat||null,
      bank: t.bank||null, meta: t.meta||null, source: t.source, sourceFiles: t.sourceFiles||null
    }))
  };
}

// núcleo síncrono — usado por persistState (debounced) e persistStateImmediate (salvar agora)
function _writeLocalStorage(state){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  }catch(e){
    // QuotaExceededError — avisa o usuário em vez de engolir silenciosamente
    const isQuota = e && (e.name==='QuotaExceededError' || e.code===22 || /quota/i.test(e.message||''));
    if(isQuota){
      const banner = document.getElementById('quotaBanner');
      // i18n: intentionally not translated — developer-facing console diagnostics, never rendered in the UI.
      if(banner) banner.classList.remove('hidden');
      else console.warn('localStorage cheio — escolha uma pasta ou baixe backup');
      ollamaLog(t('settings.data.quotaFull'), true);
    }
    return false;
  }
}
async function _writeFsDir(state){
  if(!fsDirHandle) return;
  try{
    const fh = await fsDirHandle.getFileHandle('gastos-data.json',{create:true});
    const w = await fh.createWritable();
    await w.write(JSON.stringify(state,null,2));
    await w.close();
    // i18n: intentionally not translated — developer-facing console diagnostics, never rendered in the UI.
    console.log('gastos-data.json salvo na pasta');
  }catch(e){
    // i18n: intentionally not translated — developer-facing console diagnostics, never rendered in the UI.
    console.warn('falhou salvar json na pasta',e);
  }
}
async function persistState(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(async ()=>{
    const state=buildState();
    _writeLocalStorage(state);
    await _writeFsDir(state);
  }, 400);
}
// grava NA HORA — usado pelos botões "Salvar agora" (sem debounce, sem race)
async function persistStateImmediate(){
  clearTimeout(saveTimer);
  const state=buildState();
  _writeLocalStorage(state);
  await _writeFsDir(state);
}

async function loadPersisted(){
  // 1) tenta da pasta (fonte da verdade se existir)
  if(fsDirHandle){
    try{
      const fh=await fsDirHandle.getFileHandle('gastos-data.json');
      const f=await fh.getFile();
      const j=JSON.parse(await f.text());
      applyState(j);
      ollamaLog(t('settings.data.restoredFromFolder', {count: j.transactions?.length||0, date: new Date(j.savedAt).toLocaleString()}));
      return true;
    }catch{ /* arquivo ainda não existe */ }
  }
  // 2) fallback localStorage
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(raw){
      const j=JSON.parse(raw);
      applyState(j);
      if(typeof ollamaLog==='function') {}
      // i18n: intentionally not translated — developer-facing console diagnostics, never rendered in the UI.
      console.log('restaurado do localStorage');
      return true;
    }
  }catch{}
  return false;
}
function applyState(j){
  if(!j) return;
  if(Array.isArray(j.categories) && j.categories.length){
    // mantém categorias novas que o usuário criou; preserva defaults que sumiram? simples: substitui
    categories = j.categories;
    sortCategoriesAlpha(); // backups antigos podem ter salvo em outra ordem — normaliza pra A-Z sempre
  }
  if(Array.isArray(j.bankTypes) && j.bankTypes.length){
    bankTypes = j.bankTypes;
  }
  if(Array.isArray(j.dismissedAnomalies)){
    dismissedAnomalyIds = new Set(j.dismissedAnomalies);
  }
  ignoredAnomalyDescKeys = new Set(Array.isArray(j.ignoredAnomalyDescKeys) ? j.ignoredAnomalyDescKeys : []);
  openingBalance = (j.openingBalance && j.openingBalance.value!=null)
    ? { date: new Date(j.openingBalance.date+'T12:00:00'), value: j.openingBalance.value }
    : { date: null, value: null };
  incomeTarget = (j.incomeTarget!=null && j.incomeTarget>0) ? j.incomeTarget : null;
  transactions = (j.transactions||[]).map((t,i)=>({
    // id ESTÁVEL (sem sufixo aleatório): precisa ser o mesmo a cada reload pra "aid" de anomalia
    // (que embute ids de transação) continuar batendo com dismissedAnomalyIds salvo — senão todo
    // "gasto estranho" já resolvido reaparece na próxima vez que a página carrega.
    id:`saved-${i}`,
    date: new Date(t.date+'T12:00:00'),
    realDate: t.realDate ? new Date(t.realDate+'T12:00:00') : null,
    desc: t.desc, saida:t.saida, entrada:t.entrada, balanco:t.balanco, note:t.note,
    amount: t.saida||0, internal: !!t.internal, cardPayment: !!t.cardPayment, cardSettlement: !!t.cardSettlement,
    transferGroupId: t.transferGroupId||null, transferLinked: !!t.transferLinked, autoTransfer: !!t.autoTransfer, transferApproved: !!t.transferApproved, prevCat: t.prevCat||null,
    bank: t.bank||null, meta: t.meta||null, cat:t.cat, source:t.source||'importado', sourceFiles:Array.isArray(t.sourceFiles)?t.sourceFiles:null
  }));
  const fixedDuplicates = collapseDuplicateTransactions(transactions).duplicateCount;
  currentPage=1;
  selectedTxIds.clear();
  const fixedLegacy = repairLegacyCardTransactions();
  const fixedTransfers = repairCrossAccountTransfers();
  const msgs = [];
  if(fixedDuplicates>0) msgs.push(t('settings.data.fixedDuplicatesMigration', {n: fixedDuplicates}));
  if(fixedLegacy>0) msgs.push(t('settings.data.fixedBilCardMigration', {n: fixedLegacy}));
  if(fixedTransfers>0) msgs.push(t('settings.data.fixedTransfersMigration', {n: fixedTransfers}));
  if(msgs.length){ msgs.forEach(m=>ollamaLog(m)); persistState(); }
}
// Correção retroativa: importações de "Card statement" feitas antes desta versão marcavam TODA compra do cartão
// como categoria fixa "Pagamento de Cartão" e excluída dos totais — hoje só a fatura consolidada (Monthly Visa
// payment, cardSettlement) deve ficar assim; cada compra individual é um Gasto normal e categorizável.
function repairLegacyCardTransactions(){
  let fixed = 0;
  for(const t of transactions){
    if(t.cardPayment && !t.cardSettlement && t.cat==='cartao' && t.internal){
      t.cat = categorize(t.desc);
      t.internal = false;
      fixed++;
    }
  }
  return fixed;
}
// Correção retroativa: aplica a mesma detecção automática de transferência entre contas (banco do beneficiário)
// em transações já importadas antes dessa detecção existir — não precisa reimportar o PDF.
function repairCrossAccountTransfers(){
  let fixed = 0;
  for(const t of transactions){
    if(t.internal || t.cardSettlement || t.transferLinked || t.autoTransfer) continue;
    if(t.saida==null && t.entrada==null) continue;
    const meta = t.meta||{};
    const text = `${meta.atBank||''} ${meta.beneficiary||''} ${meta.byOrderOf||''} ${meta.to||''}`;
    if(!text.trim()) continue;
    const ownIds = t.bank==='REVOLUT' ? ['REVOLUT'] : ['BIL','BIL_CARD'];
    const guess = detectCrossAccountBank(text, ownIds);
    if(guess){
      if(t.cat!=='transferencia') t.prevCat = t.cat;
      t.cat = 'transferencia';
      t.internal = true;
      t.autoTransfer = true;
      if(!t.meta) t.meta = {};
      t.meta.transferToBank = guess;
      fixed++;
    }
  }
  return fixed;
}

// hook: persist after every mutation
const _origPush = transactions.push.bind(transactions);

// Init
renderCategoryChips(); renderBankTypeChips(); ensureCharts(); updateCharts(); updateKPIs(); renderTable(); updateOpeningBalanceStatus();
setTimeout(()=>checkOllama(true), 600);
(async()=>{
  await initFsDir();
  const restored = await loadPersisted();
  if(restored){ renderCategoryChips(); renderBankTypeChips(); renderTable(); updateCharts(); updateKPIs(); updateOpeningBalanceStatus(); }
})();
document.getElementById('btnOllamaTest')?.addEventListener('click', ()=>checkOllama(false));
document.getElementById('btnSaveJson')?.addEventListener('click', async ()=>{ await persistStateImmediate(); ollamaLog(fsDirHandle? t('settings.data.savedToFolderLog', {name: fsDirHandle.name}):t('settings.data.savedToLocalLog')); });
document.getElementById('btnSaveJsonNow')?.addEventListener('click', async ()=>{ await persistStateImmediate(); alert(fsDirHandle? t('settings.data.savedToFolderAlert', {name: fsDirHandle.name}):t('settings.data.savedToLocalAlert')); });
document.getElementById('btnChooseFolder')?.addEventListener('click', chooseFolder);
document.getElementById('quotaDlBtn')?.addEventListener('click', ()=> document.getElementById('btnExportJson')?.click());
document.getElementById('btnExportJson')?.addEventListener('click', ()=>{
  const blob=new Blob([JSON.stringify(buildState(),null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download=`gastos-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
});
document.getElementById('fileImportJson')?.addEventListener('change', async e=>{
  const f=e.target.files[0]; if(!f) return;
  try{
    const j=JSON.parse(await f.text());
    applyState(j);
    renderCategoryChips(); renderBankTypeChips(); renderTable(); updateCharts(); updateKPIs(); updateOpeningBalanceStatus(); persistState();
    alert('✅ '+t('settings.data.importSuccess', {count: j.transactions?.length||0}));
  }catch(err){ alert(t('settings.data.importError', {error: err.message})); }
  e.target.value='';
});
document.getElementById('btnOllamaCategorize')?.addEventListener('click', categorizeWithOllama);
document.getElementById('btnTheme')?.addEventListener('click', ()=>{
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('gastosai_theme', isDark ? 'dark' : 'light');
  updateCharts(); // repaint chart.js canvases with theme-appropriate grid/label colors
});
