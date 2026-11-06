export async function contrastRatios(locator) {
  return locator.evaluateAll(elements => elements.map(element => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d');
    const paint = color => { context.fillStyle = color; context.fillRect(0, 0, 1, 1); };
    const luminance = rgb => rgb.slice(0, 3).map(value => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);
    const parents = [];
    for (let parent = element; parent; parent = parent.parentElement) parents.unshift(parent);
    paint('#ffffff');
    for (const parent of parents) paint(window.getComputedStyle(parent).backgroundColor);
    const background = luminance([...context.getImageData(0, 0, 1, 1).data]);
    paint(window.getComputedStyle(element).color);
    const foreground = luminance([...context.getImageData(0, 0, 1, 1).data]);
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  }));
}
