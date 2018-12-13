// vue.config.js
const webpack = require('webpack');

module.exports = {
    configureWebpack: {
        resolve: {
            // Use our versions of Node modules.
            alias: {
                fs: 'browserfs/dist/shims/fs.js',
                buffer: 'browserfs/dist/shims/buffer.js',
                path: 'browserfs/dist/shims/path.js',
                processGlobal: 'browserfs/dist/shims/process.js',
                bufferGlobal: 'browserfs/dist/shims/bufferGlobal.js',
                bfsGlobal: require.resolve('browserfs'),
            },
        },
        // REQUIRED to avoid issue "Uncaught TypeError: BrowserFS.BFSRequire is not a function"
        // See: https://github.com/jvilk/BrowserFS/issues/201
        module: {
            noParse: /browserfs\.js/,
        },
        plugins: [
            // Expose BrowserFS, process, and Buffer globals.
            // NOTE: If you intend to use BrowserFS in a script tag, you do not need
            // to expose a BrowserFS global.
            new webpack.ProvidePlugin({ BrowserFS: 'bfsGlobal', process: 'processGlobal', Buffer: 'bufferGlobal' }),
        ],
        // DISABLE Webpack's built-in process and Buffer polyfills!
        node: {
            process: false,
            Buffer: false,
        },
        resolve: {
            symlinks: false,
        },
    },
    pwa: {
        name: 'jsdocs - Website Builder',
        themeColor: '#4DBA87',
        msTileColor: '#000000',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',

        // configure the workbox plugin
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            // swSrc is required in InjectManifest mode.
            swSrc: 'public/service-worker.js',
        },
    },
};
