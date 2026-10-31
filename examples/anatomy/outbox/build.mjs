import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../../.agents/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../../../.agents/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 760;
const HEIGHT = 560;

const BASE = { x: -165, y: -105, w: 340, d: 195, r: 8 };
const BASE_H = 14;
const FOOT_H = 6;

const PED = { x: -70, y: -58, w: 140, d: 116, r: 5 };
const ANVIL = { x: -62, y: -52, w: 124, d: 104, r: 3 };
const PLATEN = { x: -56, y: -50, w: 112, d: 100, r: 3 };
const PLATEN_REST = 50;
const STROKE = 9;
const CARBON = { y: -26, from: -40, to: -12 };
const LEDGER = { y: 26, from: 12, to: 40 };
const PAPER_Z = 40.2;

const OUTBOX = { x: 85, y: -46, w: 65, d: 38, r: 2 };
const LEDGER_OUT = { x: 85, y: 8, w: 65, d: 36, r: 2 };
const SLIP = { x: 106, y: -33, w: 24, d: 14, r: 1 };
const QUEUE = { x: 96, y: -84, w: 48, d: 24, r: 2 };
const RAIL = { x: 112, y: -96, w: 12, d: 90 };
const SHUTTLE_Y = -26;
const QUEUE_Y = -72;

const columnAt = [-112, 0];
const wheelAt = [0, 0];
const WHEEL_Z = 152;
const WHEEL_TOP = 160;

