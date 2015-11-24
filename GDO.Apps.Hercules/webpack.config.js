var webpack = require('webpack');

module.exports = {
    cache: true,
    debug: true,
    devtool: 'sourcemap',
    entry: [
        'webpack/hot/only-dev-server',
        './Scripts/src/control.js'
    ],
    stats: {
        colors: true,
        reasons: true
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        alias: {
            colors: './ui/colors',
            actions: './actions',
            stores: './stores',
            ui: './ui'
        }
    },
    output: {
        path: './Scripts/build/assets/',
        filename: "control.js"
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: "style!css"
            },
            {
                test: /\.jsx$|.js$/,
                exclude: /node_modules/,
                loader: 'react-hot!babel?presets[]=react,presets[]=es2015'
            }
        ]
    },
    plugins: [
    new webpack.HotModuleReplacementPlugin()
    ]
};
