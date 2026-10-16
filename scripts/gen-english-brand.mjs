// English sharing assets use the existing approved logo and brand palette.
// Regenerate with: node scripts/gen-english-brand.mjs
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { BRAND } from '../src/content/brand.js';
import { withLanguage } from '../src/i18n/runtime.js';

const publicDir = new URL('../public/', import.meta.url);
const brand = withLanguage('en', () => ({ name: BRAND.name, descriptor: BRAND.descriptor }));
const manifest = JSON.parse(await fs.readFile(new URL('site.webmanifest', publicDir), 'utf8'));
await fs.mkdir(new URL('en/', publicDir), { recursive: true });
await fs.writeFile(new URL('en/site.webmanifest', publicDir), `${JSON.stringify({ ...manifest, name: brand.name, short_name: brand.name, description: brand.descriptor, lang: 'en', start_url: '/en/' }, null, 2)}\n`);
const logo = (await sharp(fileURLToPath(new URL('icon-512.png', publicDir))).resize(460, 460).png().toBuffer()).toString('base64');
const cards = [
  ['default', 'Korean saju & daily fortune', 'Explore your day through the Four Pillars'],
  ['story', 'Your life through Korean saju', 'Nine chapters. Your own life character.'],
  ['rank', 'Your saju ranking', 'Chart balance and category strengths'],
  ['compat', 'Korean saju compatibility', 'Explore your connection together'],
];
for (const [kind, title, subtitle] of cards) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#fffaf0"/>
    <image x="710" y="85" width="460" height="460" href="data:image/png;base64,${logo}"/>
    <g font-family="Arial, sans-serif" fill="#242e64">
      <text x="64" y="260" font-size="64" font-weight="700">${brand.name}</text>
      <text x="66" y="340" font-size="32" font-weight="600">${title.replaceAll('&', '&amp;')}</text>
      <text x="66" y="395" font-size="25" fill="#535a61">${subtitle}</text>
      <text x="66" y="548" font-size="22" fill="#535a61">Free readings · No sign-up</text>
    </g>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(new URL(`og-${kind}-en.png`, publicDir)));
}
