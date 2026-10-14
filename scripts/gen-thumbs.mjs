// 캐릭터 그림 썸네일: public/characters/*.webp(640px) → public/characters/384/*.webp
// 카드·도감 목록은 썸네일을, 캐릭터 상세 창은 원본을 쓴다. 그림을 추가·교체하면 다시 실행한다.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir = 'public/characters', out = path.join(dir, '384');
fs.mkdirSync(out, { recursive: true });
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.webp'));
for (const f of files) await sharp(path.join(dir, f)).resize(384, 384).webp({ quality: 82, effort: 6 }).toFile(path.join(out, f));
console.log(`${files.length}개 썸네일 생성 → ${out}`);
