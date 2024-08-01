const webpack = require('webpack');

module.exports = function override(config) {
    config.resolve.fallback = {
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
        vm: require.resolve('vm-browserify'),
    };

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
    ]);

    return config;
};
