// مشهد ألعاب ثلاثي الأبعاد للهيرو — كل الألعاب مبنية بالكود (بلا ملفات نماذج خارجية).
// يُحمَّل كسولاً من HeroToys فقط على الأجهزة القادرة؛ الهيرو الثابت هو البديل.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Color, Vector2, Vector3, Raycaster, Box3,
  HemisphereLight, DirectionalLight, PMREMGenerator, NeutralToneMapping, SRGBColorSpace,
  MeshPhysicalMaterial, MeshBasicMaterial, SphereGeometry, CylinderGeometry, ConeGeometry, TorusGeometry,
  CircleGeometry, LatheGeometry, ExtrudeGeometry, PlaneGeometry, Shape, CanvasTexture, MathUtils,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// لوحة ألوان الألعاب: مشتقة من ألوان العلامة (تيراكوتا، مريمية، وردي، أصفر)
// مع درجات ألعاب أنقى تنسجم معها ومع خلفية الحديقة (عشب أخضر وسماء زرقاء).
const C = {
  terracotta: "#E0743C", // اللون الأساسي للمتجر بإشباع أعلى قليلاً كي يبدو بلاستيكياً
  sage: "#3F9A90",       // المريمية بنسخة ألعاب أنقى
  pink: "#E8588C",
  sun: "#F7B52C",        // الأصفر الذهبي للمتجر
  duck: "#FFCB3D",
  sky: "#3B8EE6",
  mint: "#4FC08D",
  cream: "#FFF5E8",
  blush: "#F79CB4",
  ink: "#1C2230",
};

const plastic = (color, extra = {}) =>
  new MeshPhysicalMaterial({
    color: new Color(color), roughness: 0.34, metalness: 0,
    clearcoat: 0.55, clearcoatRoughness: 0.28, specularIntensity: 0.6, ...extra,
  });

// ---------- الألعاب ----------
function brick(color, studsX = 3) {
  const g = new Group();
  const mat = plastic(color);
  const w = studsX * 0.53;
  g.add(new Mesh(new RoundedBoxGeometry(w, 0.8, 0.8, 4, 0.12), mat));
  const studGeo = new CylinderGeometry(0.17, 0.17, 0.16, 28);
  for (let i = 0; i < studsX; i++) for (const z of [-0.18, 0.18]) {
    const st = new Mesh(studGeo, mat);
    st.position.set((i - (studsX - 1) / 2) * 0.5, 0.47, z);
    g.add(st);
  }
  return g;
}

function blockStack() {
  const g = new Group();
  const a = brick(C.sky); a.position.y = -0.42;
  const b = brick(C.terracotta, 2); b.position.set(0.32, 0.42, 0.02); b.rotation.y = 0.32;
  g.add(a, b);
  return g;
}

function beachBall() {
  const cv = document.createElement("canvas");
  cv.width = 1024; cv.height = 512;
  const x = cv.getContext("2d");
  const gores = [C.terracotta, C.cream, C.sky, C.sun, C.cream, C.mint];
  gores.forEach((c, i) => { x.fillStyle = c; x.fillRect((i * 1024) / 6, 0, 1024 / 6 + 1, 512); });
  // غطاءان في القطبين مع زرّ ملوّن
  x.fillStyle = C.cream; x.fillRect(0, 0, 1024, 40); x.fillRect(0, 472, 1024, 40);
  x.fillStyle = C.sun; x.fillRect(0, 0, 1024, 14); x.fillRect(0, 498, 1024, 14);
  const tex = new CanvasTexture(cv);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  const g = new Group();
  g.add(new Mesh(new SphereGeometry(0.78, 56, 36), plastic("#ffffff", { map: tex, roughness: 0.26, clearcoat: 0.7 })));
  return g;
}

