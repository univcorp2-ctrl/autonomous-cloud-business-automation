import type { Env, RunRequest } from './types';

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'authorization,content-type'
    }
  });
}

export function unauthorized(): Response {
  return json({ ok: false, error: 'Unauthorized. Check Bearer token.' }, 401);
}

export function isAuthorized(request: Request, env: Env): boolean {
  if (!env.GPT_ACTION_TOKEN) return true;
  const header = request.headers.get('authorization') || '';
  return header === `Bearer ${env.GPT_ACTION_TOKEN}`;
}

export function assertSafeRequest(body: RunRequest, env: Env): void {
  const liveRequested = body.live === true || body.dryRun === false;
  const liveAllowed = env.ALLOW_LIVE_TRADING === 'true';
  if (liveRequested && !liveAllowed) {
    throw new Error('Live execution is disabled. Use dryRun=true or set ALLOW_LIVE_TRADING=true after risk controls are configured.');
  }
}

export function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
