import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'acid' | 'primary' | 'secondary';
    isLoading?: boolean;
}

export function Button({
    children,
    className = '',
    variant = 'acid',
    isLoading = false,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'px-6 py-3 rounded-full font-bold tracking-tight transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

    const variantStyles = {
        acid: 'bg-acid text-black hover:shadow-glow-lg hover:scale-105 active:scale-95',
        primary: 'bg-white text-black hover:bg-white/90 hover:scale-105 active:scale-95',
        secondary: 'bg-white/5 text-white border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-white/20'
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}
