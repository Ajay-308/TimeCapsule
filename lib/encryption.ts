// lib/encryption.ts

const ALGORITHM = { name: "AES-GCM", length: 256 };
const IV_LENGTH = 12;
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 100_000;

export class CapsuleEncryption {
  static generateKey(): string {
    // 32 bytes random key → hex
    const key = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(key)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  static async encrypt(
    text: string,
    masterKey: string
  ): Promise<{ encrypted: string; key: string }> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // derive key with PBKDF2
    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(masterKey),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      baseKey,
      ALGORITHM,
      false,
      ["encrypt", "decrypt"]
    );

    const encoded = new TextEncoder().encode(text);
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt({ name: "AES-GCM", iv }, derivedKey, encoded)
    );

    // store as hex: [salt | iv | ciphertext]
    const payload = CapsuleEncryption.toHex(
      CapsuleEncryption.concatBuffers(salt, iv, ciphertext)
    );

    return { encrypted: payload, key: masterKey };
  }

  static async decrypt(
    encryptedData: string,
    masterKey: string
  ): Promise<string> {
    const data = CapsuleEncryption.fromHex(encryptedData);

    const salt = data.slice(0, SALT_LENGTH);
    const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH);

    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(masterKey),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      baseKey,
      ALGORITHM,
      false,
      ["decrypt"]
    );

    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      derivedKey,
      ciphertext
    );

    return new TextDecoder().decode(plaintext);
  }

  // Helpers
  private static concatBuffers(...buffers: Uint8Array[]): Uint8Array {
    let totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
    let result = new Uint8Array(totalLength);
    let offset = 0;
    for (let b of buffers) {
      result.set(b, offset);
      offset += b.length;
    }
    return result;
  }

  private static toHex(buffer: Uint8Array): string {
    return Array.from(buffer)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private static fromHex(hex: string): Uint8Array {
    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return arr;
  }
}
