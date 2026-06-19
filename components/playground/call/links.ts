/**
 * Guest join-link encoding. The websocket URL and token ride the URL fragment
 * (after '#'), which browsers never send in an HTTP request, so the token does
 * not reach the playground server. '/join' parses the same shape back out.
 */

export interface JoinCreds {
  wsUrl: string;
  token: string;
}

export function buildJoinLink(origin: string, wsUrl: string, token: string): string {
  const base = origin.replace(/\/$/, '');
  const params = new URLSearchParams({ u: wsUrl, t: token });
  return `${base}/join#${params.toString()}`;
}

/**
 * Inverse of buildJoinLink: read the websocket URL and token from a URL
 * fragment. Returns null when the fragment is absent or incomplete.
 */
export function parseFragment(hash: string): JoinCreds | null {
  const raw = hash.replace(/^#/, '');
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  const wsUrl = params.get('u');
  const token = params.get('t');
  if (!wsUrl || !token) return null;
  return { wsUrl, token };
}
