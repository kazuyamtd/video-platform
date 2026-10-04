const STORED_FORMAT = /^\d+(\/[0-9a-f]+)?$/;
const HASH = /^[0-9a-f]{6,}$/;

/**
 * 管理画面で入力された動画ID / URL を "123456" または
 * 限定公開動画の "123456/abcdef1234"（ハッシュ付き）に正規化する。
 */
export function parseVimeoInput(input: string): string | null {
  const value = input.trim();
  if (STORED_FORMAT.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!/(^|\.)vimeo\.com$/.test(url.hostname)) return null;

  const segments = url.pathname.split("/").filter(Boolean);
  const idIndex = segments.findIndex((s) => /^\d+$/.test(s));
  if (idIndex === -1) return null;

  const id = segments[idIndex];
  const next = segments[idIndex + 1];
  const hash = url.searchParams.get("h") ?? (next && HASH.test(next) ? next : null);
  return hash ? `${id}/${hash}` : id;
}

/** @vimeo/player の `url` オプションに渡すURL */
export function toVimeoUrl(stored: string): `https://vimeo.com/${string}` {
  return `https://vimeo.com/${stored}`;
}

/**
 * oEmbed で再生時間（秒）を取得する。埋め込みドメイン制限をかけた動画など
 * 取得できない場合は null を返す（呼び出し側で手入力にフォールバック）。
 */
export async function fetchVimeoDuration(stored: string): Promise<number | null> {
  try {
    const endpoint = new URL("https://vimeo.com/api/oembed.json");
    endpoint.searchParams.set("url", toVimeoUrl(stored));
    const res = await fetch(endpoint, {
      headers: process.env.BETTER_AUTH_URL ? { Referer: process.env.BETTER_AUTH_URL } : {},
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data: { duration?: unknown } = await res.json();
    return typeof data.duration === "number" ? data.duration : null;
  } catch {
    return null;
  }
}
