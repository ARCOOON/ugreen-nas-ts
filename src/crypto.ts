/**
 * RSA PKCS#1 v1.5 encryption for Node.js and Browser environments.
 */

import * as nodeCrypto from "crypto";

export function rsaEncryptPkcs1(plaintext: string, base64Pem: string): string {
  let pem = base64ToString(base64Pem);

  // The UGOS server sends SPKI ASN.1 payload wrapped in "-----BEGIN RSA PUBLIC KEY-----"
  // Normalize header so OpenSSL recognizes SubjectPublicKeyInfo format
  if (pem.includes("MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A") && pem.includes("RSA PUBLIC KEY")) {
    pem = pem.replace(/RSA PUBLIC KEY/g, "PUBLIC KEY");
  }

  const buffer = Buffer.from(plaintext, "utf-8");
  const encrypted = nodeCrypto.publicEncrypt(
    {
      key: pem,
      padding: nodeCrypto.constants.RSA_PKCS1_PADDING,
    },
    buffer
  );
  return encrypted.toString("base64");
}

function base64ToString(val: string): string {
  try {
    const decoded = Buffer.from(val, "base64").toString("utf-8");
    if (decoded.includes("-----BEGIN")) {
      return decoded;
    }
  } catch {}
  return val;
}
