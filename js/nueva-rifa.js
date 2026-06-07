// ─── UTILS ────────────────────────────────────────────────
function getRifas() {
  try { return JSON.parse(localStorage.getItem('rifas') || '[]'); }
  catch { return []; }
}
function saveRifas(r) { localStorage.setItem('rifas', JSON.stringify(r)); }

// ─── CREAR RIFA ───────────────────────────────────────────
document.getElementById('btn-crear').addEventListener('click', () => {
  const prize   = document.getElementById('f-prize').value.trim();
  const price   = document.getElementById('f-price').value.trim();
  const count   = parseInt(document.querySelector('input[name=rango]:checked').value);
  const date    = document.getElementById('f-date').value;
  const lottery = document.getElementById('f-lottery').value;

  // Validación
  if (!prize)   return shake('f-prize',   'Escribe qué se rifa');
  if (!price)   return shake('f-price',   'Escribe el precio');
  if (!date)    return shake('f-date',    'Elige la fecha');
  if (!lottery) return shake('f-lottery', 'Elige la lotería');

  // Generar números
  const nums = {};
  const pad  = count >= 100 ? 3 : 2;
  for (let i = 0; i < count; i++) {
    const key = String(i).padStart(pad, '0');
    nums[key] = { sold: false, buyer: '' };
  }

  const rifa = {
    id: Date.now(),
    prize,
    price,
    count,
    date,
    lottery,
    nums,
    done: false
  };

  const rifas = getRifas();
  rifas.push(rifa);
  saveRifas(rifas);

  // Ir a la rifa recién creada
  window.location.href = `rifa.html?id=${rifa.id}`;
});

// ─── SHAKE de error ───────────────────────────────────────
function shake(fieldId, msg) {
  const el = document.getElementById(fieldId);
  el.style.borderColor = '#c0392b';
  el.focus();
  el.addEventListener('input', () => el.style.borderColor = '', { once: true });
}