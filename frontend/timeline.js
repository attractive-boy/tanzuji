// Simple timeline: render last N days as bars (kgCO2e per day)
function renderTimeline(svgEl, dailyValues) {
  // Compute size from element's layout size for responsiveness
  const rect = svgEl.getBoundingClientRect();
  const w = Math.max(120, Math.floor(rect.width || parseInt(svgEl.getAttribute('width') || 600)));
  const h = Math.max(80, Math.floor(rect.height || parseInt(svgEl.getAttribute('height') || 300)));
  const padding = Math.min(28, Math.floor(w * 0.06));
  svgEl.setAttribute('width', w);
  svgEl.setAttribute('height', h);
  const n = dailyValues.length;
  const maxV = Math.max(1, ...dailyValues.map(v=>v));
  const barW = (w - padding*2) / n * 0.78;
  const gap = n > 1 ? (w - padding*2 - barW*n) / (n-1) : 0;

  // Clear
  svgEl.innerHTML = '';

  dailyValues.forEach((v,i)=>{
    const x = padding + i*(barW+gap);
    const barH = (v / maxV) * (h - padding*2);
    const y = h - padding - barH;
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', barH);
    rect.setAttribute('fill', '#6bbf59');
    svgEl.appendChild(rect);

    // label
    const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('x', x + barW/2);
    txt.setAttribute('y', h - padding + 14);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('fill', '#2b3b2b');
    const fontSize = Math.max(9, Math.round(10 * (w/600)));
    txt.setAttribute('font-size', `${fontSize}`);
    txt.textContent = `${v.toFixed(2)}`;
    svgEl.appendChild(txt);
  });
}

if (typeof module !== 'undefined') module.exports = { renderTimeline };