const P = k.fitProjection(
  [
    ...k.boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [columnAt[0], columnAt[1], 152],
    [wheelAt[0] + 22, wheelAt[1] + 22, WHEEL_TOP + 8],
    [RAIL.x + RAIL.w, RAIL.y, 79],
    [QUEUE.x + QUEUE.w, QUEUE.y, 37],
    [154, 58, 40],
  ],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 42 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

function bolts(points, z, size = 1.5) {
  return L(points.map(([x, y]) => k.ring(x, y, size, z, P, 14)).join(""), { tone: "lo" })
    + D(points.map(([x, y]) => at([x, y, z])), { size: 0.44, tone: "lo" });
}

function boltRing(cx, cy, radius, count, z, size = 1.5) {
  const points = Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  });
  return bolts(points, z, size);
}

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`];
  const feet = k.corners(BASE, 24);
  for (const [x, y] of byDepth(feet)) {
    out.push(S(k.cylinder(x, y, 7, -BASE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(BASE, -BASE_H, BASE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BASE, 5), 0, P), { tone: "lo" }));
  out.push(bolts(k.corners(BASE, 10), 0, 2.1));

  const label = { x: -150, y: 64, w: 58, d: 18, r: 1.5 };
  out.push(S(k.slabOf(label, 0, 1.1, P, 4), { tone: "lo" }));
  for (const dy of [4, 9, 14]) {
    out.push(L(k.lineOnTop([label.x + 4, label.y + dy], [label.x + label.w - 4, label.y + dy], 1.1, P), { tone: "faint", free: true }));
  }
  out.push(bolts([[label.x + 4, label.y + 4], [label.x + label.w - 4, label.y + 4]], 1.1, 0.9));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 5, label.y + 15], 1.1, P, "x"), "OUTBOX", { size: 3, tone: "lo" }));

  const hatch = { x: -72, y: 58, w: 48, d: 16, r: 2 };
  out.push(S(k.slabOf(hatch, 0, 0.8, P, 4), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(hatch, 3), 0.8, P, 4), { tone: "faint" }));
  out.push(L(k.lineOnTop([hatch.x + 4, hatch.y + 8], [hatch.x + hatch.w - 4, hatch.y + 8], 0.8, P), { tone: "faint", free: true }));
  out.push(bolts([[hatch.x + 5, hatch.y + 4], [hatch.x + hatch.w - 5, hatch.y + 4], [hatch.x + 5, hatch.y + 12], [hatch.x + hatch.w - 5, hatch.y + 12]], 0.8, 1));

  const strip = { x: -60, y: BASE.y + BASE.d - 14, w: 220, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.7, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  return out.join("");
}

function column() {
  const out = [];
  out.push(S(k.cylinder(columnAt[0], columnAt[1], 16, 0, 10, P, 40), { tone: "mid" }));
  out.push(S(k.cylinder(columnAt[0], columnAt[1], 12, 10, 4, P, 40), { tone: "mid" }));
  out.push(boltRing(columnAt[0], columnAt[1], 12, 6, 14, 1.2));
  out.push(S(k.cylinder(columnAt[0], columnAt[1], 9, 14, 126, P, 40, 1), { tone: "mid" }));
  out.push(L(k.sideArc(columnAt[0], columnAt[1], 9, 40, P, 28), { tone: "lo" }));
  out.push(L(k.sideArc(columnAt[0], columnAt[1], 9, 108, P, 28), { tone: "faint" }));
  out.push(D([at([columnAt[0] + 9, columnAt[1], 70]), at([columnAt[0] + 9, columnAt[1], 96])], { size: 0.4, tone: "lo" }));
  out.push(S(k.cylinder(columnAt[0], columnAt[1], 11, 140, 4, P, 40), { tone: "mid" }));
  out.push(boltRing(columnAt[0], columnAt[1], 7, 6, 144, 1.1));

  out.push(S(k.slabOf({ x: -112, y: -16, w: 34, d: 32, r: 3 }, 0, 44, P, 4, 0.8), { tone: "mid" }));
  out.push(bolts([[-104, -8], [-104, 8], [-86, -8], [-86, 8]], 44, 1.2));

  out.push(S(k.slabOf({ x: -112, y: -11, w: 106, d: 22, r: 3 }, 140, 10, P, 4, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline({ x: -108, y: -8, w: 98, d: 16, r: 2 }, 150, P, 4), { tone: "lo" }));
  out.push(bolts([[-104, -6], [-104, 6], [-58, -6], [-58, 6], [-20, -6], [-20, 6]], 150, 1.2));
  out.push(S(k.slabOf({ x: -100, y: -5, w: 76, d: 10, r: 2 }, 132, 8, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, 11, 147, 7, P, 36), { tone: "mid" }));
  out.push(boltRing(0, 0, 8, 8, 154, 1.1));
  return out.join("");
}

function pressBase() {
  const out = [];
  out.push(S(k.slabOf(PED, 0, 34, P, 6, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PED, 4), 34, P, 6), { tone: "lo" }));
  out.push(L(k.rise([PED.x + PED.w / 2, PED.y + PED.d], 0, 34, P), { tone: "faint" }));
  out.push(bolts([[-58, 52], [-28, 52], [28, 52], [58, 52]], 34, 1.4));
  for (const z of [8, 24]) {
    out.push(L(k.lineOnTop([-48, PED.y + PED.d + 0.1], [48, PED.y + PED.d + 0.1], z, P), { tone: "faint" }));
  }
  for (const x of [-48, 48]) {
    out.push(L(k.rise([x, PED.y + PED.d + 0.1], 8, 24, P), { tone: "faint" }));
  }
  out.push(D([at([-40, 58.2, 12]), at([40, 58.2, 12]), at([-40, 58.2, 20]), at([40, 58.2, 20])], { size: 0.4, tone: "lo" }));

  out.push(S(k.slabOf(ANVIL, 34, 6, P, 5, 0.9), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(ANVIL, 4), 40, P, 5), { tone: "lo" }));
  out.push(bolts(k.corners(ANVIL, 8), 40, 1.5));
  out.push(L(k.lineOnTop([-30, 0], [30, 0], 40, P), { tone: "faint" }));
  return out.join("");
}

function rods(back) {
  const out = [];
  const y = back ? -48 : 48;
  for (const x of [-50, 50]) {
    out.push(S(k.cylinder(x, y, 2.8, 40, 74, P, 22), { tone: "mid", crease: "none" }));
    out.push(L(k.sideArc(x, y, 2.8, 70, P, 18), { tone: "faint" }));
    out.push(S(k.cylinder(x, y, 3.6, 112, 2, P, 22), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, 4.4, 62, 14, P, 24), { tone: "mid" }));
    out.push(L(k.sideArc(x, y, 4.4, 76, P, 24), { tone: "lo" }));
    out.push(D([at([x, y + 3.6, 69])], { size: 0.4, tone: "lo" }));
  }
  return out.join("");
}

function platen() {
  const out = [];
  out.push(S(k.slabOf(PLATEN, PLATEN_REST, 8, P, 5, 0.9), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATEN, 5), PLATEN_REST + 8, P, 5), { tone: "lo" }));
  out.push(L(k.lineOnTop([-51, -22], [51, -22], PLATEN_REST + 8, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([-51, 22], [51, 22], PLATEN_REST + 8, P), { tone: "faint" }));
  out.push(bolts(k.corners(PLATEN, 8), PLATEN_REST + 8, 1.5));

  out.push(S(k.cylinder(0, 0, 13, PLATEN_REST + 8, 8, P, 32), { tone: "mid" }));
  out.push(L(k.ring(0, 0, 13, PLATEN_REST + 16, P, 32), { tone: "lo" }));
  out.push(boltRing(0, 0, 9, 6, PLATEN_REST + 16, 1));

  for (const x of [-34, 34]) {
    out.push(S(k.cylinder(x, 0, 3.6, PLATEN_REST + 16, 30, P, 20), { tone: "mid" }));
    out.push(S(k.cylinder(x, 0, 5, PLATEN_REST + 16, 4, P, 22), { tone: "mid" }));
    out.push(S(k.cylinder(x, 0, 5, 108, 4, P, 22), { tone: "mid" }));
  }

  out.push(S(k.slabOf({ x: -48, y: -13, w: 96, d: 26, r: 3 }, 112, 8, P, 4, 0.7), { tone: "mid" }));
  out.push(L(k.planOutline({ x: -44, y: -10, w: 88, d: 20, r: 2 }, 120, P, 4), { tone: "lo" }));
  out.push(bolts([[-40, -8], [-40, 8], [40, -8], [40, 8]], 120, 1.2));

  out.push(S(k.cylinder(0, 0, 4.5, 120, 32, P, 26), { tone: "mid", crease: "none" }));
  for (const z of [124, 130, 136, 142]) {
    out.push(L(k.ring(0, 0, 4.8, z, P, 26), { tone: "lo" }));
  }
  return out.join("");
}

function wheel() {
  const out = [];
  const [x, y] = wheelAt;
  out.push(S(k.cylinder(x, y, 21, WHEEL_Z, 2, P, 48), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 20, WHEEL_Z + 2, 6, P, 48, 0.6), { tone: "mid" }));
  out.push(L(k.knurl(x, y, 20, WHEEL_Z + 5, WHEEL_Z + 8, 64, P, 0.35), { tone: "lo" }));
  out.push(L(k.ring(x, y, 16.5, WHEEL_TOP, P, 48), { tone: "mid" }));
  out.push(L(k.ring(x, y, 10, WHEEL_TOP, P, 40), { tone: "faint" }));
  out.push(L(k.ring(x, y, 5.5, WHEEL_TOP + 0.3, P, 36), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 5.5, WHEEL_TOP, 8, P, 28), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 3, WHEEL_TOP + 8, 2, P, 20), { tone: "mid" }));
  out.push(D([at([x, y, WHEEL_TOP + 10])], { size: 0.55 }));
  return out.join("");
}

const spokesAt = (angle) => {
  const parts = [];
  for (let index = 0; index < 4; index++) {
    const a = angle + (index * Math.PI) / 2;
    parts.push(k.lineOnTop(
      [wheelAt[0] + Math.cos(a) * 5.5, wheelAt[1] + Math.sin(a) * 5.5],
      [wheelAt[0] + Math.cos(a) * 16.5, wheelAt[1] + Math.sin(a) * 16.5],
      WHEEL_TOP + 0.3,
      P,
    ));
  }
  return parts.join("");
};

function handle() {
  const out = [];
  out.push(S(k.cylinder(18, 0, 3.2, WHEEL_TOP, 8, P, 22), { tone: "mid" }));
  out.push(L(k.knurl(18, 0, 3.2, WHEEL_TOP + 2, WHEEL_TOP + 8, 22, P), { tone: "lo" }));
  out.push(S(k.cylinder(18, 0, 3.8, WHEEL_TOP + 8, 2, P, 22), { tone: "hi" }));
  out.push(D([at([18, 0, WHEEL_TOP + 10])], { size: 0.5, tone: "hi" }));
  return out.join("");
}

function stack(plan, baseZ, count, tone) {
  const out = [];
  out.push(S(k.slabOf(plan, baseZ, 4, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(plan, 2), baseZ + 4, P, 4), { tone: "lo" }));
  for (let index = 0; index < count; index++) {
    const inset = index % 2 === 0 ? 3 : 2.4;
    const sheet = k.insetPlan({ ...plan, y: plan.y + 2 + index * 0.4 }, inset);
    out.push(S(k.slabOf(sheet, baseZ + 4 + index * 2.4, 2.2, P, 3, 0.3), { tone, crease: "faint" }));
  }
  const top = baseZ + 4 + count * 2.4;
  out.push(L(k.planOutline(k.insetPlan(plan, 6), top, P, 4), { tone: "faint" }));
  out.push(D([at([plan.x + 6, plan.y + 6, top]), at([plan.x + plan.w - 6, plan.y + plan.d - 6, top])], { size: 0.4 }));
  return out.join("");
}

function guides(lane) {
  const out = [];
  for (const y of [lane.from + 2, lane.to - 2]) {
    out.push(S(k.cylinder(-90, y, 2.2, 40, 9, P, 18), { tone: "mid" }));
    out.push(S(k.cylinder(-90, y, 3, 49, 1.6, P, 18), { tone: "mid" }));
  }
  out.push(L(k.lineOnTop([-90, lane.from + 2], [-90, lane.to - 2], 49, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([-90, lane.from + 2], [-90, lane.to - 2], 40.8, P), { tone: "faint" }));
  out.push(D([at([-90, lane.from + 2, 49]), at([-90, lane.to - 2, 49])], { size: 0.4 }));
  return out.join("");
}

function feed(lane) {
  const out = [];
  for (const y of [lane.from + 2, lane.to - 2]) {
    out.push(L(k.segment([-98, y, 20], [-89, y, PAPER_Z], P), { tone: "lo" }));
    out.push(D([at([-98, y, 20]), at([-89, y, PAPER_Z])], { size: 0.4 }));
  }
  return out.join("");
}

function feedTable(lane) {
  const out = [];
  for (const [from, to] of [[-102, -64], [64, 84]]) {
    const plan = { x: from, y: lane.from - 2, w: to - from, d: lane.to - lane.from + 4, r: 1.5 };
    out.push(S(k.slabOf(plan, 37, 3.2, P, 4, 0.4), { tone: "mid" }));
    out.push(L(k.planOutline(k.insetPlan(plan, 3), 40.2, P, 4), { tone: "lo" }));
    out.push(bolts([[from + 5, lane.from + 2], [from + 5, lane.to - 2], [to - 5, lane.from + 2], [to - 5, lane.to - 2]], 40.2, 1));
    const wall = to === 84 ? 70 : -70;
    const foot = to === 84 ? 78 : -78;
    out.push(L(k.segment([wall, lane.y, 24], [foot, lane.y, 37], P), { tone: "lo" }));
    out.push(D([at([wall, lane.y, 24]), at([foot, lane.y, 37])], { size: 0.45, tone: "lo" }));
  }
  return out.join("");
}

function strip(lane, tone, part) {
  const out = [];
  out.push(S(k.slabOf({ x: -88, y: lane.from, w: 176, d: lane.to - lane.from, r: 0.5 }, PAPER_Z, 0.8, P, 2, 0.2), { tone }));
  out.push(L(k.lineOnTop([-88, lane.from + 1.6], [88, lane.from + 1.6], PAPER_Z + 0.8, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([-88, lane.to - 1.6], [88, lane.to - 1.6], PAPER_Z + 0.8, P), { tone: "faint" }));
  const ticks = [];
  for (let x = -84; x <= 84; x += 21) {
    ticks.push(k.lineOnTop([x, lane.from + 1.6], [x, lane.to - 1.6], PAPER_Z + 0.8, P));
  }
  out.push(L(ticks.join(""), { tone: "faint" }));
  out.push(L(k.lineOnTop([-84, lane.y], [84, lane.y], PAPER_Z + 0.8, P), { tone: "faint", dashed: true }));
  return `<g data-part="${part}">${out.join("")}</g>`;
}

function outbox() {
  const out = [];
  const plan = OUTBOX;
  out.push(S(k.slabOf(plan, 2, 6, P, 4, 0.5), { tone: "mid" }));
  out.push(S(k.slabOf({ x: plan.x, y: plan.y, w: plan.w, d: 2.4, r: 0.6 }, 8, 5, P, 3, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: plan.x, y: plan.y + plan.d - 2.4, w: plan.w, d: 2.4, r: 0.6 }, 8, 5, P, 3, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: plan.x + plan.w - 2.4, y: plan.y, w: 2.4, d: plan.d, r: 0.6 }, 8, 5, P, 3, 0.3), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(plan, 5), 8, P, 4), { tone: "lo" }));
  out.push(bolts([[plan.x + 8, plan.y + 8], [plan.x + plan.w - 8, plan.y + 8], [plan.x + 8, plan.y + plan.d - 8]], 8, 1.2));

  for (const y of [-40, -12]) {
    out.push(S(k.cylinder(84, y, 1.7, 8, 33, P, 16), { tone: "mid" }));
    out.push(S(k.cylinder(84, y, 3.2, 40, 2, P, 16), { tone: "mid" }));
    out.push(D([at([84, y, 42])], { size: 0.4 }));
  }
  out.push(L(k.lineOnTop([84, -39], [84, -13], 41.6, P), { tone: "lo" }));

  for (let index = 0; index < 5; index++) {
    const z = 13.2 + index * 2.4;
    const slip = { ...SLIP, x: SLIP.x + (index % 2 ? 0.8 : 0), y: SLIP.y + (index % 2 ? 0.6 : 0) };
    const body = S(k.slabOf(slip, z, 1.6, P, 3, 0.3), { tone: "hi" });
    const rule = L(k.lineOnTop([slip.x + 4, slip.y + 5], [slip.x + slip.w - 4, slip.y + 5], z + 1.6, P), { tone: "lo", free: true });
    out.push(`<g data-slip="${index}" style="display:none">${body}${rule}</g>`);
  }
  return out.join("");
}

function ledgerTray() {
  const out = [];
  out.push(stack(LEDGER_OUT, 2, 4, "hi"));
  out.push(S(k.slabOf({ x: 98, y: 9, w: 50, d: 4, r: 1 }, 16, 0.7, P, 3), { tone: "lo" }));
  out.push(S(k.slabOf({ x: 98, y: 39, w: 50, d: 4, r: 1 }, 16, 0.7, P, 3), { tone: "lo" }));
  return out.join("");
}

function relayStatic() {
  const out = [];
  for (const y of [RAIL.y, -6]) {
    out.push(S(k.cylinder(RAIL.x + RAIL.w / 2, y, 3.4, 0, 74, P, 22), { tone: "mid" }));
    out.push(S(k.cylinder(RAIL.x + RAIL.w / 2, y, 6, 0, 3, P, 24), { tone: "mid" }));
    out.push(boltRing(RAIL.x + RAIL.w / 2, y, 4.2, 4, 3, 0.9));
  }
  out.push(S(k.slabOf(RAIL, 74, 5, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: RAIL.x - 1, y: RAIL.y, w: RAIL.w + 2, d: RAIL.d, r: 1 }, 71, 3, P, 3, 0.3), { tone: "mid" }));
  out.push(L(k.lineOnTop([RAIL.x, RAIL.y + 3], [RAIL.x + RAIL.w, RAIL.y + 3], 79, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([RAIL.x, RAIL.y + 6], [RAIL.x + RAIL.w, RAIL.y + 6], 79, P), { tone: "faint" }));
  out.push(D([at([RAIL.x, RAIL.y + 3, 79]), at([RAIL.x + RAIL.w, RAIL.y + 3, 79]), at([RAIL.x, RAIL.y + 6, 79]), at([RAIL.x + RAIL.w, RAIL.y + 6, 79])], { size: 0.45, tone: "lo" }));
  out.push(bolts([[RAIL.x + 6, -84], [RAIL.x + 6, -56], [RAIL.x + 6, -30]], 79, 1));
  out.push(S(k.slabOf({ x: RAIL.x, y: RAIL.y - 2, w: RAIL.w, d: 2, r: 0.5 }, 74, 8, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: RAIL.x, y: -8, w: RAIL.w, d: 2, r: 0.5 }, 74, 8, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: RAIL.x + RAIL.w, y: RAIL.y + 6, w: 2, d: RAIL.d - 12, r: 0.5 }, 76, 2, P, 2, 0.2), { tone: "mid" }));
  return out.join("");
}

function queue() {
  const out = [];
  const plan = QUEUE;
  for (const x of [plan.x + 3, plan.x + plan.w - 3]) {
    out.push(S(k.cylinder(x, -76, 2.6, 0, 26, P, 18), { tone: "mid" }));
    out.push(S(k.cylinder(x, -76, 5, 0, 3, P, 20), { tone: "mid" }));
  }
  out.push(S(k.slabOf(plan, 26, 4, P, 4, 0.5), { tone: "mid" }));
  out.push(S(k.slabOf({ x: plan.x + 4, y: plan.y + 4, w: plan.w - 8, d: plan.d - 8, r: 1 }, 30, 0.8, P, 3, 0.2), { tone: "lo" }));
  out.push(S(k.slabOf({ x: plan.x, y: plan.y, w: 4, d: plan.d, r: 1 }, 30, 5, P, 3, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: plan.x + plan.w - 4, y: plan.y, w: 4, d: plan.d, r: 1 }, 30, 5, P, 3, 0.3), { tone: "mid" }));
  const rollers = [];
  for (let y = plan.y + 6; y <= plan.y + plan.d - 4; y += 4.4) {
    rollers.push(k.lineOnTop([plan.x + 5, y], [plan.x + plan.w - 5, y], 30.9, P));
  }
  out.push(L(rollers.join(""), { tone: "faint" }));
  out.push(D([at([plan.x + 2, plan.y + 2, 35]), at([plan.x + plan.w - 2, plan.y + 2, 35])], { size: 0.45 }));
  out.push(S(k.slabOf({ x: plan.x + 4, y: plan.y - 1, w: plan.w - 8, d: 3, r: 1 }, 30, 5, P, 3, 0.3), { tone: "mid" }));
  for (let index = 0; index < 3; index++) {
    const z = 30.6 + index * 1.8;
    const body = S(k.slabOf({ x: 106, y: -80 + index * 0.5, w: 24, d: 14, r: 1 }, z, 1.4, P, 3, 0.3), { tone: "hi" });
    out.push(`<g data-published="${index}" style="display:none">${body}</g>`);
  }
  return out.join("");
}

function lamp() {
  const out = [];
  out.push(S(k.cylinder(158, -27, 6, 0, 3, P, 24), { tone: "mid" }));
  out.push(boltRing(158, -27, 4, 4, 3, 0.8));
  out.push(S(k.cylinder(158, -27, 1.8, 3, 30, P, 16), { tone: "mid" }));
  out.push(S(k.cylinder(158, -27, 5.6, 33, 4, P, 24), { tone: "mid" }));
  out.push(S(k.cylinder(158, -27, 4.6, 37, 4, P, 24), { tone: "lo" }));
  out.push(`<g data-part="lamp-on" style="display:none">${S(k.cylinder(158, -27, 4.6, 37, 4, P, 24), { tone: "hi", lit: true })}</g>`);
  out.push(S(k.cylinder(158, -27, 6, 41, 1.4, P, 24), { tone: "mid" }));
  out.push(k.wireSvg([158, -30, 4], [151, -34, 10], { via: [[155, -38, 18]], tone: "lo", ends: "both", size: 1 }));
  out.push(D([at([151, -34, 10])], { size: 0.5, tone: "lo" }));
  return out.join("");
}

function lever() {
  const out = [];
  const pivot = [-11, 69];
  out.push(S(k.slabOf({ x: -20, y: 62, w: 18, d: 14, r: 2 }, 0, 4, P, 3, 0.4), { tone: "mid" }));
  out.push(bolts([[-17, 66], [-5, 66]], 4, 1));
  out.push(S(k.cylinder(pivot[0], pivot[1], 2.4, 4, 4, P, 18), { tone: "mid" }));

  const blade = (topX) => {
    const quad = [at([pivot[0], pivot[1] - 1.6, 7]), at([pivot[0], pivot[1] + 1.6, 7]), at([topX, pivot[1] + 1.6, 34]), at([topX, pivot[1] - 1.6, 34])];
    const d = `M${quad.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L")}Z`;
    return `<path class="iso-fill" data-tone="mid" d="${d}"/><path class="iso-line iso-edge" data-tone="mid" d="${d}"/>`;
  };
  const ok = blade(pivot[0] - 8)
    + S(k.cylinder(pivot[0] - 8, pivot[1], 3.4, 34, 5, P, 20), { tone: "mid" })
    + D([at([pivot[0] - 8, pivot[1], 39])], { size: 0.5, tone: "hi" });
  const fail = blade(pivot[0] + 8)
    + S(k.cylinder(pivot[0] + 8, pivot[1], 3.4, 34, 5, P, 20), { tone: "mid" })
    + D([at([pivot[0] + 8, pivot[1], 39])], { size: 0.5, tone: "hi" });
  out.push(`<g data-part="lever-ok">${ok}</g>`);
  out.push(`<g data-part="lever-fail" style="display:none">${fail}</g>`);
  return `<g data-part="lever"><title>Palanca de fallo</title>${out.join("")}</g>`;
}

