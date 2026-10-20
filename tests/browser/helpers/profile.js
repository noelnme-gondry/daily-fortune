// 기존 계산 시나리오도 브라우저 기본값에 기대지 않고 입력값을 명시한다.
export async function completeProfile(page) {
  for (const who of ['a', 'b', 'tj']) {
    const year = page.locator(`#${who}-y`);
    if (!await year.count()) continue;
    for (const [field, value] of [['y', '1990'], ['m', '1'], ['d', '1']]) {
      const input = page.locator(`#${who}-${field}`);
      if (!await input.inputValue()) await input.selectOption(value);
    }
    const time = page.locator(`#${who}-time`);
    if (await time.count() && await time.isVisible() && await time.isEnabled() && !await time.inputValue()) await time.fill('12:00');
  }
}
