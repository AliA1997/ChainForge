/**
 * In-memory nonce + session store for the SIWE demo. Deliberately no database
 * (out of scope for this project): state lives in the Node process, surviving
 * HMR via globalThis. In production you'd back this with Redis or a signed
 * JWT — the protocol flow stays identical.
 */
export interface SiweSession {
  address: string;
  chainId: number;
  issuedAt: number;
}

interface SiweStore {
  /** nonce -> expiry timestamp (ms). Single use: deleted on verification. */
  nonces: Map<string, number>;
  /** session token -> session */
  sessions: Map<string, SiweSession>;
}

const globalStore = globalThis as typeof globalThis & { __siweStore?: SiweStore };

export const siweStore: SiweStore =
  globalStore.__siweStore ?? (globalStore.__siweStore = { nonces: new Map(), sessions: new Map() });

export const NONCE_TTL_MS = 5 * 60 * 1000;
export const SESSION_TTL_MS = 60 * 60 * 1000;
export const SESSION_COOKIE = "chainforge_session";

export function issueNonce(nonce: string) {
  // opportunistic cleanup so the map can't grow unbounded
  const now = Date.now();
  for (const [key, expiry] of siweStore.nonces) {
    if (expiry < now) siweStore.nonces.delete(key);
  }
  siweStore.nonces.set(nonce, now + NONCE_TTL_MS);
}

/** Returns true if the nonce was valid — and burns it either way. */
export function consumeNonce(nonce: string): boolean {
  const expiry = siweStore.nonces.get(nonce);
  siweStore.nonces.delete(nonce);
  return expiry !== undefined && expiry > Date.now();
}

export function getSession(token: string | undefined): SiweSession | null {
  if (!token) return null;
  const session = siweStore.sessions.get(token);
  if (!session) return null;
  if (session.issuedAt + SESSION_TTL_MS < Date.now()) {
    siweStore.sessions.delete(token);
    return null;
  }
  return session;
}
