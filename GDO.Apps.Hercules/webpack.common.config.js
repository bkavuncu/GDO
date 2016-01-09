var path = require('path');

module.exports = {
    devtool: 'sourcemap',
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
    }
};
