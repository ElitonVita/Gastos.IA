// ---------- File handling ----------
const dropZone=document.getElementById('dropZone');
const fileInput=document.getElementById('fileInput');
const folderInput=document.getElementById('folderInput');
const fileList=document.getElementById('fileList');

function showProgress(pct,label){
  const w=document.getElementById('progressWrap'); w.classList.remove('hidden');
  document.getElementById('progressBar').style.width=pct+'%';
  document.getElementById('progressPct').textContent=Math.round(pct)+'%';
  if(label) document.getElementById('progressLabel').textContent=label;
}
function hideProgress(){ document.getElementById('progressWrap').classList.add('hidden'); }

async function handleFiles(files){
  const pdfs = Array.from(files).filter(f=> f.name.toLowerCase().endsWith('.pdf'));
  if(pdfs.length===0){ alert('Nenhum PDF encontrado. Selecione arquivos .pdf'); return; }
  fileList.classList.remove('hidden');
  fileList.innerHTML = pdfs.map(f=>`<div class="flex items-center gap-3 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm"><i class="fileIcon ri-file-pdf-line text-red-500 text-lg"></i><span class="flex-1 truncate font-medium">${escapeHtml(f.name)}</span><span class="bankBadge"></span><span class="text-xs font-mono text-zinc-500">${(f.size/1024).toFixed(0)} KB</span><span class="status text-[11px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">lendo...</span></div>`).join('');
  let allNew=[];
  window._lastPdfTexts=[];
  window._lastStructured=[];
  for(let i=0;i<pdfs.length;i++){
    const f=pdfs[i]; showProgress((i/pdfs.length)*100, `Lendo ${f.name} (${i+1}/${pdfs.length})`);
    try{
      const buf=await f.arrayBuffer();
      const pdf=await pdfjsLib.getDocument({data:buf}).promise;
      let text='';
      let structuredPages=[]; // array of lines with X info per page
      for(let p=1;p<=pdf.numPages;p++){
        const page=await pdf.getPage(p);
        const viewport = page.getViewport({scale:1});
        const pageWidth = viewport.width;
        const c=await page.getTextContent();
        const items=c.items.map(it=>({
          str: it.str,
          x: it.transform[4],
          y: it.transform[5],
          w: it.width || (it.str.length*6)
        }));
        // sort by Y desc, then X asc
        items.sort((a,b)=> b.y - a.y || a.x - b.x);
        // group into lines by Y
        let groups=[];
        let curY=null, curItems=[];
        for(const it of items){
          if(curY===null) curY=it.y;
          if(Math.abs(it.y - curY) > 4){
            groups.push({y: curY, items: curItems.slice()});
            curItems=[it]; curY=it.y;
          } else curItems.push(it);
        }
        if(curItems.length) groups.push({y: curY, items: curItems.slice()});
        // build text + structured lines
        for(const g of groups){
          g.items.sort((a,b)=>a.x-b.x);
          let lineText='';
          let prevEnd=null;
          for(const it of g.items){
            let gap=' ';
            if(prevEnd!==null){
              const gapPx = it.x - prevEnd;
              if(gapPx > 28) gap='  '; // wide gap = empty column separator
              else if(gapPx > 12) gap=' ';
              else gap=' ';
            }
            lineText += (lineText? gap : '') + it.str;
            prevEnd = it.x + it.w;
          }
          lineText=lineText.trim();
          if(lineText) {
            text += lineText + '\n';
            structuredPages.push({text: lineText, y: g.y, pageWidth, items: g.items});
          }
        }
      }
      window._lastPdfTexts.push(text);
      window._lastStructured.push(structuredPages);
      const txs=extractTransactionsFromText(text, f.name, structuredPages);
      allNew.push(...txs);
      const row=fileList.children[i]; const st=row.querySelector('.status');
      const saidas = txs.filter(t=>t.saida).length;
      const entradas = txs.filter(t=>t.entrada).length;
      st.textContent = txs.length? `${saidas} saídas · ${entradas} entradas` : 'nenhum valor encontrado';
      st.className='status text-[11px] font-bold px-2 py-1 rounded-full '+(txs.length? 'bg-emerald-100 text-emerald-700':'bg-zinc-200 text-zinc-600');
      // Ícone de cartão + selo "BIL" quando detectamos uma fatura de cartão BIL
      const detectedBank = detectBankType(text);
      const icon = row.querySelector('.fileIcon');
      const badge = row.querySelector('.bankBadge');
      if(detectedBank==='BIL_CARD'){
        if(icon){ icon.className='fileIcon ri-bank-card-2-fill text-amber-500 text-lg'; icon.title='Fatura de cartão BIL'; }
        if(badge) badge.innerHTML='<span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">BIL</span>';
      } else if(detectedBank==='BIL'){
        if(icon){ icon.className='fileIcon ri-bank-fill text-red-500 text-lg'; icon.title='Extrato de conta BIL'; }
        if(badge) badge.innerHTML='<span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">BIL</span>';
      } else if(detectedBank==='REVOLUT'){
        if(icon){ icon.title='Extrato Revolut'; }
        if(badge) badge.innerHTML='<span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">Revolut</span>';
      }
    }catch(e){
      const row=fileList.children[i]; const st=row.querySelector('.status');
      st.textContent='erro ao ler'; st.className='status text-[11px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-700';
      console.error(e);
    }
  }
  showProgress(100,'Concluído'); setTimeout(hideProgress,900);
  if(allNew.length===0){
    alert('Não encontrei valores no formato esperado (ex: 12,34 € , € 1.234,56 ou 1 234,56 €). Abra o PDF e tente selecionar o valor com o mouse — se não conseguir selecionar, é PDF escaneado (imagem) e precisa de OCR. Use “Adicionar transação manual” como alternativa.');
    // mostra prévia do texto extraído para diagnóstico (primeiros 1200 chars)
    const lastTexts = window._lastPdfTexts || [];
    if(lastTexts.length){
      const preview = lastTexts[0].slice(0,1200);
      const dbg = document.createElement('div');
      dbg.className='mt-3 p-3 rounded-xl bg-zinc-900 text-zinc-100 text-xs font-mono whitespace-pre-wrap break-words max-h-[200px] overflow-auto border border-zinc-700';
      dbg.innerHTML = '<div class="font-bold mb-1 text-amber-300">Texto extraído (primeiros 1200 chars) — copie e me envie se o erro persistir:</div>' + escapeHtml(preview || '(vazio — PDF sem texto selecionável)');
      fileList.appendChild(dbg);
    }
    return;
  }
  // --- dedup: não duplica transações idênticas (data+descrição+saída+entrada) já presentes ---
  // mas, se o mesmo extrato trouxer detalhes que a transação já salva ainda não tinha
  // (tipo de conta, local, referências bancárias, saldo...), completa a existente em vez de descartar tudo.
  // usa a data real da transação (não a data de pagamento da fatura do cartão) para não confundir compras diferentes do mesmo mês
  const sigOf = t => { const rd=t.realDate||t.date; return `${rd instanceof Date ? rd.toISOString().slice(0,10) : String(t.dateStr||rd)}|${normalizeDescKey(t.desc)}|${t.saida??''}|${t.entrada??''}`; };
  const existingBySig = new Map();
  for(const t of transactions){ existingBySig.set(sigOf(t), t); }
  const beforeDedup = allNew.length;
  let enrichedCount = 0;
  allNew = allNew.filter(t => {
    const existing = existingBySig.get(sigOf(t));
    if(!existing) return true; // é novidade de verdade, mantém para importar
    if(mergeMissingDetails(existing, t)) enrichedCount++;
    return false; // já existe — não duplica a linha
  });
  const dupCount = beforeDedup - allNew.length;
  if(dupCount > 0){
    const row=fileList.children[pdfs.length-1];
    if(row){
      const extra = enrichedCount>0 ? ` · ${enrichedCount} completadas com novos detalhes` : '';
      row.insertAdjacentHTML('afterend', `<div class="text-[11px] text-amber-600 font-semibold px-3 py-1">⏭️ ${dupCount} duplicadas ignoradas (data+descrição+valor idênticos)${extra}</div>`);
    }
  }
  if(enrichedCount > 0){ renderTable(); renderBankTypeChips(); persistState(); }
  if(allNew.length===0){
    showProgress(100,'Nada novo'); setTimeout(hideProgress,900);
    ollamaLog?.(`${dupCount} movimentos duplicados${enrichedCount>0?` (${enrichedCount} completados com novos detalhes)`:''} — nada novo importado.`);
    return;
  }
  // auto-herda categoria de descrições já conhecidas (do JSON salvo ou da sessão)
  const known={};
  for(const t of transactions){ if(t.saida && !t.internal && t.cat!=='outros') known[normalizeDescKey(t.desc)]=t.cat; }
  let inherited=0;
  for(const t of allNew){
    if(t.saida && !t.internal && t.cat==='outros'){
      const k=known[normalizeDescKey(t.desc)];
      if(k){ t.cat=k; inherited++; }
    }
  }
  transactions.push(...allNew);
  currentPage=1;
  renderCategoryChips(); renderTable(); updateCharts(); updateKPIs();
  persistState();
  if(inherited>0){ fileList.querySelectorAll('.status')[pdfs.length-1]?.insertAdjacentHTML('afterend', `<div class="text-[11px] text-violet-600 font-semibold px-3 py-1">✨ ${inherited} herdados de categorias já salvas</div>`); }
  // auto IA if enabled
  if(document.getElementById('ollamaAuto')?.checked && allNew.some(t=>t.saida)){
    setTimeout(()=>categorizeWithOllama(), 350);
  }
}

