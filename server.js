import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create storage directory if it doesn't exist
const storageDir = path.join(__dirname, 'user_storage');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Encryption functions
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Generate sync code for cross-device API key sharing
function generateSyncCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Validate sync code format
function isValidSyncCode(code) {
  return /^[A-F0-9]{8}$/.test(code);
}

// Store API key with sync code
app.post('/api/store-key', async (req, res) => {
    try {
        const { apiKey, config, syncCode } = req.body;
        
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }
        
        let finalSyncCode = syncCode;
        
        // If no sync code provided, generate a new one
        if (!finalSyncCode) {
            finalSyncCode = generateSyncCode();
        } else if (!isValidSyncCode(finalSyncCode)) {
            return res.status(400).json({ error: 'Invalid sync code format' });
        }
        
        const encryptedData = encrypt(JSON.stringify({ 
            apiKey, 
            config, 
            timestamp: Date.now(),
            syncCode: finalSyncCode
        }));
        const filePath = path.join(storageDir, `${finalSyncCode}.dat`);
        
        fs.writeFileSync(filePath, encryptedData);
        
        res.json({ 
            success: true, 
            message: 'API key stored securely',
            syncCode: finalSyncCode
        });
    } catch (error) {
        console.error('Error storing API key:', error);
        res.status(500).json({ error: 'Failed to store API key' });
    }
});

// Retrieve API key using sync code
app.post('/api/get-key', async (req, res) => {
    try {
        const { syncCode } = req.body;
        
        if (!syncCode || !isValidSyncCode(syncCode)) {
            return res.status(400).json({ error: 'Valid sync code is required' });
        }
        
        const filePath = path.join(storageDir, `${syncCode}.dat`);
        
        if (!fs.existsSync(filePath)) {
            return res.json({ found: false, error: 'Sync code not found' });
        }
        
        const encryptedData = fs.readFileSync(filePath, 'utf8');
        const decryptedData = JSON.parse(decrypt(encryptedData));
        
        res.json({ 
            found: true, 
            apiKey: decryptedData.apiKey, 
            config: decryptedData.config || {},
            syncCode: decryptedData.syncCode,
            lastUpdated: decryptedData.timestamp 
        });
    } catch (error) {
        console.error('Error retrieving API key:', error);
        res.status(500).json({ error: 'Failed to retrieve API key' });
    }
});

// Delete stored API key using sync code
app.delete('/api/delete-key', async (req, res) => {
    try {
        const { syncCode } = req.body;
        
        if (!syncCode || !isValidSyncCode(syncCode)) {
            return res.status(400).json({ error: 'Valid sync code is required' });
        }
        
        const filePath = path.join(storageDir, `${syncCode}.dat`);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.json({ success: true, message: 'API key deleted' });
    } catch (error) {
        console.error('Error deleting API key:', error);
        res.status(500).json({ error: 'Failed to delete API key' });
    }
});

app.post('/api/gemini', async (req, res) => {
    const { message, model = 'gemini-1.5-flash', temperature = 0.7, maxTokens = 1024 } = req.body;
    
    // Always use the built-in API key from environment
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: No API key configured' });
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }],
                generationConfig: {
                    temperature: temperature,
                    maxOutputTokens: maxTokens
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: error.message || 'API call failed' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));