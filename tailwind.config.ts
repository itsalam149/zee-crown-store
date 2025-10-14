import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FF7C30',
                lightPrimary: 'rgba(255, 102, 14, 0.1)',
                light: '#f8e8df',
                grayBG: '#f5f5f5',
                'dark-gray': '#38434D',
                gray: '#808080',
                'light-gray': '#c2c2c2',
                'lighter-gray': '#e7e7e6',
                blue: '#327ad6',
                red: '#FF0000',
                white: '#FFF',
                black: '#000',
            },
        },
    },
    plugins: [],
};

export default config;