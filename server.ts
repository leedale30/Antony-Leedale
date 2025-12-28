import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Buffer } from 'buffer';

// --- Configuration ---
const PORT = process.env.PORT || 8080;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'LEEDALE666888'; // Default password
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(cors() as any);
app.use(express.json() as any);

// --- API Routes ---

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    const cleanPassword = (password || '').trim();
    
    // In a real production app, use hashed passwords and a database.
    if (cleanPassword === ADMIN_PASSWORD) {
        // Return a simple mock token
        const token = Buffer.from(cleanPassword + '-' + Date.now()).toString('base64');
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Access Code' });
    }
});

// Verify Endpoint (Optional, for session checks)
app.get('/api/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// --- Static Files (Frontend) ---
// Serve static files from the Vite build output (dist)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath) as any);

// Handle Client-Side Routing
// Send index.html for any other request
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Serving static files from: ${distPath}`);
    console.log(`Admin Password Configured: ${ADMIN_PASSWORD === 'LEEDALE666888' ? 'Default (LEEDALE...)' : 'Custom Env Var'}`);
});