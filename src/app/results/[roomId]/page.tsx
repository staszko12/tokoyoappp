'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, Loader2, ArrowLeft, Clock, Banknote, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/Button';
import Map from '@/components/Map';

export default function ResultsPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadResults() {
            try {
                const response = await fetch(`/api/rooms?roomId=${roomId}`);
                const data = await response.json();

                if (data.success) {
                    setRoom(data);
                } else {
                    setError('Room not found');
                }
            } catch (err) {
                console.error('Error loading results:', err);
                setError('Failed to load results');
            } finally {
                setLoading(false);
            }
        }

        loadResults();
    }, [roomId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-acid animate-spin" />
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-3xl font-display font-bold text-white mb-4 tracking-tight">{error || 'Room not found'}</h1>
                    <Button variant="acid" onClick={() => router.push('/')}>Back to Home</Button>
                </div>
            </div>
        );
    }

    if (!room.itinerary) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-3xl font-display font-bold text-white mb-4 tracking-tight">No Itinerary Yet</h1>
                    <p className="text-slate-400 mb-6">This group hasn't completed voting yet.</p>
                    <Button variant="acid" onClick={() => router.push('/')}>Back to Home</Button>
                </div>
            </div>
        );
    }

    const itinerary = room.itinerary;
    const places = itinerary.itinerary.map((item: any) => item.place);

    return (
        <div className="min-h-screen bg-void">
            {/* Editorial Header - Centered, Massive Typography */}
            <header className="text-center py-16 px-4 relative overflow-hidden animate-fade-in">
                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-acid/20 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <button
                        onClick={() => router.push('/')}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-acid transition-colors mb-6 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </button>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-acid/10 border border-acid/20 mb-6">
                        <Sparkles className="w-4 h-4 text-acid animate-pulse" />
                        <span className="text-acid font-mono text-sm font-semibold">{roomId}</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-display font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">
                        Tokyo Un-locked
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                        {itinerary.overview}
                    </p>

                    <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-acid" />
                            <span>{itinerary.totalEstimatedTime}</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-acid" />
                            <span>{itinerary.totalEstimatedCost}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Two-Column Layout */}
            <div className="max-w-7xl mx-auto px-4 pb-16 grid md:grid-cols-3 gap-8">
                {/* Left Column - Stats/Group Favorites */}
                <div className="md:col-span-1 space-y-6 animate-slide-up">
                    <div className="bg-surface/60 backdrop-blur-glass border border-white/[0.08] rounded-3xl p-6 shadow-deep sticky top-6">
                        <h3 className="text-sm uppercase tracking-widest text-acid font-semibold mb-6">Group Favorites</h3>
                        <div className="space-y-4">
                            {places.slice(0, 5).map((place: any, idx: number) => (
                                <div key={place.id} className="flex items-center gap-3">
                                    <span className="text-2xl font-display font-bold text-white/20">{idx + 1}</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-white text-sm">{place.name}</p>
                                        <p className="text-xs text-slate-500">{place.description?.substring(0, 40)}...</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Timeline */}
                <div className="md:col-span-2 space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {/* Vertical Timeline */}
                    <div className="relative border-l-2 border-white/10 ml-6 space-y-12">
                        {itinerary.itinerary.map((item: any, index: number) => (
                            <div key={item.place.id} className="relative pl-10">
                                {/* Timeline Dot - Calendar Icon */}
                                <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-acid flex items-center justify-center shadow-glow">
                                    <Calendar className="w-3 h-3 text-black" />
                                </div>

                                <div className="bg-surface/60 backdrop-blur-glass border border-white/[0.08] rounded-3xl overflow-hidden shadow-deep hover:border-white/20 transition-all">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-xs font-mono text-acid tracking-wider">DAY {index + 1}</span>
                                                <h3 className="text-2xl font-display font-bold text-white tracking-tight mt-1">
                                                    {item.place.name}
                                                </h3>
                                            </div>
                                            {item.place.isAiSuggestion && (
                                                <div className="inline-flex items-center gap-1 text-xs text-tokyo-pink bg-tokyo-pink/10 px-3 py-1 rounded-full border border-tokyo-pink/20">
                                                    <Sparkles className="w-3 h-3" /> AI Pick
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-slate-400 mb-6 leading-relaxed">
                                            {item.place.description}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                            <div>
                                                <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Duration</span>
                                                <span className="text-white font-semibold">{item.timeAllocation}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Best Time</span>
                                                <span className="text-white font-semibold">{item.recommendedTime}</span>
                                            </div>
                                        </div>

                                        {item.tourGuideInsight && (
                                            <div className="mt-4 p-4 bg-electric/10 border border-electric/20 rounded-2xl">
                                                <strong className="block text-electric text-xs uppercase tracking-wider mb-2">💡 Insider Tip</strong>
                                                <p className="text-slate-300 text-sm leading-relaxed">{item.tourGuideInsight}</p>
                                            </div>
                                        )}
                                    </div>

                                    {item.commuteToNext && (
                                        <div className="px-6 pb-6">
                                            <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-sm text-slate-400">
                                                <span>{getTransportIcon(item.commuteToNext.method)}</span>
                                                <span>{item.commuteToNext.method}</span>
                                                <span className="text-slate-600">•</span>
                                                <span>{item.commuteToNext.duration}</span>
                                                <span className="text-slate-600">•</span>
                                                <span className="text-slate-500">{item.commuteToNext.details}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Map - Full Width Below */}
            <div className="h-[600px] w-full">
                <Map
                    places={places}
                    loading={false}
                    viewMode="itinerary"
                />
            </div>
        </div>
    );
}

function getTransportIcon(method: string) {
    const icons: Record<string, string> = {
        'Train': '🚆',
        'Walking': '🚶',
        'Walk': '🚶',
        'Bus': '🚌',
        'Taxi': '🚕',
        'Subway': '🚇',
        'Metro': '🚇'
    };
    return icons[method] || '🚶';
}
