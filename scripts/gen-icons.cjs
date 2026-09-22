const sharp = require('sharp');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'JETAPRINT_LOGO_01_2026-01.jpg');
const OUT = path.join(ROOT, 'public', 'icons');

async function getMark() {
  // Recorta o glifo "J" (com a barra ciano) do wordmark e remove a
  // margem branca — é a única forma quadrada aproveitável da marca.
  const cropped = await sharp(SRC)
    .extract({ left: 0, top: 0, width: 260, height: 592 })
    .png()
    .toBuffer();
  return sharp(cropped).trim().toBuffer();
}

async function makeIcon({ size, outFile, bg, markHeightRatio }) {
  const markBuf = await getMark();
  const markHeight = Math.round(size * markHeightRatio);
  const resized = await sharp(markBuf).resize({ height: markHeight }).toBuffer();
  const meta = await sharp(resized).metadata();

  const left = Math.round((size - meta.width) / 2);
  const top = Math.round((size - meta.height) / 2);

  await sharp({
    create: { width: size, height: size, channels: 4, background: bg }
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toFile(path.join(OUT, outFile));
  console.log('wrote', outFile, size, 'mark', meta.width, meta.height);
}

(async () => {
  await makeIcon({ size: 192, outFile: 'icon-192.png', bg: '#FFFFFF', markHeightRatio: 0.72 });
  await makeIcon({ size: 512, outFile: 'icon-512.png', bg: '#FFFFFF', markHeightRatio: 0.72 });
  // Maskable: conteúdo dentro do círculo seguro central (~80% de raio)
  await makeIcon({ size: 512, outFile: 'maskable-512.png', bg: '#FFFFFF', markHeightRatio: 0.5 });
  await makeIcon({ size: 180, outFile: 'apple-touch-icon.png', bg: '#FFFFFF', markHeightRatio: 0.72 });
})().catch((e) => { console.error(e); process.exit(1); });