// Drag & drop
dropZone.addEventListener('click', (e)=>{ if(e.target.closest('button')) return; fileInput.click(); });
dropZone.addEventListener('dragover', e=>{ e.preventDefault(); dropZone.classList.add('drop-active'); });
dropZone.addEventListener('dragleave', ()=> dropZone.classList.remove('drop-active'));
dropZone.addEventListener('drop', e=>{ e.preventDefault(); dropZone.classList.remove('drop-active'); if(e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); });

document.getElementById('btnPickFiles').addEventListener('click', ()=> fileInput.click());
document.getElementById('btnPickFolder').addEventListener('click', ()=> folderInput.click());
fileInput.addEventListener('change', ()=> handleFiles(fileInput.files));
folderInput.addEventListener('change', ()=> handleFiles(folderInput.files));

// debounce helper (evita renderTable a cada tecla em bases grandes)
function debounce(fn, ms){ let id; return (...a)=>{ clearTimeout(id); id=setTimeout(()=>fn(...a), ms); }; }
document.getElementById('searchTx').addEventListener('input', debounce(()=>{ currentPage=1; renderTable(); }, 180));
document.getElementById('filterCat').addEventListener('change', e=>{ activeCatFilter=e.target.value||null; currentPage=1; renderCategoryChips(); renderTable(); });
const ft=document.getElementById('filterType'); if(ft) ft.addEventListener('change', ()=>{ currentPage=1; renderTable(); });
const fb=document.getElementById('filterBank'); if(fb) fb.addEventListener('change', ()=>{ currentPage=1; renderTable(); });
// ordenação pelos títulos das colunas — clique alterna asc/desc; trocar de coluna usa um padrão sensato
// (data/valores começam do maior/mais recente, texto começa alfabético)
document.querySelectorAll('th[data-sort]').forEach(th=>{
  th.addEventListener('click', ()=>{
    const key = th.dataset.sort;
    if(tableSort.key===key){ tableSort.dir = tableSort.dir==='asc' ? 'desc' : 'asc'; }
    else { tableSort = { key, dir: (key==='saida'||key==='entrada'||key==='date') ? 'desc' : 'asc' }; }
    currentPage=1;
    renderTable();
  });
});
const fpt=document.getElementById('filterPeriodTop'); if(fpt) fpt.addEventListener('change', e=>setPeriod(e.target.value));
const prevBtn=document.getElementById('prevPage'); const nextBtn=document.getElementById('nextPage');
function scrollTableIntoView(){
  const table = document.getElementById('txBody')?.closest('.overflow-auto');
  if(!table) return;
  // rola SOMENTE o frame da tabela de volta ao topo (suave)
  table.scrollTo({top:0, behavior:'smooth'});
  // e garante que o cabeçalho da tabela fique visível na viewport da página (sem pular a página inteira)
  const header = table.closest('.bg-white');
  const r = header?.getBoundingClientRect();
  if(r && (r.top < 0 || r.top > window.innerHeight - 120)){
    window.scrollTo({top: window.scrollY + r.top - 80, behavior:'smooth'});
  }
}
if(prevBtn) prevBtn.addEventListener('click', ()=>{ if(currentPage>1){ currentPage--; renderTable(); scrollTableIntoView(); }});
if(nextBtn) nextBtn.addEventListener('click', ()=>{ currentPage++; renderTable(); scrollTableIntoView(); });

