const API_URL = 'http://localhost:3000/api';

export interface MessageData {
    recipientName: string;
    content: string;
    mediaUrl?: string;
}

export const api = {
    login: async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    },

    getMessages: async () => {
        const res = await fetch(`${API_URL}/messages`);
        const data = await res.json();
        // Transform dates
        return data.map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt),
        }));
    },

    createMessage: async (data: MessageData) => {
        const res = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create');
        return res.json();
    },

    deleteMessage: async (id: string) => {
        const res = await fetch(`${API_URL}/messages/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete');
        return res.json();
    },

    getPublicMessage: async (id: string) => {
        const res = await fetch(`${API_URL}/public/messages/${id}`);
        if (!res.ok) {
            if (res.status === 404) throw new Error('Message not found');
            if (res.status === 410) throw new Error('Message expired');
            throw new Error('Error loading message');
        }
        return res.json();
    }
};
