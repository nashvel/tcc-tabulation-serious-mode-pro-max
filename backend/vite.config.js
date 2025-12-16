import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ mode }) => {
    // Load env file
    const env = loadEnv(mode, process.cwd(), '');
    const host = env.VITE_DEV_SERVER_HOST || 'localhost';

    // Custom plugin to rewrite the hot file with correct host
    const rewriteHotFile = () => ({
        name: 'rewrite-hot-file',
        configureServer(server) {
            server.httpServer?.once('listening', () => {
                const hotFile = path.resolve(__dirname, 'public/hot');
                setTimeout(() => {
                    if (fs.existsSync(hotFile)) {
                        fs.writeFileSync(hotFile, `http://${host}:5173`);
                        console.log(`\n  ✓ Hot file set to: http://${host}:5173\n`);
                    }
                }, 100);
            });
        },
    });

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.js'],
                refresh: true,
                detectTls: false,
            }),
            vue({
                template: {
                    transformAssetUrls: {
                        base: null,
                        includeAbsolute: false,
                    },
                },
            }),
            tailwindcss(),
            rewriteHotFile(),
        ],
        resolve: {
            alias: {
                vue: 'vue/dist/vue.esm-bundler.js',
            },
        },
        server: {
            host: '0.0.0.0',
            port: 5173,
            strictPort: true,
            cors: true,
            origin: `http://${host}:5173`,
            hmr: {
                host: host,
            },
        },
    };
});
