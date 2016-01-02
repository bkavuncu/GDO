var webpack = require('webpack'),
    path = require('path');

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
        root: path.resolve('./Scripts/src/'),
        extensions: ['', '.js', '.jsx'],
        alias: {
            colors: 'ui/Colors',
            actions: 'actions',
            stores: 'stores',
            ui: 'ui'
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
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline'
            }
        ]
    },
    plugins: [
    new webpack.HotModuleReplacementPlugin()
    ]
};
