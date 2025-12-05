'use client';

import { useRouter } from 'next/navigation';
import { Users, Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface User {
    userId: string;
    userName: string;
    isReady: boolean;
}

interface Room {
    roomId: string;
    users?: User[];
    itinerary?: any;
}

interface GroupStatusProps {
    room: Room | null;
    currentUser: { userId: string; userName: string };
}

const AVATAR_COLORS = [
    'bg-gradient-to-br from-electric to-tokyo-pink',
    'bg-gradient-to-br from-tokyo-neon to-acid',
    'bg-gradient-to-br from-acid to-electric',
    'bg-gradient-to-br from-tokyo-pink to-electric',
    'bg-gradient-to-br from-acid to-tokyo-neon',
];

export default function GroupStatus({ room, currentUser }: GroupStatusProps) {
    const router = useRouter();

    if (!room) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-acid animate-spin" />
            </div>
        );
    }

    const readyCount = room.users?.filter(u => u.isReady).length || 0;
    const totalUsers = room.users?.length || 0;
    const allReady = readyCount === 5 && totalUsers === 5;
    const itineraryReady = room.itinerary !== null;

    return (
        <div className="min-h-screen bg-void p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Glows - Enhanced */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-electric/40 rounded-full blur-[140px] animate-float pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-acid/30 rounded-full blur-[140px] animate-float pointer-events-none" style={{ animationDelay: '3s' }}></div>

            <div className="relative z-10 w-full max-w-4xl animate-slide-up">
                <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                    <div>
                        <h2 className="text-4xl font-display font-bold text-white tracking-tight">
                            {itineraryReady ? 'Results Ready!' : allReady ? 'Generating...' : 'Lobby'}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-slate-400 text-sm">Room Code:</span>
                            <span className="font-mono bg-acid/10 px-3 py-1.5 rounded-full text-acid border border-acid/20 select-all text-sm font-semibold">
                                {room.roomId}
                            </span>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                        <Users className="w-4 h-4 text-acid" />
                        <span className="text-white font-medium">{totalUsers} of 5</span>
                    </div>
                </header>

                {itineraryReady ? (
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="inline-block p-4 rounded-full bg-gradient-to-br from-acid/20 to-electric/20 mb-6 shadow-glow">
                            <Sparkles className="w-12 h-12 text-acid" />
                        </div>
                        <h1 className="text-5xl font-display font-bold text-white mb-4 tracking-tight">Itinerary Ready!</h1>
                        <p className="text-slate-400 text-lg mb-8">Your group trip has been planned by Gemini AI</p>
                        <Button variant="acid" onClick={() => router.push(`/results/${room.roomId}`)}>
                            View Results <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                ) : allReady ? (
                    <div className="text-center mb-12">
                        <Loader2 className="w-16 h-16 text-acid animate-spin mx-auto mb-6" />
                        <h1 className="text-5xl font-display font-bold text-white mb-4 tracking-tight">Generating Your Itinerary</h1>
                        <p className="text-slate-400 text-lg">Gemini AI is creating the perfect trip for your group</p>
                    </div>
                ) : (
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-acid/10 px-4 py-2 rounded-full border border-acid/20 mb-6">
                            <CheckCircle2 className="w-5 h-5 text-acid" />
                            <span className="text-white font-semibold">Votes Submitted!</span>
                        </div>
                        <h1 className="text-4xl font-display font-bold text-white mb-4 tracking-tight">Waiting for Others</h1>
                        <p className="text-slate-400 text-lg mb-6">We'll generate the itinerary when everyone has voted</p>
                        <div className="w-full max-w-md mx-auto bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-acid to-electric transition-all duration-500"
                                style={{ width: `${(readyCount / 5) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-slate-400 mt-3 text-sm">{readyCount} / 5 users ready</p>
                    </div>
                )}

                {/* Bento Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {room.users?.map((user, index) => (
                        <div key={user.userId} className="relative group">
                            <div className={`
                                h-48 flex flex-col items-center justify-center gap-4 
                                bg-surface/60 backdrop-blur-glass rounded-3xl p-4 
                                border transition-all duration-300
                                ${user.isReady
                                    ? 'border-acid shadow-glow'
                                    : 'border-white/10 hover:border-white/20'
                                }
                            `}>
                                <div className={`w-20 h-20 rounded-full ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center text-2xl font-bold text-white shadow-deep`}>
                                    {user.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-semibold">
                                        {user.userName}
                                        {user.userId === currentUser.userId && ' (you)'}
                                    </p>
                                    <span className={`text-xs px-3 py-1 rounded-full mt-2 inline-block font-medium ${user.isReady
                                        ? 'bg-acid/20 text-acid border border-acid/30'
                                        : 'bg-white/5 text-slate-400 border border-white/10'
                                        }`}>
                                        {user.isReady ? 'Ready' : 'Voting...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {totalUsers < 5 && [...Array(5 - totalUsers)].map((_, i) => (
                        <div key={`empty-${i}`} className="relative">
                            <div className="h-48 flex flex-col items-center justify-center gap-4 bg-white/[0.02] rounded-3xl p-4 border border-white/5 border-dashed">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-700">
                                    <Users className="w-8 h-8" />
                                </div>
                                <p className="text-slate-600 text-sm font-medium">Empty slot</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center text-slate-500 text-sm">
                    💡 Share the room code with friends to fill all 5 slots!
                </div>
            </div>
        </div>
    );
}
