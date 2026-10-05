function getRifas() {
  try { return JSON.parse(localStorage.getItem('rifas') || '[]'); }
  catch { return []; }
}
function saveRifas(r) { localStorage.setItem('rifas', JSON.stringify(r)); }
document.getElementById('f-lottery').addEventListener('change', function() {
  const custom = document.getElementById('f-lottery-custom');
  custom.style.display = this.value === 'Otra' ? 'block' : 'none';
});
// Plantillas de temporada: no van fijas en el selector, solo se muestran
// como 4ª tarjeta si son la plantilla guardada
const TPL_TEMPORADA = {
  calabaza: {
    name: 'Calabaza',
    deco: '<svg class="pp-deco" width="24" height="21" viewBox="0 0 46 40"><path d="M23 6 q2-5 6-5" stroke="#5c8a2e" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="14" cy="23" rx="11" ry="14" fill="#F28C28"/><ellipse cx="32" cy="23" rx="11" ry="14" fill="#F28C28"/><ellipse cx="23" cy="23" rx="11" ry="15" fill="#f59a3c"/><path d="M15 19 l4 4 h-8z M31 19 l4 4 h-8z" fill="#17120e"/><path d="M14 29 q9 6 18 0 l-3 2 -3-2 -3 2 -3-2 -3 2z" fill="#17120e"/></svg>'
  },
  noche: {
    name: 'Noche morada',
    deco: '<svg class="pp-deco" width="40" height="20" viewBox="0 0 80 40"><circle cx="40" cy="20" r="15" fill="#f4ecc8"/><circle cx="46" cy="16" r="15" fill="#1e1433"/><path d="M8 14 q4-4 8 0 q2-3 4 0 q2-3 4 0 q4-4 8 0 q-6 0-8 5 q-2-3-4-3 q-2 0-4 3 q-2-5-8-5z" fill="#b9a3e8"/><path d="M52 28 q3-3 6 0 q1.5-2 3 0 q1.5-2 3 0 q3-3 6 0 q-4.5 0-6 3.5 q-1.5-2-3-2 q-1.5 0-3 2 q-1.5-3.5-6-3.5z" fill="#b9a3e8"/></svg>'
  },
  fantasma: {
    name: 'Fantasmita',
    deco: '<svg class="pp-deco" width="22" height="22" viewBox="0 0 44 44"><path d="M8 40 V20 a14 14 0 0 1 28 0 V40 l-4.7-4 -4.7 4 -4.6-4 -4.7 4 -4.6-4z" fill="#ffffff" stroke="#7a5ea8" stroke-width="1.5"/><ellipse cx="17" cy="20" rx="2.3" ry="3" fill="#3b2f4f"/><ellipse cx="27" cy="20" rx="2.3" ry="3" fill="#3b2f4f"/><ellipse cx="13" cy="26" rx="2.5" ry="1.5" fill="#f4b6c8"/><ellipse cx="31" cy="26" rx="2.5" ry="1.5" fill="#f4b6c8"/><path d="M19.5 26 q2.5 2.5 5 0" stroke="#3b2f4f" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>'
  }
};

function addTplTemporada(value) {
  const tpl = TPL_TEMPORADA[value];
  if (!tpl) return;
  const grid = document.querySelector('.tpl-grid');
  grid.classList.add('tpl-grid--4');
  grid.insertAdjacentHTML('beforeend', `
    <label class="tpl-card" data-template="${value}">
      <input type="radio" name="plantilla" value="${value}" />
      <div class="plantilla-preview plantilla-preview--${value}">
        ${tpl.deco}
        <div class="pp-title">Smart TV</div>
      </div>
      <div class="tpl-name">${tpl.name}</div>
      <span class="check-btn" aria-hidden="true">
        <span class="check-circle">
          <svg viewBox="0 0 20 20" width="12" height="12" overflow="visible">
            <path class="check-path" d="M 4.5 10 L 8.5 14 L 15.5 6"
              fill="none" stroke="#F5C842" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round"
              stroke-dasharray="20" stroke-dashoffset="20"/>
          </svg>
        </span>
      </span>
    </label>`);
}

// Selector de plantilla: preselecciona la guardada o azul y la guarda al tocar
function initTplSelector() {
  const actual = localStorage.getItem('plantilla_seleccionada') || 'azul';
  addTplTemporada(actual);
  const cards = document.querySelectorAll('.tpl-card');
  const mark = card => {
    cards.forEach(c => {
      c.classList.remove('selected');
      c.querySelector('.check-btn').classList.remove('is-checked');
    });
    card.classList.add('selected');
    card.querySelector('.check-btn').classList.add('is-checked');
    card.querySelector('input').checked = true;
  };
  cards.forEach(card => {
    if (card.dataset.template === actual) mark(card);
    card.addEventListener('click', () => {
      mark(card);
      localStorage.setItem('plantilla_seleccionada', card.dataset.template);
    });
  });
}
initTplSelector();
document.getElementById('btn-crear').addEventListener('click', () => {
 const prize = document.getElementById('f-prize').value.trim().toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  const price   = document.getElementById('f-price').value.trim();
  const count   = parseInt(document.querySelector('input[name=rango]:checked').value);
  const date    = document.getElementById('f-date').value;
  const lotterySelect = document.getElementById('f-lottery').value;
  const whatsapp = document.getElementById('f-whatsapp').value.trim();
const lottery = lotterySelect === 'Otra' 
  ? document.getElementById('f-lottery-custom').value.trim() 
  : lotterySelect;

  if (!prize)   return shake('f-prize');
  if (!price)   return shake('f-price');
  if (!date)    return shake('f-date');
  if (!lottery) return shake(lotterySelect === 'Otra' ? 'f-lottery-custom' : 'f-lottery');

  // Padding: 2 dígitos para <=100, 3 para 200
  const pad = count <= 100 ? 2 : 3;

  const nums = {};
  for (let i = 0; i < count; i++) {
    const key = String(i).padStart(pad, '0');
    nums[key] = { sold: false, buyer: '' };
  }

  const rifa = { id: Date.now(), prize, price, count, date, lottery, nums, done: false, whatsapp };
  const rifas = getRifas();
  rifas.push(rifa);
  saveRifas(rifas);

  window.location.href = `rifa.html?id=${rifa.id}`;
});
  //cada 3 cifras se agg un punto automaticamente al crear la rifa 
document.getElementById('f-price').addEventListener('input', function() {
  let val = this.value.replace(/\D/g, '');
  this.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
});
function shake(fieldId) {
  const el = document.getElementById(fieldId);
  el.style.borderColor = '#c0392b';
  el.focus();
  el.addEventListener('input', () => el.style.borderColor = '', { once: true });
}