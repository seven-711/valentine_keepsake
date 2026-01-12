import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// --- ADMIN API ---

// Admin Login (Simple hardcoded for now, can be expanded to DB later)
app.post('/api/login', async (req, res) => {
    // TODO: Use DB-based auth in production
    // For now, checks env var or default
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@valentine.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'love123';

    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Return a simple mock token
        res.json({ token: 'valid-session-token', user: { email: ADMIN_EMAIL } });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// List all messages (Admin only)
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Create Message
app.post('/api/messages', async (req, res) => {
    try {
        const { recipientName, content, mediaUrl, expiresAt } = req.body;
        const message = await prisma.message.create({
            data: {
                recipientName,
                content,
                mediaUrl,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
        });

        // Generate QR Code Data URL
        // In prod, this URL should point to the deployed frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const accessUrl = `${frontendUrl}/m/${message.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(accessUrl);

        res.json({ ...message, accessUrl, qrCodeDataUrl });
    } catch (error) {
        console.error("Create Message Error:", error);
        res.status(500).json({ error: 'Failed to create message' });
    }
});

// Delete Message
app.delete('/api/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.message.delete({ where: { id } });
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
        const message = await prisma.message.findUnique({
            where: { id },
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Check expiration
        if (message.expiresAt && new Date() > message.expiresAt) {
            return res.status(410).json({ error: 'This message has faded away...' });
        }

        // Mark as viewed (update asynchronously to not block response)
        // We only mark it if it wasn't viewed, or just update last viewed count if we had one.
        // For now, just setting isViewed = true
        if (!message.isViewed) {
            await prisma.message.update({
                where: { id },
                data: { isViewed: true }
            });
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
