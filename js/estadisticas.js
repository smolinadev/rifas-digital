// ── datos desde localStorage ──────────────────────────────────────────────────
function getRifas() {
  try {
    return JSON.parse(localStorage.getItem('rifas') || '[]');
  } catch {
    return [];
  }
}

const RIFAS = getRifas();

// ── helpers con tu estructura real ───────────────────────────────────────────
function getVendidos(rifa) {
  return Object.values(rifa.nums).filter(n => n.sold).length;
}

function getLibres(rifa) {
  return rifa.count - getVendidos(rifa);
}

function getPrecio(rifa) {
  return Number(rifa.price.replace(/\./g, ""));
}

function getRecaudado(rifa) {
  return getVendidos(rifa) * getPrecio(rifa);
}

function getPorcentaje(rifa) {
  return (getVendidos(rifa) / rifa.count) * 100;
}

function fmt(n) {
  return n.toLocaleString("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  });
}

// ── emoji automático por palabras clave del premio ────────────────────────────
const EMOJI_MAP = [
  { keys: ["jean","jeans","pantalon","pantalón","leggin","ropa","camisa","chaqueta","vestido","zapato","tenis","bota"], emoji: "👖" },
  { keys: ["tv","televisor","televisión","television","samsung","lg","pantalla","smart"], emoji: "📺" },
  { keys: ["iphone","celular","telefono","teléfono","smartphone","moto","xiaomi","huawei","samsung galaxy"], emoji: "📱" },
  { keys: ["computador","laptop","portátil","portatil","pc","macbook","tablet","ipad"], emoji: "💻" },
  { keys: ["moto","motocicleta","bicicleta","bici","scooter"], emoji: "🏍️" },
  { keys: ["carro","coche","auto","automovil","automóvil","vehiculo","vehículo"], emoji: "🚗" },
  { keys: ["nevera","lavadora","estufa","electrodomestico","electrodoméstico","horno","microondas"], emoji: "🏠" },
  { keys: ["reloj","watch","smartwatch"], emoji: "⌚" },
  { keys: ["playstation","ps5","ps4","xbox","nintendo","consola","videojuego"], emoji: "🎮" },
  { keys: ["auricular","audifonos","audífonos","parlante","bocina","airpods"], emoji: "🎧" },
  { keys: ["bolso","cartera","bolsa","maleta","mochila"], emoji: "👜" },
  { keys: ["perfume","colonia","maquillaje","belleza","cosmetico","cosmético"], emoji: "🌸" },
  { keys: ["efectivo","dinero","plata","pesos","millón","millon","premio en"], emoji: "💵" },
  { keys: ["viaje","pasaje","tiquete","tour","vacaciones","hotel"], emoji: "✈️" },
  { keys: ["mercado","mercadería","mercancia","mercancía","domicilio","combo"], emoji: "🛒" },
];

function getEmoji(prize) {
  const lower = prize.toLowerCase();
  for (const { keys, emoji } of EMOJI_MAP) {
    if (keys.some(k => lower.includes(k))) return emoji;
  }
  return "🎁"; // fallback genérico
}

function buildDonut(pct) {
  const r = 32, cx = 40, cy = 40;
  const circ = 2 * Math.PI * r;

  const wrap = document.createElement('div');
  wrap.className = 'donut-wrap';

  wrap.innerHTML = `
    <svg viewBox="0 0 80 80" width="80" height="80">
      <circle cx="${cx}" cy="${cy}" r="${r}"
        fill="none" stroke="#ECEAE5" stroke-width="8"/>
      <circle class="donut-arc" cx="${cx}" cy="${cy}" r="${r}"
        fill="none" stroke="#C4714A" stroke-width="8"
        stroke-dasharray="0 ${circ}"
        stroke-dashoffset="${circ * 0.25}"
        stroke-linecap="round"
        style="transition: stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)"/>
    </svg>
    <span class="donut-pct">${Math.round(pct)}%</span>
  `;

  setTimeout(() => {
    const filled = (pct / 100) * circ;
    const arc = wrap.querySelector('.donut-arc');
    if (arc) arc.setAttribute('stroke-dasharray', `${filled} ${circ - filled}`);
  }, 30);

  return wrap;
}

/*barras semanales mejor estructuradas*/
let activeChart = null;

function buildBars(rifa) {
  // Últimas 5 semanas (lunes como inicio)
  const hoy = new Date();
  const semanas = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - hoy.getDay() + 1 - i * 7); // lunes de esa semana
    semanas.push(d.toISOString().slice(0, 10));
  }

  // Contar vendidos y reservados por semana
  const sold     = semanas.map(() => 0);
  const reserved = semanas.map(() => 0);

  Object.values(rifa.nums).forEach(n => {
    if ((!n.sold && !n.reserved) || !n.fecha) return;
    const d = new Date(n.fecha);
    if (isNaN(d)) return;

    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    const key = monday.toISOString().slice(0, 10);

    const idx = semanas.indexOf(key);
    if (idx === -1) return;
    if (n.sold)     sold[idx]++;
    if (n.reserved) reserved[idx]++;
  });

  const labels = semanas.map((_, i) => 'S' + (i + 1));
  const maxVal = Math.max(...sold.map((s, i) => s + reserved[i]), 1);

  const wrap   = document.createElement('div');
  wrap.className = 'bars';
  wrap.style.height = 'auto';

  const legend = document.createElement('div');
