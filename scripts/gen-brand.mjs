// 승인된 원본을 그대로 축소해 웹 로고·홈 화면 아이콘·공유 이미지를 만든다. 파비콘은 gen-favicon.mjs.
// 재생성: node scripts/gen-brand.mjs
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { BRAND } from '../src/content/brand.js';

const source = new URL('../assets/brand/sun-logo.png', import.meta.url);
const publicDir = new URL('../public/', import.meta.url);
await fs.mkdir(new URL('brand/', publicDir), { recursive: true });
for (const [file, size] of [
  ['brand/logo-128.png', 128],
  ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512],
]) {
  await sharp(source.pathname).resize(size, size).png().toFile(new URL(file, publicDir).pathname);
}
await import('./gen-favicon.mjs');

const manifestFile = new URL('site.webmanifest', publicDir);
const manifest = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
manifest.name = BRAND.name;
manifest.short_name = BRAND.name;
manifest.description = BRAND.descriptor;
manifest.icons = manifest.icons.map((icon) => ({ ...icon, src: `${icon.src.split('?')[0]}?v=sun` }));
await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const logo = (await sharp(source.pathname).resize(460, 460).png().toBuffer()).toString('base64');
const cards = [
  ['default', BRAND.descriptor, '생년월일시로 만나는 나의 하루'],
  ['story', '사주로 본 내 인생은?', '아홉 챕터의 인생 캐릭터'],
  ['rank', '내 사주 랭킹', '사주 점수와 분야별 강점'],
  ['compat', '무료 사주 궁합', '두 사람의 관계와 함께할 시기'],
];
for (const [kind, title, subtitle] of cards) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#fffaf0"/>
    <image x="710" y="85" width="460" height="460" href="data:image/png;base64,${logo}"/>
    <g font-family="Arial, Apple SD Gothic Neo, sans-serif" fill="#242e64">
      <text x="64" y="260" font-size="58" font-weight="700" letter-spacing="-2">${esc(BRAND.name)}</text>
      <text x="66" y="340" font-size="32" font-weight="600">${esc(title)}</text>
      <text x="66" y="395" font-size="27" fill="#535a61">${esc(subtitle)}</text>
      <text x="66" y="548" font-size="22" fill="#535a61">회원가입 없이 결과까지 무료</text>
    </g>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(new URL(`og-${kind}.png`, publicDir).pathname);
}
console.log('브랜드 로고·파비콘·홈 화면 아이콘·공유 이미지 생성 완료');
