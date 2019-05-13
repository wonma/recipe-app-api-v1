// node.js에 의해 해석됨
// config object만들기

const path = require('path')

module.exports = {
    entry: {
        main: ['babel-polyfill', './src/scripts/main.js'],
        edit: ['babel-polyfill', './src/scripts/edit.js'],
        index: ['babel-polyfill', './src/scripts/index.js'],
        view: ['babel-polyfill', './src/scripts/view.js']
    },  
    output: {
        path: path.resolve(__dirname, 'public/scripts'),
        filename: '[name]-bundle.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {  // what loader to use
                loader: 'babel-loader',
                options: {
                    presets: ['env'], // 여러개 있지만 env만 사용
                    plugins: ['transform-object-rest-spread']
                }
            }
        }]
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'public'),  // what to serve, absolute path
        publicPath: '/scripts/'  // public기준으로 어딜가야 webpack이 감지할 파일(assets)있는지
    },
    devtool: 'source-map'
}

//  Original absolute path
//  /Users/wonmikwon/Desktop/Learning/01_ Front-end/06. JS Bootcamp_ by Andrew/boilerplate

//  Using '__dirname'
//  path: __dirname + '/public/scripts' 이건 안됨 OS마다 달라서
//  node.js library 사용해줘야해: require로 임포트해옴