function rocket() {
  const g = new Group();
  const prof = [[0, -1.0], [0.36, -0.95], [0.46, -0.6], [0.5, 0], [0.46, 0.5], [0.34, 0.85], [0, 1.0]]
    .map(([r, y]) => new Vector2(r, y));
  g.add(new Mesh(new LatheGeometry(prof, 48), plastic(C.cream, { roughness: 0.3 })));
  const band = new Mesh(new TorusGeometry(0.47, 0.06, 14, 48), plastic(C.sage));
  band.rotation.x = Math.PI / 2; band.position.y = -0.62; g.add(band);
  const nose = new Mesh(new ConeGeometry(0.35, 0.55, 48), plastic(C.terracotta));
  nose.position.y = 1.12; g.add(nose);
  const win = new Mesh(new CircleGeometry(0.2, 40), plastic(C.sky, { roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.05 }));
  win.position.set(0, 0.25, 0.495); g.add(win);
  const glint = new Mesh(new CircleGeometry(0.06, 20), new MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.85 }));
  glint.position.set(-0.07, 0.32, 0.5); g.add(glint);
  const rim = new Mesh(new TorusGeometry(0.21, 0.05, 14, 40), plastic(C.sage));
  rim.position.copy(win.position); g.add(rim);
  const fin = new Shape();
  fin.moveTo(0, 0); fin.lineTo(0.5, -0.45); fin.lineTo(0.5, -0.8); fin.lineTo(0, -0.45); fin.lineTo(0, 0);
  const finGeo = new ExtrudeGeometry(fin, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 });
  finGeo.translate(0.38, -0.2, -0.04);
  const finMat = plastic(C.terracotta);
  for (let i = 0; i < 3; i++) {
    const f = new Mesh(finGeo, finMat);
    f.rotation.y = (i * Math.PI * 2) / 3 + Math.PI / 6;
    g.add(f);
  }
  // لهب بطبقتين: برتقالي خارجي وأصفر مضيء داخلي
  const flame = new Group();
  const outer = new Mesh(new ConeGeometry(0.24, 0.55, 28), new MeshBasicMaterial({ color: "#FF8A3D", transparent: true, opacity: 0.9 }));
  const inner = new Mesh(new ConeGeometry(0.13, 0.36, 24), new MeshBasicMaterial({ color: "#FFE27A" }));
  inner.position.y = 0.08;
  flame.add(outer, inner);
  flame.rotation.x = Math.PI; flame.position.y = -1.24; g.add(flame);
  g.userData.flame = flame;
  return g;
}

function duck() {
  const g = new Group();
  const y = plastic(C.duck, { roughness: 0.3 });
  const body = new Mesh(new SphereGeometry(0.62, 48, 32), y);
  body.scale.set(1.25, 0.85, 1); g.add(body);
  const wing = new Mesh(new SphereGeometry(0.3, 32, 20), plastic("#F7B92E"));
  wing.scale.set(1.3, 0.7, 0.5); wing.position.set(-0.05, 0.08, 0.5); wing.rotation.z = -0.3; g.add(wing);
  const head = new Mesh(new SphereGeometry(0.4, 48, 32), y);
  head.position.set(0.42, 0.62, 0); g.add(head);
  const tail = new Mesh(new ConeGeometry(0.2, 0.4, 24), y);
  tail.position.set(-0.78, 0.18, 0); tail.rotation.z = Math.PI / 2.6; g.add(tail);
  const beak = new Mesh(new SphereGeometry(0.17, 28, 18), plastic("#F2762E", { roughness: 0.28 }));
  beak.scale.set(1.5, 0.55, 1); beak.position.set(0.8, 0.56, 0); g.add(beak);
  const eyeGeo = new SphereGeometry(0.065, 18, 12);
  const eyeMat = plastic(C.ink, { roughness: 0.08, clearcoat: 1 });
  const hiGeo = new SphereGeometry(0.022, 10, 8);
  const hiMat = new MeshBasicMaterial({ color: "#ffffff" });
  const blushGeo = new CircleGeometry(0.075, 20);
  const blushMat = new MeshBasicMaterial({ color: C.blush, transparent: true, opacity: 0.75 });
  for (const z of [-0.2, 0.2]) {
    const e = new Mesh(eyeGeo, eyeMat); e.position.set(0.66, 0.74, z); g.add(e);
    const h = new Mesh(hiGeo, hiMat); h.position.set(0.71, 0.77, z + Math.sign(z) * 0.015); g.add(h);
    const b = new Mesh(blushGeo, blushMat);
    b.position.set(0.6, 0.6, z * 1.65); b.lookAt(new Vector3(0.6, 0.6, z * 10)); g.add(b);
  }
  return g;
}

function spinTop() {
  // دوّامة بأشرطة ملوّنة: كل شريط قطعة دوران مستقلة تلتقي حوافها
  const pts = [[0, -0.75], [0.08, -0.7], [0.3, -0.42], [0.55, -0.12], [0.62, 0.02], [0.5, 0.18], [0.12, 0.26], [0.12, 0.62], [0, 0.66]]
    .map(([r, yy]) => new Vector2(r, yy));
  const bands = [[0, 3, C.pink], [2, 5, C.sun], [4, 7, C.sage], [6, 9, C.terracotta]];
  const g = new Group();
  for (const [a, b, col] of bands) g.add(new Mesh(new LatheGeometry(pts.slice(a, b), 56), plastic(col)));
  const ring = new Mesh(new TorusGeometry(0.62, 0.045, 14, 56), plastic(C.cream));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.02; g.add(ring);
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
  const geo = new ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 5 });
  geo.center();
  const g = new Group();
  g.add(new Mesh(geo, plastic(C.sun, { emissive: new Color("#FFB000"), emissiveIntensity: 0.18, roughness: 0.25, clearcoat: 0.8 })));
  return g;
}

const BUILDERS = { blocks: blockStack, ball: beachBall, rocket, duck, top: spinTop, star };
// الألعاب القريبة من العشب لها ظل ناعم تحتها كي تبدو جزءاً من المشهد
const GROUNDED = new Set(["blocks", "duck", "top", "ball"]);

