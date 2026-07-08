function getRifas() {
  try { return JSON.parse(localStorage.getItem('rifas') || '[]'); }
  catch { return []; }
}

function formatDate(d) {
  if (!d) return '—';
  const [y,m,dd] = d.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(dd)} ${months[parseInt(m)-1]} ${y}`;
}

function renderFinalizadas() {
  const rifas = getRifas().filter(r => r.done);
  const list  = document.getElementById('rifa-list');
  const empty = document.getElementById('list-empty');

  if (rifas.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  rifas.forEach(rifa => {
    const li = document.createElement('li');
    li.className = 'rifa-card';
    li.innerHTML = `
      <div class="rifa-card__info">
        <div class="rifa-card__name">${rifa.prize}</div>
        <div class="rifa-card__meta">${rifa.price} · ${formatDate(rifa.date)} · ${rifa.lottery}</div>
        ${rifa.winner ? `<div style="margin-top:6px;font-size:13px;font-weight:700;color:#1a1a1a;">🏆 ${rifa.winner.buyer} — Número ${rifa.winner.num}</div>` : ''}
      </div>
    `;
    list.appendChild(li);
  });
}

renderFinalizadas();