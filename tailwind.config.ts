import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            colors: {
                primary: '#FF7C30',
                'primary-hover': '#E86A20',
                lightPrimary: 'rgba(255, 102, 14, 0.1)',
                grayBG: '#f7f8fa',
                'dark-gray': '#1a202c', // Deeper black for text
                gray: '#718096',
                'light-gray': '#a0aec0',
                'lighter-gray': '#edf2f7',
                red: '#e53e3e',
                white: '#FFF',
            },
            boxShadow: {
                'subtle': '0 4px 12px rgba(0, 0, 0, 0.05)',
                'medium': '0 10px 20px rgba(0, 0, 0, 0.07)',
                'lifted': '0 20px 40px rgba(0, 0, 0, 0.1)',
            },
            transitionTimingFunction: {
                'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
            },
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
            },
        },
    },
    plugins: [], // Removed the 3D plugin
};

export default config;