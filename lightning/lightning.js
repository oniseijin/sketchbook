// FractalLightning — web port (p5.js) of the Processing sketch.
// Same math: fBm midpoint-displacement bolts + self-similar recursive
// branching + additive glow stack + Gaussian spray speckle.
// Tap the sky for a new one. Palette dots below the canvas.
// Original Java-mode sketch: Ryan Mills, 2026 (the Processing repo).

// ---------- state ----------
var SEED = 7;
var ROUGH = 0.60;
var BRANCH = 0.7;
var GLOW = 1.1;
var PAL = 0;
var W, H;
var bolts = [];

// ---------- palettes: {halo, body, core} ----------
var PALS = [
  { halo: [224, 29, 156], body: [255, 79, 174], core: [255, 227, 244] }, // hot pink (the reference)
  { halo: [122, 43, 235], body: [180, 117, 255], core: [240, 226, 255] },// violet
  { halo: [42, 102, 232], body: [95, 168, 255],  core: [226, 241, 255] },// electric blue
  { halo: [24, 194, 94],  body: [121, 255, 176], core: [233, 255, 241] },// neon green
  { halo: [240, 138, 24], body: [255, 192, 85],  core: [255, 243, 220] } // amber
];
var PALNAMES = ['hot pink', 'violet', 'electric blue', 'neon green', 'amber'];
var BG;

// geometry: fractional anchors, resolved against W,H
var TRUNK = [
  [0.55, -0.04], [0.46, 0.13], [0.57, 0.30], [0.45, 0.47],
  [0.53, 0.64], [0.43, 0.84], [0.37, 1.04]
];
// forced arms: [trunk arc-param, endX, endY, waviness, energy]
var ARMS = [
  [0.10, 0.02, 0.21, 0.28, 0.82],
  [0.15, 0.99, 0.28, 0.28, 0.80],
  [0.30, 0.04, 0.44, 0.26, 0.62],
  [0.36, 0.88, 0.55, 0.26, 0.55],
  [0.52, 0.08, 0.70, 0.28, 0.64],
  [0.60, 0.84, 0.75, 0.26, 0.52],
  [0.82, 0.14, 1.00, 0.26, 0.46],
  [0.87, 0.74, 1.02, 0.26, 0.42]
];

// ---------------------------------------------------------------- p5
function setup() {
  fitCanvas();
  BG = color(5, 5, 7);
  buildScene();
}

function fitCanvas() {
  W = Math.min(560, windowWidth - 24);
  H = Math.round(W * 4 / 3);
  var c = createCanvas(W, H);
  c.canvas.style.touchAction = 'none';
}

function windowResized() {
  var oldW = W;
  fitCanvas();
  if (W !== oldW) buildScene();   // geometry is parametric; rebuild same seed
}

function draw() {
  background(BG);
  paintScene();
}

// tap anywhere on the sky = new lightning
function mousePressed() { if (insideCanvas()) reroll(); }
function touchStarted() { if (insideCanvas()) reroll(); }

function insideCanvas() {
  return mouseX >= 0 && mouseX < W && mouseY >= 0 && mouseY < H;
}

function reroll() {
  SEED = Math.floor(random(1, 99999999));
  buildScene();
  var el = document.getElementById('seedlabel');
  if (el) el.textContent = 'seed ' + SEED;
}

function setPalette(i) {
  PAL = i;
  var el = document.getElementById('paillabel');
  if (el) el.textContent = PALNAMES[i];
}

// ---------------------------------------------------------------- scene
function buildScene() {
  randomSeed(SEED);
  bolts = [];

  var trunk = boltFromAnchors(TRUNK, 0.30, 1.0);
  bolts.push(trunk);

  for (var i = 0; i < ARMS.length; i++) {
    var a = ARMS[i];
    var start = pointAt(trunk, a[0]);
    var end = vec(a[1] * W, a[2] * H);
    var arm = boltBetween(start, end, a[3], a[4]);
    bolts.push(arm);
    growChildren(arm, 2);
  }
  var extra = Math.floor(2 * BRANCH);
  for (var j = 0; j < extra; j++) {
    var t = random(0.2, 0.9);
    var at = pointAt(trunk, t);
    var dir = tangentAt(trunk, t);
    var ang = (random(1) < 0.5 ? -1 : 1) * radians(random(25, 55));
    var c = rot(dir, ang);
    var len = W * random(0.10, 0.22);
    var s = boltBetween(at, add(at, mult(c, len)), 0.27, random(0.45, 0.6));
    bolts.push(s);
    growChildren(s, 1);
  }
}

