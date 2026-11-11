/** Browser-only. A missing seed is chosen once, then written into the URL. */
export function chooseSeed() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('seed');
  if (q !== null && q.trim() !== '') return q.trim();
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const seed = String(buf[0]);
  const url = new URL(window.location.href);
  url.searchParams.set('seed', seed);
  history.replaceState(null, '', url);
  return seed;
}
