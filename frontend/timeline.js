// Simple timeline: render last N days as bars (kgCO2e per day)
function renderTimeline(svgEl, dailyValues) {
  const width = svgEl.getAttribute('width');
  const height = svgEl.getAttribute('height');
  const w = +width, h = +height;
  const padding = 24;
  const n = dailyValues.length;
  const maxV = Math.max(1, ...dailyValues.map(v=>v));
  const barW = (w - padding*2) / n * 0.8;
  const gap = (w - padding*2 - barW*n) / (n-1 || 1);

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
    txt.setAttribute('font-size', '10');
    txt.textContent = `${v.toFixed(2)}`;
    svgEl.appendChild(txt);
  });
}

if (typeof module !== 'undefined') module.exports = { renderTimeline };
