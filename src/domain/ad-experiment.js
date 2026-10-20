export const AD_POSITION_EXPERIMENT = Object.freeze({
  id: 'ad_position_v2',
  storageKey: 'myod:ad-position:v2',
  placements: Object.freeze({ A: 'after_summary', B: 'before_result' }),
});

// 동일 브라우저에 배정을 유지한다. 저장 차단 시 탭, 마지막으로 현재 문서에만 유지한다.
export function assignAdVariant(stores, random = Math.random) {
  let variant;
  for (const { scope, open } of stores) {
    try {
      const storage = open();
      const saved = storage.getItem(AD_POSITION_EXPERIMENT.storageKey);
      if (saved === 'A' || saved === 'B') return { variant: saved, scope };
      variant ??= random() < 0.5 ? 'A' : 'B';
      storage.setItem(AD_POSITION_EXPERIMENT.storageKey, variant);
      return { variant, scope };
    } catch { /* 저장소 제한은 계산·광고 표시를 막지 않는다. */ }
  }
  return { variant: variant ?? (random() < 0.5 ? 'A' : 'B'), scope: 'page' };
}
