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
    li.className = 'rifa-card rifa-card--done';
li.innerHTML = `
  <div class="rifa-card__info">
    <div class="rifa-card__name">${rifa.prize}</div>
    <div class="rifa-card__meta">${rifa.price} · ${formatDate(rifa.date)} · ${rifa.lottery}</div>
    ${rifa.winner ? `<div class="rifa-card__winner">🏆 ${rifa.winner.buyer}</div>` : ''}
  </div>
  ${rifa.winner ? `
    <div class="rifa-card__right">
      <div class="rifa-card__numwinner">
        <span class="rifa-card__numlabel">Nº</span>
        <span class="rifa-card__numvalue">${rifa.winner.num}</span>
      </div>
    </div>
  ` : ''}
`;
    li.addEventListener('click', () => openResumen(rifa));
    list.appendChild(li);
  });
}

renderFinalizadas();
function formatPrice(price) {
  const num = parseInt(price.replace(/[^0-9]/g, ''));
  return isNaN(num) ? 0 : num;
}

function formatMoney(num) {
  return '$' + num.toLocaleString('es-CO');
}

function openResumen(rifa) {
  const nums   = Object.values(rifa.nums);
  const sold   = nums.filter(n => n.sold).length;
  const total  = nums.length;
  const precio = formatPrice(rifa.price);

  document.getElementById('pr-prize').textContent    = rifa.prize;
  document.getElementById('pr-winner').textContent   = rifa.winner ? `👤 ${rifa.winner.buyer} — Número ${rifa.winner.num}` : '—';
  document.getElementById('pr-price').textContent    = rifa.price;
  document.getElementById('pr-lottery').textContent  = rifa.lottery;
  document.getElementById('pr-sold').textContent     = `${sold} / ${total}`;
  document.getElementById('pr-possible').textContent = formatMoney(precio * total);
  document.getElementById('pr-total').textContent    = formatMoney(precio * sold);

  document.getElementById('modal-resumen').classList.remove('hidden');
}

document.getElementById('pr-close').addEventListener('click', () => {
  document.getElementById('modal-resumen').classList.add('hidden');
});

document.getElementById('modal-resumen').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-resumen')) {
    document.getElementById('modal-resumen').classList.add('hidden');
  }
});