// Chart mode toggle
document.querySelectorAll('.chartModeBtn').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('.chartModeBtn').forEach(x=>{ x.classList.remove('bg-white','dark:bg-zinc-700','shadow-sm'); x.classList.add('text-zinc-500'); });
    b.classList.add('bg-white','dark:bg-zinc-700','shadow-sm'); b.classList.remove('text-zinc-500');
    chartMode = b.dataset.chartmode.trim();
    updateCharts();
  });
});

// Compare (categoria x mês) mode toggle: barras agrupadas vs linhas sobrepostas
document.querySelectorAll('.compareModeBtn').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('.compareModeBtn').forEach(x=>{ x.classList.remove('bg-white','dark:bg-zinc-700','shadow-sm'); x.classList.add('text-zinc-500'); });
    b.classList.add('bg-white','dark:bg-zinc-700','shadow-sm'); b.classList.remove('text-zinc-500');
    compareMode = b.dataset.comparemode;
    updateCharts();
  });
});
document.querySelectorAll('.budgetScopeBtn').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('.budgetScopeBtn').forEach(x=>{ x.classList.remove('bg-white','dark:bg-zinc-700','shadow-sm'); x.classList.add('text-zinc-500'); });
    b.classList.add('bg-white','dark:bg-zinc-700','shadow-sm'); b.classList.remove('text-zinc-500');
    budgetScope = b.dataset.budgetscope;
    updateCharts();
  });
});

