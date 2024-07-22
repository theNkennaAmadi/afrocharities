import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                about: './about.js',
                archive: './archive.js',
                community: './community.js',
                faq: './faq.js',
                g_template: './g-template.js',
                global: './global.js',
                main: './main.js',
                program: './program.js',
                upton: './upton.js',
                // You can add more entry points here if you have more JavaScript files
            },
            output: {
                minify: true, // Disable minification
                cssCodeSplit: false, // Disable CSS code splitting
                target: 'esnext', // Use the latest ECMAScript features
                manualChunks: {}, // Disables code splitting
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },

    },
});