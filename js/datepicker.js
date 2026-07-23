// ── config ────────────────────────────────────────────────────────────────────
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const ITEM_H  = 44;
const VISIBLE = 5;

let selectedDate = new Date();
let viewMonth = selectedDate.getMonth();
let viewYear  = selectedDate.getFullYear();
let calMode   = "days"; // "days" | "months" | "years"

// ── helpers ───────────────────────────────────────────────────────────────────
function daysInMonth(m, y) { return new Date(y, m + 1, 0).getDate(); }
function firstDay(m, y)    { return new Date(y, m, 1).getDay(); }
function pad(n)            { return n < 10 ? "0" + n : String(n); }
function range(a, b)       { return Array.from({length: b - a + 1}, (_, i) => a + i); }

function updateDisplay() {
  const fmt = new Intl.DateTimeFormat("es-MX", {
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  });
  const parts = fmt.format(selectedDate).split(", ");
  document.getElementById("dp-weekday").textContent     = parts[0] + ",";
  document.getElementById("dp-date-accent").textContent = parts[1] || "";
}

// ── drum columns ──────────────────────────────────────────────────────────────
function buildColumn(el, items, selectedIdx, onSelect) {
  el.innerHTML = "";

  const fadeTop = document.createElement("div");
  fadeTop.className = "dp-column__fade-top";

  const hl = document.createElement("div");
  hl.className = "dp-column__highlight";

  const fadeBot = document.createElement("div");
  fadeBot.className = "dp-column__fade-bottom";

  const scroll = document.createElement("div");
  scroll.className = "dp-column__scroll";
  const VISIBLE = 5; // items visibles
const PAD = Math.floor(VISIBLE / 2) * ITEM_H;
scroll.style.paddingTop = PAD + 'px';
scroll.style.paddingBottom = PAD + 'px';

  items.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "dp-item";
    div.textContent = typeof item === "number" ? pad(item) : item;
    updateItemStyle(div, i, selectedIdx);
    div.addEventListener("click", () => {
      scroll.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
    });
    scroll.appendChild(div);
  });

  el.appendChild(fadeTop);
  el.appendChild(hl);
  el.appendChild(fadeBot);
  el.appendChild(scroll);

  scroll.scrollTop = selectedIdx * ITEM_H;

  let currentIdx = selectedIdx;
  let snapTimer = null;

  scroll.addEventListener("scroll", () => {
    const raw = scroll.scrollTop / ITEM_H;
    const nearest = Math.round(raw);
    const clamped = Math.max(0, Math.min(nearest, items.length - 1));

    if (clamped !== currentIdx) {
      currentIdx = clamped;
      refreshItemStyles(scroll, clamped);
      onSelect(clamped);
    }

    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      const expected = clamped * ITEM_H;
      if (Math.abs(scroll.scrollTop - expected) > 1) {
        scroll.scrollTo({ top: expected, behavior: "smooth" });
      }
    }, 150);
  });

  return scroll;
}

function updateItemStyle(el, i, selectedIdx) {
  const dist = Math.min(Math.abs(i - selectedIdx), 2);
  el.dataset.dist = dist;
}

function refreshItemStyles(scrollEl, selectedIdx) {
  Array.from(scrollEl.children).forEach((item, i) => {
    updateItemStyle(item, i, selectedIdx);
  });
}

// ── drum state ────────────────────────────────────────────────────────────────
let dayScroll, monthScroll, yearScroll;
const currentYear = new Date().getFullYear();
const years = range(currentYear - 80, currentYear + 10);

function rebuildDayColumn() {
  const total = daysInMonth(selectedDate.getMonth(), selectedDate.getFullYear());
  const days = range(1, total);
  const colEl = document.getElementById("col-day");
  dayScroll = buildColumn(colEl, days, selectedDate.getDate() - 1, (i) => {
    selectedDate.setDate(i + 1);
    updateDisplay();
    refreshItemStyles(dayScroll, i);
  });
}

function initDrum() {
  rebuildDayColumn();

  const colMonth = document.getElementById("col-month");
  monthScroll = buildColumn(colMonth, MONTHS, selectedDate.getMonth(), (i) => {
    selectedDate.setMonth(i);
    const max = daysInMonth(i, selectedDate.getFullYear());
    if (selectedDate.getDate() > max) selectedDate.setDate(max);
    updateDisplay();
    rebuildDayColumn();
    refreshItemStyles(monthScroll, i);
  });

  const colYear = document.getElementById("col-year");
  yearScroll = buildColumn(colYear, years, years.indexOf(selectedDate.getFullYear()), (i) => {
    selectedDate.setFullYear(years[i]);
    const max = daysInMonth(selectedDate.getMonth(), years[i]);
    if (selectedDate.getDate() > max) selectedDate.setDate(max);
    updateDisplay();
    rebuildDayColumn();
    refreshItemStyles(yearScroll, i);
  });
}