function Bolt(e) { this.pts = []; this.energy = e; }

function vec(x, y) { return { x: x, y: y }; }
function add(a, b) { return vec(a.x + b.x, a.y + b.y); }
function mult(a, k) { return vec(a.x * k, a.y * k); }
function sub(a, b) { return vec(a.x - b.x, a.y - b.y); }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function lerpV(a, b, t) { return vec(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t); }
function rot(v, a) {
  return vec(v.x * Math.cos(a) - v.y * Math.sin(a),
             v.x * Math.sin(a) + v.y * Math.cos(a));
}

function boltFromAnchors(anch, wave, energy) {
  var b = new Bolt(energy);
  for (var i = 0; i < anch.length - 1; i++) {
    var a = vec(anch[i][0] * W, anch[i][1] * H);
    var c = vec(anch[i + 1][0] * W, anch[i + 1][1] * H);
    displace(b.pts, a, c, dist(a, c) * wave, 4);
  }
  return b;
}

function boltBetween(a, c, wave, energy) {
  var b = new Bolt(energy);
  displace(b.pts, a, c, dist(a, c) * wave, 4);
  return b;
}

// recursive midpoint displacement — the fractal core
function displace(out, a, c, disp, depth) {
  var d = dist(a, c);
  if (depth <= 0 || d < 16) {
    if (out.length === 0) out.push(vec(a.x, a.y));
    out.push(vec(c.x, c.y));
    return;
  }
  var m = lerpV(a, c, 0.5);
  var n = normalize(vec(-(c.y - a.y), c.x - a.x));
  var u = random(-1, 1);            // power bias: calm runs, rare sharp jags
  m = add(m, mult(n, (u < 0 ? -1 : 1) * Math.pow(Math.abs(u), 1.8) * disp));
  displace(out, a, m, disp * ROUGH, depth - 1);
  displace(out, m, c, disp * ROUGH, depth - 1);
}

function normalize(v) {
  var l = Math.hypot(v.x, v.y);
  return l < 1e-6 ? vec(0, 1) : vec(v.x / l, v.y / l);
}

// self-similar step: children are small copies of the parent generator
function growChildren(parent, gensLeft) {
  if (gensLeft <= 0) return;
  var plen = polyLen(parent.pts);
  var n = 1 + Math.floor(random(1.8 * BRANCH));
  for (var i = 0; i < n; i++) {
    var e = parent.energy * random(0.52, 0.72);
    if (e < 0.34) continue;
    var t = random(0.3, 0.88);
    var at = pointAt(parent, t);
    var dir = tangentAt(parent, t);
    var ang = (random(1) < 0.5 ? -1 : 1) * radians(random(20, 58));
    var c = rot(dir, ang);
    if (c.y < -0.05) c = rot(dir, -ang);      // bias downward
    var len = Math.min(plen * random(0.36, 0.60), W * 0.38);
    var child = boltBetween(at, add(at, mult(c, len)), 0.27, e);
    bolts.push(child);
    growChildren(child, gensLeft - 1);
  }
}

// ---------------------------------------------------------------- paint
function baseWidth() { return 0.020 * W; }

