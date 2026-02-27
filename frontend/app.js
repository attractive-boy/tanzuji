// App glue: manage sample ledger entries and update TreeViz + Timeline
(function(){
  // Simple sample data: last 14 days
  let daily = new Array(14).fill(0).map((_,i)=>Math.random()*3 + 0.5);
  const entries = [];

  const treeCanvas = document.getElementById('treeCanvas');
  const treeViz = new TreeViz(treeCanvas);
  const timelineSvg = document.getElementById('timeline');

  function updateVisuals() {
    const cumulativeKg = daily.reduce((a,b)=>a+b, 0);
    treeViz.setCumulativeKg(cumulativeKg);
    renderTimeline(timelineSvg, daily);
    document.getElementById('treeStats').textContent = `最近 14 天累计: ${cumulativeKg.toFixed(2)} kgCO2e`;
    document.getElementById('timelineStats').textContent = `平均每天: ${(cumulativeKg/daily.length).toFixed(2)} kgCO2e`;

    const ul = document.getElementById('entries');
    ul.innerHTML = '';
    entries.slice().reverse().forEach(e=>{
      const li = document.createElement('li');
      li.textContent = `${e.type} — ${e.amount} (${e.factor} g/unit) => ${e.kg.toFixed(3)} kg`; 
      ul.appendChild(li);
    });
  }

  document.getElementById('addBtn').addEventListener('click', async ()=>{
    const type = document.getElementById('activityType').value;
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const factor = parseFloat(document.getElementById('factor').value) || 0;
    const unit = (type === 'transport') ? 'km' : (type === 'electricity' ? 'kWh' : 'kg');

    // Try to post to backend ledger; fallback to local calculation
    let kg = (amount * factor) / 1000;
    if (window.apiClient && window.apiClient.postLedger) {
      try {
        const payload = { user_id: null, type, amount, unit, meta: { gco2PerUnit: factor }, scope: 'personal' };
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
    document.getElementById('badgeIcon').textContent = icon || '🏅';
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
  updateVisuals();
})();
