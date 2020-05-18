class AddFilePlugin {
    constructor(name){
        this.fileName = name // 获取传递的文件名
    }
    apply(compiler){
        compiler.hooks.emit.tap("AddFile",(compilation)=>{
            // compilation.assets 获取或添加打包之后的文件列表
            let arr = []
            for (const key in compilation.assets) {
                let item = compilation.assets[key] // 获取文件信息
                let obj = `name:[${key}]\\nsize:${item.size()/1000}KB`
                arr.push(obj)
            }

            compilation.assets[this.fileName] = {  // 创建一个新文件
                source:()=>{
                    return arr.join('\n')
                },
                size:()=>{
                    return arr.join('\n').length
                }
            }
        })
    }
}

module.exports = AddFilePlugin