import { randomBytes } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createFeedbackId() {
  const bytes = randomBytes(8);
  let body = "";
  for (let index = 0; index < 8; index += 1) {
    body += ALPHABET[bytes[index] % ALPHABET.length];
  }
  return `CNDX-${body}`;
}

export function isFeedbackId(value: string) {
  return /^CNDX-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(value);
}
