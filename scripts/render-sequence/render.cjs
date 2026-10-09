// يصيّر إطارات مشهد صندوق الهدية إلى public/seq/<name>/NNN.webp
// الاستعمال: node scripts/render-sequence/render.cjs <url> <outDir> <W> <H> <frames> [portrait] [onlyTimes]
const { chromium } = require(process.env.PW_PATH || "playwright");
const fs = require("fs"); const path = require("path");
const [url, outDir, W, H, N, portrait, only] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const p = await b.newPage({ viewport: { width: +W, height: +H } });
  p.on("pageerror", (e) => console.error("PAGEERR", e.message));
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
  await p.evaluate(([w, h, pt]) => window.setup(w, h, pt), [+W, +H, portrait === "1"]);
  fs.mkdirSync(outDir, { recursive: true });
  const times = only ? only.split(",").map(Number) : Array.from({ length: +N }, (_, i) => i / (+N - 1));
  for (const [i, t] of times.entries()) {
    const data = await p.evaluate((tt) => window.frame(tt), t);
    fs.writeFileSync(path.join(outDir, `${String(i).padStart(3, "0")}.webp`), Buffer.from(data.split(",")[1], "base64"));
  }
  console.log("rendered", times.length, "frames →", outDir);
  await b.close();
})();
