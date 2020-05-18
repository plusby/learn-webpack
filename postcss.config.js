module.exports = { // 配置postcss
    map: false, // 映射源码
    plugins: { // 使用插件
        "postcss-preset-env":{ // 使用预设环境的插件
            stage: 0,  // 配置未来css的第0个阶段
            preserve: false
        }
    }
}