// 파비콘은 작게 보이므로 로고의 여백과 반짝이를 빼고 해 얼굴만 꽉 차게 만든다.
// 재생성: node scripts/gen-favicon.mjs (gen-brand.mjs도 함께 실행한다)
import fs from 'node:fs/promises';
import sharp from 'sharp';

const source = new URL('../assets/brand/sun-logo.png', import.meta.url).pathname;
const publicDir = new URL('../public/', import.meta.url);

// 원본 1254px 기준 반짝이 영역과 해의 외곽
const SPARKLE = { x0: 755, x1: 891, y0: 252, y1: 386 };
const SUN = { x0: 184, x1: 1071, y0: 187, y1: 1035 };
const MARGIN = 0.04;

const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const bg = [data[0], data[1], data[2]];
for (let y = SPARKLE.y0; y < SPARKLE.y1; y++) {
  for (let x = SPARKLE.x0; x < SPARKLE.x1; x++) {
    const i = (y * info.width + x) * 3;
    // 남색 반짝이와 그 경계(파란 기가 도는 픽셀)만 배경색으로 덮고, 주황 햇살은 그대로 둔다.
    if (data[i + 2] - data[i] > -10) bg.forEach((v, k) => { data[i + k] = v; });
  }
}

const side = Math.round(Math.max(SUN.x1 - SUN.x0, SUN.y1 - SUN.y0) * (1 + MARGIN * 2));
const left = Math.round((SUN.x0 + SUN.x1 - side) / 2);
const top = Math.round((SUN.y0 + SUN.y1 - side) / 2);
const icon = await sharp(data, { raw: info }).extract({ left, top, width: side, height: side }).png().toBuffer();
const png = (size) => sharp(icon).resize(size, size, { kernel: 'lanczos3' }).png().toBuffer();

await fs.writeFile(new URL('favicon-32.png', publicDir), await png(32));
await fs.writeFile(new URL('favicon-48.png', publicDir), await png(48));
await fs.writeFile(new URL('favicon.svg', publicDir), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><image width="96" height="96" href="data:image/png;base64,${(await png(96)).toString('base64')}"/></svg>\n`);

// favicon.ico: PNG 이미지를 그대로 담은 ICO(16·32·48px)
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, n) => {
  const e = 6 + n * 16;
  header.writeUInt8(size, e);
  header.writeUInt8(size, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(images[n].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += images[n].length;
});
await fs.writeFile(new URL('favicon.ico', publicDir), Buffer.concat([header, ...images]));
console.log('파비콘 생성 완료 (favicon.svg·favicon.ico·favicon-32.png·favicon-48.png)');
