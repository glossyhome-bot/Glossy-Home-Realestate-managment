import { neon } from "@neondatabase/serverless";

interface Env {
  ASSETS: Fetcher;
  DATABASE_URL: string;
  ADMIN_ID: string;
  ADMIN_PASSWORD: string;
  ADMIN_TOKEN_SECRET: string;
}
const MAX_BODY_BYTES = 5 * 1024 * 1024;
const TOKEN_TTL_SECONDS = 12 * 60 * 60;

function b64url(bytes: Uint8Array): string {
  let binary = ""; for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function fromB64url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
async function hmacKey(secret: string, usages: KeyUsage[]) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usages);
}
async function createToken(user: string, secret: string): Promise<string> {
  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ sub: user, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+TOKEN_TTL_SECONDS })));
  const content = `${header}.${payload}`;
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(secret, ["sign"]), new TextEncoder().encode(content)));
  return `${content}.${b64url(sig)}`;
}
async function verifyToken(token: string, secret: string): Promise<string | null> {
  try {
    const parts = token.split("."); if (parts.length !== 3) return null;
    const valid = await crypto.subtle.verify("HMAC", await hmacKey(secret, ["verify"]), new Uint8Array(fromB64url(parts[2])).buffer, new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(parts[1])));
    if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now()/1000)) return null;
    return String(payload.sub);
  } catch { return null; }
}
function constantTimeEqual(a: string, b: string): boolean {
  const aa = new TextEncoder().encode(a), bb = new TextEncoder().encode(b);
  let diff = aa.length ^ bb.length; const n = Math.max(aa.length, bb.length);
  for (let i=0;i<n;i++) diff |= (aa[i % (aa.length || 1)] || 0) ^ (bb[i % (bb.length || 1)] || 0);
  return diff === 0;
}
function json(data: unknown, status=200, origin?: string) {
  const headers: Record<string,string> = { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff", "Referrer-Policy":"same-origin" };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(data), { status, headers });
}
function allowedOrigin(request: Request): string | undefined {
  const origin = request.headers.get("Origin");
  if (!origin) return undefined;
  try { return new URL(origin).origin === new URL(request.url).origin ? origin : undefined; } catch { return undefined; }
}
async function readJson(request: Request): Promise<any> {
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > MAX_BODY_BYTES) throw new Error("Request body too large (maximum 5 MB).");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new Error("Request body too large (maximum 5 MB).");
  return JSON.parse(text);
}
async function requireAdmin(request: Request, env: Env): Promise<string | null> {
  const value = request.headers.get("Authorization") || "";
  if (!value.startsWith("Bearer ")) return null;
  return verifyToken(value.slice(7), env.ADMIN_TOKEN_SECRET);
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url), origin = allowedOrigin(request);
    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      if (request.headers.get("Origin") && !origin) return json({ error:"Cross-origin request denied." }, 403);
      return new Response(null, { status:204, headers:{ ...(origin?{"Access-Control-Allow-Origin":origin}:{}), "Access-Control-Allow-Methods":"GET,POST,PUT,OPTIONS", "Access-Control-Allow-Headers":"Content-Type,Authorization", "Access-Control-Max-Age":"600", "Vary":"Origin" } });
    }
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (request.headers.get("Origin") && !origin) return json({ error:"Cross-origin request denied." }, 403);
    try {
      if (url.pathname === "/api/health" && request.method === "GET") return json({ ok:true, service:"glossy-home-api", databaseConfigured:!!env.DATABASE_URL, authConfigured:!!(env.ADMIN_ID && env.ADMIN_PASSWORD && env.ADMIN_TOKEN_SECRET && env.ADMIN_TOKEN_SECRET.length >= 32) },200,origin);
      if (url.pathname === "/api/auth/login" && request.method === "POST") {
        if (!env.ADMIN_ID || !env.ADMIN_PASSWORD || !env.ADMIN_TOKEN_SECRET || env.ADMIN_TOKEN_SECRET.length < 32) return json({ error:"Admin authentication secrets are not configured correctly." },503,origin);
        const body = await readJson(request);
        if (typeof body.adminId !== "string" || typeof body.password !== "string" || !constantTimeEqual(body.adminId, env.ADMIN_ID) || !constantTimeEqual(body.password, env.ADMIN_PASSWORD)) return json({ error:"Invalid Admin ID or password." },401,origin);
        return json({ token: await createToken(env.ADMIN_ID, env.ADMIN_TOKEN_SECRET), expiresIn: TOKEN_TTL_SECONDS },200,origin);
      }
      if (url.pathname === "/api/v1/public-data" && request.method === "GET") {
        if (!env.DATABASE_URL) return json({ exists:false, data:null, publicReadConfigured:false },200,origin);
        const sql = neon(env.DATABASE_URL);
        const rows = await sql`SELECT data, updated_at FROM glossy_home_app_state WHERE id = 'default' LIMIT 1`;
        if (!rows.length) return json({ exists:false, data:null, publicReadConfigured:true },200,origin);
        const publicData = rows[0].data as any;
        if (publicData && Array.isArray(publicData.tenants)) publicData.tenants = publicData.tenants.map((t:any) => ({ ...t, phone:"", email:"", notes:"", deposit:0 }));
        if (publicData && Array.isArray(publicData.payments)) publicData.payments = publicData.payments.map((p:any) => ({ ...p, notes:"" }));
        if (publicData && Array.isArray(publicData.flats)) publicData.flats = publicData.flats.map((f:any) => ({ ...f, ownerPhone:"", ownerEmail:"", notes:"", rooms:Array.isArray(f.rooms)?f.rooms.map((r:any)=>({...r,notes:""})):f.rooms }));
        return json({ exists:true, data:publicData, updatedAt:rows[0].updated_at, publicReadConfigured:true },200,origin);
      }
      if (url.pathname === "/api/v1/data" && (request.method === "GET" || request.method === "PUT")) {
        if (!env.DATABASE_URL) return json({ error:"Database is not configured. Admin login is available, but cloud storage requires DATABASE_URL." },503,origin);
        const user = await requireAdmin(request, env);
        if (!user) return json({ error:"Admin session expired. Please sign in again." },401,origin);
        const sql = neon(env.DATABASE_URL);
        if (request.method === "GET") {
          const rows = await sql`SELECT data, updated_at FROM glossy_home_app_state WHERE id = 'default' LIMIT 1`;
          if (!rows.length) return json({ exists:false, data:null },200,origin);
          return json({ exists:true, data:rows[0].data, updatedAt:rows[0].updated_at },200,origin);
        }
        const body = await readJson(request);
        const data = body?.data;
        if (!data || typeof data !== "object" || !Array.isArray(data.flats) || !Array.isArray(data.tenants) || !Array.isArray(data.payments) || !Array.isArray(data.utilities)) return json({ error:"Invalid data format. Required arrays: flats, tenants, payments, utilities." },400,origin);
        const encoded = JSON.stringify({ ...data, expenses:Array.isArray(data.expenses)?data.expenses:[], listings:Array.isArray(data.listings)?data.listings:[] });
        await sql`INSERT INTO glossy_home_app_state (id, data, updated_at, updated_by) VALUES ('default', ${encoded}::jsonb, now(), ${user}) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now(), updated_by = EXCLUDED.updated_by`;
        return json({ ok:true, updatedAt:new Date().toISOString() },200,origin);
      }
      return json({ error:"Not found." },404,origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected server error.";
      return json({ error: message.includes("JSON") ? "Invalid JSON request." : "Server error. Check Worker logs and database configuration." },500,origin);
    }
  }
};
