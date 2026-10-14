// 모든 페이지에서 불러오는 진입점. 계산기가 있는 페이지에서만 엔진(만세력 라이브러리 포함)을 지연 로딩한다.
const tool = document.getElementById('tool');
if (tool) {
  import('./tool.js').then((m) => m.mount(tool)).catch((e) => {
    console.error(e);
    const out = document.getElementById('result');
    if (out) out.innerHTML = '<div class="result-empty card"><p>계산기를 불러오지 못했습니다. 새로고침해 주세요.</p></div>';
  });
}
