// ─── STORAGE ──────────────────────────────────────────────
function getRifas() {
  try { return JSON.parse(localStorage.getItem('rifas') || '[]'); }
  catch { return []; }
}
function saveRifas(r) { localStorage.setItem('rifas', JSON.stringify(r)); }

// ─── UTILS ────────────────────────────────────────────────
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

// ─── INIT: carga la rifa desde la URL ─────────────────────
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

// ─── GRID: renderiza los números con su estado ────────────
function renderGrid() {
  const grid = document.getElementById('num-grid');
  const nums = Object.keys(rifa.nums).sort((a, b) => parseInt(a) - parseInt(b));

  // Columnas y tamaño según rango de números
  const cols = rifa.count <= 10 ? 5
             : rifa.count <= 50 ? 7
             : rifa.count <= 100 ? 7
             : 10;

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

  // Actualizar stats y barra de progreso
  document.getElementById('stat-sold').textContent  = sold;
  document.getElementById('stat-free').textContent  = nums.length - sold;
  document.getElementById('stat-total').textContent = nums.length;
  const pct = Math.round(sold / nums.length * 100);
  document.getElementById('stat-bar').style.width = pct + '%';
  document.getElementById('stat-pct').textContent = pct + '% vendido';
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
  document.getElementById('modal-edit').style.display = 'none';
  document.getElementById('modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('modal-input').focus(), 100);
}

// ─── MODAL YA VENDIDO ─────────────────────────────────────
function openModalSold(num, buyer) {
  selectedNum = num;
  document.getElementById('modal-num').textContent = `Número ${num}`;
  document.getElementById('modal-title').textContent = 'Ya vendido';
  document.getElementById('modal-buyer').textContent = `👤 ${buyer}`;
  document.getElementById('modal-buyer').style.display = 'block';
  document.getElementById('modal-edit').style.display = 'block';
  document.getElementById('modal-input').style.display = 'none';
  document.getElementById('modal-confirm').style.display = 'none';
  document.getElementById('modal').classList.remove('hidden');
}

document.getElementById('modal-edit').addEventListener('click', () => {
  const buyer = rifa.nums[selectedNum].buyer;
  document.getElementById('modal-input').value = buyer;
  document.getElementById('modal-input').style.display = 'block';
  document.getElementById('modal-confirm').textContent = 'Guardar cambios';
  document.getElementById('modal-confirm').style.display = 'block';
  document.getElementById('modal-buyer').style.display = 'none';
  document.getElementById('modal-edit').style.display = 'none';
  setTimeout(() => document.getElementById('modal-input').focus(), 100);
});

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  selectedNum = null;
}