// Fluxo de caixa: mensal vs acumulado
document.querySelectorAll('.cashflowModeBtn').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('.cashflowModeBtn').forEach(x=>{ x.classList.remove('bg-white','dark:bg-zinc-700','shadow-sm'); x.classList.add('text-zinc-500'); });
    b.classList.add('bg-white','dark:bg-zinc-700','shadow-sm'); b.classList.remove('text-zinc-500');
    cashflowMode = b.dataset.cashflowmode;
    updateCharts();
  });
});

// Demo data
const DEMO = [
  {date:'2026-02-01',desc:'Saldo inicial',saida:null,entrada:null,balanco:3240.00,cat:'outros'},
  {date:'2026-02-05',desc:'Supermercado Continente',saida:87.42,entrada:null,balanco:3152.58,cat:'alimentacao'},
  {date:'2026-02-06',desc:'Ordenado Fevereiro',saida:null,entrada:1850.00,balanco:5002.58,cat:'outros'},
  {date:'2026-02-08',desc:'Restaurante Sampa',saida:64.90,entrada:null,balanco:4937.68,cat:'alimentacao'},
  {date:'2026-02-12',desc:'Posto Galp - Combustível',saida:45.00,entrada:null,balanco:4892.68,cat:'transporte'},
  {date:'2026-02-14',desc:'Uber Viagem',saida:12.60,entrada:null,balanco:4880.08,cat:'transporte'},
  {date:'2026-02-15',desc:'Netflix',saida:15.90,entrada:null,balanco:4864.18,cat:'lazer'},
  {date:'2026-02-18',desc:'Farmácia Wells',saida:29.80,entrada:null,balanco:4834.38,cat:'saude'},
  {date:'2026-02-20',desc:'Renda - Aluguel',saida:850.00,entrada:null,balanco:3984.38,cat:'moradia'},
  {date:'2026-02-22',desc:'EDP Energia',saida:67.33,entrada:null,balanco:3917.05,cat:'contas'},
  {date:'2026-02-25',desc:'Amazon.es - Eletrônicos',saida:142.00,entrada:null,balanco:3775.05,cat:'compras'},
  {date:'2026-02-28',desc:'Reembolso IRS',saida:null,entrada:320.00,balanco:4095.05,cat:'outros'},
  {date:'2026-03-02',desc:'Pingo Doce Supermercado',saida:112.10,entrada:null,balanco:3982.95,cat:'alimentacao'},
  {date:'2026-03-09',desc:'NOS Internet Fibra',saida:39.90,entrada:null,balanco:3943.05,cat:'contas'},
  {date:'2026-03-11',desc:'Spotify Família',saida:10.99,entrada:null,balanco:3932.06,cat:'lazer'},
  {date:'2026-03-14',desc:'Ginásio Fitness Hut',saida:32.90,entrada:null,balanco:3899.16,cat:'saude'},
  {date:'2026-03-18',desc:'Transferência recebida',saida:null,entrada:150.00,balanco:4049.16,cat:'outros'},
  {date:'2026-03-22',desc:'Condomínio',saida:120.00,entrada:null,balanco:3929.16,cat:'moradia'},
  {date:'2026-03-28',desc:'Restaurante Outback',saida:48.50,entrada:null,balanco:3880.66,cat:'alimentacao'},
  {date:'2026-04-03',desc:'Continente Supermercado',saida:98.70,entrada:null,balanco:3781.96,cat:'alimentacao'},
  {date:'2026-04-10',desc:'Curso Udemy',saida:19.99,entrada:null,balanco:3761.97,cat:'educacao'},
  {date:'2026-04-15',desc:'HBO Max',saida:9.99,entrada:null,balanco:3751.98,cat:'lazer'},
  {date:'2026-04-25',desc:'Shein - Compras',saida:56.70,entrada:null,balanco:3695.28,cat:'compras'},
  {date:'2026-05-01',desc:'Ordenado Maio',saida:null,entrada:1850.00,balanco:5545.28,cat:'outros'},
  {date:'2026-05-11',desc:'Galp Combustível',saida:50.00,entrada:null,balanco:5495.28,cat:'transporte'},
  {date:'2026-05-16',desc:'Dentista - Consulta',saida:80.00,entrada:null,balanco:5415.28,cat:'saude'},
  {date:'2026-05-20',desc:'Renda - Aluguel',saida:850.00,entrada:null,balanco:4565.28,cat:'moradia'},
  {date:'2026-05-28',desc:'Cinema + Jantar',saida:34.00,entrada:null,balanco:4531.28,cat:'lazer'},
  {date:'2026-05-30',desc:'To EUR Flexible Cash Funds',saida:400.00,entrada:null,balanco:4131.28,cat:'transferencia'},
  {date:'2026-06-02',desc:'To pocket EUR Groceries from EUR',saida:150.00,entrada:null,balanco:3981.28,cat:'transferencia'},
  {date:'2026-06-03',desc:'Pocket Withdrawal',entrada:80.00,saida:null,balanco:4061.28,cat:'transferencia'},
];
document.getElementById('btnDemo').addEventListener('click', ()=>{
  const base=Date.now();
  transactions = DEMO.map((d,i)=>({
    id:'demo-'+i+'-'+base,
    date: new Date(d.date),
    desc: d.desc,
    saida: d.saida, entrada: d.entrada, balanco: d.balanco,
    amount: (d.saida||0),
    internal: d.cat==='transferencia',
    cat: d.cat,
    source: 'dados-de-exemplo.pdf'
  }));
  fileList.classList.remove('hidden');
  fileList.innerHTML=`<div class="flex items-center gap-3 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 text-sm"><i class="ri-sparkling-line text-emerald-600"></i><span class="flex-1 font-semibold text-emerald-800 dark:text-emerald-200">Dados de exemplo carregados — ${DEMO.length} despesas</span><span class="text-xs font-mono text-emerald-700">${fmtEUR(DEMO.filter(x=>x.saida).reduce((s,x)=>s+x.saida,0))}</span></div>`;
  renderCategoryChips(); renderTable(); updateCharts();
});

