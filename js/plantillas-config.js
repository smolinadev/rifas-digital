// Plantillas destacadas en el formulario de nueva rifa (cambiar por temporada)
const PLANTILLAS_DESTACADAS = ['calabaza', 'noche', 'fantasma'];
const TEMPORADA = '🎃 Halloween';

// Secciones y plantillas de la página Plantillas
const SECCIONES = [
  { id: 'basicas',   nombre: 'Básicas' },
  { id: 'halloween', nombre: '🎃 Halloween' },
];
const PLANTILLAS = [
  { id: 'azul',      nombre: 'Azul Marino',     desc: 'Elegante y clásico', seccion: 'basicas' },
  { id: 'esmeralda', nombre: 'Verde Esmeralda', desc: 'Fresco y moderno',   seccion: 'basicas' },
  { id: 'retro',     nombre: 'Retro Rosa',      desc: 'Estilo vintage',     seccion: 'basicas' },
  { id: 'calabaza',  nombre: 'Calabaza',        desc: 'Naranja y negro',    seccion: 'halloween' },
  { id: 'noche',     nombre: 'Noche Morada',    desc: 'Luna y murciélagos', seccion: 'halloween' },
  { id: 'fantasma',  nombre: 'Fantasmita',      desc: 'Tierno y pastel',    seccion: 'halloween' },
];
