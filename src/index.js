import * as obj from './js/a'
import style1 from './style/index.css';
import style2 from './style/details.css';
import style3 from './style/index.pcss';
import img from "./js/img";
import jquery from "./js/jquery";

// 变量 a = 1;

console.log(style1,style2,style3)
document.getElementsByClassName('p')[0].className = style3.p
document.getElementsByClassName('h5')[0].className = style1.h5
document.getElementsByClassName('main')[0].className = style1.main
// 测试babel 
 var a = new Promise((res,rej)=>{
    res()
 })

 if(module.hot){ // 是否开启了热更新
    module.hot.accept() // 接受热更新
 }

/*

._2JY5meG2cJWHkEJyMGc19E{
    width: 100px;
    height: 100px;
    background: url(img-cc26f47cd1bfb55eb293703b305692da.png) no-repeat;
    background-size: cover;
}



*/