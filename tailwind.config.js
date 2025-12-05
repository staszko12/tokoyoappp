/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['Space Grotesk', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                void: '#030305',
                surface: '#0f0f11',
                acid: '#ccff00',
                electric: '#6d28d9',
                'tokyo-pink': '#d946ef',
                'tokyo-neon': '#22d3ee',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(204, 255, 0, 0.2)',
                'glow-lg': '0 0 40px rgba(204, 255, 0, 0.3)',
                'deep': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            },
            backdropBlur: {
                'glass': '24px',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out',
                'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                'pulse-glow': 'pulseGlow 2s infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(40px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(204, 255, 0, 0.2)' },
                    '50%': { boxShadow: '0 0 40px rgba(204, 255, 0, 0.4)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
            },
        },
    },
    plugins: [],
}