function shadowTexture() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const x = cv.getContext("2d");
  const grd = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(24,44,16,0.62)");
  grd.addColorStop(0.55, "rgba(28,48,20,0.22)");
  grd.addColorStop(1, "rgba(28,48,20,0)");
  x.fillStyle = grd; x.fillRect(0, 0, 128, 128);
  return new CanvasTexture(cv);
}

// أماكن الألعاب بنسب من مساحة الهيرو (x من اليسار، y من الأعلى) — بعيدة عن بطاقة النص وعن داني
const LAYOUTS = {
  wide: [
    { kind: "rocket", x: 0.9, y: 0.3, s: 0.62, z: 0, tilt: -0.4 },
    { kind: "ball", x: 0.95, y: 0.72, s: 0.75, z: -0.6 },
    { kind: "blocks", x: 0.8, y: 0.84, s: 0.72, z: 0.4 },
    { kind: "star", x: 0.76, y: 0.13, s: 0.5, z: -1.2, face: true },
    { kind: "duck", x: 0.36, y: 0.93, s: 0.6, z: 0.3, spinRate: 0, yaw: -0.5 },
    { kind: "top", x: 0.63, y: 0.91, s: 0.72, z: 0 },
  ],
  mid: [
    { kind: "rocket", x: 0.9, y: 0.8, s: 0.75, z: 0, tilt: -0.35 },
    { kind: "star", x: 0.92, y: 0.08, s: 0.45, z: -1, face: true },
    { kind: "blocks", x: 0.7, y: 0.9, s: 0.65, z: 0.3 },
    { kind: "ball", x: 0.07, y: 0.08, s: 0.5, z: -1 },
    { kind: "duck", x: 0.5, y: 0.88, s: 0.55, z: 0.2, spinRate: 0, yaw: -0.5 },
  ],
  narrow: [
    { kind: "ball", x: 0.85, y: 0.76, s: 0.55, z: 0 },
    { kind: "blocks", x: 0.62, y: 0.88, s: 0.5, z: 0.3 },
    { kind: "star", x: 0.52, y: 0.72, s: 0.34, z: -0.8, face: true },
  ],
};

const easeOutBack = (t) => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

export function mountToyScene(host) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = "hero-toys-canvas";
  host.appendChild(canvas);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.32;
  // إضاءة تطابق صورة الحديقة: شمس دافئة من أعلى اليسار، سماء زرقاء فوق، ارتداد أخضر من العشب،
  // وضوء حافة بارد من الخلف يفصل الألعاب عن الخلفية
  scene.add(new HemisphereLight("#d9ecff", "#9fcf72", 0.85));
  const sun = new DirectionalLight("#ffe4bf", 2.5);
  sun.position.set(-6, 7, 6);
  scene.add(sun);
  const rim = new DirectionalLight("#cfe5ff", 1.5);
  rim.position.set(5, 3, -6);
  scene.add(rim);
  const shadowTex = shadowTexture();

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
    toys.forEach((t) => { scene.remove(t.obj); if (t.shadow) scene.remove(t.shadow); });
    toys = LAYOUTS[key].map((spec, i) => {
      const obj = BUILDERS[spec.kind]();
      scene.add(obj);
      const box = new Box3().setFromObject(obj);
      let shadow = null;
      if (GROUNDED.has(spec.kind)) {
        shadow = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
        shadow.renderOrder = -1;
        scene.add(shadow);
      }
      return { spec, obj, shadow, foot: box.min.y, span: Math.max(box.max.x - box.min.x, box.max.z - box.min.z),
        phase: i * 1.7, born: performance.now() + 250 + i * 140, spin: 0, spinVel: 0 };
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
        (spec.face ? Math.sin(t * 0.8 + phase) * 0.45 : (spec.spinRate ?? 0.35) * t + (spec.yaw ?? phase)) + pointer.sx * 0.5 + toy.spin + sScroll * 2,
        (spec.tilt || 0) + Math.sin(t * 0.9 + phase) * 0.08,
      );
      if (obj.userData.flame) obj.userData.flame.scale.set(1, 0.85 + Math.sin(t * 18) * 0.15, 1);
      if (toy.shadow) {
        // الظل ثابت على "الأرض" ويصغر ويخف كلما ارتفعت اللعبة
        const lift = obj.position.y - (base.y + sy);
        const k = Math.max(0, 1 - Math.max(0, lift) * 1.6);
        const w = toy.span * s * (0.95 + 0.15 * k);
        toy.shadow.position.set(obj.position.x, base.y + sy + toy.foot * s - 0.1 * s, base.z - 0.4);
        toy.shadow.scale.set(Math.max(0.0001, w), Math.max(0.0001, w * 0.26), 1);
        toy.shadow.material.opacity = k * pop * (1 - sScroll);
      }
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
      shadowTex.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
