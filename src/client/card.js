// 결과 이미지 카드(1080×1350 PNG)를 캔버스로 그린다. 인스타그램 스토리·메신저 공유용.
const C = { bg: '#eceee9', paper: '#f8f9f5', ink: '#1a1d21', ink2: '#535a61', line: '#d2d6ce', accent: '#2b3a8f', seal: '#b4362b' };
const DISPLAY = 'Hahmlet, "Noto Serif KR", serif';
const BODY = '"IBM Plex Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

function wrap(ctx, text, maxW) {
  const words = String(text).split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width <= maxW) { cur = t; continue; }
    if (cur) lines.push(cur);
    if (ctx.measureText(w).width <= maxW) { cur = w; continue; }
    let part = '';
    for (const ch of w) { if (ctx.measureText(part + ch).width > maxW) { lines.push(part); part = ch; } else part += ch; }
    cur = part;
  }
  if (cur) lines.push(cur);
  return lines;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function drawCard(data) {
  try { await Promise.all([document.fonts.load(`700 120px ${DISPLAY}`), document.fonts.load(`500 40px ${BODY}`), document.fonts.load('900 60px "Noto Serif KR"')]); } catch (e) { /* 기본 글꼴로 그림 */ }
  const W = 1080, H = 1350, M = 64;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  roundRect(ctx, M, M, W - 2 * M, H - 2 * M, 36); ctx.fillStyle = C.paper; ctx.fill();
  ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
  // 도장
  ctx.save(); ctx.translate(M + 110, M + 120); ctx.rotate(-0.07);
  roundRect(ctx, -46, -46, 92, 92, 14); ctx.fillStyle = C.seal; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '900 58px "Noto Serif KR", serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('運', 0, 4);
  ctx.restore();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const x = M + 64, maxW = W - 2 * M - 128;
  let y = M + 290;
  ctx.fillStyle = C.ink2; ctx.font = `500 40px ${BODY}`;
  for (const l of wrap(ctx, data.kicker, maxW).slice(0, 2)) { ctx.fillText(l, x, y); y += 54; }
  y += 70;
  let size = 132;
  ctx.font = `700 ${size}px ${DISPLAY}`;
  while (ctx.measureText(data.big).width > maxW && size > 64) { size -= 6; ctx.font = `700 ${size}px ${DISPLAY}`; }
  ctx.fillStyle = C.accent; ctx.fillText(data.big, x, y);
  y += 96;
  ctx.fillStyle = C.ink; ctx.font = `700 54px ${DISPLAY}`;
  for (const l of wrap(ctx, data.title, maxW).slice(0, 3)) { ctx.fillText(l, x, y); y += 74; }
  if (data.lines && data.lines.length) {
    y += 30;
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + maxW, y); ctx.stroke();
    y += 70;
    for (const [k, v] of data.lines.slice(0, 4)) {
      ctx.fillStyle = C.ink2; ctx.font = `500 36px ${BODY}`; ctx.fillText(k, x, y);
      ctx.fillStyle = C.ink; ctx.font = `600 40px ${BODY}`;
      const vl = wrap(ctx, v, maxW - 200);
      vl.slice(0, 2).forEach((l, i) => ctx.fillText(l, x + 200, y + i * 50));
      y += 60 + (Math.min(vl.length, 2) - 1) * 50;
    }
  }
  ctx.fillStyle = C.ink2; ctx.font = `500 34px ${BODY}`;
  ctx.fillText(`오행 운세 · ${location.host}`, x, H - M - 70);
  ctx.fillStyle = C.seal; ctx.font = `600 32px ${BODY}`;
  ctx.fillText('나도 해 보기 →', x + maxW - ctx.measureText('나도 해 보기 →').width, H - M - 70);
  return new Promise((res) => cv.toBlob(res, 'image/png'));
}
