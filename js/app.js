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
function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const [y, m, d] = dateStr.split('-');
  return (
    today.getFullYear() === parseInt(y) &&
    today.getMonth() + 1 === parseInt(m) &&
    today.getDate() === parseInt(d)
  );
}
function renderHome() {
  const rifas = getRifas().filter(r => !r.done);
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
   li.className = `rifa-card${isToday(rifa.date) ? ' sorteo-hoy' : ''}`;
    li.innerHTML = `
  <div class="rifa-card__info">
    <div class="rifa-card__name">${rifa.prize}</div>
${isToday(rifa.date) ? '<span class="badge-sorteo">Hoy es el sorteo</span>' : ''}
    <div class="rifa-card__meta">${rifa.price} · ${formatDate(rifa.date)} · ${rifa.lottery}</div>
    <div class="rifa-card__bar">
      <div class="rifa-card__fill" style="width:${pct}%"></div>
    </div>
  </div>
  <div class="rifa-card__right">
    <span class="rifa-card__pct">${sold}/${total}</span>
    ${isToday(rifa.date) ? `<button class="btn-ganador" data-id="${rifa.id}">¿Quién ganó?</button>` : `<button class="btn btn--danger" data-id="${rifa.id}">✕</button>`}
  </div>
`;
    li.querySelector('.rifa-card__info').addEventListener('click', () => {
  window.location.href = `rifa.html?id=${rifa.id}`;
    });
if (isToday(rifa.date)) {
  li.querySelector('.btn-ganador').addEventListener('click', e => {
    e.stopPropagation();
    openWinnerModal(rifa);
  });
} else
    li.querySelector('.btn--danger').addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('delete-title').textContent = `¿Eliminar "${rifa.prize}"?`;
  document.getElementById('modal-delete').classList.remove('hidden');

  document.getElementById('delete-confirm').onclick = () => {
    saveRifas(getRifas().filter(r => r.id !== rifa.id));
    document.getElementById('modal-delete').classList.add('hidden');
    renderHome();
  };
});
    

    list.appendChild(li);
  });
}

document.getElementById('btn-nueva').addEventListener('click', () => {
  window.location.href = 'nueva-rifa.html'; // próximo paso
});

renderHome();
function openWinnerModal(rifa) {
  document.getElementById('winner-num').textContent = `🏆 ${rifa.prize}`;
  document.getElementById('winner-input').value = '';
  document.getElementById('winner-result').style.display = 'none';
  document.getElementById('winner-confirm').style.display = 'block';
  document.getElementById('modal-winner').classList.remove('hidden');
  setTimeout(() => document.getElementById('winner-input').focus(), 100);

  document.getElementById('winner-confirm').onclick = () => {
    const num = document.getElementById('winner-input').value.trim();
    if (!num) return;
    const pad = rifa.count <= 100 ? 2 : 3;
    const key = String(parseInt(num)).padStart(pad, '0');
    const winner = rifa.nums[key];
    if (!winner) {
      document.getElementById('winner-result').textContent = `El número ${key} no existe.`;
      document.getElementById('winner-result').style.display = 'block';
      return;
    }
    if (!winner.sold) {
      document.getElementById('winner-result').textContent = `El número ${key} no fue vendido.`;
      document.getElementById('winner-result').style.display = 'block';
      return;
    }
    document.getElementById('winner-title').textContent = '¡Tenemos ganador!';
    document.getElementById('winner-result').textContent = `🏆 ${winner.buyer} — Número ${key}`;
    document.getElementById('winner-result').style.display = 'block';
    document.getElementById('winner-confirm').style.display = 'none';
const rifas = getRifas().map(r => r.id === rifa.id ? { ...r, done: true, winner: { num: key, buyer: winner.buyer } } : r);
saveRifas(rifas);
renderHome();

  };
  document.getElementById('winner-cancel').onclick = () => {
    document.getElementById('modal-winner').classList.add('hidden');
  };
}
document.getElementById('delete-cancel').addEventListener('click', () => {
  document.getElementById('modal-delete').classList.add('hidden');
});
document.getElementById('btn-menu').addEventListener('click', () => {
  const btn = document.getElementById('btn-menu');
  const overlay = document.getElementById('drawer-overlay');
  
  if (overlay.classList.contains('hidden')) {
    btn.classList.add('open');
    overlay.classList.remove('hidden');
  } else {
    btn.classList.remove('open');
    overlay.classList.add('hidden');
  }
});
document.getElementById('drawer-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('drawer-overlay')) {
    document.getElementById('btn-menu').classList.remove('open');
    document.getElementById('drawer-overlay').classList.add('hidden');
  }
});

document.getElementById('drawer-templates').addEventListener('click', () => {
  document.getElementById('drawer-templates').classList.add('active');
  window.location.href = 'plantillas.html';
});

document.getElementById('drawer-finished').addEventListener('click', () => {
  document.getElementById('drawer-finished').classList.add('active');
  window.location.href = 'finalizadas.html';
});
document.getElementById('drawer-about').addEventListener('click', () => {
  window.location.href = 'about.html';
});

document.getElementById('drawer-privacy').addEventListener('click', () => {
  window.location.href = 'privacy.html';
});