'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

export default function CreateRoom() {
    const router = useRouter();
    const [creating, setCreating] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [mode, setMode] = useState<'create' | 'join'>('create');
    const [history, setHistory] = useState<Array<{ roomId: string, joinedAt: number }>>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedHistory = JSON.parse(localStorage.getItem('japan_trip_history') || '[]');
        setHistory(savedHistory);
    }, []);

    const addToHistory = (roomId: string) => {
        const newHistory = [
            { roomId, joinedAt: Date.now() },
            ...history.filter(h => h.roomId !== roomId)
        ].slice(0, 5);

        localStorage.setItem('japan_trip_history', JSON.stringify(newHistory));
        setHistory(newHistory);
    };

    const handleCreateRoom = async () => {
        setCreating(true);
        try {
            const response = await fetch('/api/rooms', {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                addToHistory(data.roomId);
                router.push(`/room/${data.roomId}`);
            }
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleJoinRoom = () => {
        if (!joinCode.trim()) {
            alert('Please enter a room code');
            return;
        }

        const code = joinCode.toUpperCase();
        addToHistory(code);
        router.push(`/room/${code}`);
    };

    const clearHistory = () => {
        localStorage.removeItem('japan_trip_history');
        setHistory([]);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
            {/* Ambient Glows - Enhanced */}
            <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-electric/40 rounded-full blur-[140px] animate-float pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-acid/30 rounded-full blur-[140px] animate-float pointer-events-none" style={{ animationDelay: '3s' }}></div>

            <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-5 gap-12 items-center animate-slide-up">
                {/* Left Side - Hero (40%) */}
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6">
                            <div className="w-2 h-2 bg-acid rounded-full animate-pulse-glow"></div>
                            <span className="text-sm text-slate-400">Version 2.0.25 Live</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-display font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">
                            NEON TOKYO
                        </h1>

                        <p className="text-xl text-slate-400 max-w-md">
                            Plan your perfect Tokyo trip with friends. Vote together, explore together.
                        </p>
                    </div>

                    {/* Social Proof - Overlapping Avatars */}
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric to-tokyo-pink border-2 border-void"></div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tokyo-neon to-acid border-2 border-void"></div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-acid to-electric border-2 border-void"></div>
                        </div>
                        <p className="text-sm text-slate-500">
                            Join <span className="text-white font-semibold">350+</span> travelers
                        </p>
                    </div>
                </div>

                {/* Right Side - Action Card */}
                <Card className="md:col-span-3 backdrop-blur-[32px]">
                    {/* Tabs */}
                    <div className="flex gap-6 mb-8 border-b border-white/10">
                        <button
                            onClick={() => setMode('create')}
                            className={`pb-3 text-sm font-semibold tracking-tight transition-all relative ${mode === 'create'
                                ? 'text-white'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Start New Trip
                            {mode === 'create' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-acid"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setMode('join')}
                            className={`pb-3 text-sm font-semibold tracking-tight transition-all relative ${mode === 'join'
                                ? 'text-white'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Join Existing
                            {mode === 'join' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-acid"></div>
                            )}
                        </button>
                    </div>

                    {mode === 'create' ? (
                        <div className="space-y-4">
                            <p className="text-slate-400 text-sm">
                                Create a collaborative trip planning session for up to 5 people
                            </p>
                            <Button
                                variant="acid"
                                className="w-full"
                                disabled={creating}
                                onClick={handleCreateRoom}
                                isLoading={creating}
                            >
                                Create Lobby <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">
                                    Room Code
                                </label>
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                                    placeholder="e.g., X9Z2B4"
                                    maxLength={6}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-lg text-white placeholder-slate-600 focus:outline-none focus:border-acid/50 transition-all"
                                />
                            </div>
                            <Button
                                variant="acid"
                                className="w-full"
                                disabled={joining || !joinCode.trim()}
                                onClick={handleJoinRoom}
                            >
                                Join Party <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </Card>

                {/* History - Optional */}
                {mounted && history.length > 0 && (
                    <div className="md:col-span-2 animate-fade-in">
                        <Card className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-semibold text-slate-300">Recent Trips</h3>
                                <button
                                    className="text-xs text-slate-500 hover:text-acid transition-colors"
                                    onClick={clearHistory}
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {history.map(item => (
                                    <div
                                        key={item.roomId}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-all border border-white/5 hover:border-acid/30"
                                        onClick={() => router.push(`/results/${item.roomId}`)}
                                    >
                                        <span className="font-mono text-tokyo-neon text-sm">{item.roomId}</span>
                                        <span className="text-slate-500 text-sm">→</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
