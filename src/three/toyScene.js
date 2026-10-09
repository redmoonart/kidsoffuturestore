// مشهد ألعاب ثلاثي الأبعاد للهيرو — كل الألعاب مبنية بالكود (بلا ملفات نماذج خارجية).
// يُحمَّل كسولاً من HeroToys فقط على الأجهزة القادرة؛ الهيرو الثابت هو البديل.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Color, Vector2, Raycaster,
  HemisphereLight, DirectionalLight, PMREMGenerator, NeutralToneMapping, SRGBColorSpace,
  MeshPhysicalMaterial, SphereGeometry, CylinderGeometry, ConeGeometry, TorusGeometry,
  CircleGeometry, LatheGeometry, ExtrudeGeometry, Shape, CanvasTexture, MathUtils,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const C = {
  orange: "#E8794A", yellow: "#F5B82E", teal: "#3E8E8A", pink: "#EF6F8E",
  blue: "#4A8FE7", red: "#E5533D", cream: "#FFF6EA", green: "#5DBB63", ink: "#1F2430",
};

const plastic = (color, extra = {}) =>
  new MeshPhysicalMaterial({ color: new Color(color), roughness: 0.38, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.3, ...extra });

// ---------- الألعاب ----------
function brick(color) {
  const g = new Group();
  const mat = plastic(color);
  const body = new Mesh(new RoundedBoxGeometry(1.6, 0.8, 0.8, 4, 0.12), mat);
  g.add(body);
  const studGeo = new CylinderGeometry(0.17, 0.17, 0.16, 28);
  for (const x of [-0.5, 0, 0.5]) for (const z of [-0.18, 0.18]) {
    const s = new Mesh(studGeo, mat);
    s.position.set(x, 0.47, z);
    g.add(s);
  }
  return g;
}

function blockStack() {
  const g = new Group();
  const a = brick(C.blue); a.position.y = -0.42;
  const b = brick(C.yellow); b.position.set(0.25, 0.42, 0); b.rotation.y = 0.35;
  g.add(a, b);
  return g;
}

function beachBall() {
  const cv = document.createElement("canvas");
  cv.width = 512; cv.height = 256;
  const x = cv.getContext("2d");
  const cols = [C.red, C.cream, C.blue, C.yellow, C.cream, C.green];
  cols.forEach((c, i) => { x.fillStyle = c; x.fillRect((i * 512) / 6, 0, 512 / 6 + 1, 256); });
  x.fillStyle = C.cream; x.fillRect(0, 0, 512, 22); x.fillRect(0, 234, 512, 22);
  const tex = new CanvasTexture(cv);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  const m = new Mesh(new SphereGeometry(0.78, 48, 32), plastic("#ffffff", { map: tex, roughness: 0.28 }));
  const g = new Group(); g.add(m);
  return g;
}

function rocket() {
  const g = new Group();
  const prof = [[0, -1.0], [0.36, -0.95], [0.46, -0.6], [0.5, 0], [0.46, 0.5], [0.34, 0.85], [0, 1.0]]
    .map(([r, y]) => new Vector2(r, y));
  const body = new Mesh(new LatheGeometry(prof, 40), plastic(C.cream));
  g.add(body);
  const nose = new Mesh(new ConeGeometry(0.35, 0.55, 40), plastic(C.red));
  nose.position.y = 1.12; g.add(nose);
  const win = new Mesh(new CircleGeometry(0.2, 32), plastic(C.blue, { roughness: 0.08, clearcoat: 1 }));
  win.position.set(0, 0.25, 0.495); g.add(win);
  const rim = new Mesh(new TorusGeometry(0.21, 0.05, 14, 40), plastic(C.orange));
  rim.position.copy(win.position); g.add(rim);
  const fin = new Shape();
  fin.moveTo(0, 0); fin.lineTo(0.5, -0.45); fin.lineTo(0.5, -0.8); fin.lineTo(0, -0.45); fin.lineTo(0, 0);
  const finGeo = new ExtrudeGeometry(fin, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 });
  finGeo.translate(0.38, -0.2, -0.04);
  for (let i = 0; i < 3; i++) {
    const f = new Mesh(finGeo, plastic(C.red));
    f.rotation.y = (i * Math.PI * 2) / 3;
    g.add(f);
  }
  const flame = new Mesh(new ConeGeometry(0.22, 0.5, 24), plastic(C.yellow, { emissive: new Color(C.orange), emissiveIntensity: 0.6 }));
  flame.rotation.x = Math.PI; flame.position.y = -1.22; g.add(flame);
  g.userData.flame = flame;
  return g;
}

