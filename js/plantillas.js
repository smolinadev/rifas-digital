// Plantilla guardada o azul por defecto
const PLANTILLA_KEY = 'plantilla_seleccionada';

function getPlantilla() {
  return localStorage.getItem(PLANTILLA_KEY) || 'azul';
}

function setPlantilla(value) {
  localStorage.setItem(PLANTILLA_KEY, value);
}

// Marcar la card seleccionada al cargar
function initPlantillas() {
  const actual = getPlantilla();
  document.querySelectorAll('.plantilla-card').forEach(card => {
    const value = card.dataset.template;
    const input = card.querySelector('input');
    if (value === actual) {
      input.checked = true;
      card.classList.add('selected');
    }

card.addEventListener('click', () => {
  document.querySelectorAll('.plantilla-card').forEach(c => {
    c.classList.remove('selected');
    c.querySelector('.check-btn').classList.remove('is-checked');
    c.querySelector('.check-btn').setAttribute('aria-pressed', 'false');
  });
  card.classList.add('selected');
  card.querySelector('.check-btn').classList.add('is-checked');
  card.querySelector('.check-btn').setAttribute('aria-pressed', 'true');
  input.checked = true;
  setPlantilla(value);
});
});
}
initPlantillas();