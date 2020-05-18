const utils = require('loader-utils')
module.exports = function(sourceCode){
    const reg = new RegExp(utils.getOptions(this).val,"g")
    return sourceCode.replace(reg,"const")
}