const utils = require('loader-utils')
function imgLoader(buffer){
    let result;
    const { name="[contenthash].[ext]", limt=1000 } = utils.getOptions(this)
    if(limt < buffer.byteLength ){ // 超过指定大小就获取文件路径
        result = toFileUrl.call(this,buffer,name)
    }else{ // 转成base64输出
        result = toBase64(buffer)
    }
    return `module.exports=\'${result}\'`
}

function toBase64(buffer){
    return "data:image/png;base64,"+buffer.toString("base64")
}

function toFileUrl(buffer,name){
    // 获取到文件路径
    const url = utils.interpolateName(this,name,{
        content: buffer
    })
    this.emitFile(url,buffer) // 直接打包成一个文件
    return url
}

imgLoader.raw = true // 文件内容保留文件的原始数据，不进行utf-8转

module.exports = imgLoader