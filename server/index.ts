import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

dotenv.config();

const app = express();
// Initialize Supabase Client
// Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are in your .env file
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// --- ADMIN API ---

// Admin Login
app.post('/api/login', async (req, res) => {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@valentine.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'love123';

    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        res.json({ token: 'valid-session-token', user: { email: ADMIN_EMAIL } });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// List all messages (Admin only)
app.get('/api/messages', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Message')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Create Message
app.post('/api/messages', async (req, res) => {
    try {
        const { recipientName, content, mediaUrl, expiresAt } = req.body;

        const { data, error } = await supabase
            .from('Message')
            .insert({
                recipientName,
                content,
                mediaUrl,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            })
            .select()
            .single();

        if (error) throw error;

        // Generate QR Code Data URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const accessUrl = `${frontendUrl}/m/${data.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(accessUrl);

        res.json({ ...data, accessUrl, qrCodeDataUrl });
    } catch (error) {
        console.error("Create Message Error:", error);
        res.status(500).json({ error: 'Failed to create message' });
    }
});

// Delete Message
app.delete('/api/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('Message')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// --- PUBLIC API ---

// Public Get Message
app.get('/api/public/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: message, error } = await supabase
            .from('Message')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Check expiration
        if (message.expiresAt && new Date() > new Date(message.expiresAt)) {
            return res.status(410).json({ error: 'This message has faded away...' });
        }

        // Mark as viewed
        if (!message.isViewed) {
            // Fire and forget update (or await if strict consistency needed)
            await supabase
                .from('Message')
                .update({ isViewed: true })
                .eq('id', id);
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching message' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
