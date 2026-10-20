(() => {
  const vscode = acquireVsCodeApi();
  const $ = id => document.getElementById(id);
  let headers = [], rows = [], filtered = [], page = 0, sortBy = -1, sortAsc = true, limited = false;
  let perPage = 100;
  function cell(parent, tag, text) { const el = document.createElement(tag); el.textContent = String(text ?? ''); parent.appendChild(el); return el; }
  function render() {
    const head = $('thead'), body = $('tbody'); head.replaceChildren(); body.replaceChildren();
    const tr = document.createElement('tr'); cell(tr, 'th', '#');
    headers.forEach((h, i) => {
      const th = cell(tr, 'th', h || `Column ${i + 1}`);
      th.title = 'Click to sort'; th.className = 'sortable';
      if (sortBy === i) th.textContent += sortAsc ? ' ▲' : ' ▼';
      th.addEventListener('click', () => { if (sortBy === i) sortAsc = !sortAsc; else { sortBy = i; sortAsc = true; } updateFiltered(); });
    }); head.appendChild(tr);
    const begin = page * perPage;
    filtered.slice(begin, begin + perPage).forEach(({row, index}) => {
      const tr = document.createElement('tr'); cell(tr, 'td', index + 1).className = 'row-index';
      headers.forEach((_, i) => { const td = cell(tr, 'td', row[i] || ''); td.title = row[i] || ''; }); body.appendChild(tr);
    });
    const count = filtered.length, pageCount = Math.max(1, Math.ceil(count / perPage));
    $('range').textContent = `${count ? begin + 1 : 0}–${Math.min(begin + perPage, count)} of ${count.toLocaleString()} matching rows`;
    $('page').textContent = `${page + 1} / ${pageCount}`;
    $('previous').disabled = page === 0; $('next').disabled = page >= pageCount - 1;
  }
  function updateFiltered() {
    const query = $('filter').value.toLocaleLowerCase();
    filtered = rows.map((row,index) => ({row,index})).filter(x => !query || x.row.some(v => String(v || '').toLocaleLowerCase().includes(query)));
    if (sortBy >= 0) filtered.sort((a,b) => {
      const va = a.row[sortBy] || '', vb = b.row[sortBy] || '';
      const na = Number(va), nb = Number(vb);
      const cmp = va.trim() !== '' && vb.trim() !== '' && Number.isFinite(na) && Number.isFinite(nb) ? na-nb : va.localeCompare(vb, undefined, {numeric:true});
      return sortAsc ? cmp : -cmp;
    });
    page = 0; render();
  }
  $('filter').addEventListener('input', updateFiltered);
  $('per-page').addEventListener('change', () => {
    perPage = Number($('per-page').value);
    page = 0;
    render();
  });
  $('previous').addEventListener('click', () => { if(page > 0) { page--; render(); }});
  $('next').addEventListener('click', () => { if((page+1)*perPage < filtered.length) { page++; render(); }});
  $('refresh').addEventListener('click', () => vscode.postMessage({ type:'refresh' }));
  $('text').addEventListener('click', () => vscode.postMessage({ type:'text' }));
  window.addEventListener('message', event => {
    const msg = event.data;
    if (msg.type === 'error') { $('status').textContent = `Error: ${msg.message}`; return; }
    if (msg.type !== 'data') return;
    headers = msg.headers; rows = msg.rows; limited = msg.limited; sortBy = -1; page = 0;
    const width = Math.max(headers.length, ...rows.map(r=>r.length), 0);
    while (headers.length < width) headers.push(`Column ${headers.length + 1}`);
    $('file-title').textContent = msg.fileName;
    $('status').textContent = `${rows.length.toLocaleString()} rows loaded · ${width} columns · delimiter: ${msg.delimiter}${limited ? ` · truncated at ${msg.maxRows.toLocaleString()} rows` : ''} · read-only`;
    updateFiltered();
  });
  vscode.postMessage({ type:'ready' });
})();