// Confirmar venta — si el nombre queda vacío, libera el número
document.getElementById('modal-confirm').addEventListener('click', () => {
  const buyer = document.getElementById('modal-input').value.trim();
  rifa.nums[selectedNum] = buyer ? { sold: true, buyer } : { sold: false, buyer: '' };
  saveRifas(getRifas().map(r => r.id === rifa.id ? rifa : r));
  closeModal();
  renderGrid();
});
document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e => {
  if (e.target === document.getElementById('modal')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ─── COMPARTIR: detecta plantilla y genera imagen ─────────
document.getElementById('btn-share').addEventListener('click', async () => {
  const plantilla = localStorage.getItem('plantilla_seleccionada') || 'azul';
  const targetId = plantilla === 'retro' ? 'ticket-share-retro'
                 : plantilla === 'esmeralda' ? 'ticket-share-esmeralda'
                 : 'ticket-share';

  if (plantilla === 'azul') buildShareTicket();
  else if (plantilla === 'retro') buildShareTicketRetro();
  else if (plantilla === 'esmeralda') buildShareTicketEsmeralda();

  await new Promise(r => setTimeout(r, 100));
  const canvas = await html2canvas(document.getElementById(targetId), {
    scale: 2,
    useCORS: true,
    backgroundColor: null
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


//----Funcion sello Rifa App---//
function createSoldStamp(size = 13) {
  const stamp = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  stamp.setAttribute('viewBox', '0 0 16 16');
  stamp.setAttribute('width', size);
  stamp.setAttribute('height', size);

  stamp.style.cssText = `
    grid-area: 1/1;
    display: block;
    pointer-events: none;
    z-index: 2;
  `;

  stamp.innerHTML = `
    <circle cx="8" cy="8" r="7.2" fill="#0f2744"/>
    <circle cx="8" cy="8" r="7.2" fill="none" stroke="white" stroke-width="0.9"/>
    <circle cx="8" cy="8" r="5.6" fill="none" stroke="white" stroke-width="0.5" stroke-dasharray="1.2 1.1"/>
    <path d="M 3.8 3.2 L 3.8 12.8 L 6.1 12.8 L 6.1 9.4 Q 12.8 9.4 12.8 6.1 Q 12.8 3.2 6.1 3.2 Z" fill="#F5C842"/>
    <path d="M 6.1 5 Q 10.6 5 10.6 6.1 Q 10.6 7.3 6.1 7.3 Z" fill="#0f2744"/>
    <line x1="6.3" y1="9.6" x2="12.2" y2="12.2" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  `;

  return stamp;
}
// ─── PLANTILLA: Azul Marino ───────────────────────────────
function buildShareTicket() {
  const nums = Object.keys(rifa.nums).sort((a, b) => parseInt(a) - parseInt(b));
  const cols = rifa.count <= 10 ? 5 : 10;
  const soldCount = nums.filter(n => rifa.nums[n].sold).length;

  document.getElementById('ts-prize').textContent    = rifa.prize;
  document.getElementById('ts-price').textContent    = rifa.price;
  document.getElementById('ts-date').textContent     = formatDate(rifa.date);
  document.getElementById('ts-lottery').textContent  = rifa.lottery;
  document.getElementById('ts-count').textContent    = `${soldCount} / ${nums.length}`;
  document.getElementById('ts-whatsapp').textContent = rifa.whatsapp ? `WS: ${rifa.whatsapp}` : 'Rifa App';

  const grid = document.getElementById('ts-grid');
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.innerHTML = '';

  nums.forEach(n => {
  const sold = rifa.nums[n].sold;
  const div = document.createElement('div');

  div.style.cssText = `
    display: grid;
    place-items: center;
    overflow: visible;
    min-height: 16.5px;
  `;

  const span = document.createElement('span');
  span.textContent = n;

  span.style.cssText = `
    grid-area: 1/1;
    font-size: 8.5px;
    font-weight: 500;
    line-height: 1;
    min-height: 16.5px;
    padding: 2.5px 0;
    color: ${sold ? 'rgba(74,122,170,0.35)' : '#6a9fc8'};
    z-index: 1;
  `;

  div.appendChild(span);

  if (sold) {
    div.appendChild(createSoldStamp(14));
  }


  grid.appendChild(div);
});
}

// ─── PLANTILLA: Retro Rosa ────────────────────────────────
function buildShareTicketRetro() {
  const nums = Object.keys(rifa.nums).sort((a, b) => parseInt(a) - parseInt(b));
  const cols = rifa.count <= 10 ? 5 : 10;
document.getElementById('tsr-price').textContent   = rifa.price;
document.getElementById('tsr-date').textContent    = formatDate(rifa.date);
document.getElementById('tsr-lottery').textContent = rifa.lottery;
document.getElementById('tsr-footer').textContent  = rifa.whatsapp ? `WhatsApp: ${rifa.whatsapp}` : '';
document.getElementById('tsr-prize').textContent = rifa.prize;

  const grid = document.getElementById('tsr-grid');
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.innerHTML = '';

  nums.forEach(n => {
    const sold = rifa.nums[n].sold;
    const div = document.createElement('div');
    div.style.cssText = `font-size:8.5px;font-weight:400;color:${sold ? '#c08a93' : '#4a3d42'};${sold ? 'text-decoration:line-through;' : ''}text-align:center;padding:2.5px 0;`;
    div.textContent = n;
    grid.appendChild(div);
  });
}

// ─── PLANTILLA: Verde Esmeralda ───────────────────────────
function buildShareTicketEsmeralda() {
  const nums = Object.keys(rifa.nums).sort((a, b) => parseInt(a) - parseInt(b));
  const cols = rifa.count <= 10 ? 5 : 10;

  document.getElementById('tse-prize').textContent    = rifa.prize;
  document.getElementById('tse-price').textContent    = rifa.price;
  document.getElementById('tse-date').textContent     = formatDate(rifa.date);
  document.getElementById('tse-lottery').textContent  = rifa.lottery;
  document.getElementById('tse-count').textContent    = `${nums.filter(n => rifa.nums[n].sold).length} / ${nums.length}`;
  document.getElementById('tse-whatsapp').textContent = rifa.whatsapp ? `WS: ${rifa.whatsapp}` : 'Rifa App';

  const grid = document.getElementById('tse-grid');
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.innerHTML = '';

nums.forEach(n => {
  const sold = rifa.nums[n].sold;
  const div = document.createElement('div');

  div.style.cssText = `
    display: grid;
    place-items: center;
    overflow: visible;
  `;

  const span = document.createElement('span');
  span.textContent = n;
  span.style.cssText = `
    grid-area: 1/1;
    font-size: 8.5px;
    font-weight: 500;
    line-height: 1;
    min-height: 16.5px;
    padding: 2.5px 0;
    color: ${sold ? 'rgba(77,128,104,0.35)' : '#6ee7a8'};
    z-index: 1;
  `;
  div.appendChild(span);

  if (sold) {
    div.appendChild(createSoldStamp(14));
  }

  grid.appendChild(div);
});
}

init();