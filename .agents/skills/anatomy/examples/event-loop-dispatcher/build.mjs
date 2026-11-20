import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { kitScript } from "../../scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 680;
const HEIGHT = 420;

// ---- Layout --------------------------------------------------------------
const PLATE = { x: -200, y: -78, w: 400, d: 156, r: 10 };
const PLATE_H = 12;
const FOOT_H = 5;

// Zone 1: call stack tower (left)
const STACK_X = -150, STACK_Y = 6;
const STACK_SIZES = [30, 25, 20, 15]; // plate half-extent shrinks with depth
const FRAME_H = 9;
const STACK_BASE_Z = 0;

// Zone 2: macrotask carousel (centre)
const WHEEL = [-5, -4];
const WHEEL_R = 34;
const WHEEL_Z = 0;
const WHEEL_H = 10;
const STATIONS = 4;
const POINTER_POST = [WHEEL[0] + WHEEL_R + 18, WHEEL[1] - 2];

// Zone 3: microtask chute (right)
const CHUTE = { x: 118, y: -14, w: 30, d: 28, r: 3 };
const CHUTE_FLOOR_Z = 2;
const CHUTE_TOP_Z = 86;
const BALL_R = 6.2;
const BALL_H = 7;
const BALL_COUNT = 3;
const BALL_GAP = 11;
const TRAY = { x: 112, y: CHUTE.y + CHUTE.d + 6, w: 42, d: 20, r: 3 };

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [STACK_X, STACK_Y, STACK_BASE_Z + STACK_SIZES.length * FRAME_H + 6],
    [WHEEL[0] + WHEEL_R + 30, WHEEL[1], WHEEL_Z + WHEEL_H + 40],
    [CHUTE.x + CHUTE.w, CHUTE.y, CHUTE_TOP_Z + 6],
  ],
  WIDTH,
  HEIGHT,
  { pad: 30, azimuth: 40 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// ---- Base plate (feet, screws, ruler strip) -------------------------------
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 26))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 24), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 10, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const strip = { x: -170, y: PLATE.y + PLATE.d - 15, w: 340, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 6, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  return out.join("");
}

function dividers() {
  const out = [];
  for (const x of [-72, 54]) {
    out.push(S(k.slabOf({ x, y: PLATE.y + 8, w: 2, d: PLATE.d - 16, r: 1 }, 0, 1.4, P, 2), { tone: "lo", crease: "none" }));
  }
  const labels = [["PILA", -150], ["COLA MACROTASKS", -5], ["MICROTASKS", 133]];
  labels.forEach(([text, x]) => out.push(k.faceTextSvg(k.topMatrix([x, PLATE.y + 20], 0.2, P, "x"), text, { size: 2.6, tone: "lo", anchor: "middle" })));
  return out.join("");
}

// ---- Zone 1: call stack tower ---------------------------------------------
function stackTower() {
  const out = [];
  out.push(S(k.cylinder(STACK_X, STACK_Y, 4, 0, STACK_SIZES.length * FRAME_H + 10, P, 20), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(STACK_X, STACK_Y, 7, 0, 3, P, 24), { tone: "lo" }));
  return out.join("");
}

function stackFrame(index, half) {
  const plan = { x: STACK_X - half, y: STACK_Y - half, w: half * 2, d: half * 2, r: 2.4 };
  const z = STACK_BASE_Z + index * FRAME_H;
  const lit = index === 0; // topmost drawn part for the deepest live frame; recoloured in JS per depth
  const out = [];
  out.push(S(k.slabOf(plan, z, FRAME_H - 1.2, P, 4, 0.6), { tone: lit ? "hi" : "mid", crease: "lo", lit }));
  out.push(L(k.planOutline(k.insetPlan(plan, 2.2), z + FRAME_H - 1.2, P, 4), { tone: "faint" }));
  return out.join("");
}

// ---- Zone 2: macrotask carousel --------------------------------------------
function carousel() {
  const out = [];
  const [x, y] = WHEEL;
  out.push(S(k.cylinder(x, y, 8, 0, 4, P, 24), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, WHEEL_R, WHEEL_Z + 4, WHEEL_H, P, 56, 0.8), { tone: "mid", crease: "lo" }));
  out.push(L(k.knurl(x, y, WHEEL_R, WHEEL_Z + 4 + WHEEL_H - 2.6, WHEEL_Z + 4 + WHEEL_H, 72, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, WHEEL_R - 6, WHEEL_Z + 4 + WHEEL_H, P, 56), { tone: "faint" }));
  // Fixed pointer post + blade (lit): shows which station the dispatcher is about to take.
  out.push(S(k.cylinder(POINTER_POST[0], POINTER_POST[1], 3, 0, WHEEL_Z + 4 + WHEEL_H + 6, P, 16), { tone: "mid" }));
  return out.join("");
}

