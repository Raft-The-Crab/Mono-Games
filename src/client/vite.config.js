import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react()
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './'),
            '@games': resolve(__dirname, './games'),
            '@components': resolve(__dirname, './components'),
            '@utils': resolve(__dirname, './utils'),
            '@store': resolve(__dirname, './store'),
            '@services': resolve(__dirname, './services')
        }
    },
    server: {
        port: 5173,
        open: false
    },
    build: {
        outDir: '../../dist/client',
        sourcemap: false
    }
});
