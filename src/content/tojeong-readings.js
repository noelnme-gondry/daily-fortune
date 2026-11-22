// 서버 전용: 144괘 해설 원본. 브라우저는 /data/tojeong/{괘}.json으로 자기 괘 하나만 받는다(vite.config.js).
import fs from 'node:fs';

const original = JSON.parse(fs.readFileSync(new URL('./tojeong-144.json', import.meta.url), 'utf8'));
const modern = JSON.parse(fs.readFileSync(new URL('./tojeong-modern.ko.json', import.meta.url), 'utf8'));
export const READINGS = Object.fromEntries(Object.entries(original).map(([code, reading]) => [code, { ...reading, interpretation: modern[code] }]));