function wheelStations() {
  const [cx, cy] = WHEEL;
  const z = WHEEL_Z + 4 + WHEEL_H;
  const out = [];
  for (let i = 0; i < STATIONS; i++) {
    const a = (i / STATIONS) * Math.PI * 2;
    const x = cx + Math.cos(a) * (WHEEL_R - 11);
    const y = cy + Math.sin(a) * (WHEEL_R - 11);
    const plan = { x: x - 7, y: y - 7, w: 14, d: 14, r: 2 };
    out.push(S(k.slabOf(plan, z, 3.4, P, 3, 0.4), { tone: "mid", crease: "lo" }));
    out.push(k.faceTextSvg(k.topMatrix([x, y + 1], z + 3.4, P, "x"), String(i + 1), { size: 3, tone: "lo", anchor: "middle" }));
  }
  return out.join("");
}

function pointerBlade(angle) {
  const z = WHEEL_Z + 4 + WHEEL_H + 6;
  const tip = [POINTER_POST[0] - Math.cos(angle) * 2, POINTER_POST[1] - Math.sin(angle) * 2 + Math.sin(angle) * 0];
  const d = k.lineOnTop([POINTER_POST[0], POINTER_POST[1]], [WHEEL[0] + Math.cos(angle) * (WHEEL_R + 2), WHEEL[1] + Math.sin(angle) * (WHEEL_R + 2)], z, P);
  return `<path data-part="pointer" class="iso-line" data-tone="lit" data-free="start" d="${d}" style="stroke-width:1.3"/>`;
}

