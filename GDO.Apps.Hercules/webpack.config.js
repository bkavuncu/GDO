module.exports = {
  entry: "./Scripts/src/control.jsx",
  output: {
    path: "./Scripts/build",
    filename: "control.js"
  },
  module: {
      loaders: [
        {
            test: /\.jsx$|.js$/,
            loader: 'babel',
            query: {
                presets: ['react', 'es2015']
            }
        }
      ]
  }
}
