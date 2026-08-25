// ---------- Categories ----------
const DEFAULT_CATEGORIES = [
  { id:'alimentacao', name:'Alimentação', color:'#f59e0b', icon:'ri-restaurant-2-fill', keys:[
    // BR
    'supermercado','mercado','padaria','açougue','hortifruti','ifood','rappi','restaurante','lanchonete','bar ','boteco','pão de açúcar','carrefour','extra','assai','atacadão','food','grocery',
    // Luxemburgo
    'cactus','delhaize','alima','match','naturata','kaufhaus',
    // França
    'leclerc','intermarché','intermarche','monoprix','franprix','casino','picard','lidl','aldi','biocoop',
    // Itália
    'esselunga','coop','conad','eurospin','pam','despar','crai','trattoria','pizzeria','gelateria',
    // Alemanha
    'rewe','edeka','kaufland','netto','penny','denns','bäckerei','baeckerei','imbiss',
    // internacional
    'lieferando','deliveroo','glovo','uber eats','wolt','starbucks','mcdonald','burger king'
  ] },
  { id:'transporte', name:'Transporte', color:'#06b6d4', icon:'ri-bus-2-fill', keys:[
    // BR
    'uber','99','cabify','combustível','combustivel','posto','shell','ipiranga','br ','estacionamento','pedágio','pedagio','passagem','ônibus','onibus','metrô','metro','táxi','taxi','bike','combust',
    // Luxemburgo
    'cfl','veloh','sales lentz','luxtram',
    // França
    'sncf','ratp','vélib','velib','blablacar','navigo','autoroute',
    // Itália
    'trenitalia','italo','atm milano','atac','autostrade','esso','eni','q8',
    // Alemanha
    'deutsche bahn',' db ','bvg','mvv','flixbus','flixtrain','aral','esso','tankstelle',
    // internacional
    'free now','bolt','ryanair','easyjet','vinted go','trainline','parkeasy'
  ] },
  { id:'moradia', name:'Moradia', color:'#8b5cf6', icon:'ri-home-4-fill', keys:[
    // BR
    'aluguel','condomínio','condominio','imobiliária','imobiliaria','iptu','financiamento','habitação',
    // FR/LU (francês)
    'loyer','syndic','charges locatives','notaire',
    // DE
    'miete','nebenkosten','hausverwaltung','grundsteuer',
    // IT
    'affitto','condominio','agenzia immobiliare','imu'
  ] },
  { id:'contas', name:'Contas & Casa', color:'#10b981', icon:'ri-flashlight-fill', keys:[
    // BR
    'energia','elétrica','eletrica','cemig','enel','copel','água','agua','saneamento','gás','gas','internet','vivo','claro','tim','oi ','telefone','luz ','conta ',
    // Luxemburgo
    'enovos','creos','post luxembourg','eltrona',
    // França
    'edf','engie','veolia','orange fr','sfr','bouygues telecom','free mobile','suez',
    // Itália
    'eni gas','a2a','acea','iren','tim it','vodafone it','wind tre','fastweb',
    // Alemanha
    'e.on','eon','vattenfall','stadtwerke','deutsche telekom','vodafone de','1&1','o2 de'
  ] },
  { id:'saude', name:'Saúde', color:'#ef4444', icon:'ri-heart-pulse-fill', keys:[
    // BR
    'farmácia','farmacia','drogaria','hospital','clínica','clinica','médico','medico','dentista','laboratório','laboratorio','plano de saúde','unimed','amil',
    // Luxemburgo
    'cns luxembourg','pharmacie',
    // França
    'pharmacie','mutuelle','cpam','médecin','cabinet médical',
    // Itália
    'farmacia','asl','ospedale','medico di base',
    // Alemanha
    'apotheke','arzt','krankenkasse','zahnarzt','krankenhaus'
  ] },
  { id:'lazer', name:'Lazer & Entretenimento', color:'#ec4899', icon:'ri-gamepad-fill', keys:[
    'netflix','spotify','prime video','disney','hbo','deezer','canal+','sky','apple tv','youtube premium',
    'cinema','teatro','show','ingresso','bar ','cerveja','festa','viagem','hotel','airbnb','booking',
    'ryanair','easyjet','luxair','uci cinemas','cinemaxx','pathé','pathe'
  ] },
  { id:'compras', name:'Compras', color:'#6366f1', icon:'ri-shopping-bag-3-fill', keys:[
    // BR
    'amazon','mercado livre','magalu','americanas','shopee','shein','loja','shopping','roupa','calçado','calcado','eletrônico','eletronico',
    // Europa (LU/FR/IT/DE)
    'zalando','fnac','darty','cdiscount','otto','mediamarkt','saturn','unieuro','euronics','decathlon','ikea','h&m','zara','primark','auchan'
  ] },
  { id:'educacao', name:'Educação', color:'#14b8a6', icon:'ri-graduation-cap-fill', keys:[
    'escola','faculdade','curso','mensalidade','livro','udemy','alura','educação','educacao',
    'école','université','ecole','universite','schule','universität','universitat','scuola','università','universita'
  ] },
  { id:'transferencia', name:'Transferência interna', color:'#a3a3fb', icon:'ri-exchange-fill', keys:['to eur flexible cash funds','to pocket','from eur flexible cash funds','from flexible cash funds','pocket withdrawal','transfer between accounts'] },
  { id:'cartao', name:'Pagamento de Cartão', color:'#f59e0b', icon:'ri-bank-card-fill', keys:[] },
  { id:'outros', name:'Outros', color:'#71717a', icon:'ri-shapes-fill', keys:[] },
];

let categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
sortCategoriesAlpha();
let transactions = []; // {id,date,desc,amount,saida,entrada,balanco,cat,source}
let currentPage=1; const PAGE_SIZE=30;
let selectedTxIds = new Set(); // seleção para ações em massa na tabela de transações
let bulkNoteTarget = null; // ids alvo do dialog de nota em massa
let activeCatFilter = null;
let tableSort = { key:'date', dir:'desc' }; // ordenação da tabela de transações — clique nos títulos das colunas
let dismissedAnomalyIds = new Set(); // ids de anomalias já revisadas ("aceitar") — não reaparecem
let ignoredAnomalyDescKeys = new Set(); // descrições (normalizeDescKey) marcadas como "sempre aceitar" — nunca mais viram anomalia
let currentAnomalies = []; // última lista renderizada, indexada por posição para o botão "Resolver"
// Saldo que o usuário tinha um dia antes do 1º extrato importado (ex: extratos começam em jan/2026 mas
// o salário de dezembro pagou o início de janeiro) — usado só pra ancorar o gráfico de Fluxo de caixa acumulado.
let openingBalance = { date: null, value: null };
// Meta de renda mensal (opcional) — junto com o orçamento por categoria (c.budget), alimenta a aba "Previsão"
// do Fluxo de caixa. Categorias sem orçamento definido caem pra média histórica dos últimos meses.
let incomeTarget = null;
let chartMode = 'bar';
let compareMode = 'bars';
let budgetScope = 'month'; // 'month' = só o mês mais recente | 'cumulative' = soma orçamento e real de todos os meses do período
let cashflowMode = 'cumulative';

// ---------- Helpers ----------
// Locale tag for Date/Number formatting, driven by the current UI language — so dates
// and currency follow the language toggle instead of being frozen to pt-BR/de-DE.
const localeTag = () => window.i18n.getCurrentLang() === 'en' ? 'en-US' : 'pt-BR';
const fmtEUR = v => Number(v==null||isNaN(v)?0:v).toLocaleString(localeTag(),{style:'currency',currency:'EUR'});
const fmtBRL = fmtEUR; // compat alias
const parseDate = s => {
  if(!s) return null;
  // try dd/mm/yyyy, yyyy-mm-dd, dd-mm-yyyy
  let m;
  if(m=s.match(/(\d{2})\/(\d{2})\/(\d{4})/)) return new Date(m[3],m[2]-1,m[1]);
  if(m=s.match(/(\d{4})-(\d{2})-(\d{2})/)) return new Date(m[1],m[2]-1,m[3]);
  if(m=s.match(/(\d{2})-(\d{2})-(\d{4})/)) return new Date(m[3],m[2]-1,m[1]);
  const d=new Date(s); return isNaN(d)?null:d;
};
const monthKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const monthLabel = k => { const [y,m]=k.split('-'); return new Date(y,m-1,1).toLocaleDateString(localeTag(),{month:'short',year:'numeric'})};

