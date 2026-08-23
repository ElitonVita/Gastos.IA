// ---------- Ollama IA Local (Gemma4) ----------
const OLLAMA_DEFAULT_MODEL = 'gemma4:latest';
let ollamaBusy=false;

function ollamaLog(msg, isError=false){
  const el=document.getElementById('ollamaLog');
  if(!el) return;
  el.classList.remove('hidden');
  const line=document.createElement('div');
  line.className = isError ? 'text-red-400' : 'text-zinc-300';
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}
function setOllamaStatus(state, text){
  const dot=document.getElementById('ollamaDot');
  const txt=document.getElementById('ollamaStatusText');
  const wrap=document.getElementById('ollamaStatus');
  if(!dot||!txt) return;
  txt.textContent=text;
  if(state==='ok'){ dot.className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse'; wrap.className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold'; }
  else if(state==='busy'){ dot.className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'; wrap.className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold'; }
  else if(state==='error'){ dot.className='w-1.5 h-1.5 rounded-full bg-red-500'; wrap.className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold'; }
  else { dot.className='w-1.5 h-1.5 rounded-full bg-zinc-500'; wrap.className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] font-bold text-zinc-400'; }
}
async function checkOllama(silent=false){
  const url=(document.getElementById('ollamaUrl')?.value||'http://localhost:11434').replace(/\/$/,'');
  try{
    const r=await fetch(url + '/api/tags', {method:'GET'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const j=await r.json();
    const models=(j.models||[]).map(m=>m.name);
    const hasGemma = models.some(m=>m.includes('gemma'));
    setOllamaStatus('ok', hasGemma ? 'online · '+models.find(m=>m.includes('gemma')) : 'online');
    if(!silent) ollamaLog('Ollama online. Modelos: ' + (models.join(', ')||'(nenhum)'));
    return true;
  }catch(e){
    setOllamaStatus('error', 'offline');
    if(!silent) ollamaLog('Ollama offline: ' + e.message + ' — verifique: OLLAMA_ORIGINS="*" ollama serve', true);
    if(!silent) ollamaLog('Dica: brew services stop ollama && OLLAMA_ORIGINS="*" ollama serve', true);
    return false;
  }
}

async function categorizeWithOllama(){
  if(ollamaBusy) return;
  const url=(document.getElementById('ollamaUrl')?.value||'http://localhost:11434').replace(/\/$/,'');
  const model=document.getElementById('ollamaModel')?.value||OLLAMA_DEFAULT_MODEL;
  const saidaTxs = transactions.filter(t=> t.saida!=null && t.saida>0 && !t.internal);
  if(saidaTxs.length===0){ ollamaLog('Nada para categorizar (sem Saídas).', true); return; }
  // IA só toca no que ainda NÃO tem categoria (outros). Já categorizadas ficam intocadas.
  let targets = saidaTxs.filter(t=> t.cat==='outros');
  const already = saidaTxs.length - targets.length;
  if(targets.length===0){
    ollamaLog(`Todas as ${saidaTxs.length} saídas já estão categorizadas — nada a fazer. ✅`);
    return;
  }
  ollamaLog(`${targets.length} sem categoria serão enviadas à IA · ${already} já categorizadas foram ignoradas`);
  ollamaBusy=true;
  const btn=document.getElementById('btnOllamaCategorize');
  if(btn){ btn.disabled=true; btn.innerHTML='<i class="ri-loader-4-line animate-spin"></i> Categorizando...'; }
  setOllamaStatus('busy','a categorizar...');
  ollamaLog(`Iniciando: ${targets.length} descrições → ${model} @ ${url}`);

  const ok = await checkOllama(true);
  if(!ok){ ollamaBusy=false; if(btn){ btn.disabled=false; btn.innerHTML='<i class="ri-magic-line"></i> Categorizar com IA local'; } setOllamaStatus('error','offline'); return; }

  const catList = categories.map(c=> `- ${c.id}: ${c.name}`).join('\n');
  const systemPrompt = `Você é um classificador de extratos bancários portugueses.\nCategorias disponíveis (use exatamente um destes ids):\n${catList}\n\nRegras:\n- Responda APENAS JSON válido, sem texto extra.\n- Formato: {"resultados":[{"idx":0,"categoria":"alimentacao"}, ...]}\n- idx é o índice da lista enviada.\n- Seja conservador: só use "outros" se realmente não encaixar.\n- Descrições em PT-PT: Continente/Pingo Doce=alimentacao, Galp/Repsol=transporte, EDP/NOS/Águas=contas, Renda/Condomínio=moradia, Farmácia/Hospital=saude, Netflix/Spotify=lazer, Amazon/Shein=compras, Escola/Curso=educacao.`;

  const BATCH=18;
  let done=0;
  for(let i=0;i<targets.length;i+=BATCH){
    const batch = targets.slice(i, i+BATCH);
    const userPrompt = batch.map((t,bi)=> `${bi}. "${t.desc.replace(/"/g,"'")}"`).join('\n');
    const fullPrompt = `Classifique estas ${batch.length} descrições:\n${userPrompt}\n\nRetorne JSON {"resultados":[{"idx":n,"categoria":"id"}]}`;

    try{
      const resp=await fetch(url + '/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model: model,
          messages: [
            {role:'system', content: systemPrompt},
            {role:'user', content: fullPrompt}
          ],
          stream:false,
          format:'json',
          options:{temperature:0.1, num_predict: 800}
        })
      });
      if(!resp.ok){
        const txt=await resp.text();
        throw new Error('HTTP '+resp.status+': '+txt.slice(0,300));
      }
      const data=await resp.json();
      let content = data.message?.content || data.response || '';
      // try parse JSON
      let parsed=null;
      try{ parsed=JSON.parse(content); }catch{
        const m=content.match(/\{.*\}/s);
        if(m) try{ parsed=JSON.parse(m[0]); }catch{}
      }
      let resultados = parsed?.resultados || parsed?.results || [];
      if(!Array.isArray(resultados) && parsed && typeof parsed==='object'){
        // sometimes model returns {"0":"alimentacao", "1":"transporte"}
        const keys=Object.keys(parsed);
        if(keys.every(k=>!isNaN(k))) resultados = keys.map(k=>({idx: parseInt(k), categoria: parsed[k]}));
      }
      if(resultados.length===0){
        ollamaLog(`Lote ${i/BATCH+1}: resposta sem JSON — "${content.slice(0,120)}"`, true);
        continue;
      }
      let applied=0;
      for(const r of resultados){
        const bi = r.idx ?? r.index;
        const catId = (r.categoria||r.category||'').toLowerCase().trim();
        if(bi==null || bi<0 || bi>=batch.length) continue;
        if(!categories.find(c=>c.id===catId)) continue;
        const tx = batch[bi];
        if(tx.cat !== catId){ tx.cat = catId; applied++; }
      }
      done+=applied;
      ollamaLog(`Lote ${i/BATCH+1}/${Math.ceil(targets.length/BATCH)}: ${applied} categorizadas`);
      renderCategoryChips(); updateCharts(); renderTable(); updateKPIs();
    }catch(e){
      ollamaLog('Erro no lote '+(i/BATCH+1)+': '+e.message, true);
      if(e.message.includes('CORS') || e.message.includes('Failed to fetch')){
        ollamaLog('Erro de CORS — rode: OLLAMA_ORIGINS="*" ollama serve', true);
        break;
      }
    }
    // small pause to not hammer
    await new Promise(r=>setTimeout(r, 120));
  }
  ollamaBusy=false;
  if(btn){ btn.disabled=false; btn.innerHTML='<i class="ri-magic-line"></i> Categorizar com IA local'; }
  setOllamaStatus('ok','online');
  ollamaLog(`Concluído: ${done} transações re-categorizadas com ${model}.`);
  if(done>0){ renderCategoryChips(); updateCharts(); renderTable(); persistState(); }
}

