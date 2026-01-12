import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';

const PublicMessage = () => {
    const { id } = useParams();
    const [message, setMessage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            api.getPublicMessage(id)
                .then(setMessage)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-soft-pink">
            <div className="animate-pulse text-love-red text-xl">Loading your surprise...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">🍂</div>
                <h1 className="text-2xl font-serif text-gray-600 mb-2">Message Unavailable</h1>
                <p className="text-gray-500">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-soft-pink p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-10 left-10 text-4xl opacity-20 animate-bounce">❤️</div>
                <div className="absolute bottom-20 right-20 text-5xl opacity-20 animate-pulse">💖</div>
            </div>

            <div className="max-w-lg w-full bg-white/60 backdrop-blur-md p-10 rounded-2xl shadow-xl border border-white/50 transform transition-all hover:scale-[1.01] duration-700">
                <h1 className="text-4xl font-serif text-love-red mb-8 text-center drop-shadow-sm">
                    {message.recipientName ? `Dearest ${message.recipientName},` : 'Dearest One,'}
                </h1>

                <div className="prose prose-pink max-w-none mb-8">
                    <p className="text-xl text-gray-800 leading-loose font-light font-sans text-center whitespace-pre-wrap">
                        {message.content}
                    </p>
                </div>

                {message.mediaUrl && (
                    <div className="mb-8 rounded-lg overflow-hidden shadow-lg border-4 border-white">
                        <img src={message.mediaUrl} alt="A memory" className="w-full h-auto object-cover" />
                    </div>
                )}

                <div className="text-center mt-12 opacity-60">
                    <span className="text-xs uppercase tracking-widest text-love-red">With all my love</span>
                    <div className="mt-2 text-2xl">❤️</div>
                </div>
            </div>

            <div className="fixed bottom-4 text-center w-full text-xs text-gray-400 opacity-50">
                Valentine Keepsake
            </div>
        </div>
    );
};

export default PublicMessage;
