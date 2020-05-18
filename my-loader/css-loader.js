module.exports = function(sourceCode){
    // css放在style中 
    var text = `var styleEl = document.createElement("style");
    styleEl.innerHTML = \"${sourceCode}\";
    document.head.appendChild(styleEl);
    module.exports=\"${sourceCode}\"`
    return text
}