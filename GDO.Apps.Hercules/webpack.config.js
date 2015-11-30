var webpack = require('webpack');

module.exports = {
    cache: true,
    debug: true,
    devtool: 'sourcemap',
    entry: [
        'webpack/hot/only-dev-server',
        './Scripts/src/Hercules.js'
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
        publicPath: '/assets/',
        filename: "Hercules.js"
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
