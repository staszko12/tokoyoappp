import { Heart, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './Button';

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'vibe', label: 'Vibe' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'old-sightseeing', label: 'Old Sights' },
    { id: 'nature', label: 'Nature' },
    { id: 'modern', label: 'Modern' },
];

const AVATAR_COLORS = [
    'bg-gradient-to-br from-electric to-tokyo-pink',
    'bg-gradient-to-br from-tokyo-neon to-acid',
    'bg-gradient-to-br from-acid to-electric',
    'bg-gradient-to-br from-tokyo-pink to-electric',
    'bg-gradient-to-br from-acid to-tokyo-neon',
];

interface Place {
    id: string;
    name: string;
    tags?: string[];
    image?: string;
    votes?: number;
    aiDescription?: string;
    googleMapsUrl?: string;
    osmUrl?: string;
}

interface SidebarProps {
    places: Place[];
    onVote: (id: string) => void;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    activeCity?: string;
    onCityChange?: (city: string) => void;
    onFinish: () => void;
    loading: boolean;
    error?: string | null;
    roomInfo?: any;
    currentUser?: any;
}

export default function Sidebar({
    places,
    onVote,
    activeFilter,
    onFilterChange,
    activeCity,
    onCityChange,
    onFinish,
    loading,
    error,
    roomInfo,
    currentUser
}: SidebarProps) {
    return (
        <aside className="fixed md:relative z-40 inset-0 md:inset-auto w-full md:w-[500px] bg-surface/60 backdrop-blur-[32px] md:border-r border-white/10 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-b from-white/[0.02] to-transparent">
                <h2 className="text-3xl font-display font-bold text-white mb-3 tracking-tight">Discover</h2>
                {roomInfo && currentUser && (
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <span>👤 {currentUser.userName}</span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono text-acid">{roomInfo.roomId}</span>
                        <span className="text-white/20">•</span>
                        <span>{roomInfo.totalUsers}/5</span>
                    </div>
                )}

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {FILTERS.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeFilter === filter.id
                                ? 'bg-acid text-black shadow-glow'
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <Loader2 className="w-10 h-10 text-acid animate-spin mb-4" />
                    <p className="text-slate-400">Loading places...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-400">
                        {error}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && places.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-6">
                    <p className="text-slate-500">No places found. Try a different filter.</p>
                </div>
            )}

            {/* Places List - Horizontal Cards */}
            {!loading && !error && places.length > 0 && (
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {places.map((place) => (
                        <div
                            key={place.id}
                            className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            <div className="flex gap-4 p-4">
                                {/* Image */}
                                {place.image && (
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                                        <img
                                            src={place.image}
                                            alt={place.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white leading-tight mb-1">
                                        {place.name}
                                    </h3>
                                    {place.tags && place.tags.length > 0 && (
                                        <span className="text-xs text-acid uppercase tracking-wide">
                                            {place.tags.join(' • ')}
                                        </span>
                                    )}
                                    {place.aiDescription && (
                                        <p className="text-slate-400 text-sm line-clamp-2 mt-2">
                                            {place.aiDescription}
                                        </p>
                                    )}
                                </div>

                                {/* Vote Button */}
                                <button
                                    onClick={() => onVote(place.id)}
                                    className="flex-shrink-0 w-12 h-12 rounded-full bg-acid hover:bg-acid/80 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center shadow-glow-lg animate-pulse-glow"
                                >
                                    <Heart className="w-5 h-5 fill-black text-black" />
                                </button>
                            </div>

                            {/* Vote Indicators */}
                            {roomInfo?.votes && (
                                <div className="px-4 pb-4 flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {roomInfo.votes.filter((v: any) => v.placeId === place.id).map((v: any, i: number) => {
                                            const voter = roomInfo.users?.find((u: any) => u.id === v.userId);
                                            const voterIndex = roomInfo.users?.findIndex((u: any) => u.id === v.userId) || 0;
                                            const color = AVATAR_COLORS[voterIndex % AVATAR_COLORS.length];

                                            if (!voter) return null;

                                            return (
                                                <div
                                                    key={i}
                                                    className={`w-7 h-7 rounded-full border-2 border-surface ${color} flex items-center justify-center text-[10px] font-bold text-white shadow-deep`}
                                                    title={voter.name}
                                                >
                                                    {voter.name.charAt(0).toUpperCase()}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {(place.votes && place.votes > 0) && (
                                        <span className="text-xs text-slate-500">
                                            {place.votes} vote{place.votes !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Footer with Submit Button */}
            <div className="p-6 border-t border-white/10 bg-gradient-to-t from-white/[0.02] to-transparent">
                <Button variant="acid" onClick={onFinish} className="w-full" isLoading={loading} disabled={loading}>
                    Generate Itinerary <Sparkles className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </aside>
    );
}
