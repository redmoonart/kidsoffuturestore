// تصيير إطارات مشهد "صندوق الهدية" لمشغّل التمرير (ScrollSequence).
// يُشغَّل في متصفح بلا واجهة عبر scripts/render-sequence/render.cjs — لا يدخل في حزمة الموقع.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Color, Fog, Vector3, SpotLight, PointLight,
  DirectionalLight, HemisphereLight, PMREMGenerator, NeutralToneMapping, PCFSoftShadowMap, MeshStandardMaterial,
  MeshBasicMaterial, CircleGeometry, ConeGeometry, TorusGeometry, SphereGeometry, BufferGeometry,
  Float32BufferAttribute, Points, PointsMaterial, AdditiveBlending, DoubleSide, CanvasTexture, MathUtils,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BUILDERS, TOY_COLORS as C, plastic } from "../../src/three/toyScene.js";

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, t) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const easeOutBack = (x) => { const c = 1.5; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

let renderer, scene, camera, portrait;
let lid, glow, beam, dust, spot, toys = [];

function gradientTex(stops, w = 4, h = 256) {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const x = cv.getContext("2d"); const g = x.createLinearGradient(0, 0, 0, h);
  stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, w, h);
  return new CanvasTexture(cv);
}

function giftBox() {
  const g = new Group();
  const wall = plastic(C.terracotta, { roughness: 0.42 });
  const inner = new MeshStandardMaterial({ color: "#8a3f1e", roughness: 0.8 });
  const ribbon = plastic(C.sage, { roughness: 0.3 });
  const W = 1.9, H = 1.45, T = 0.09;
  const add = (geo, mat, x, y, z) => { const m = new Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
  add(new RoundedBoxGeometry(W, T, W, 3, 0.03), inner, 0, T / 2, 0);
  add(new RoundedBoxGeometry(W, H, T, 3, 0.04), wall, 0, H / 2, W / 2 - T / 2);
  add(new RoundedBoxGeometry(W, H, T, 3, 0.04), wall, 0, H / 2, -W / 2 + T / 2);
  add(new RoundedBoxGeometry(T, H, W, 3, 0.04), wall, W / 2 - T / 2, H / 2, 0);
  add(new RoundedBoxGeometry(T, H, W, 3, 0.04), wall, -W / 2 + T / 2, H / 2, 0);
  // شرائط على الجدران
  add(new RoundedBoxGeometry(0.3, H + 0.01, 0.02, 2, 0.01), ribbon, 0, H / 2, W / 2 + 0.005);
  add(new RoundedBoxGeometry(0.3, H + 0.01, 0.02, 2, 0.01), ribbon, 0, H / 2, -W / 2 - 0.005);
  add(new RoundedBoxGeometry(0.02, H + 0.01, 0.3, 2, 0.01), ribbon, W / 2 + 0.005, H / 2, 0);
  add(new RoundedBoxGeometry(0.02, H + 0.01, 0.3, 2, 0.01), ribbon, -W / 2 - 0.005, H / 2, 0);

  lid = new Group();
  lid.add(new Mesh(new RoundedBoxGeometry(W + 0.16, 0.36, W + 0.16, 4, 0.06), wall));
  const r1 = new Mesh(new RoundedBoxGeometry(0.32, 0.38, W + 0.18, 2, 0.02), ribbon); lid.add(r1);
  const r2 = new Mesh(new RoundedBoxGeometry(W + 0.18, 0.38, 0.32, 2, 0.02), ribbon); lid.add(r2);
  const loopGeo = new TorusGeometry(0.34, 0.1, 16, 40);
  for (const s of [-1, 1]) {
    const l = new Mesh(loopGeo, ribbon);
    l.position.set(s * 0.32, 0.42, 0); l.rotation.set(0, 0, s * 0.5); l.scale.set(1, 0.8, 0.6); lid.add(l);
  }
  const knot = new Mesh(new SphereGeometry(0.16, 24, 16), ribbon); knot.position.y = 0.3; lid.add(knot);
  lid.position.y = H + 0.18;
  g.add(lid);

  glow = new PointLight("#ffb45e", 0, 6, 1.6);
  glow.position.set(0, 0.9, 0);
  g.add(glow);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// مدارات الألعاب النهائية حول الصندوق
const ORBITS = [
  { kind: "rocket", a: -0.95, r: 2.6, y: 2.45, s: 0.72, tilt: -0.5 },
  { kind: "ball", a: 0.95, r: 2.5, y: 0.95, s: 0.7 },
  { kind: "blocks", a: 1.75, r: 2.6, y: 1.85, s: 0.6 },
  { kind: "duck", a: -1.75, r: 2.45, y: 0.85, s: 0.62, face: true, yaw: 1.2 },
  { kind: "top", a: 2.5, r: 2.5, y: 2.85, s: 0.56 },
  { kind: "star", a: -0.2, r: 1.5, y: 3.35, s: 0.5, face: true },
];

window.setup = (W, H, isPortrait) => {
  portrait = isPortrait;
  renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H);
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  scene = new Scene();
  scene.background = new Color("#08070d");
  scene.fog = new Fog("#08070d", 11, 26);
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.16;

  camera = new PerspectiveCamera(portrait ? 52 : 34, W / H, 0.1, 100);

  scene.add(new HemisphereLight("#6f7cff", "#1a1018", 0.25));
  const rim = new DirectionalLight("#9ab6ff", 0.9); rim.position.set(-5, 4, -6); scene.add(rim);
  spot = new SpotLight("#ffe3bd", 260, 0, 0.44, 0.75, 2);
  spot.position.set(0, 9.5, 1.2);
  spot.target.position.set(0, 0.6, 0);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -0.0004;
  scene.add(spot, spot.target);

  const floor = new Mesh(new CircleGeometry(30, 64), new MeshStandardMaterial({ color: "#1a1622", roughness: 0.7, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // شعاع ضوئي حجمي مزيّف
  const beamTex = gradientTex([[0, "rgba(255,255,255,0.0)"], [0.25, "rgba(255,255,255,0.35)"], [1, "rgba(255,255,255,0.9)"]]);
  beam = new Mesh(new ConeGeometry(3.4, 9.6, 64, 1, true),
    new MeshBasicMaterial({ color: "#ffd9a6", alphaMap: beamTex, transparent: true, opacity: 0.04, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }));
  beam.position.set(0, 4.8, 0.4);
  scene.add(beam);
  // نواة أضيق وأسطع داخل الشعاع لحافة ناعمة
  const core = new Mesh(new ConeGeometry(2.0, 9.6, 64, 1, true), beam.material.clone());
  core.material.opacity = 0.045;
  core.position.copy(beam.position);
  scene.add(core);
  beam.userData.core = core;

  // غبار يطفو في الضوء
  const N = 420, pos = [];
  for (let i = 0; i < N; i++) {
    const h = Math.random() * 8.5, rr = Math.random() * (0.4 + h * 0.3);
    const a = Math.random() * Math.PI * 2;
    pos.push(Math.cos(a) * rr, 9 - h, Math.sin(a) * rr + 0.4);
  }
  const dg = new BufferGeometry(); dg.setAttribute("position", new Float32BufferAttribute(pos, 3));
  dust = new Points(dg, new PointsMaterial({ color: "#ffe2b5", size: 0.035, transparent: true, opacity: 0.7, blending: AdditiveBlending, depthWrite: false }));
  scene.add(dust);

  scene.add(giftBox());

  toys = ORBITS.map((o, i) => {
    const obj = BUILDERS[o.kind]();
    obj.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    scene.add(obj);
    return { ...o, obj, i };
  });
};

window.frame = (t) => {
  // الكاميرا: اقتراب بطيء ثم دوران حول الصندوق
  const orbit = smooth(0.2, 1, t) * 0.62;
  const R = (portrait ? 12.2 : 9.4) - smooth(0, 0.3, t) * (portrait ? 1.2 : 1.0);
  const camH = 2.5 + smooth(0.3, 1, t) * 0.6;
  camera.position.set(Math.sin(orbit) * R, camH, Math.cos(orbit) * R);
  camera.lookAt(0, portrait ? 1.95 : 1.45, 0);

  spot.intensity = 260 * (0.35 + 0.65 * smooth(0, 0.1, t));
  beam.material.opacity = 0.04 * (0.4 + 0.6 * smooth(0, 0.1, t));
  beam.userData.core.material.opacity = 0.045 * (0.4 + 0.6 * smooth(0, 0.1, t));
  dust.rotation.y = t * 1.2;
  dust.material.opacity = 0.35 + 0.35 * smooth(0, 0.15, t);

  // الغطاء يرتفع ويطير جانباً
  const L = smooth(0.12, 0.42, t);
  lid.position.set(-2.6 * L * L, 1.63 + L * (portrait ? 7.5 : 4.4), -0.6 * L);
  lid.rotation.set(L * 0.9, L * 0.6, L * 0.55);
  glow.intensity = 34 * smooth(0.18, 0.45, t) * (1 - 0.35 * smooth(0.8, 1, t));

  for (const toy of toys) {
    const t0 = 0.27 + toy.i * 0.065;
    const u = clamp01((t - t0) / 0.3);
    const rise = smooth(0, 0.45, u);
    const out = smooth(0.35, 1, u);
    const extra = Math.max(0, t - t0 - 0.3) * 0.7; // دوران مداري بطيء بعد الوصول
    const ang = toy.a - (1 - out) * 2.4 + extra;
    const rad = toy.r * out * (portrait ? 0.68 : 1);
    const y = MathUtils.lerp(0.35, 2.2 + toy.i * 0.15, rise) * (1 - out) + (toy.y * (portrait ? 1.22 : 1) + (portrait ? 0.25 : 0)) * out + Math.sin(t * 9 + toy.i) * 0.06 * out;
    toy.obj.position.set(Math.sin(ang) * rad, y, Math.cos(ang) * rad);
    const sc = u <= 0 ? 0.0001 : toy.s * (0.3 + 0.7 * easeOutBack(Math.min(1, u * 1.25)));
    toy.obj.scale.setScalar(Math.max(0.0001, sc));
    const spin = toy.face ? Math.sin(t * 6 + toy.i) * 0.4 + orbit + (toy.yaw || 0) - ang : t * 7 + toy.i * 1.3;
    toy.obj.rotation.set(Math.sin(t * 5 + toy.i) * 0.2 + (toy.tilt ? 0 : 0.2), spin, (toy.tilt || 0) + Math.sin(t * 4 + toy.i) * 0.08);
    toy.obj.visible = u > 0;
  }
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL("image/webp", 0.8);
};

window.ready = true;
