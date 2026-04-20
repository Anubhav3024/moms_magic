import crypto from "crypto";

const KEYLEN = 64;
const SCRYPT_OPTIONS: crypto.ScryptOptions = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};

const encode = (buf: Buffer) => buf.toString("base64");
const decode = (val: string) => Buffer.from(val, "base64");

export function hashPassword(password: string): string {
  const normalized = String(password || "");
  if (normalized.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(normalized, salt, KEYLEN, SCRYPT_OPTIONS);
  return `scrypt$${encode(salt)}$${encode(derived)}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const normalized = String(password || "");
  const parts = String(stored || "").split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt" || parts[1] !== "") {
    return false;
  }

  const salt = decode(parts[2]);
  const expected = decode(parts[3]);
  const actual = crypto.scryptSync(normalized, salt, expected.length, SCRYPT_OPTIONS);
  return (
    expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
  );
}

