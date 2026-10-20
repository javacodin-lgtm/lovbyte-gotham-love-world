const MAX_GIFT_BYTES = 20 * 1024 * 1024;
const IMAGE_DATA = /^data:image\/(?:jpeg|png|webp|gif);base64,[a-z0-9+/=]+$/i;
const AUDIO_DATA = /^data:audio\/(?:mpeg|mp4|ogg|wav|x-wav|webm);base64,[a-z0-9+/=]+$/i;

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  return !origin || new URL(origin).origin === new URL(request.url).origin;
}

export async function parseRequest(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_GIFT_BYTES) throw new Error("Gift is too large. Please use smaller photos or a shorter song.");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_GIFT_BYTES) throw new Error("Gift is too large. Please use smaller photos or a shorter song.");
  try { return JSON.parse(text); } catch { throw new Error("The gift details could not be read."); }
}

function safeUrl(value, dataPattern) {
  if (typeof value !== "string") return "";
  if (dataPattern.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}

function boundedText(value, max = 1000) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function boundedNumber(value, fallback, min, max) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function cleanConfig(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Gift details are missing.");
  const output = Object.create(null);
  const fields = {
    recipient: 80, nickname: 80, sender: 120, title: 180, introMessage: 700,
    introNote: 1200, letter: 12000, scrapSecret: 500, batSecret: 500,
    catSecret: 500, finalMessage: 1200, openButton: 100, templateButtonLabel: 100,
    kissButton: 100, finalLinkLabel: 100, songTitle: 120
  };
  for (const [key, max] of Object.entries(fields)) output[key] = boundedText(input[key], max);
  output.password = boundedText(input.password, 10);
  output.ownerPin = boundedText(input.ownerPin, 10);
  output.dialogue = Array.isArray(input.dialogue) ? input.dialogue.slice(0, 3).map(item => boundedText(item, 280)) : [];
  output.reasons = Array.isArray(input.reasons) ? input.reasons.slice(0, 24).map(item => ({
    front: boundedText(item && item.front, 120), back: boundedText(item && item.back, 500)
  })) : [];
  output.gallery = Array.isArray(input.gallery) ? input.gallery.slice(0, 60).map((item, index) => ({
    id: "memory-" + (index + 1),
    art: ["moon", "rose", "rooftop"].includes(item && item.art) ? item.art : "moon",
    src: safeUrl(item && item.src, IMAGE_DATA),
    caption: boundedText(item && item.caption, 240),
    date: boundedText(item && item.date, 100),
    rotation: boundedNumber(item && item.rotation, 0, -12, 12),
    scale: boundedNumber(item && item.scale, 100, 80, 120),
    posX: boundedNumber(item && item.posX, 0, -100, 100),
    posY: boundedNumber(item && item.posY, 0, -80, 100),
    frameScale: boundedNumber(item && item.frameScale, 100, 75, 120),
    sticker: boundedText(item && item.sticker, 8),
    stickerX: boundedNumber(item && item.stickerX, 0, -70, 70),
    stickerY: boundedNumber(item && item.stickerY, 0, -70, 70)
  })) : [];
  output.finalLinkUrl = safeUrl(input.finalLinkUrl, /^$/);
  output.coupleArt = safeUrl(input.coupleArt, IMAGE_DATA);
  output.cover = safeUrl(input.cover, IMAGE_DATA);
  output.songUrl = safeUrl(input.songUrl, AUDIO_DATA);
  output.musicEmbed = boundedText(input.musicEmbed, 1000);
  output.accent = /^#[\da-f]{6}$/i.test(input.accent) ? input.accent : "#c38b9b";
  output.paper = /^#[\da-f]{6}$/i.test(input.paper) ? input.paper : "#f3ebdc";
  output.playerBg = /^#[\da-f]{6}$/i.test(input.playerBg) ? input.playerBg : output.paper;
  output.playerAccent = /^#[\da-f]{6}$/i.test(input.playerAccent) ? input.playerAccent : output.accent;
  output.font = ["classic", "soft", "editorial"].includes(input.font) ? input.font : "classic";
  output.preset = ["moonlit", "velvet", "rose"].includes(input.preset) ? input.preset : "moonlit";
  output.playerDesign = ["round", "cassette", "card", "vinyl", "dark", "polaroid"].includes(input.playerDesign) ? input.playerDesign : "card";
  output.playerShape = ["rounded", "round", "square"].includes(input.playerShape) ? input.playerShape : "rounded";
  output.playerPosition = ["bottom-right", "bottom-left", "top-right", "top-left", "inline"].includes(input.playerPosition) ? input.playerPosition : "bottom-right";
  output.playerWidth = boundedNumber(input.playerWidth, 340, 250, 440);
  output.playerAnimation = ["spin", "gentle", "none"].includes(input.playerAnimation) ? input.playerAnimation : "spin";
  if (!/^\d{6,10}$/.test(output.password)) throw new Error("For a shareable gift, choose a 6–10 digit passcode.");
  return output;
}

export async function prepareRecord(input, id, previous = null) {
  const config = cleanConfig(input);
  const passwordHash = await digest(id + ":" + config.password);
  const passwordLength = config.password.length;
  delete config.password;
  delete config.ownerPin;
  const record = {
    version: 1,
    createdAt: (previous && previous.createdAt) || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    passwordLength,
    passwordHash,
    ownerToken: (previous && previous.ownerToken) || "",
    config
  };
  const serialized = JSON.stringify(record);
  if (new TextEncoder().encode(serialized).byteLength > MAX_GIFT_BYTES) throw new Error("This gift is over the 20 MB share limit. Use smaller photos or a shorter audio file.");
  return record;
}

export async function digest(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function safeEqual(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  let mismatch = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) mismatch |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  return mismatch === 0;
}

export async function readRecord(bucket, id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const object = await bucket.get("gift/" + id);
  if (!object) return null;
  try { return JSON.parse(await object.text()); } catch { return null; }
}

export async function rateLimit(kv, request, label, limit, periodSeconds = 3600) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const key = label + ":" + await digest(ip);
  const count = Number(await kv.get(key) || 0);
  if (count >= limit) return false;
  await kv.put(key, String(count + 1), { expirationTtl: periodSeconds });
  return true;
}