legend.style.cssText = 'display:flex;gap:14px;margin-bottom:8px;';
legend.innerHTML = `
  <span style="display:flex;align-items:center;gap:5px;font-size:11px;color:#888;font-family:DM Sans,sans-serif">
    <span style="width:10px;height:10px;border-radius:3px;background:#3DAB7A;display:inline-block"></span>
    Vendidos
  </span>
  <span style="display:flex;align-items:center;gap:5px;font-size:11px;color:#888;font-family:DM Sans,sans-serif">
    <span style="width:10px;height:10px;border-radius:3px;background:#5B8DEF;display:inline-block"></span>
    Reservados
  </span>
`;
wrap.appendChild(legend);

const chartWrap = document.createElement('div');
chartWrap.style.cssText = 'position:relative;height:130px;width:100%;';

const canvas = document.createElement('canvas');
canvas.addEventListener('mouseleave', () => {
  if (activeChart) {
    activeChart.tooltip.setActiveElements([], { x: 0, y: 0 });
    activeChart.update();
  }
});
chartWrap.appendChild(canvas);
wrap.appendChild(chartWrap);
  setTimeout(() => {
    if (activeChart) { activeChart.destroy(); activeChart = null; }

    activeChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
datasets: [
  {
    
  label: 'Vendidos',
  data: sold,

  backgroundColor: sold.map((_, i) =>
    i === semanas.length - 1
      ? '#3DAB7A'
      : 'rgba(61,171,122,0.55)'
  ),

  hoverBackgroundColor: '#3DAB7A',

  borderRadius: {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 6,
    bottomRight: 6
  },

  borderSkipped: false,
  stack: 'a',
  barPercentage: 0.5,
},

{
  label: 'Reservados',
  data: reserved,

  backgroundColor: reserved.map((_, i) =>
    i === semanas.length - 1
      ? '#5B8DEF'
      : 'rgba(91,141,239,0.55)'
  ),

  hoverBackgroundColor: '#5B8DEF',

  borderRadius: {
    topLeft: 6,
    topRight: 6,
    bottomLeft: 0,
    bottomRight: 0
  },

  borderSkipped: false,
  stack: 'a',
  barPercentage: 0.5,
},
  {
    label: '',
    data: sold.map((s, i) => (s + reserved[i] === 0) ? maxVal : 0),
    backgroundColor: 'rgba(0,0,0,0.06)',
    hoverBackgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 6,
    borderSkipped: false,
    stack: 'a',
    barPercentage: 0.5,
  }
],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            border: { display: false },
            ticks: { font: { family: 'DM Sans', size: 11 }, color: '#888' }
          },
          y: {
            stacked: true,
            display: false,
            beginAtZero: true,
            max: maxVal + Math.ceil(maxVal * 0.25),
          }
        },
        layout: { padding: { top: 20 } },
      },
      plugins: [{
        id: 'topLabels',
        afterDatasetsDraw(chart) {
          const { ctx } = chart;
          const meta0 = chart.getDatasetMeta(0);
          const meta1 = chart.getDatasetMeta(1);

          meta0.data.forEach((bar, i) => {
            const total = sold[i] + reserved[i];
            if (!total) return;
            const topBar = reserved[i] ? meta1.data[i] : bar;
            ctx.save();
            ctx.font = '600 11px DM Sans, sans-serif';
            ctx.fillStyle = '#1a1a1a';
            ctx.textAlign = 'center';
            ctx.fillText(total, topBar.x, topBar.y - 6);
            ctx.restore();
          });
        }
      }]
    });
  }, 0);

  return wrap;
}
// ── chip ──────────────────────────────────────────────────────────────────────
function buildChip(label, value, accent) {
  const chip = document.createElement("div");
  chip.className = "chip" + (accent ? " accent" : "");

  const lbl = document.createElement("p");
  lbl.className = "chip__label";
  lbl.textContent = label;

  const val = document.createElement("p");
  val.className = "chip__value";
  val.textContent = value;

  chip.appendChild(lbl);
  chip.appendChild(val);
  return chip;
}

