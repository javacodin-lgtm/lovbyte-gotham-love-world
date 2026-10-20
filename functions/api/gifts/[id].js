import { json, parseRequest, prepareRecord, readRecord, safeEqual, sameOrigin } from "../../../lib/gifts.js";

export async function onRequestGet({ params, env }) {
  if (!env.GIFTS) return json({ error: "Share links are not connected." }, 503);
  const record = await readRecord(env.GIFTS, params.id);
  if (!record) return json({ error: "This little gift link could not be found." }, 404);
  const passwordLength = Math.min(10, Math.max(6, Number(record.passwordLength) || 6));
  return json({
    preview: {
      recipient: record.config.recipient,
      nickname: record.config.nickname,
      introMessage: record.config.introMessage,
      openButton: record.config.openButton
    },
    passwordLength
  });
}

export async function onRequestPut({ request, params, env }) {
  if (!sameOrigin(request)) return json({ error: "This request is not allowed." }, 403);
  if (!env.GIFTS || !env.LIMITS) return json({ error: "Share links are not connected yet." }, 503);
  let body;
  try { body = await parseRequest(request); } catch (error) { return json({ error: error.message }, 413); }
  const existing = await readRecord(env.GIFTS, params.id);
  if (!existing || !safeEqual(body.manageToken, existing.ownerToken)) return json({ error: "This saved link could not be updated from this browser." }, 404);
  let record;
  try { record = await prepareRecord(body.config, params.id, existing); }
  catch (error) { return json({ error: error.message }, 400); }
  record.ownerToken = existing.ownerToken;
  try { await env.GIFTS.put(`gift/${params.id}`, JSON.stringify(record)); }
  catch { return json({ error: "The gift could not be updated. Please try again." }, 503); }
  return json({ id: params.id, shareUrl: `${new URL(request.url).origin}/?gift=${encodeURIComponent(params.id)}` });
}

export async function onRequestDelete({ request, params, env }) {
  if (!sameOrigin(request)) return json({ error: "This request is not allowed." }, 403);
  if (!env.GIFTS) return json({ error: "Share links are not connected." }, 503);
  const existing = await readRecord(env.GIFTS, params.id);
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!existing || !safeEqual(token, existing.ownerToken)) return json({ error: "This saved link could not be revoked from this browser." }, 404);
  await env.GIFTS.delete(`gift/${params.id}`);
  return json({ ok: true });
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "allow": "GET, PUT, DELETE, OPTIONS" } });
  return json({ error: "Method not allowed." }, 405);
}
