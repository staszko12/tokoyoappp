import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`
            bg-surface/60 
            backdrop-blur-glass 
            border border-white/[0.08] 
            rounded-3xl 
            p-6 
            shadow-deep
            bg-gradient-to-b from-white/[0.02] to-transparent
            ${className}
        `}>
            {children}
        </div>
    );
};

export default Card;
