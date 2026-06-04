import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "skyforge_session";
const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_fatec_av3_poo";

const encoder = new TextEncoder();

async function getCryptoKey() {
  const keyBuf = encoder.encode(JWT_SECRET);
  return await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(data: string): Promise<string> {
  const payloadBuf = encoder.encode(data);
  const key = await getCryptoKey();
  const signatureBuf = await crypto.subtle.sign("HMAC", key, payloadBuf);
  return arrayBufferToBase64(signatureBuf);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function createSession(usuario: any) {
  const payload = JSON.stringify(usuario);
  const signature = await sign(payload);
  const payloadBase64 = btoa(unescape(encodeURIComponent(payload)));
  const token = `${payloadBase64}.${signature}`;
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 dia
    path: "/",
  });
}

/**
 * Verify and parse a raw session token string.
 * Can be called from any runtime (Edge or Node).
 */
export async function verifySessionToken(token: string): Promise<any | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  let payload = "";
  try {
    payload = decodeURIComponent(escape(atob(payloadBase64)));
  } catch {
    return null;
  }

  const expectedSig = await sign(payload);
  if (expectedSig !== signature) return null;

  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Get session from Next.js `cookies()` — works in Server Components, Server Actions, Route Handlers.
 * Does NOT work in middleware (use verifySessionToken with request.cookies instead).
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export { SESSION_COOKIE_NAME };