// ---- Zone 3: microtask chute ------------------------------------------------
function chute() {
  const out = [];
  out.push(S(k.slabOf({ x: CHUTE.x - 2, y: CHUTE.y - 2, w: 3, d: CHUTE.d + 4, r: 1 }, CHUTE_FLOOR_Z, CHUTE_TOP_Z - CHUTE_FLOOR_Z, P, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf({ x: CHUTE.x + CHUTE.w - 1, y: CHUTE.y - 2, w: 3, d: CHUTE.d + 4, r: 1 }, CHUTE_FLOOR_Z, CHUTE_TOP_Z - CHUTE_FLOOR_Z, P, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf({ x: CHUTE.x - 2, y: CHUTE.y - 2, w: CHUTE.w + 4, d: 3 }, CHUTE_FLOOR_Z, CHUTE_TOP_Z - CHUTE_FLOOR_Z, P, 2), { tone: "faint", crease: "none" }));
  out.push(S(k.slabOf(TRAY, 0, CHUTE_FLOOR_Z + 1.5, P, 4, 0.6), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(TRAY, 2), CHUTE_FLOOR_Z + 1.5, P, 4), { tone: "faint" }));
  return out.join("");
}

function ball(index) {
  const cx = CHUTE.x + CHUTE.w / 2, cy = CHUTE.y + CHUTE.d / 2;
  const z = CHUTE_FLOOR_Z + 3 + index * BALL_GAP;
  return S(k.cylinder(cx, cy, BALL_R, z, BALL_H, P, 24, 0.9), { tone: index === 0 ? "hi" : "mid", crease: "lo", lit: index === 0 });
}

// ---- Assemble ---------------------------------------------------------------
const stackParts = STACK_SIZES.map((half, index) => `<g data-part="frame-${index}" data-rest="${STACK_BASE_Z + index * FRAME_H}">${stackFrame(index, half)}</g>`).join("");
const ballParts = Array.from({ length: BALL_COUNT }, (_, i) => `<g data-part="ball-${i}" data-rest="${CHUTE_FLOOR_Z + 3 + i * BALL_GAP}">${ball(i)}</g>`).join("");

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A benchtop dispatcher with three mechanisms on one base plate. On the left, a spring post stacks square frames one on top of another as functions call deeper; the topmost lit frame is the one currently running, and frames come back off in the reverse order they went on. In the centre, a numbered carousel holds one macrotask per station and turns by exactly one station per full cycle. On the right, a magazine of balls empties completely into a tray every time the stack returns to empty, before the carousel is allowed to turn.",
  body: [
    plate(),
    dividers(),
    stackTower(),
    `<g data-part="stack-group">${stackParts}</g>`,
    carousel(),
    wheelStations(),
    pointerBlade(-Math.PI / 2),
    chute(),
    `<g data-part="ball-group">${ballParts}</g>`,
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const STACK_X = ${STACK_X}, STACK_Y = ${STACK_Y}, FRAME_H = ${FRAME_H};
const WHEEL = ${JSON.stringify(WHEEL)}, WHEEL_R = ${WHEEL_R}, STATIONS = ${STATIONS};
const CHUTE_FLOOR_Z = ${CHUTE_FLOOR_Z}, BALL_GAP = ${BALL_GAP}, BALL_COUNT = ${BALL_COUNT};
const TRAY_Z = ${CHUTE_FLOOR_Z + 1.5};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const frames = Array.from({ length: 4 }, (_, i) => svg.querySelector('[data-part="frame-' + i + '"]'));
const balls = Array.from({ length: BALL_COUNT }, (_, i) => svg.querySelector('[data-part="ball-' + i + '"]'));
const pointer = svg.querySelector('[data-part="pointer"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");

function placeFrame(el, depth) {
  el.setAttribute("transform", translateAlong(P, [0, 0, depth === null ? -40 : 0]));
  el.style.opacity = depth === null ? 0 : 1;
}
function placeBall(el, z) {
  el.setAttribute("transform", translateAlong(P, [0, 0, z]));
}
function pointerAt(angle) {
  const z = ${WHEEL_Z + 4 + WHEEL_H + 6};
  return lineOnTop([WHEEL[0] + Math.cos(angle) * 3, WHEEL[1] + Math.sin(angle) * 3], [WHEEL[0] + Math.cos(angle) * (WHEEL_R + 2), WHEEL[1] + Math.sin(angle) * (WHEEL_R + 2)], z, P);
}

// --- Script of the loop: a tiny fixed timeline, run-to-completion per phase ---
// Each step: { depth: 0..4 (call stack size), micro: 0..BALL_COUNT (balls left), station, text }
const steps = [];
function pushCall(depth) { steps.push({ depth, micro: BALL_COUNT, text: "marco " + depth + "/4 · llamada síncrona" }); }
function popCall(depth) { steps.push({ depth, micro: BALL_COUNT, text: depth === 0 ? "pila vacía · drena microtasks" : "retorna · marco " + depth }); }
[1, 2, 3].forEach(pushCall);
[2, 1, 0].forEach(popCall);
for (let left = BALL_COUNT; left >= 0; left--) {
  steps.push({ depth: 0, micro: left, text: left > 0 ? "microtask · quedan " + left : "microtasks vacíos · gira el carrusel" });
}
let station = 0;
steps.push({ depth: 0, micro: 0, text: "macrotask · estación " + (((station + 1) % STATIONS) + 1), turn: true });

let i = 0, frame = 0, visible = false, holdUntil = 0, angle = -Math.PI / 2;
function render(step) {
  frames.forEach((el, index) => placeFrame(el, index < step.depth ? 0 : null));
  balls.forEach((el, index) => placeBall(el, index < step.micro ? CHUTE_FLOOR_Z + 3 + index * BALL_GAP : TRAY_Z));
  if (step.turn) { station = (station + 1) % STATIONS; angle += (Math.PI * 2) / STATIONS; }
  pointer.setAttribute("d", pointerAt(angle));
  if (readout.textContent !== step.text) readout.textContent = step.text;
  stage.setAttribute("aria-valuetext", step.text);
}
function tick(now) {
  if (!holdUntil) holdUntil = now;
  const stepDuration = still.matches ? 1 : 650;
  if (now - holdUntil >= stepDuration) {
    i = (i + 1) % steps.length;
    render(steps[i]);
    holdUntil = now;
  }
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { holdUntil = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("keydown", (event) => {
  if (event.key !== " " && event.key !== "ArrowRight") return;
  event.preventDefault();
  i = (i + 1) % steps.length;
  render(steps[i]);
  holdUntil = performance.now();
});
render(steps[0]);
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "El despachador: pila, microtasks y macrotasks",
  hint: "Espacio para avanzar",
  readout: "marco 1/4 · llamada síncrona",
  keys: [
    { mark: "lit", label: "Marco activo de la pila: el que se está ejecutando ahora mismo" },
    { mark: "raised", label: "Carrusel de macrotasks: gira una sola estación por ciclo completo" },
  ],
  caption:
    "Cada marco se apila sobre el anterior (pila, LIFO) y se retira en el orden inverso. Recién cuando la pila vuelve a cero, el cargador de microtasks se vacía POR COMPLETO. Solo entonces el carrusel de macrotasks gira una sola estación — nunca dos — y el ciclo empieza de nuevo.",
  body: `<div class="iso-stage" tabindex="0" role="img" aria-label="Despachador del event loop: espacio para avanzar un paso">${svg}</div>`,
});

const OUT_DIR = process.env.ANATOMY_OUT || HERE;
const outName = theme === "light" ? "figure-light.html" : "figure.html";
writeFileSync(
  join(OUT_DIR, outName),
  k.pageHtml({ title: "El despachador del event loop", theme, body, script: kitScript() + live }),
);
console.log("wrote", join(OUT_DIR, outName));