function categorize(text){
  const t = text.toLowerCase();
  for(const c of categories){
    if(c.id==='outros') continue;
    for(const k of c.keys){ if(k && t.includes(k.toLowerCase())) return c.id; }
  }
  return 'outros';
}
function catById(id){ return categories.find(c=>c.id===id) || categories.find(c=>c.id==='outros'); }
const catIcon = c => (c && c.icon) || 'ri-price-tag-3-fill';
// Tipo de conta/extrato de origem — usado no badge da linha, na edição em massa e em Configurações → Tipos de conta
const DEFAULT_BANK_TYPES = [
  { id:'BIL', name:'BIL', icon:'ri-bank-fill' },
  { id:'BIL_CARD', name:'Cartão BIL', icon:'ri-bank-card-fill' },
  { id:'REVOLUT', name:'Revolut', icon:'ri-exchange-dollar-fill' },
];
let bankTypes = JSON.parse(JSON.stringify(DEFAULT_BANK_TYPES));
function bankById(id){ return bankTypes.find(b=>b.id===id) || null; }
function bankLabel(b){ const x=bankById(b); return x ? bankDisplayName(x) : ''; }
function bankIcon(b){ const x=bankById(b); return x ? x.icon : 'ri-bank-line'; }

// i18n: DEFAULT_CATEGORIES/DEFAULT_BANK_TYPES keep their original Portuguese
// `name:` as a fallback (used if a locale key is ever missing), but display
// name resolution goes through catDisplayName()/bankDisplayName() so switching
// language re-translates default entries without re-persisting a baked-in string.
// User-created custom categories/bank-types (anything whose id isn't one of
// DEFAULT_CATEGORIES/DEFAULT_BANK_TYPES' ids) always use their own stored `name`
// verbatim — there's no locale key for a category the user invented themselves.
const DEFAULT_CATEGORY_IDS = new Set(DEFAULT_CATEGORIES.map(c=>c.id));
const DEFAULT_BANK_TYPE_IDS = new Set(DEFAULT_BANK_TYPES.map(b=>b.id));
// Snapshot of each default id's ORIGINAL Portuguese name, captured once here (before any
// user edit can happen) — used to detect whether the user has renamed a default category/
// bank-type through the same edit dialog used for custom ones. If `.name` still matches the
// original default, we know it's untouched and safe to translate live; if it no longer
// matches, the user renamed it and that custom name must win over the locale translation,
// exactly like a user-created category (see catDisplayName/bankDisplayName below).
const DEFAULT_CAT_NAMES = new Map(DEFAULT_CATEGORIES.map(c=>[c.id,c.name]));
const DEFAULT_BANK_TYPE_NAMES = new Map(DEFAULT_BANK_TYPES.map(b=>[b.id,b.name]));

function catDisplayName(cat){
  if (!cat) return '';
  if (DEFAULT_CATEGORY_IDS.has(cat.id) && cat.name === DEFAULT_CAT_NAMES.get(cat.id)) {
    const translated = t(`categories.${cat.id}`);
    return translated === `categories.${cat.id}` ? cat.name : translated; // t() returns the key itself on a miss — fall back to stored name
  }
  return cat.name; // user renamed this default (or it's a custom category) — their name always wins
}
function bankDisplayName(bank){
  if (!bank) return '';
  if (DEFAULT_BANK_TYPE_IDS.has(bank.id) && bank.name === DEFAULT_BANK_TYPE_NAMES.get(bank.id)) {
    const translated = t(`bankTypes.${bank.id}`);
    return translated === `bankTypes.${bank.id}` ? bank.name : translated;
  }
  return bank.name; // user renamed this default (or it's a custom bank type) — their name always wins
}