function paintScene() {
  var P = PALS[PAL];
  var HALO = P.halo, BODY = P.body, CORE = P.core;
  noFill(); strokeCap(ROUND); strokeJoin(ROUND);
  blendMode(ADD);

  var b, i, w;
  for (i = 0; i < bolts.length; i++) {
    b = bolts[i]; w = baseWidth() * b.energy;
    stroke(HALO[0], HALO[1], HALO[2], 22); strokeWeight(w * 6.5 * GLOW); poly(b.pts);
    stroke(HALO[0], HALO[1], HALO[2], 45); strokeWeight(w * 4.0 * GLOW); poly(b.pts);
    stroke(HALO[0], HALO[1], HALO[2], 80); strokeWeight(w * 2.4 * GLOW); poly(b.pts);
  }
  for (i = 0; i < bolts.length; i++) {
    b = bolts[i]; w = baseWidth() * b.energy;
    stroke(BODY[0], BODY[1], BODY[2], 235); strokeWeight(w * 1.15); poly(b.pts);
    stroke(CORE[0], CORE[1], CORE[2], 255); strokeWeight(w * 0.5); poly(b.pts);
  }
  for (i = 0; i < bolts.length; i++) speckle(bolts[i]);
  blendMode(BLEND);
}

function speckle(b) {
  var w = baseWidth() * b.energy;
  var HALO = PALS[PAL].halo, BODY = PALS[PAL].body;
  noStroke();
  for (var i = 0; i < b.pts.length - 1; i++) {
    var a = b.pts[i], c = b.pts[i + 1];
    var l = dist(a, c); if (l < 0.001) continue;
    var n = normalize(vec(-(c.y - a.y), c.x - a.x));
    var near = Math.floor(l * w * 0.22 * GLOW);
    for (var k = 0; k < near; k++) {
      var d = Math.abs(randomGaussian()) * w * 0.75 * GLOW;
      var al = 130 * Math.exp(-d / (w * 1.1));
      var m = random(1);
      fill(lerp(HALO[0], BODY[0], m), lerp(HALO[1], BODY[1], m),
           lerp(HALO[2], BODY[2], m), al);
      var t = random(1), sz = random(1.2, 3.6), side = random(1) < 0.5 ? -1 : 1;
      circle(a.x + (c.x - a.x) * t + n.x * d * side,
             a.y + (c.y - a.y) * t + n.y * d * side, sz);
    }
    var mid = Math.floor(l * w * 0.06 * GLOW);
    for (var k2 = 0; k2 < mid; k2++) {
      var d2 = Math.abs(randomGaussian()) * w * 2.2 * GLOW;
      fill(HALO[0], HALO[1], HALO[2], 45 * Math.exp(-d2 / (w * 3)));
      var t2 = random(1), side2 = random(1) < 0.5 ? -1 : 1;
      circle(a.x + (c.x - a.x) * t2 + n.x * d2 * side2,
             a.y + (c.y - a.y) * t2 + n.y * d2 * side2, random(1, 3));
    }
    var far = Math.floor(l * 0.09 * GLOW);
    for (var k3 = 0; k3 < far; k3++) {
      var d3 = random(1.5, 8) * w;
      fill(HALO[0], HALO[1], HALO[2], random(16, 44));
      var t3 = random(1), side3 = random(1) < 0.5 ? -1 : 1;
      circle(a.x + (c.x - a.x) * t3 + n.x * d3 * side3,
             a.y + (c.y - a.y) * t3 + n.y * d3 * side3, random(1, 4));
    }
  }
}

function poly(pts) {
  beginShape();
  for (var i = 0; i < pts.length; i++) vertex(pts[i].x, pts[i].y);
  endShape();
}

// ---------------------------------------------------------------- helpers
function polyLen(pts) {
  var l = 0;
  for (var i = 0; i < pts.length - 1; i++) l += dist(pts[i], pts[i + 1]);
  return l;
}

function pointAt(b, t) {
  var target = polyLen(b.pts) * t, acc = 0;
  for (var i = 0; i < b.pts.length - 1; i++) {
    var a = b.pts[i], c = b.pts[i + 1];
    var l = dist(a, c);
    if (acc + l >= target) return lerpV(a, c, (target - acc) / l);
    acc += l;
  }
  var last = b.pts[b.pts.length - 1];
  return vec(last.x, last.y);
}

function tangentAt(b, t) {
  var p = pointAt(b, t);
  var q = pointAt(b, Math.min(1, t + 0.02));
  return dist(p, q) < 0.001 ? vec(0, 1) : normalize(sub(q, p));
}
