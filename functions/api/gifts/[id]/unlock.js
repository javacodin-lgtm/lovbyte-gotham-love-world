import { digest, json, parseRequest, rateLimit, readRecord, safeEqual, sameOrigin } from "../../../../lib/gifts.js";

export async function onRequestPost({ request, params, env }) {
  if (!sameOrigin(request)) return json({ error: "This request is not allowed." }, 403);
  if (!env.GIFTS || !env.LIMITS) return json({ error: "Share links are not connected." }, 503);
  const record = await readRecord(env.GIFTS, params.id);
  if (!record) return json({ error: "This little gift link could not be found." }, 404);
  const limitKey = `unlock:${params.id}`;
  const allowed = await rateLimit(env.LIMITS, request, limitKey, 8, 3600);
  if (!allowed) return json({ error: "Too many tries for now. Give it a little while, then try again." }, 429);
  let body;
  try { body = await parseRequest(request); } catch { return json({ error: "That code did not open the letter." }, 401); }
  const passcode = typeof body.passcode === "string" ? body.passcode : "";
  if (!/^\d{6,10}$/.test(passcode) || !safeEqual(await digest(`${params.id}:${passcode}`), record.passwordHash)) {
    return json({ error: "That code did not open the letter." }, 401);
  }
  return json({ config: record.config });
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "allow": "POST, OPTIONS" } });
  return json({ error: "Method not allowed." }, 405);
}
