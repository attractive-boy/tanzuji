// Fetch evaluation rows from backend and render into table
(async function(){
  const tbody = document.querySelector('#evalTable tbody');
  const url = (window.BACKEND_URL || 'http://localhost:3001') + '/evaluation';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('network');
    const data = await res.json();
    if (!data || !Array.isArray(data.rows)) throw new Error('bad-data');
    tbody.innerHTML = '';
    data.rows.forEach(r => {
      const tr = document.createElement('tr');
      const idTd = document.createElement('td'); idTd.textContent = r.id;
      const metricTd = document.createElement('td'); metricTd.textContent = r.metric;
      const scoreTd = document.createElement('td'); scoreTd.textContent = r.score;
      const commentTd = document.createElement('td'); commentTd.textContent = r.comment;
      tr.appendChild(idTd); tr.appendChild(metricTd); tr.appendChild(scoreTd); tr.appendChild(commentTd);
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="4">无法获取评价数据：' + (err.message || err) + '</td></tr>';
    console.error('fetch evaluation failed', err);
  }
})();
