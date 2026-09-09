// Pass 2: buttons/badges whose background is a SOLID saturated brand gradient
// need white text in both themes — restore var(--on-accent) where pass 1 turned
// their text into the theme-aware ink token.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const files = [
  'src/App.jsx',
  ...readdirSync('src/components').filter(f => f.endsWith('.jsx')).map(f => `src/components/${f}`)
];

// style={{ ... }} objects, tolerating one level of nested braces
const STYLE_OBJ = /style=\{\{((?:[^{}]|\{[^{}]*\})*)\}\}/g;

function isSolidBrandGradient(styleBody) {
  const m = styleBody.match(/background(?:Color)?:\s*'(linear-gradient\([^']*)'/i);
  if (!m) return false;
  const grad = m[1];
  if (/rgba\([^)]*,\s*0?\.\d/.test(grad)) return false;          // translucent tint → not solid
  return /#[0-9a-f]{3,8}\b|var\(--brand-(?:cyan|magenta|navy)\)|var\(--success\)/i.test(grad);
}

let n = 0;
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const out = src.replace(STYLE_OBJ, (full, body) => {
    if (isSolidBrandGradient(body) && body.includes("color: 'var(--text-strong)'")) {
      n++;
      return full.replace("color: 'var(--text-strong)'", "color: 'var(--on-accent)'");
    }
    return full;
  });
  if (out !== src) { writeFileSync(file, out); console.log(`  ${file}`); }
}
console.log(`\non-accent fixes: ${n}`);
