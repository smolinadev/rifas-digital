function getRifas() {
  try { return JSON.parse(localStorage.getItem('rifas') || '[]'); }
  catch { return []; }
}
function saveRifas(r) { localStorage.setItem('rifas', JSON.stringify(r)); }

function formatDate(d) {
  if (!d) return '—';
  const [y,m,dd] = d.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(dd)} ${months[parseInt(m)-1]} ${y}`;
}

function renderHome() {
  const rifas = getRifas();
  const list  = document.getElementById('rifa-list');
  const empty = document.getElementById('list-empty');

  list.innerHTML = '';

  if (rifas.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  rifas.forEach(rifa => {
    const nums  = Object.values(rifa.nums);
    const sold  = nums.filter(n => n.sold).length;
    const total = nums.length;
    const pct   = total > 0 ? Math.round(sold / total * 100) : 0;

    const li = document.createElement('li');
    li.className = 'rifa-card';
    li.innerHTML = `
  <div class="rifa-card__info">
    <div class="rifa-card__name">${rifa.prize}</div>
    <div class="rifa-card__meta">${rifa.price} · ${formatDate(rifa.date)} · ${rifa.lottery}</div>
    <div class="rifa-card__bar">
      <div class="rifa-card__fill" style="width:${pct}%"></div>
    </div>
  </div>
  <div class="rifa-card__right">
    <span class="rifa-card__pct">${sold}/${total}</span>
    <button class="btn btn--danger" data-id="${rifa.id}">✕</button>
  </div>
`;
    li.querySelector('.rifa-card__info').addEventListener('click', () => {
  window.location.href = `rifa.html?id=${rifa.id}`;
    });

    li.querySelector('.btn--danger').addEventListener('click', e => {
      e.stopPropagation();
      if (!confirm(`¿Eliminar "${rifa.prize}"?`)) return;
      saveRifas(getRifas().filter(r => r.id !== rifa.id));
      renderHome();
    });

    list.appendChild(li);
  });
}

document.getElementById('btn-nueva').addEventListener('click', () => {
  window.location.href = 'nueva-rifa.html'; // próximo paso
});

renderHome();