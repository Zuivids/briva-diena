export function bgImageUrl(path: string | null | undefined, base = '/images/'): string {
  if (!path) return 'none';
  // encodeURIComponent leaves ( ) ! ~ * ' unescaped (RFC 2396 "unreserved" set),
  // but unescaped parentheses still terminate an unquoted CSS url() early.
  const encoded = encodeURIComponent(path).replace(/[()]/g, c => '%' + c.charCodeAt(0).toString(16));
  return `url(${base}${encoded})`;
}
