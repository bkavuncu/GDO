var webpack = require('webpack'),
    path = require('path'),
    commonConfig = require('./webpack.common.config.js'),
    _ = require('underscore');

module.exports = _.extend({}, commonConfig, {
    cache: true,
    debug: true,
    entry: [
        'webpack/hot/only-dev-server',
        './Scripts/src/Hercules.js'
    ],
    output: {
        publicPath: '/assets/',
        filename: "Hercules.js"
    },
    plugins: [
    new webpack.HotModuleReplacementPlugin()
    ]
});