// ── render panel ──────────────────────────────────────────────────────────────
function renderPanel(rifa) {
  const vendidos   = getVendidos(rifa);
  const libres     = getLibres(rifa);
  const precio     = getPrecio(rifa);
  const recaudado  = getRecaudado(rifa);
  const porcentaje = getPorcentaje(rifa);
  const posible    = precio * rifa.count;
  const emoji      = getEmoji(rifa.prize);

  const body = document.getElementById("panel-body");
  body.innerHTML = "";

  // — resumen —
  const s1 = document.createElement("div");
  s1.className = "stat-section";
  s1.innerHTML = `
    <div class="stat-header">
      <div class="stat-emoji">${emoji}</div>
      <div class="stat-meta">
        <p class="stat-tag">Rifa activa</p>
        <p class="stat-name">${rifa.prize}</p>
        <p class="stat-sub">${rifa.lottery} · ${rifa.date}</p>
      </div>
    </div>
    <div class="stat-progress-row">
      <span class="stat-progress-label">Progreso de ventas</span>
      <span class="stat-progress-num">${vendidos} / ${rifa.count}</span>
    </div>
    <div class="progress">
      <div class="progress__fill" style="width:${porcentaje}%"></div>
    </div>
  `;
  body.appendChild(s1);

  // — chips dinero —
  const row1 = document.createElement("div");
  row1.className = "chips-row";
  row1.appendChild(buildChip("Recaudado",    fmt(recaudado), true));
  row1.appendChild(buildChip("Total posible", fmt(posible),  false));
  body.appendChild(row1);

  // — chips conteos —
  const row2 = document.createElement("div");
  row2.className = "chips-row";
  row2.style.marginBottom = "10px";
  row2.appendChild(buildChip("Vendidas",  String(vendidos),   false));
  row2.appendChild(buildChip("Faltantes", String(libres),     false));
  row2.appendChild(buildChip("Precio c/u", fmt(precio),       false));
  body.appendChild(row2);

  // — gráficas —
  const s2 = document.createElement("div");
  s2.className = "stat-section";

  const chartsRow = document.createElement("div");
  chartsRow.className = "charts-row";
  chartsRow.appendChild(buildDonut(porcentaje));

  const barsWrap = document.createElement("div");
  barsWrap.className = "bars-wrap";
  const barsTitle = document.createElement("p");
  barsTitle.className = "bars-title";
  barsTitle.textContent = "Ventas por semana";
  barsWrap.appendChild(barsTitle);
  barsWrap.appendChild(buildBars(rifa)); 
  chartsRow.appendChild(barsWrap);

  s2.appendChild(chartsRow);
  body.appendChild(s2);

  // — premio —
  const s3 = document.createElement("div");
  s3.className = "stat-section";
  s3.innerHTML = `
    <p class="stat-tag">Premio</p>
    <p class="premio-name">${rifa.prize}</p>
    <div class="premio-divider">
      <div class="premio-row">
        <span class="premio-key">Fecha del sorteo</span>
        <span class="premio-val">${rifa.date}</span>
      </div>
      <div class="premio-row">
        <span class="premio-key">Lotería</span>
        <span class="premio-val">${rifa.lottery}</span>
      </div>
      <div class="premio-row">
        <span class="premio-key">Precio boleta</span>
        <span class="premio-val">${fmt(precio)}</span>
      </div>
      <div class="premio-row">
        <span class="premio-key">Total números</span>
        <span class="premio-val">${rifa.count}</span>
      </div>
    </div>
  `;
  body.appendChild(s3);
}

// ── panel open / close ────────────────────────────────────────────────────────
const panel = document.getElementById("panel");

function openPanel(rifa) {
  renderPanel(rifa);
  panel.classList.remove("closing");
  panel.classList.add("active");
}

function closePanel() {
  panel.classList.add("closing");
  setTimeout(() => {
    panel.classList.remove("active", "closing");
  }, 320);
}

document.getElementById("btn-volver").addEventListener("click", closePanel);

// ── construir cards ───────────────────────────────────────────────────────────
function buildCard(rifa) {
  const vendidos   = getVendidos(rifa);
  const precio     = getPrecio(rifa);
  const porcentaje = getPorcentaje(rifa);
  const emoji      = getEmoji(rifa.prize);

  const card = document.createElement("button");
  card.className = "rifa-card";
  card.innerHTML = `
    <div class="rifa-card__row">
      <div class="rifa-card__emoji">${emoji}</div>
      <div class="rifa-card__info">
        <p class="rifa-card__name">${rifa.prize}</p>
        <p class="rifa-card__sub">${fmt(precio)} · ${rifa.date}</p>
      </div>
      <div class="rifa-card__right">
        <div class="rifa-card__count">
          <p class="rifa-card__count-num">${vendidos}/${rifa.count}</p>
          <p class="rifa-card__count-label">vendidas</p>
        </div>
        <div class="rifa-card__arrow">›</div>
      </div>
    </div>
    <div class="progress">
      <div class="progress__fill" style="width:${porcentaje}%"></div>
    </div>
  `;
  card.addEventListener("click", () => openPanel(rifa));
  return card;
}

// ── init ──────────────────────────────────────────────────────────────────────
function init() {
  const list = document.getElementById("rifa-list");

  if (RIFAS.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🎟️</div>
        <p>No tienes rifas activas aún.</p>
      </div>
    `;
    return;
  }

  RIFAS.forEach(r => list.appendChild(buildCard(r)));
}

init();
