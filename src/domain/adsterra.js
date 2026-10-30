// Public placement keys issued for makeyourownday-fortune.com; no visitor input.
export const ADSTERRA_FORMATS = Object.freeze({
  wide: { key: 'fc789e07e083f374c174aee8f7464e7a', width: 728, height: 90 },
  compact: { key: 'c4be6b408b9381b6023794252df541c1', width: 320, height: 50 },
});
export const ADSTERRA_SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox';
const ADSTERRA_ORIGIN = 'https://bauval.org';
export function adsterraFormat(width) {
  if (!Number.isFinite(width)) return null;
  return Object.keys(ADSTERRA_FORMATS).find(key => ADSTERRA_FORMATS[key].width <= width) || null;
}
export function adsterraDocument(format) {
  if (!Object.hasOwn(ADSTERRA_FORMATS, format)) return null;
  const { key, width, height } = ADSTERRA_FORMATS[format];
  const options = JSON.stringify({ key, format: 'iframe', height, width, params: {} });
  // srcdoc otherwise inherits the embedding page's full URL through baseURI.
  // Keep its base public and its origin opaque; never grant allow-same-origin.
  // The SDK deletes consumed options; a global var would be non-configurable.
  return `<!doctype html><html><head><base href="${ADSTERRA_ORIGIN}/"><meta name="referrer" content="origin"><style>html,body{margin:0;padding:0;overflow:hidden}</style></head><body><script>window.atOptions=${options};</script><script src="${ADSTERRA_ORIGIN}/22/${key}" referrerpolicy="origin"></script></body></html>`;
}