// Export CSV
document.getElementById('btnExport').addEventListener('click', ()=>{
  if(transactions.length===0){ alert('Nada para exportar ainda.'); return; }
  const header=['data','descricao','saida','entrada','saldo','categoria','arquivo'];
  const rows=transactions.map(t=>[
    (t.realDate||t.date).toISOString().slice(0,10),
    `"${t.desc.replace(/"/g,'""')}"`,
    t.saida!=null? t.saida.toFixed(2).replace('.',','):'',
    t.entrada!=null? t.entrada.toFixed(2).replace('.',','):'',
    t.balanco!=null? t.balanco.toFixed(2).replace('.',','):'',
    catById(t.cat).name,
    t.source
  ].join(';'));
  const csv=[header.join(';'),...rows].join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='gastos.csv'; a.click(); URL.revokeObjectURL(url);
});

// Clear
document.getElementById('btnClear').addEventListener('click', ()=>{
  if(!transactions.length) return;
  if(!confirm(`Limpar ${transactions.length} transações?`)) return;
  transactions=[]; fileList.classList.add('hidden'); fileList.innerHTML=''; activeCatFilter=null;
  try{ localStorage.removeItem(STORAGE_KEY); }catch{}
  if(fsDirHandle){ fsDirHandle.removeEntry('gastos-data.json').catch(()=>{}); }
  renderCategoryChips(); renderTable(); updateCharts(); updateKPIs(); hideProgress();
});