// ---------- Icon picker (nova categoria) ----------
const ICON_CHOICES = ['ri-restaurant-2-fill','ri-cup-fill','ri-car-fill','ri-bus-2-fill','ri-plane-fill','ri-home-4-fill','ri-building-4-fill','ri-flashlight-fill','ri-heart-pulse-fill','ri-hospital-fill','ri-gamepad-fill','ri-film-fill','ri-music-2-fill','ri-shopping-bag-3-fill','ri-t-shirt-fill','ri-graduation-cap-fill','ri-book-open-fill','ri-exchange-fill','ri-bank-card-fill','ri-gift-fill','ri-wallet-3-fill','ri-plant-fill','ri-briefcase-fill','ri-tools-fill','ri-smartphone-fill','ri-shapes-fill'];
function renderIconPicker(selected){
  const wrap=document.getElementById('iconPicker');
  if(!wrap) return;
  const paint = (btn, isSel) => {
    btn.className = 'iconChoice w-9 h-9 rounded-xl border flex items-center justify-center text-base transition '
      + (isSel ? 'bg-violet-600 border-violet-600 text-white' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-violet-300 dark:hover:border-violet-700');
  };
  wrap.innerHTML = ICON_CHOICES.map(ic=>`<button type="button" data-icon="${ic}" title="${ic}" class="iconChoice"><i class="${ic}"></i></button>`).join('');
  wrap.querySelectorAll('.iconChoice').forEach(b=>{
    paint(b, b.dataset.icon===selected);
    b.addEventListener('click', ()=>{
      document.getElementById('cIcon').value = b.dataset.icon;
      wrap.querySelectorAll('.iconChoice').forEach(x=>paint(x, x===b));
    });
  });
}
// ---------- Icon picker (novo tipo de conta) ----------
const BANK_ICON_CHOICES = ['ri-bank-fill','ri-bank-card-fill','ri-bank-card-2-fill','ri-exchange-fill','ri-exchange-dollar-fill','ri-wallet-3-fill','ri-secure-payment-fill','ri-coins-fill','ri-money-euro-circle-fill','ri-bank-line','ri-shapes-fill'];
function renderBankIconPicker(selected){
  const wrap=document.getElementById('bankIconPicker');
  if(!wrap) return;
  const paint = (btn, isSel) => {
    btn.className = 'bankIconChoice w-9 h-9 rounded-xl border flex items-center justify-center text-base transition '
      + (isSel ? 'bg-violet-600 border-violet-600 text-white' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-violet-300 dark:hover:border-violet-700');
  };
  wrap.innerHTML = BANK_ICON_CHOICES.map(ic=>`<button type="button" data-icon="${ic}" title="${ic}" class="bankIconChoice"><i class="${ic}"></i></button>`).join('');
  wrap.querySelectorAll('.bankIconChoice').forEach(b=>{
    paint(b, b.dataset.icon===selected);
    b.addEventListener('click', ()=>{
      document.getElementById('bIcon').value = b.dataset.icon;
      wrap.querySelectorAll('.bankIconChoice').forEach(x=>paint(x, x===b));
    });
  });
}
function renderBankTypeChips(){
  const wrap=document.getElementById('bankTypeChips');
  if(!wrap) return;
  wrap.innerHTML='';
  bankTypes.forEach(b=>{
    const item=document.createElement('span');
    item.className='inline-flex items-center gap-1';
    const chip=document.createElement('span');
    chip.className='inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200';
    chip.innerHTML=`<span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 bg-violet-600 text-white"><i class="${b.icon}"></i></span>${escapeHtml(bankDisplayName(b))} <span class="opacity-60 font-mono">${transactions.filter(t=>t.bank===b.id).length||0}</span>`;
    item.appendChild(chip);
    const editBtn=document.createElement('button');
    editBtn.type='button';
    editBtn.title=t('common.editItemTitle', {name: escapeHtml(bankDisplayName(b))});
    editBtn.className='w-7 h-7 shrink-0 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-700 flex items-center justify-center text-[12px] transition';
    editBtn.innerHTML='<i class="ri-pencil-fill"></i>';
    editBtn.onclick=()=> openBankTypeDialog(b.id);
    item.appendChild(editBtn);
    wrap.appendChild(item);
  });
  // popula o filtro "Contas" da tabela de transações, preservando a seleção atual
  const sel=document.getElementById('filterBank');
  if(sel){
    const cur=sel.value;
    sel.innerHTML = `<option value="">${t('filters.bankAll')}</option>`
      + bankTypes.map(b=>`<option value="${b.id}">${escapeHtml(bankDisplayName(b))}</option>`).join('')
      + `<option value="__none__">${t('filters.bankNone')}</option>`;
    sel.value = Array.from(sel.options).some(o=>o.value===cur) ? cur : '';
  }
}
function openBankTypeDialog(editId){
  const b = editId ? bankById(editId) : null;
  document.getElementById('bankDialogTitle').textContent = b ? t('modals.bankType.titleEdit') : t('modals.bankType.titleNew');
  document.getElementById('bankSubmitBtn').textContent = b ? t('modals.category.submitEdit') : t('modals.bankType.submitNew');
  document.getElementById('bEditId').value = b ? b.id : '';
  document.getElementById('bName').value = b ? b.name : '';
  const icon = b ? b.icon : BANK_ICON_CHOICES[0];
  document.getElementById('bIcon').value = icon;
  renderBankIconPicker(icon);
  document.getElementById('bankTypeDialog').showModal();
}
document.getElementById('btnAddBankType')?.addEventListener('click', ()=> openBankTypeDialog(null));
document.getElementById('btnCancelBankType')?.addEventListener('click', ()=> document.getElementById('bankTypeDialog').close());
document.getElementById('bankTypeForm')?.addEventListener('submit', e=>{
  e.preventDefault();
  const name=document.getElementById('bName').value.trim(); if(!name) return;
  const icon=document.getElementById('bIcon').value || BANK_ICON_CHOICES[0];
  const editId=document.getElementById('bEditId').value;
  if(editId){
    const b=bankById(editId); if(b){ b.name=name; b.icon=icon; }
  } else {
    let base = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'') || ('conta_'+bankTypes.length);
    let uid=base, n=2; while(bankTypes.some(x=>x.id===uid)){ uid=base+'_'+n++; }
    bankTypes.push({id:uid, name, icon});
  }
  renderBankTypeChips(); renderBulkBar(); renderTable(); persistState();
  document.getElementById('bankTypeDialog').close();
});
// Quando uma transação é categorizada, propaga para TODAS com descrição idêntica
function applySameDescription(changedTx, silent){
  if(!changedTx || !changedTx.desc) return 0;
  const key = normalizeDescKey(changedTx.desc);
  let n=0;
  for(const t of transactions){
    if(t===changedTx) continue;
    if(normalizeDescKey(t.desc)===key && !t.internal && t.cat!==changedTx.cat){
      t.cat = changedTx.cat;
      if(changedTx.cat==='transferencia') t.internal = true; // propaga também o "não contar nos totais"
      n++;
    }
  }
  if(n>0){
    renderCategoryChips(); updateCharts(); updateKPIs(); renderTable(); persistState();
    if(!silent){ ollamaLog(t('categories.propagatedLog', {n, desc: changedTx.desc.slice(0,40), category: catDisplayName(catById(changedTx.cat))})); }
  }
  return n;
}
// Mantém `categories` sempre em ordem alfabética — chamado toda vez que a lista muda (criar, editar nome,
// restaurar backup) pra qualquer lugar que itere `categories` diretamente (chips, dropdowns, orçamento)
// já sair ordenado, sem precisar duplicar o sort em cada render.
function sortCategoriesAlpha(){
  // Nota: não usa catDisplayName aqui de propósito — esta função roda no
  // bootstrap do módulo (linha ~86), antes de DEFAULT_CATEGORY_IDS/DEFAULT_CAT_NAMES
  // serem inicializadas (TDZ), o que derruba o app inteiro. Ordenar pelo nome
  // bruto também não muda nada na prática nesse ponto do carregamento, já que
  // as traduções ainda nem foram aplicadas.
  categories.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
}
function normalizeDescKey(d){
  // lowercase + remove números de cartão/refs e espaços extras — agrupa variações do mesmo merchant
  let k=(d||'').toLowerCase().trim();
  k=k.replace(/\*{2,}[^ ]*/g,'').replace(/\b\d{4}[ *x]?\b/g,'');   // ****1234 refs
  k=k.replace(/\s+/g,' ').trim();
  return k;
}
// Ao reimportar o mesmo extrato (ou um extrato equivalente), a transação já existe (mesma data+descrição+valor) —
// em vez de descartar tudo, completa na existente qualquer detalhe que ela ainda não tinha (tipo de conta, local,
// referências bancárias, saldo etc.), sem duplicar a linha nem sobrescrever o que o usuário já editou.
function mergeMissingDetails(existing, incoming){
  let changed = false;
  if(!existing.bank && incoming.bank){ existing.bank = incoming.bank; changed = true; }
  if(incoming.meta){
    if(!existing.meta) existing.meta = {};
    for(const k of Object.keys(incoming.meta)){
      if((existing.meta[k]==null || existing.meta[k]==='') && incoming.meta[k]!=null && incoming.meta[k]!==''){
        existing.meta[k] = incoming.meta[k];
        changed = true;
      }
    }
    if(Object.keys(existing.meta).length===0) delete existing.meta;
  }
  if(!existing.cardPayment && incoming.cardPayment){ existing.cardPayment = true; changed = true; }
  if(!existing.realDate && incoming.realDate){ existing.realDate = incoming.realDate; changed = true; }
  if(existing.balanco==null && incoming.balanco!=null){ existing.balanco = incoming.balanco; changed = true; }
  return changed;
}
// Movimentações internas (Revolut pockets, Flexible Cash Funds etc.) — não são gastos nem receitas
function isInternalTransfer(desc){
  const d=(desc||'').toLowerCase().trim();
  // Guard: "To ..." sem keyword interna explícita NÃO é transferência (ex: "To COMUNE DI ROMA" é pagamento)
  // Apenas padrões com keywords internas contam
  return /(^to (eur|usd|gbp|chf) )|(^to pocket)|(^from (eur|usd|gbp|chf) )|(flexible cash funds)|(^pocket (withdrawal|deposit))/i.test(d);
}

