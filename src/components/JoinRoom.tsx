'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface JoinRoomProps {
    roomId: string;
    onJoin: (user: { userId: string; userName: string }) => void;
}

export default function JoinRoom({ roomId, onJoin }: JoinRoomProps) {
    const [userName, setUserName] = useState('');
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async () => {
        if (!userName.trim()) {
            setError('Please enter your name');
            return;
        }

        setJoining(true);
        setError(null);

        try {
            const response = await fetch(`/api/rooms/${roomId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName: userName.trim() })
            });

            const data = await response.json();

            if (data.success) {
                onJoin({
                    userId: data.userId,
                    userName: data.userName
                });
            } else {
                setError(data.error || 'Failed to join room');
            }
        } catch (err) {
            console.error('Error joining room:', err);
            setError('Failed to join room. Please try again.');
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-void/95 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-fade-in">
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-electric/30 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md animate-slide-up relative z-10">
                <Card className="backdrop-blur-[32px]">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-display font-bold text-white mb-3 tracking-tight">
                            Join Trip Planning
                        </h1>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-slate-400 text-sm">Room Code:</span>
                            <span className="font-mono bg-acid/10 px-3 py-1 rounded-full text-acid border border-acid/20 select-all text-sm font-semibold">
                                {roomId}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">
                                Your Name
                            </label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-lg text-white placeholder-slate-600 focus:outline-none focus:border-acid/50 transition-all"
                                placeholder="e.g. Kenji"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                                maxLength={30}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            variant="acid"
                            className="w-full"
                            onClick={handleJoin}
                            disabled={joining || !userName.trim()}
                            isLoading={joining}
                        >
                            Join Group <ArrowRight className="w-4 h-4" />
                        </Button>

                        <p className="text-center text-slate-500 text-sm">
                            💡 Up to 5 people can join this group
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