function shuttle() {
  const out = [];
  out.push(S(k.slabOf({ x: 104, y: -8, w: 28, d: 16, r: 2 }, 79, 7, P, 3, 0.5), { tone: "mid" }));
  out.push(S(k.slabOf({ x: 108, y: -5, w: 20, d: 10, r: 1.5 }, 86, 2, P, 3, 0.3), { tone: "mid" }));
  out.push(L(k.planOutline({ x: 108, y: -5, w: 20, d: 10, r: 1.5 }, 88, P, 3), { tone: "lo" }));
  out.push(bolts([[108, -5], [128, -5], [108, 5], [128, 5]], 86, 1.1));
  out.push(D([at([110, -7, 86]), at([126, -7, 86]), at([110, 7, 86]), at([126, 7, 86])], { size: 0.45 }));
  out.push(S(k.slabOf({ x: 112, y: -5, w: 12, d: 10, r: 1 }, 76, 3, P, 2, 0.2), { tone: "mid" }));
  return out.join("");
}

function gripper() {
  const out = [];
  out.push(S(k.cylinder(118, 0, 1.8, 46, 30, P, 16), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(118, 0, 5.4, 43, 3, P, 24), { tone: "mid" }));
  out.push(L(k.ring(118, 0, 5.4, 46, P, 24), { tone: "lo" }));
  out.push(D([at([118, 0, 43])], { size: 0.5, tone: "lo" }));
  return out.join("");
}

