var webpack = require('webpack'),
    path = require('path'),
    commonConfig = require('./webpack.common.config.js'),
    _ = require('underscore');

module.exports = _.extend({}, commonConfig, {
    cache: true,
    debug: false,
    console: false,
    entry: [
        './Scripts/src/Hercules.js'
    ],
    output: {
        path: './Web/Hercules/assets/',
        filename: "HerculesControl.js"
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false
            }
        })
    ]
});