// ── calendar ──────────────────────────────────────────────────────────────────
function renderCalendar() {
  // update nav buttons
  document.getElementById("dp-month-btn").textContent = MONTHS[viewMonth];
  document.getElementById("dp-year-btn").textContent  = viewYear;

  // hide / show grid vs overlays
  const grid      = document.getElementById("dp-days-grid");
  const daysHdr   = document.querySelector(".dp-days-header");
  const monthsOvl = document.getElementById("dp-months-overlay");
  const yearsOvl  = document.getElementById("dp-years-overlay");

  grid.style.display      = calMode === "days"   ? "grid" : "none";
  daysHdr.style.display   = calMode === "days"   ? "grid" : "none";
  monthsOvl.classList.toggle("active", calMode === "months");
  yearsOvl.classList.toggle("active",  calMode === "years");

  if (calMode === "days") renderDays();
  if (calMode === "months") renderMonthChips();
  if (calMode === "years") renderYearChips();
}

function renderDays() {
  const grid = document.getElementById("dp-days-grid");
  grid.innerHTML = "";

  const total    = daysInMonth(viewMonth, viewYear);
  const first    = firstDay(viewMonth, viewYear);
  const prevM    = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevY    = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevTotal = daysInMonth(prevM, prevY);
  const today    = new Date();

  const cells = [];
  for (let i = first - 1; i >= 0; i--) cells.push({ day: prevTotal - i, type: "prev" });
  for (let i = 1; i <= total; i++)     cells.push({ day: i, type: "current" });
  let n = 1;
  while (cells.length % 7 !== 0 || cells.length < 35) cells.push({ day: n++, type: "next" });

  cells.forEach(({ day, type }) => {
    const btn = document.createElement("button");
    btn.className = "dp-day";
    btn.textContent = day;

    if (type !== "current") {
      btn.classList.add("other-month");
      btn.addEventListener("click", () => {
        if (type === "prev") { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } }
        else                 { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } }
        renderCalendar();
      });
    } else {
      const isSelected =
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === viewMonth &&
        selectedDate.getFullYear() === viewYear;
      const isTod =
        today.getDate() === day &&
        today.getMonth() === viewMonth &&
        today.getFullYear() === viewYear;

      if (isSelected) btn.classList.add("selected");
      else if (isTod) btn.classList.add("today");

      btn.addEventListener("click", () => {
        selectedDate = new Date(viewYear, viewMonth, day);
        updateDisplay();
        renderCalendar();
      });
    }

    grid.appendChild(btn);
  });
}

function renderMonthChips() {
  const ovl = document.getElementById("dp-months-overlay");
  ovl.innerHTML = "";
  MONTHS.forEach((m, i) => {
    const btn = document.createElement("button");
    btn.className = "dp-chip" + (i === viewMonth ? " active" : "");
    btn.textContent = m.slice(0, 3);
    btn.addEventListener("click", () => {
      viewMonth = i; calMode = "days"; renderCalendar();
    });
    ovl.appendChild(btn);
  });
}

function renderYearChips() {
  const ovl = document.getElementById("dp-years-overlay");
  ovl.innerHTML = "";
  const yrs = range(currentYear - 40, currentYear + 20);
  yrs.forEach(y => {
    const btn = document.createElement("button");
    btn.className = "dp-chip" + (y === viewYear ? " active" : "");
    btn.textContent = y;
    btn.addEventListener("click", () => {
      viewYear = y; calMode = "days"; renderCalendar();
    });
    ovl.appendChild(btn);
  });
  // scroll selected into view
  const active = ovl.querySelector(".active");
  if (active) active.scrollIntoView({ block: "center" });
}

// ── nav arrows ────────────────────────────────────────────────────────────────
document.getElementById("dp-prev").addEventListener("click", () => {
  viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderCalendar();
});
document.getElementById("dp-next").addEventListener("click", () => {
  viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  renderCalendar();
});
document.getElementById("dp-month-btn").addEventListener("click", () => {
  calMode = calMode === "months" ? "days" : "months"; renderCalendar();
});
document.getElementById("dp-year-btn").addEventListener("click", () => {
  calMode = calMode === "years" ? "days" : "years"; renderCalendar();
});

// ── confirm ───────────────────────────────────────────────────────────────────
document.getElementById("dp-confirm").addEventListener("click", () => {
  alert("Fecha confirmada: " + selectedDate.toLocaleDateString("es-MX", {
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  }));
  // aquí enganchas tu lógica: enviar al servidor, actualizar un input, etc.
});

const btnDate = document.getElementById("btn-date");
const modal = document.getElementById("dp-modal");

btnDate.addEventListener("click", () => {

    modal.classList.add("show");

});
// ── init ──────────────────────────────────────────────────────────────────────
updateDisplay();
initDrum();
renderCalendar();