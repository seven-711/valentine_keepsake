import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const Home = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await api.login(email, password);
            localStorage.setItem('token', data.token);
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-soft-pink">
            <div className="max-w-md w-full p-8 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-love-red font-serif">Valentine Keepsake</h1>
                    <p className="text-gray-500 mt-2">Creator Login</p>
                </div>
                {error && <div className="mb-4 bg-red-50 text-red-500 p-3 rounded text-sm text-center">{error}</div>}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-love-red focus:ring-love-red p-3 border outline-none transition-colors"
                            placeholder="admin@valentine.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-love-red focus:ring-love-red p-3 border outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="w-full bg-love-red text-white py-3 rounded-lg hover:bg-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        Enter Integration
                    </button>
                    <div className="text-center text-xs text-gray-400 mt-4">
                        Default: admin@valentine.com / love123
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Home;
