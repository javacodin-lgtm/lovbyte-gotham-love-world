import { json, parseRequest, prepareRecord, rateLimit, sameOrigin } from "../../../lib/gifts.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "This request is not allowed." }, 403);
  if (!env.GIFTS || !env.LIMITS) return json({ error: "Share links are not connected yet. Finish the one-time Cloudflare setup first." }, 503);
  if (!await rateLimit(env.LIMITS, request, "publish", 8)) return json({ error: "A few gifts have already been created from this connection. Please try again later." }, 429);
  let body;
  try { body = await parseRequest(request); } catch (error) { return json({ error: error.message }, 413); }
  const id = crypto.randomUUID();
  let record;
  try { record = await prepareRecord(body.config, id); }
  catch (error) { return json({ error: error.message }, 400); }
  record.ownerToken = crypto.randomUUID() + crypto.randomUUID();
  try {
    await env.GIFTS.put(`gift/${id}`, JSON.stringify(record));
  } catch { return json({ error: "The gift could not be stored. Please try again." }, 503); }
  return json({ id, manageToken: record.ownerToken, shareUrl: `${new URL(request.url).origin}/?gift=${encodeURIComponent(id)}` }, 201);
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "allow": "POST, OPTIONS" } });
  return json({ error: "Method not allowed." }, 405);
}
