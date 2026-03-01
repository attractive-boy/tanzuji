// App glue: manage sample ledger entries and update TreeViz + Timeline
// Run app logic after DOM is ready to ensure elements exist
document.addEventListener('DOMContentLoaded', function () {

  (function(){
  // Simple sample data: last 14 days
  let daily = new Array(14).fill(0).map((_,i)=>Math.random()*3 + 0.5);
  const entries = [];

  const treeCanvas = document.getElementById('treeCanvas');
  const treeViz = new TreeViz(treeCanvas);
  const timelineSvg = document.getElementById('timeline');

  // Responsive: attach resize handler (debounced)
  let resizeTimer = null;
  function onResize() {
    try {
      if (treeViz && typeof treeViz.resize === 'function') treeViz.resize();
      renderTimeline(timelineSvg, daily);
    } catch (e) {}
  }
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 120);
  });
  // call once to size canvases based on CSS
  onResize();

  function updateVisuals() {
    const cumulativeKg = daily.reduce((a,b)=>a+b, 0);
    treeViz.setCumulativeKg(cumulativeKg);
    renderTimeline(timelineSvg, daily);
    document.getElementById('treeStats').textContent = `最近 14 天累计: ${cumulativeKg.toFixed(2)} kgCO2e`;
    document.getElementById('timelineStats').textContent = `平均每天: ${(cumulativeKg/daily.length).toFixed(2)} kgCO2e`;

    const ul = document.getElementById('entries');
    ul.innerHTML = '';
    entries.slice().reverse().forEach(e=>{
      // render as fluent-card
      const card = document.createElement('fluent-card');
      card.className = 'entry-card';
      const title = document.createElement('div');
      title.className = 'entry-title';
      title.textContent = `${e.type} — ${e.amount} ${e.type === 'transport' ? 'km' : e.type === 'electricity' ? 'kWh' : 'kg'}`;
      const meta = document.createElement('div');
      meta.className = 'entry-meta';
      meta.textContent = `${e.factor} g/unit → ${e.kg.toFixed(3)} kgCO2e`;
      card.appendChild(title);
      card.appendChild(meta);
      const li = document.createElement('li');
      li.appendChild(card);
      ul.appendChild(li);
    });
  }

  document.getElementById('addBtn').addEventListener('click', async ()=>{
    const typeEl = document.getElementById('activityType');
    const type = typeEl && typeEl.value ? typeEl.value : document.getElementById('activityType').value;
    const amountEl = document.getElementById('amount');
    const factorEl = document.getElementById('factor');
    const amount = parseFloat(amountEl && amountEl.value ? amountEl.value : amountEl);
    const factor = parseFloat(factorEl && factorEl.value ? factorEl.value : factorEl);

    // Frontend input validation
    if (!type || isNaN(amount) || !isFinite(amount) || amount < 0) {
      alert('请输入有效的数量（非负数字）');
      return;
    }
    if (isNaN(factor) || !isFinite(factor)) {
      alert('请输入有效的因子（gCO2e/unit）');
      return;
    }
    const unit = (type === 'transport') ? 'km' : (type === 'electricity' ? 'kWh' : 'kg');

    // Try to post to backend ledger; fallback to local calculation
    let kg = (amount * factor) / 1000;
    if (window.apiClient && window.apiClient.postLedger) {
      try {
        // Map generic factor to type-specific meta keys for clarity
        const meta = {};
        if (type === 'transport') meta.gco2PerKm = factor;
        else if (type === 'electricity') meta.gco2PerKwh = factor;
        else if (type === 'food') meta.gco2PerKg = factor;
        else meta.gco2PerUnit = factor;
        const payload = { user_id: null, type, amount, unit, meta, scope: 'personal' };
        const resp = await window.apiClient.postLedger(payload);
        // backend stores kgco2e as kg
        if (resp && resp.kgco2e != null) kg = parseFloat(resp.kgco2e);
      } catch (err) {
        // network fail -> continue with local
      }
    }

    // push to today (index last)
    daily[daily.length-1] += kg;
    entries.push({ type, amount, factor, kg });
    updateVisuals();
    checkForBadges();
  });

  document.getElementById('resetBtn').addEventListener('click', ()=>{
    daily = new Array(14).fill(0).map((_,i)=>Math.random()*3 + 0.5);
    entries.length = 0;
    updateVisuals();
  });

  // badge logic: simple thresholds for demo
  function showBadge(title, desc, icon) {
    const modal = document.getElementById('badgeModal');
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('badgeTitle').textContent = title;
    document.getElementById('badgeDesc').textContent = desc;
    // Use Unsplash imagery for badge visual: pick query from title or icon
    const img = document.createElement('img');
    const q = encodeURIComponent(title.replace(/\s+/g,'') + ',badge,soft');
    img.src = `https://source.unsplash.com/200x200/?${q}`;
    img.alt = title;
    img.className = 'badge-image';
    const holder = document.getElementById('badgeIcon');
    holder.innerHTML = '';
    holder.appendChild(img);
  }
  document.getElementById('closeBadge').addEventListener('click', ()=>{
    document.getElementById('badgeModal').setAttribute('aria-hidden','true');
  });

  function checkForBadges(){
    const cumulativeKg = daily.reduce((a,b)=>a+b,0);
    // Example badges
    if (cumulativeKg < 10) {
      showBadge('绿色先锋','过去 14 天排放小于 10 kgCO2e，继续保持！','🌱');
    } else if (cumulativeKg < 25) {
      showBadge('低碳努力者','过去 14 天排放小于 25 kgCO2e，表现良好！','🌿');
    }
  }

    // initial render
    try { updateVisuals(); onResize(); } catch (e) { console.error('updateVisuals failed', e); }
  })();

});
