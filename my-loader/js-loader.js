const utils = require("loader-utils")
module.exports = function (sourceCode){
    // 对传递进来的代码做一些处理返回
    // 可以通过this获取loader中的参数
    // 或者使用第三方工具loader-utils
    const options = utils.getOptions(this) // 获取到webpack.config.js中传递的参数
    const reg = new RegExp(options.val,"g") // 创建一个正则获取到所有的指定字符
    return sourceCode.replace(reg,"var") // 进行替换
}