function duck() {
  const g = new Group();
  const y = plastic(C.yellow);
  const body = new Mesh(new SphereGeometry(0.62, 40, 28), y);
  body.scale.set(1.25, 0.85, 1); g.add(body);
  const head = new Mesh(new SphereGeometry(0.4, 40, 28), y);
  head.position.set(0.42, 0.62, 0); g.add(head);
  const tail = new Mesh(new ConeGeometry(0.2, 0.4, 24), y);
  tail.position.set(-0.78, 0.18, 0); tail.rotation.z = Math.PI / 2.6; g.add(tail);
  const beak = new Mesh(new SphereGeometry(0.17, 24, 16), plastic(C.orange));
  beak.scale.set(1.5, 0.55, 1); beak.position.set(0.8, 0.56, 0); g.add(beak);
  const eyeGeo = new SphereGeometry(0.06, 16, 12);
  const eyeMat = plastic(C.ink, { roughness: 0.1 });
  for (const z of [-0.2, 0.2]) {
    const e = new Mesh(eyeGeo, eyeMat);
    e.position.set(0.66, 0.74, z); g.add(e);
  }
  return g;
}

function spinTop() {
  const prof = [[0, -0.75], [0.08, -0.7], [0.55, -0.12], [0.62, 0.02], [0.5, 0.18], [0.12, 0.26], [0.12, 0.62], [0, 0.66]]
    .map(([r, yy]) => new Vector2(r, yy));
  const g = new Group();
  g.add(new Mesh(new LatheGeometry(prof, 48), plastic(C.teal)));
  const band = new Mesh(new TorusGeometry(0.6, 0.06, 14, 48), plastic(C.pink));
  band.rotation.x = Math.PI / 2; band.position.y = 0.02; g.add(band);
  return g;
}

function star() {
  const s = new Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.32 : 0.75;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const px = Math.cos(a) * r, py = Math.sin(a) * r;
    i ? s.lineTo(px, py) : s.moveTo(px, py);
  }
  const geo = new ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 4 });
  geo.center();
  const g = new Group();
  g.add(new Mesh(geo, plastic(C.yellow, { emissive: new Color("#F5B82E"), emissiveIntensity: 0.12 })));
  return g;
}

const BUILDERS = { blocks: blockStack, ball: beachBall, rocket, duck, top: spinTop, star };

// أماكن الألعاب بنسب من مساحة الهيرو (x من اليسار، y من الأعلى) — بعيدة عن بطاقة النص وعن داني
const LAYOUTS = {
  wide: [
    { kind: "rocket", x: 0.9, y: 0.3, s: 0.62, z: 0, tilt: -0.4 },
    { kind: "ball", x: 0.95, y: 0.72, s: 0.75, z: -0.6 },
    { kind: "blocks", x: 0.8, y: 0.84, s: 0.72, z: 0.4 },
    { kind: "star", x: 0.76, y: 0.13, s: 0.5, z: -1.2 },
    { kind: "duck", x: 0.36, y: 0.93, s: 0.6, z: 0.3, spinRate: 0, yaw: -0.5 },
    { kind: "top", x: 0.63, y: 0.91, s: 0.72, z: 0 },
  ],
  mid: [
    { kind: "rocket", x: 0.9, y: 0.8, s: 0.75, z: 0, tilt: -0.35 },
    { kind: "star", x: 0.92, y: 0.08, s: 0.45, z: -1 },
    { kind: "blocks", x: 0.7, y: 0.9, s: 0.65, z: 0.3 },
    { kind: "ball", x: 0.07, y: 0.08, s: 0.5, z: -1 },
    { kind: "duck", x: 0.5, y: 0.88, s: 0.55, z: 0.2, spinRate: 0, yaw: -0.5 },
  ],
  narrow: [
    { kind: "ball", x: 0.85, y: 0.76, s: 0.55, z: 0 },
    { kind: "blocks", x: 0.62, y: 0.88, s: 0.5, z: 0.3 },
    { kind: "star", x: 0.52, y: 0.72, s: 0.34, z: -0.8 },
  ],
};

const easeOutBack = (t) => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

