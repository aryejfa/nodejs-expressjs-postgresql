const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const key = "12345678123456781234567812345678";
const iv = crypto.randomBytes(16).toString("base64").slice(0, 16);

const encrypt = (text) => {
  const encrypter = crypto.createCipheriv(algorithm, key, iv);
  let encryptedMsg = encrypter.update(text, "utf-8", "base64");
  encryptedMsg += encrypter.final("base64");

  return encryptedMsg.toString();
};

const decrypt = (text) => {
  const decrypter = crypto.createDecipheriv(algorithm, key, iv);
  let decryptedMsg = decrypter.update(text, "base64", "utf8");
  decryptedMsg += decrypter.final("utf8");

  return decryptedMsg.toString();
};

exports.encrypt = encrypt;
exports.decrypt = decrypt;