// Manual entry
const manualDialog=document.getElementById('manualDialog');
document.getElementById('btnAddManual').addEventListener('click', ()=>{
  document.getElementById('mDate').valueAsDate=new Date();
  document.getElementById('mVal').value=''; document.getElementById('mDesc').value='';
  manualDialog.showModal();
});
document.getElementById('btnCancelManual').addEventListener('click', ()=> manualDialog.close());
document.getElementById('manualForm').addEventListener('submit', e=>{
  e.preventDefault();
  const date=new Date(document.getElementById('mDate').value||Date.now());
  const amount=parseFloat(document.getElementById('mVal').value);
  const desc=document.getElementById('mDesc').value.trim()||'Movimento';
  const typeEl=document.getElementById('mType'); const isEntrada = typeEl && typeEl.value==='entrada';
  const cat=document.getElementById('mCat').value || (isEntrada ? 'outros' : categorize(desc));
  const internal = cat==='transferencia'; // marcado manualmente como Transferência interna — some dos totais
  if(!amount||isNaN(amount)){ alert('Informe um valor válido'); return; }
  if(isEntrada) transactions.push({ id:'manual-'+Date.now(), date, desc, saida:null, entrada:Math.abs(amount), balanco:null, amount:0, cat, internal, source:'manual' });
  else transactions.push({ id:'manual-'+Date.now(), date, desc, saida:Math.abs(amount), entrada:null, balanco:null, amount:Math.abs(amount), cat, internal, source:'manual' });
  manualDialog.close(); renderCategoryChips(); renderTable(); updateCharts(); persistState();
});

// Note modal logic
const noteDialog=document.getElementById('noteDialog');
