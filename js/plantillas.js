// Plantilla guardada o azul por defecto
const PLANTILLA_KEY = 'plantilla_seleccionada';

function getPlantilla() {
  return localStorage.getItem(PLANTILLA_KEY) || 'azul';
}

function setPlantilla(value) {
  localStorage.setItem(PLANTILLA_KEY, value);
}

// Contenido del preview de cada plantilla (los estilos están en plantillas.css)
const PREVIEWS = {
  azul: '<div class="pp-badge">Rifa Oficial</div><div class="pp-title">Smart TV</div>',
  esmeralda: '<div class="pp-badge-esm">Rifa Oficial</div><div class="pp-title">Smart TV</div>',
  retro: '<div class="pp-sun">☀</div><div class="pp-title-retro">Smart TV</div>',
  calabaza: '<svg class="pp-deco" width="24" height="21" viewBox="0 0 46 40"><path d="M23 6 q2-5 6-5" stroke="#5c8a2e" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="14" cy="23" rx="11" ry="14" fill="#F28C28"/><ellipse cx="32" cy="23" rx="11" ry="14" fill="#F28C28"/><ellipse cx="23" cy="23" rx="11" ry="15" fill="#f59a3c"/><path d="M15 19 l4 4 h-8z M31 19 l4 4 h-8z" fill="#17120e"/><path d="M14 29 q9 6 18 0 l-3 2 -3-2 -3 2 -3-2 -3 2z" fill="#17120e"/></svg><div class="pp-title">Smart TV</div>',
  noche: '<svg class="pp-deco" width="40" height="20" viewBox="0 0 80 40"><circle cx="40" cy="20" r="15" fill="#f4ecc8"/><circle cx="46" cy="16" r="15" fill="#1e1433"/><path d="M8 14 q4-4 8 0 q2-3 4 0 q2-3 4 0 q4-4 8 0 q-6 0-8 5 q-2-3-4-3 q-2 0-4 3 q-2-5-8-5z" fill="#b9a3e8"/><path d="M52 28 q3-3 6 0 q1.5-2 3 0 q1.5-2 3 0 q3-3 6 0 q-4.5 0-6 3.5 q-1.5-2-3-2 q-1.5 0-3 2 q-1.5-3.5-6-3.5z" fill="#b9a3e8"/></svg><div class="pp-title">Smart TV</div>',
  fantasma: '<svg class="pp-deco" width="22" height="22" viewBox="0 0 44 44"><path d="M8 40 V20 a14 14 0 0 1 28 0 V40 l-4.7-4 -4.7 4 -4.6-4 -4.7 4 -4.6-4z" fill="#ffffff" stroke="#7a5ea8" stroke-width="1.5"/><ellipse cx="17" cy="20" rx="2.3" ry="3" fill="#3b2f4f"/><ellipse cx="27" cy="20" rx="2.3" ry="3" fill="#3b2f4f"/><ellipse cx="13" cy="26" rx="2.5" ry="1.5" fill="#f4b6c8"/><ellipse cx="31" cy="26" rx="2.5" ry="1.5" fill="#f4b6c8"/><path d="M19.5 26 q2.5 2.5 5 0" stroke="#3b2f4f" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg><div class="pp-title">Smart TV</div>'
};

function cardHTML(p) {
  return `
      <label class="plantilla-card" data-template="${p.id}">
        <input type="radio" name="plantilla" value="${p.id}" />
        <div class="plantilla-preview plantilla-preview--${p.id}">
          ${PREVIEWS[p.id] || ''}
        </div>
        <div class="plantilla-info">
          <div class="plantilla-name">${p.nombre}</div>
          <div class="plantilla-desc">${p.desc}</div>
        </div>
        <button class="check-btn" aria-pressed="false">
          <div class="check-circle">
            <svg viewBox="0 0 20 20" width="16" height="16" overflow="visible">
              <path class="check-path" d="M 4.5 10 L 8.5 14 L 15.5 6"
                fill="none" stroke="#F5C842" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round"
                stroke-dasharray="20" stroke-dashoffset="20"/>
            </svg>
          </div>
        </button>
      </label>`;
}

// Pinta las cards: "todas" (con título por sección) o una sola sección
function renderPlantillas(filtro) {
  const secciones = filtro === 'todas' ? SECCIONES : SECCIONES.filter(s => s.id === filtro);
  document.getElementById('plantillas-list').innerHTML = secciones.map(s => {
    const cards = PLANTILLAS.filter(p => p.seccion === s.id).map(cardHTML).join('');
    if (!cards) return '';
    const titulo = filtro === 'todas' ? `<h2 class="plantillas-seccion">${s.nombre}</h2>` : '';
    return titulo + cards;
  }).join('');
  initCards();
}

// Marcar la card seleccionada y guardar al tocar
function initCards() {
  const actual = getPlantilla();
  const cards = document.querySelectorAll('.plantilla-card');
  cards.forEach(card => {
    const value = card.dataset.template;
    const input = card.querySelector('input');
    if (value === actual) {
      input.checked = true;
      card.classList.add('selected');
      card.querySelector('.check-btn').classList.add('is-checked');
    }

    card.addEventListener('click', () => {
      cards.forEach(c => {
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

// Chips: "Todas" + una por sección
function initChips() {
  const chips = document.getElementById('plantillas-chips');
  chips.innerHTML = [{ id: 'todas', nombre: 'Todas' }, ...SECCIONES]
    .map(s => `<button class="plantillas-chip" data-seccion="${s.id}">${s.nombre}</button>`)
    .join('');
  chips.querySelectorAll('.plantillas-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chips.querySelectorAll('.plantillas-chip').forEach(c => c.classList.toggle('active', c === chip));
      renderPlantillas(chip.dataset.seccion);
    });
  });
  chips.querySelector('.plantillas-chip').classList.add('active');
}

initChips();
renderPlantillas('todas');
