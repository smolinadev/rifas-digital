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

function getIdFromURL() {
  return parseInt(new URLSearchParams(window.location.search).get('id'));
}

let rifa = null;

function init() {
  const id = getIdFromURL();
  rifa = getRifas().find(r => r.id === id);
  if (!rifa) { alert('Rifa no encontrada.'); window.location.href = 'index.html'; return; }

  document.getElementById('rifa-title').textContent   = rifa.prize;
  document.getElementById('info-price').textContent   = rifa.price;
  document.getElementById('info-date').textContent    = formatDate(rifa.date);
  document.getElementById('info-lottery').textContent = rifa.lottery;

  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('num-grid');

  // Ordenar numéricamente siempre
  const nums = Object.keys(rifa.nums).sort((a, b) => parseInt(a) - parseInt(b));

  // Columnas según rango
 const cols = rifa.count <= 10 ? 5
           : rifa.count <= 50 ? 7
           : rifa.count <= 100 ? 7
           : 10;

  // Tamaño de botón según rango
  const btnSize = rifa.count <= 10  ? '90px'
                : rifa.count <= 50  ? '72px'
                : rifa.count <= 100 ? '64px'
                : '52px';

  const fontSize = rifa.count <= 50  ? '17px'
                 : rifa.count <= 100 ? '15px'
                 : '13px';

  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.innerHTML = '';

  let sold = 0;

  nums.forEach(n => {
    const info = rifa.nums[n];
    if (info.sold) sold++;

    const btn = document.createElement('button');
    btn.className = `num-btn${info.sold ? ' sold' : ''}`;
    btn.textContent = n;
    btn.title = info.sold ? `${n} — ${info.buyer}` : n;
    btn.style.height   = btnSize;
    btn.style.fontSize = fontSize;

    btn.addEventListener('click', () => {
      if (info.sold) openModalSold(n, info.buyer);
      else openModalBuy(n);
    });

    grid.appendChild(btn);
  });

  document.getElementById('stat-sold').textContent  = sold;
  document.getElementById('stat-free').textContent  = nums.length - sold;
  document.getElementById('stat-total').textContent = nums.length;
}

// ─── MODAL COMPRA ──────────────────────────────────────────
let selectedNum = null;

function openModalBuy(num) {
  selectedNum = num;
  document.getElementById('modal-num').textContent = `Número ${num}`;
  document.getElementById('modal-title').textContent = '¿Quién compró este número?';
  document.getElementById('modal-input').value = '';
  document.getElementById('modal-input').style.display  = 'block';
  document.getElementById('modal-confirm').style.display = 'block';
  document.getElementById('modal-buyer').style.display  = 'none';
  document.getElementById('modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('modal-input').focus(), 100);
}

// ─── MODAL YA VENDIDO ─────────────────────────────────────
function openModalSold(num, buyer) {
  document.getElementById('modal-num').textContent = `Número ${num}`;
  document.getElementById('modal-title').textContent = 'Ya vendido';
  document.getElementById('modal-input').style.display   = 'none';
  document.getElementById('modal-confirm').style.display = 'none';
  document.getElementById('modal-buyer').textContent = `👤 ${buyer}`;
  document.getElementById('modal-buyer').style.display   = 'block';
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  selectedNum = null;
}

document.getElementById('modal-confirm').addEventListener('click', () => {
  const buyer = document.getElementById('modal-input').value.trim();
  if (!buyer) {
    document.getElementById('modal-input').style.borderColor = '#c0392b';
    document.getElementById('modal-input').focus();
    return;
  }
  rifa.nums[selectedNum] = { sold: true, buyer };
  saveRifas(getRifas().map(r => r.id === rifa.id ? rifa : r));
  closeModal();
  renderGrid();
});

document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e => {
  if (e.target === document.getElementById('modal')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

document.getElementById('btn-share').addEventListener('click', async () => {
  buildShareTicket();
  await new Promise(r => setTimeout(r, 100));
  const canvas = await html2canvas(document.getElementById('ticket-share'), {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ECEAE5'
  });
  canvas.toBlob(async blob => {
    const file = new File([blob], 'rifa.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: rifa.prize });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'rifa.png'; a.click();
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
});

function buildShareTicket() {
  const nums = Object.keys(rifa.nums).sort((a, b) => parseInt(a) - parseInt(b));
  const cols = rifa.count <= 10 ? 5 : 10;
  const sold = nums.filter(n => rifa.nums[n].sold).length;

  document.getElementById('ts-prize').textContent   = rifa.prize;
  document.getElementById('ts-price').textContent   = rifa.price;
  document.getElementById('ts-date').textContent    = formatDate(rifa.date);
  document.getElementById('ts-lottery').textContent = rifa.lottery;
  document.getElementById('ts-count').textContent   = `${sold} / ${nums.length} vendidos`;

  const grid = document.getElementById('ts-grid');
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.innerHTML = '';

  nums.forEach(n => {
    const div = document.createElement('div');
    const sold = rifa.nums[n].sold;
    div.style.cssText = `height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;${sold ? 'background:#1a1a1a;color:#fff;' : 'background:#fff;border:1.5px solid #ddd;color:#1a1a1a;'}`;
    div.textContent = n;
    grid.appendChild(div);
  });
}

init();