import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    recipientName: string | null;
    content: string;
    createdAt: Date;
    isViewed: boolean;
    mediaUrl?: string;
}

const AdminDashboard = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // New Message State
    const [recipientName, setRecipientName] = useState('');
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [createdQrData, setCreatedQrData] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        loadMessages();
    }, [navigate]);

    const loadMessages = async () => {
        try {
            const data = await api.getMessages();
            setMessages(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.deleteMessage(id);
            setMessages(messages.filter(m => m.id !== id));
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.createMessage({
                recipientName,
                content,
                mediaUrl
            });
            setMessages([res, ...messages]);
            setCreatedQrData(res.qrCodeDataUrl);
            setRecipientName('');
            setContent('');
            setMediaUrl('');
        } catch (err) {
            alert('Error creating message');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Keepsake Dashboard</h1>
                        <p className="text-sm text-gray-500">Manage your Valentine messages</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-love-red text-white px-6 py-2 rounded-full hover:bg-pink-600 shadow-md transition-all flex items-center gap-2"
                    >
                        <span>+</span> New Message
                    </button>
                </header>

                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
                            <button onClick={() => { setShowModal(false); setCreatedQrData(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

                            {!createdQrData ? (
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <h2 className="text-xl font-bold text-gray-800">Create New Keepsake</h2>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Recipient Name (Optional)</label>
                                        <input value={recipientName} onChange={e => setRecipientName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 border p-2 focus:ring-love-red focus:border-love-red" placeholder="e.g. My Love" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Message Content</label>
                                        <textarea required value={content} onChange={e => setContent(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 border p-2 focus:ring-love-red focus:border-love-red" placeholder="Write something from the heart..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Media URL (Image/Video) - Optional</label>
                                        <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 border p-2 focus:ring-love-red focus:border-love-red" placeholder="https://..." />
                                    </div>
                                    <button type="submit" className="w-full bg-love-red text-white py-3 rounded-lg hover:bg-pink-700 font-semibold shadow-lg">
                                        Generate QR Code
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center space-y-6">
                                    <h3 className="text-2xl font-bold text-love-red">It's Ready!</h3>
                                    <div className="flex justify-center">
                                        <img src={createdQrData} alt="QR Code" className="w-64 h-64 border-4 border-gray-100 rounded-xl shadow-inner" />
                                    </div>
                                    <p className="text-sm text-gray-500">Scan this code to test, or save the image to print.</p>
                                    <div className="flex gap-4 justify-center">
                                        <a href={createdQrData} download="valentine-qr.png" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800">Download PNG</a>
                                        <button onClick={() => { setCreatedQrData(null); setShowModal(false); loadMessages(); }} className="text-gray-600 hover:text-gray-900 px-4 py-2">Done</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message Preview</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading messages...</td></tr>
                            ) : messages.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No messages yet. Create one!</td></tr>
                            ) : messages.map((msg) => (
                                <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{msg.recipientName || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{msg.content}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(msg.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {msg.isViewed ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Opened</span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Unopened</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(msg.id)} className="text-red-400 hover:text-red-600 transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