export function mountToyScene(host) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = "hero-toys-canvas";
  host.appendChild(canvas);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.45;
  scene.add(new HemisphereLight("#ffffff", "#e9c9b0", 0.9));
  const sun = new DirectionalLight("#fff3e0", 2.2);
  sun.position.set(4, 6, 8);
  scene.add(sun);

  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  let toys = [];
  let layoutKey = "";
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let scroll = 0, sScroll = 0;
  let active = true, raf = 0, last = performance.now(), t0 = last;
  let width = 1, height = 1;

  function worldAt(fx, fy, z) {
    const h = 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - z);
    const w = h * camera.aspect;
    return { x: (fx - 0.5) * w, y: (0.5 - fy) * h, unit: h / height };
  }

  function buildLayout() {
    const key = width >= 1025 ? "wide" : width >= 641 ? "mid" : "narrow";
    if (key === layoutKey) return placeToys();
    layoutKey = key;
    toys.forEach((t) => scene.remove(t.obj));
    toys = LAYOUTS[key].map((spec, i) => {
      const obj = BUILDERS[spec.kind]();
      scene.add(obj);
      return { spec, obj, phase: i * 1.7, born: performance.now() + 250 + i * 140, spin: 0, spinVel: 0 };
    });
    placeToys();
  }

  function placeToys() {
    // على الشاشات الأصغر نصغّر الألعاب نسبياً حتى تبقى بحجم مقروء ولا تزاحم المحتوى
    const k = Math.min(1, Math.max(0.62, height / 640));
    toys.forEach((t) => {
      const p = worldAt(t.spec.x, t.spec.y, t.spec.z);
      t.base = { x: p.x, y: p.y, z: t.spec.z, s: t.spec.s * k };
    });
  }

  function resize() {
    const r = host.getBoundingClientRect();
    width = Math.max(1, r.width); height = Math.max(1, r.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    buildLayout();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  function frame(now) {
    raf = 0;
    if (!active) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - t0) / 1000;
    pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 4);
    pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 4);
    sScroll += (scroll - sScroll) * Math.min(1, dt * 8);

    for (const toy of toys) {
      const { obj, base, spec, phase } = toy;
      const age = Math.min(1, Math.max(0, (now - toy.born) / 900));
      const pop = age <= 0 ? 0 : easeOutBack(age);
      const depth = 1 + spec.z * 0.35;
      // التبعثر مع السكرول: تبتعد عن المركز وترتفع وتصغر
      const dx = base.x === 0 ? 1 : Math.sign(base.x);
      const sx = dx * sScroll * 2.6;
      const sy = sScroll * 2.2 + Math.max(0, base.y) * sScroll * 0.6;
      toy.spinVel *= Math.pow(0.04, dt);
      toy.spin += toy.spinVel * dt;
      const jump = toy.spinVel > 0.5 ? Math.sin(Math.min(1, toy.spinVel / 14) * Math.PI) * 0.35 : 0;

      obj.position.set(
        base.x + pointer.sx * 0.28 * depth + sx,
        base.y + Math.sin(t * 1.1 + phase) * 0.12 - pointer.sy * 0.18 * depth + sy + jump,
        base.z,
      );
      const s = base.s * pop * (1 - sScroll * 0.35);
      obj.scale.setScalar(Math.max(0.0001, s));
      obj.rotation.set(
        Math.sin(t * 0.7 + phase) * 0.18 + pointer.sy * 0.25 + (spec.tilt ? 0 : 0.25),
        (spec.spinRate ?? 0.35) * t + (spec.yaw ?? phase) + pointer.sx * 0.5 + toy.spin + sScroll * 2,
        (spec.tilt || 0) + Math.sin(t * 0.9 + phase) * 0.08,
      );
      if (obj.userData.flame) obj.userData.flame.scale.y = 0.85 + Math.sin(t * 18) * 0.15;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  const ray = new Raycaster();
  const ndc = new Vector2();

  return {
    canvas,
    setPointer(x, y) { pointer.x = MathUtils.clamp(x, -1, 1); pointer.y = MathUtils.clamp(y, -1, 1); },
    setScroll(p) { scroll = MathUtils.clamp(p, 0, 1); },
    setActive(on) {
      if (on === active) return;
      active = on;
      if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    },
    // نقرة على لعبة → تقفز وتدور. ترجع true إذا أصابت لعبة.
    poke(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      for (const toy of toys) {
        if (ray.intersectObject(toy.obj, true).length) { toy.spinVel = 14; return true; }
      }
      return false;
    },
    destroy() {
      active = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { o.material.map?.dispose(); o.material.dispose(); }
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
