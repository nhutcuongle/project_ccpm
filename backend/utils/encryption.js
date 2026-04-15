import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // 64 char hex string or custom key
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

let _keyBuf = null;
const getKey = () => {
  if (!_keyBuf) {
    if (ENCRYPTION_KEY.length === 64) {
      _keyBuf = Buffer.from(ENCRYPTION_KEY, 'hex');
    } else {
      // Fallback: hash the string to a 32-byte key
      _keyBuf = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    }
  }
  return _keyBuf;
};

/**
 * Mã hóa chuỗi văn bản
 * @param {string} text Nội dung cần mã hóa
 * @returns {string} Chuỗi trả về có dạng "iv:encryptedText", hoặc chuỗi gốc nếu lỗi/khuyết
 */
export const encryptText = (text) => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("Encryption error:", err);
    return text;
  }
};

/**
 * Giải mã chuỗi văn bản
 * @param {string} text Chuỗi có dạng "iv:encryptedText"
 * @returns {string} Trả về chuỗi nguyên gốc. Nếu text không đúng định dạng mã hóa, trả về chính nó (hỗ trợ tin nhắn cũ).
 */
export const decryptText = (text) => {
  if (!text) return text;
  const parts = text.split(":");
  // Nếu không đúng định dạng "iv:encryptedData", khả năng cao là tin nhắn cũ (plaintext)
  if (parts.length !== 2) return text;

  try {
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = Buffer.from(parts[1], "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    // Nếu giải mã lỗi (ví dụ file cũ tình cờ có dấu : nhưng ko phải hex base) -> trả về gốc
    return text;
  }
};

/**
 * Helper: Giải mã text trong object Message
 */
export const decryptMessageObj = (msg) => {
  if (!msg) return msg;
  if (msg.text) {
    msg.text = decryptText(msg.text);
  }
  return msg;
};

/**
 * Helper: Giải mã lastMessage trong object Conversation
 */
export const decryptConversationObj = (conv) => {
  if (!conv) return conv;
  if (conv.lastMessage && conv.lastMessage.text) {
    conv.lastMessage.text = decryptText(conv.lastMessage.text);
  }
  return conv;
};