function mover() {
  const out = [];
  const slip = S(k.slabOf(SLIP, 0, 1.5, P, 3, 0.3), { tone: "hi", lit: true });
  const rule = L(k.lineOnTop([SLIP.x + 4, SLIP.y + 5], [SLIP.x + SLIP.w - 4, SLIP.y + 5], 1.5, P), { tone: "lit", free: true });
  return `<g data-part="mover" style="display:none">${slip}${rule}</g>`;
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "Prensa de doble copia. Una vía imprime el libro de entregas y otra, en el mismo golpe, deposita una copia de carbono en la bandeja sellada del outbox. Un pórtico de relevo toma la copia pendiente, la eleva y la deja en la cinta de publicación. Una palanca permite levantar la copia de carbono para mostrar el fallo de escritura doble.",
  body: [
    plate(),
    queue(),
    relayStatic(),
    stack({ x: -150, y: -44, w: 50, d: 36, r: 2 }, 2, 6, "mid"),
    feed(CARBON),
    guides(CARBON),
    outbox(),
    pressBase(),
    feedTable(CARBON),
    rods(true),
    column(),
    strip(CARBON, "mid", "carbon-strip"),
    `<g data-part="platen">${platen()}</g>`,
    rods(false),
    feedTable(LEDGER),
    strip(LEDGER, "hi", "ledger-strip"),
    stack({ x: -150, y: 8, w: 50, d: 36, r: 2 }, 2, 6, "hi"),
    feed(LEDGER),
    wheel(),
    `<path data-part="spokes" class="iso-line" data-tone="mid" style="stroke-width:1.2" d="${spokesAt(0)}"/>`,
    `<g data-part="handle" transform="${k.translateAlong(P, [0, 0, 0])}">${handle()}</g>`,
    ledgerTray(),
    lamp(),
    lever(),
    `<g data-part="shuttle" transform="${k.translateAlong(P, [0, 0, 0])}">${shuttle()}<g data-part="gripper" transform="${k.translateAlong(P, [0, 0, 0])}">${gripper()}</g></g>`,
    mover(),
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const SLIP = ${JSON.stringify(SLIP)};
const LEDGER_Y = ${LEDGER.y};
const PAPER_Z = ${PAPER_Z};
const PLATEN_REST = ${PLATEN_REST};
const STROKE = ${STROKE};
const WHEEL_TOP = ${WHEEL_TOP};
const SHUTTLE_Y = ${SHUTTLE_Y};
const QUEUE_Y = ${QUEUE_Y};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const platenEl = svg.querySelector('[data-part="platen"]');
const spokesEl = svg.querySelector('[data-part="spokes"]');
const handleEl = svg.querySelector('[data-part="handle"]');
const shuttleEl = svg.querySelector('[data-part="shuttle"]');
const gripperEl = svg.querySelector('[data-part="gripper"]');
const moverEl = svg.querySelector('[data-part="mover"]');
const carbonStrip = svg.querySelector('[data-part="carbon-strip"]');
const lampOn = svg.querySelector('[data-part="lamp-on"]');
const leverOk = svg.querySelector('[data-part="lever-ok"]');
const leverFail = svg.querySelector('[data-part="lever-fail"]');
const slipEls = [0, 1, 2, 3, 4].map((index) => svg.querySelector('[data-slip="' + index + '"]'));
const publishedEls = [0, 1, 2].map((index) => svg.querySelector('[data-published="' + index + '"]'));
const readout = document.querySelector("[data-readout]");
const failButton = document.querySelector('[data-action="fail"]');
const themeButton = document.querySelector('[data-action="theme"]');
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const ease = (value) => value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;

let pending = 0;
let published = 0;
let failure = false;
let stampAt = -1;
let stamped = false;
let relayAt = -1;
let holding = false;
let falling = false;
let dz = 0;
let wheel = 0;
let wheelFrom = 0;
let wheelTo = 0;
let shuttleY = SHUTTLE_Y;
let drop = 0;
let moverZ = 0;
let raf = 0;
let visible = false;
let tour = 0;
let last = 0;

function spokesAt(angle) {
  const parts = [];
  for (let index = 0; index < 4; index++) {
    const a = angle + (index * Math.PI) / 2;
    parts.push(lineOnTop(
      [Math.cos(a) * 5.5, Math.sin(a) * 5.5],
      [Math.cos(a) * 16.5, Math.sin(a) * 16.5],
      WHEEL_TOP + 0.3,
      P,
    ));
  }
  return parts.join("");
}

function drawSlips() {
  slipEls.forEach((el, index) => { el.style.display = index < Math.min(pending, 5) ? "" : "none"; });
  publishedEls.forEach((el, index) => { el.style.display = index < Math.min(published, 3) ? "" : "none"; });
}

function say(extra = "") {
  const pend = pending === 1 ? "1 pendiente" : pending + " pendientes";
  const pub = published === 1 ? "1 publicado" : published + " publicados";
  const text = pend + " · " + pub + (failure ? " · sin copia" : "") + extra;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}

function render() {
  platenEl.setAttribute("transform", translateAlong(P, [0, 0, -dz]));
  spokesEl.setAttribute("d", spokesAt(wheel));
  const hx = Math.cos(wheel) * 18;
  const hy = Math.sin(wheel) * 18;
  handleEl.setAttribute("transform", translateAlong(P, [hx - 18, hy, 0]));
  shuttleEl.setAttribute("transform", translateAlong(P, [0, shuttleY - SHUTTLE_Y, 0]));
  gripperEl.setAttribute("transform", translateAlong(P, [0, 0, -drop * 28]));
  moverEl.setAttribute("transform", translateAlong(P, [0, shuttleY - SHUTTLE_Y, moverZ]));
  moverEl.style.display = holding || falling ? "" : "none";
  lampOn.style.display = (stampAt >= 0 || relayAt >= 0) ? "" : "none";
  drawSlips();
}

function applyStamp() {
  stamped = true;
  if (!failure) pending += 1;
  say();
}

function startRelay(now) {
  if (relayAt >= 0 || pending <= 0) return;
  relayAt = now;
  holding = false;
  falling = false;
  wake();
  schedule(4300);
}

function schedule(delay) {
  clearTimeout(tour);
  if (still.matches) return;
  tour = setTimeout(() => { stamp(); }, delay);
}

function stamp() {
  if (stampAt >= 0) return;
  clearTimeout(tour);
  stampAt = performance.now();
  stamped = false;
  wheelFrom = wheel;
  wheelTo = wheel + Math.PI / 2;
  wake();
  if (still.matches) {
    stampAt = -1;
    dz = STROKE;
    wheel = wheelTo;
    applyStamp();
    render();
    setTimeout(() => { dz = 0; render(); }, 220);
    setTimeout(() => {
      if (pending > 0) {
        pending -= 1;
        published += 1;
        say();
        render();
      }
      schedule(4200);
    }, 700);
    return;
  }
  setTimeout(() => {
    if (pending > 0 && relayAt < 0) startRelay(performance.now());
  }, 1100);
}

function update(now) {
  if (stampAt >= 0) {
    const t = (now - stampAt) / 1000;
    const down = clamp(t / 0.32, 0, 1);
    const up = clamp((t - 0.36) / 0.34, 0, 1);
    dz = down < 1 ? ease(down) * STROKE : STROKE * (1 - ease(up));
    wheel = wheelFrom + (wheelTo - wheelFrom) * clamp(t / 0.5, 0, 1);
    if (!stamped && t >= 0.3) applyStamp();
    if (t >= 0.75) { stampAt = -1; dz = 0; wheel = wheelTo; }
  }
  if (relayAt >= 0) {
    const t = (now - relayAt) / 1000;
    if (t < 0.55) {
      drop = ease(t / 0.55);
    } else if (t < 0.7 && !holding) {
      holding = true;
      pending = Math.max(0, pending - 1);
      say();
      drop = 1;
      moverZ = 13.2;
    } else if (t < 1.15) {
      drop = 1 - ease((t - 0.7) / 0.45);
      moverZ = 13.2 + ease((t - 0.7) / 0.45) * 28.2;
    } else if (t < 2.3) {
      drop = 0;
      moverZ = 41.4;
      shuttleY = SHUTTLE_Y + (QUEUE_Y - SHUTTLE_Y) * ease((t - 1.15) / 1.15);
    } else if (t < 2.7) {
      shuttleY = QUEUE_Y;
      drop = 0.2 * ease((t - 2.3) / 0.4);
      moverZ = 41.4 - ease((t - 2.3) / 0.4) * 5.6;
    } else if (!falling) {
      holding = false;
      falling = true;
      moverZ = 35.8;
      published += 1;
      say();
      drop = 0;
      shuttleY = QUEUE_Y;
    } else if (t < 3.25) {
      moverZ = 35.8 - ease((t - 2.7) / 0.55) * 5.2;
    } else {
      falling = false;
      moverZ = 0;
      relayAt = -1;
      shuttleY = SHUTTLE_Y;
      drop = 0;
      if (pending > 0) setTimeout(() => startRelay(performance.now()), 260);
      schedule(4200);
    }
  }
  render();
}

function frame(now) {
  raf = 0;
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  update(now);
  if (stampAt >= 0 || relayAt >= 0) wake();
}

function wake() {
  if (!raf && visible) { last = 0; raf = requestAnimationFrame(frame); }
}

function toggleFailure() {
  failure = !failure;
  failButton.setAttribute("aria-pressed", String(failure));
  carbonStrip.style.display = failure ? "none" : "";
  leverOk.style.display = failure ? "none" : "";
  leverFail.style.display = failure ? "" : "none";
  say();
}

failButton.addEventListener("click", toggleFailure);
svg.querySelector('[data-part="lever"]').addEventListener("click", (event) => {
  event.stopPropagation();
  toggleFailure();
});
themeButton.addEventListener("click", () => {
  const light = document.body.dataset.theme !== "light";
  document.body.dataset.theme = light ? "light" : "dark";
  themeButton.setAttribute("aria-pressed", String(light));
  themeButton.textContent = light ? "Tema oscuro" : "Tema claro";
});
document.querySelector('[data-action="stamp"]').addEventListener("click", stamp);

stage.addEventListener("click", stamp);
stage.addEventListener("keydown", (event) => {
  if (event.key === " " || event.key === "Enter") { event.preventDefault(); stamp(); }
  if (event.key === "f" || event.key === "F") { event.preventDefault(); toggleFailure(); }
});
new IntersectionObserver((entries) => {
  visible = entries[entries.length - 1].isIntersecting;
  if (visible) { wake(); schedule(pending === 0 ? 1400 : 3000); }
}, { rootMargin: "120px 0px" }).observe(stage);
still.addEventListener("change", () => { if (still.matches) clearTimeout(tour); else schedule(1400); });
readout.setAttribute("aria-live", "polite");
stage.setAttribute("aria-valuetext", "0 pendientes · 0 publicados");
render();
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "Prensa de doble copia",
  hint: "Espacio o clic: sellar",
  readout: "0 pendientes · 0 publicados",
  keys: [
    { mark: "lit", label: "Copia del evento: lo que sale del outbox" },
    { mark: "raised", label: "Libro de entregas y copia de carbono, sellados a la vez" },
  ],
  caption:
    "Cada golpe imprime el libro de entregas y, en la misma transacción, deja una copia pendiente en el cajón del outbox; el pórtico de relevo la eleva y la publica en la cinta. Con la palanca de fallo levantada el libro avanza pero la copia no existe: el hecho queda sin mensaje. El contador muestra pendientes y publicados.",
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Prensa de doble copia del outbox. Pulsa Espacio o Enter para sellar; F activa el modo fallo.">${svg}</div>
<div class="iso-controls" role="group" aria-label="Controles de la figura">
  <button type="button" data-action="stamp">Sellar</button>
  <button type="button" data-action="fail" aria-pressed="false">Modo fallo</button>
  <button type="button" data-action="theme" aria-pressed="${theme === "light"}">${theme === "light" ? "Tema oscuro" : "Tema claro"}</button>
</div>
<style>
.iso-page{margin:0 auto}
.iso-figure{margin:6px 0}
.iso-plate{padding:40px 24px}
.iso-stage:focus-visible{outline:2px solid var(--anatomy-hi);outline-offset:4px}
.iso-stage [data-part="lever"]{cursor:pointer}
.iso-controls{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px auto 0}
.iso-controls button{border:1px solid var(--anatomy-mid);border-radius:2px;background:transparent;color:var(--anatomy-text);font:inherit;font-size:12px;letter-spacing:.02em;padding:7px 11px;cursor:pointer}
.iso-controls button:hover{border-color:var(--anatomy-hi);color:var(--anatomy-hi)}
.iso-controls button[aria-pressed="true"]{background:var(--anatomy-hi);border-color:var(--anatomy-hi);color:var(--anatomy-page)}
.iso-controls button:focus-visible{outline:2px solid var(--anatomy-hi);outline-offset:2px}
</style>`,
});

let html = k.pageHtml({ title: "Prensa de doble copia: outbox transaccional", theme, body, script: kitScript() + live });
html = html.replace('<html lang="en">', '<html lang="es">');

const outFile = join(HERE, theme === "light" ? "outbox-light.html" : "outbox.html");
writeFileSync(outFile, html);
console.log("wrote", outFile);
