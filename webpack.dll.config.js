// 手动单独打包的配置
const webpack = require('webpack')
const path = require("path")

module.exports = {
    mode: "production",
    entry: { // 需要单独打包的文件
        jquery: ["jquery"],
        lodash: ["lodash"]
    },
    output: {
        filename: "dll/[name].js",
        library: "[name]" // 打包之后的bundle暴露的变量名
    },
    plugins: [
        // 生成资源清单
        new webpack.DllPlugin({
            path: path.resolve(__dirname,"dll","[name].manifest.json"), // 资源清单保存的位置
            name: "[name]" // 资源清单中，暴露的变量名
        })
    ]
}