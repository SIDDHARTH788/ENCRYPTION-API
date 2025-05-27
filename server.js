require('dotenv').config();
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from(process.env.SECRET_KEY, 'base64');

// 🔐 Encrypt Function
function encrypt(text) {
  const iv = crypto.randomBytes(16); // Unique IV for each encryption
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
}

// 🔓 Decrypt Function
function decrypt(encryptedData, ivHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 🔸 Encrypt Route
app.post('/encrypt', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const result = encrypt(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Encryption failed', details: err.message });
  }
});

// 🔹 Decrypt Route
app.post('/decrypt', (req, res) => {
  const { encryptedData, iv } = req.body;
  if (!encryptedData || !iv)
    return res.status(400).json({ error: 'encryptedData and iv are required' });

  try {
    const decryptedText = decrypt(encryptedData, iv);
    res.json({ decryptedText });
  } catch (err) {
    res.status(500).json({ error: 'Decryption failed', details: err.message });
  }
});

// 🚀 Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Encryption API running on http://localhost:${PORT}`);
});
