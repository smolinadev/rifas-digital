function getRifas() {
  try { return JSON.parse(localStorage.getItem('rifas') || '[]'); }
  catch { return []; }
}
function saveRifas(r) { localStorage.setItem('rifas', JSON.stringify(r)); }

document.getElementById('btn-crear').addEventListener('click', () => {
 const prize = document.getElementById('f-prize').value.trim().toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  const price   = document.getElementById('f-price').value.trim();
  const count   = parseInt(document.querySelector('input[name=rango]:checked').value);
  const date    = document.getElementById('f-date').value;
  const lottery = document.getElementById('f-lottery').value;

  if (!prize)   return shake('f-prize');
  if (!price)   return shake('f-price');
  if (!date)    return shake('f-date');
  if (!lottery) return shake('f-lottery');

  // Padding: 2 dígitos para <=100, 3 para 200
  const pad = count <= 100 ? 2 : 3;

  const nums = {};
  for (let i = 0; i < count; i++) {
    const key = String(i).padStart(pad, '0');
    nums[key] = { sold: false, buyer: '' };
  }

  const rifa = { id: Date.now(), prize, price, count, date, lottery, nums, done: false };
  const rifas = getRifas();
  rifas.push(rifa);
  saveRifas(rifas);

  window.location.href = `rifa.html?id=${rifa.id}`;
});

function shake(fieldId) {
  const el = document.getElementById(fieldId);
  el.style.borderColor = '#c0392b';
  el.focus();
  el.addEventListener('input', () => el.style.borderColor = '', { once: true });
}