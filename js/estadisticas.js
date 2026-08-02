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

// ── donut SVG ─────────────────────────────────────────────────────────────────
function buildDonut(p) {
  const r    = 42;
  const circ = 2 * Math.PI * r;
  const dash = (p / 100) * circ;
  const ns   = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", 96);
  svg.setAttribute("height", 96);
  svg.setAttribute("viewBox", "0 0 100 100");

  const track = document.createElementNS(ns, "circle");
  track.setAttribute("cx", 50); track.setAttribute("cy", 50); track.setAttribute("r", r);
  track.setAttribute("fill", "none");
  track.setAttribute("stroke", "#E0DDD8");
  track.setAttribute("stroke-width", 12);

  const arc = document.createElementNS(ns, "circle");
  arc.setAttribute("cx", 50); arc.setAttribute("cy", 50); arc.setAttribute("r", r);
  arc.setAttribute("fill", "none");
  arc.setAttribute("stroke", "#C4714A");
  arc.setAttribute("stroke-width", 12);
  arc.setAttribute("stroke-dasharray", `${dash} ${circ}`);
  arc.setAttribute("stroke-linecap", "round");
  arc.setAttribute("stroke-dashoffset", circ * 0.25);

  const txt = document.createElementNS(ns, "text");
  txt.setAttribute("x", 50); txt.setAttribute("y", 54);
  txt.setAttribute("text-anchor", "middle");
  txt.setAttribute("font-size", 18);
  txt.setAttribute("font-weight", 700);
  txt.setAttribute("fill", "#1a1a1a");
  txt.setAttribute("font-family", "DM Sans, sans-serif");
  txt.textContent = Math.round(p) + "%";

  svg.appendChild(track);
  svg.appendChild(arc);
  svg.appendChild(txt);
  return svg;
}

// ── barras semanales ──────────────────────────────────────────────────────────
function buildBars(vendidos) {
  const vals = [0.12, 0.22, 0.18, 0.28, 0.20].map(f => Math.floor(vendidos * f));
  const max  = Math.max(...vals, 1);
  const wrap = document.createElement("div");
  wrap.className = "bars";

  vals.forEach((v, i) => {
    const col = document.createElement("div");
    col.className = "bar-col";

    const bar = document.createElement("div");
    bar.className = "bar " + (i === vals.length - 1 ? "active" : "inactive");
    bar.style.height = `${(v / max) * 52}px`;

    const lbl = document.createElement("span");
    lbl.className = "bar-label";
    lbl.textContent = "S" + (i + 1);

    col.appendChild(bar);
    col.appendChild(lbl);
    wrap.appendChild(col);
  });
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
  barsWrap.appendChild(buildBars(vendidos));
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
