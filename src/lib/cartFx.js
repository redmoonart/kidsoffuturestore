// تأثيرات تفاعلية خفيفة (Web Animations API مباشرة، بدون مكتبات إضافية)

export const CART_HIT_EVENT = "kof:cart-hit";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function visibleCartButton() {
  return [...document.querySelectorAll(".cart-btn")].find((el) => el.getClientRects().length > 0);
}

function hit() {
  window.dispatchEvent(new Event(CART_HIT_EVENT));
}

// تطير صورة المنتج من العنصر المضغوط إلى أيقونة السلة في مسار قوسي، ثم تُعلم الهيدر بالوصول
export function flyToCart(fromEl, image, emoji) {
  const target = visibleCartButton();
  if (reduced() || !target || !fromEl) return hit();

  const a = fromEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = 64;
  const x0 = a.left + a.width / 2 - size / 2;
  const y0 = a.top + a.height / 2 - size / 2;
  const dx = b.left + b.width / 2 - size / 2 - x0;
  const dy = b.top + b.height / 2 - size / 2 - y0;
  // ارتفاع القوس محدود بالمساحة المتاحة فوق نقطة الوصول حتى لا يخرج المنتج من الشاشة
  const room = Math.max(0, Math.min(y0, y0 + dy) - 8);
  const lift = Math.min(room, 160, Math.max(70, Math.abs(dx) * 0.25));

  // الحاوية الخارجية تتحرك أفقياً بسرعة ثابتة، والداخلية عمودياً بتسارع (صعود ثم سقوط) فيتشكّل قوس طبيعي
  const outer = document.createElement("div");
  outer.className = "fly-to-cart";
  outer.style.left = `${x0}px`;
  outer.style.top = `${y0}px`;
  const inner = document.createElement("div");
  inner.className = "fly-to-cart-item";
  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.alt = "";
    inner.appendChild(img);
  } else {
    inner.textContent = emoji || "🎁";
  }
  outer.appendChild(inner);
  document.body.appendChild(outer);

  const duration = 720;
  outer.animate([{ transform: "translateX(0)" }, { transform: `translateX(${dx}px)` }], {
    duration,
    easing: "cubic-bezier(.3,.1,.6,1)",
    fill: "forwards",
  });
  const fall = inner.animate(
    [
      { transform: "translateY(0) scale(1) rotate(0deg)", easing: "cubic-bezier(.2,.7,.4,1)" },
      { transform: `translateY(${Math.min(0, dy) - lift}px) scale(.85) rotate(-14deg)`, offset: 0.38, easing: "cubic-bezier(.6,0,.85,.4)" },
      { transform: `translateY(${dy}px) scale(.28) rotate(10deg)`, opacity: 0.85 },
    ],
    { duration, fill: "forwards" }
  );
  fall.onfinish = () => {
    outer.remove();
    hit();
  };
}

const CONFETTI_COLORS = ["#d87943", "#527575", "#f2a71b", "#ef4444", "#d94f82", "#16a34a"];

// انفجار قصاصات ملوّنة من نقطة معيّنة (للاحتفال بنجاح الطلب)
export function burstConfetti(x, y, count = 34) {
  if (reduced()) return;
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  document.body.appendChild(layer);
  let pending = count;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    if (i % 3 === 0) piece.style.borderRadius = "50%";
    layer.appendChild(piece);

    const angle = (-90 + (Math.random() - 0.5) * 150) * (Math.PI / 180);
    const speed = 160 + Math.random() * 220;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const spin = (Math.random() - 0.5) * 900;
    const duration = 1100 + Math.random() * 600;

    const anim = piece.animate(
      [
        { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1, easing: "cubic-bezier(.15,.7,.4,1)" },
        { transform: `translate(${vx * 0.8}px, ${vy * 0.8}px) rotate(${spin * 0.5}deg) scale(1)`, opacity: 1, offset: 0.4, easing: "cubic-bezier(.5,0,.9,.6)" },
        { transform: `translate(${vx}px, ${vy * 0.6 + 320}px) rotate(${spin}deg) scale(.7)`, opacity: 0 },
      ],
      { duration, fill: "forwards" }
    );
    anim.onfinish = () => {
      if (--pending === 0) layer.remove();
    };
  }
}
