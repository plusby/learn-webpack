const path = require("path")
const AddFile = require('./my-plugin/add-file-plugin')
const { CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');

module.exports = function (env){
    let base = {}
    // 根据命令传递的env来区分开发和生产环境从而设置不同的配置
    if(env){ //存在就是开发
        base = {
            mode: "development", // 指定每次执行webpack的模式 两种模式开发development生成production, 命令行中会优先
            devtool:"source-map",
        }
    }else{ // 生产
        base = {
            mode: "production",
            optimization: {  // 优化方面的配置项
                splitChunks:{  // 自动分包的配置
                    chunks: 'all', // 所有的chunk都应用分包策略
                    minSize: 30000,  // 最小包为30kb才进行分包
                    minChunks: 1,    // 最少被引用过一次
                    maxAsyncRequests: 5,   // 限制异步模块内部的并行最大请求数
                    maxInitialRequests: 3, // 允许入口并行加载的最大请求数 超过了这个数量就不再继续分包了即使满足分包策略
                    automaticNameDelimiter: '~',
                    name: true, 
                    cacheGroups: { // 缓存组 默认有两个vendors和default，继承上面的配置，如果有相同配置会覆盖
                      vendors: { 
                        test: /[\/]node_modules[\/]/, // 从指定的文件中进行匹配
                        priority: -10 // 优先级，值越大优先级越高
                      },
                      default: {
                        minChunks: 2,  // 最少被其他模块引用次数
                        priority: -20, // 优先级
                        reuseExistingChunk: true  // 重用已经被分离出去的chunk
                      },
                      styles: { // 除了可以对js进行分包，也可以对css进行分包
                        test: /\.css$/, // 匹配样式模块
                        minSize: 0, // 覆盖默认的最小尺寸，这里仅仅是作为测试
                        minChunks: 2 // 覆盖默认的最小chunk引用数
                      }  
                    },
                       
                },
                 // 是否要启用压缩，默认情况下，生产环境会自动开启
                minimize: true, 
                minimizer: [ // 压缩时使用的插件，可以有多个
                    new TerserPlugin(), 
                    new OptimizeCSSAssetsPlugin()
                ],
            }
        }
    }

    return{
        ...base,
        // entry: {  // 多入口
        //     index: "./src/index.js", 
        //     details: "./src/details.js"
        // },
        entry: './src/index.js', //入口文件 字符串或者数组或对象 可以指定多个入口文件
        output: {
            path: path.resolve(__dirname,'./dist'),  // 打包之后输出的文件目录
            filename: '[name][hash:5]bundle.js', // 文件名，以hash值作为文件名，每次内容的修改都会生成一个对应的hash,防止服务端缓存之后获取不到修改之后的文件
            //publicpath: '/'  // 配置公共路径，比如图片和js文件打包到单独一个文件夹中，loader和插件用到这个的路径都是绝对路径                                  
        },
        resolve:{
            alias:{  // 配置别名
                "@": path.resolve(__dirname,"src") // @表示src路径
            }
        },
        plugins: [ // 插件
            new AddFile('myPlugin.txt'), // 向打包输出中添加一个文件
            new CleanWebpackPlugin({ // 打包前清空目录
                // 排除掉dll目录本身和它里面的文件
                cleanOnceBeforeBuildPatterns: ["**/*", '!dll', '!dll/*']
            }),  
            new HtmlWebpackPlugin({    // 生成html并引入打包之后的js
                template: "public/index.html",  // 指定要打包的html
                minify: { // 压缩HTML文件
                    removeComments: true, // 移除HTML中的注释
                    collapseWhitespace: true, // 删除空白符与换行符
                    minifyCSS: true// 压缩内联css
                },
                filename: 'home.html', // 重命名
                // chunks: ["index"]  // 用于指定这个html引入哪个js文件,对应入口中的js
            }),
            // new HtmlWebpackPlugin({    // 多个入口配置多个html 生成html并引入打包之后的js
            //     template: "public/details.html",  // 指定要打包的html
            //     minify: { // 压缩HTML文件
            //         removeComments: true, // 移除HTML中的注释
            //         collapseWhitespace: true, // 删除空白符与换行符
            //         minifyCSS: true// 压缩内联css
            //     },
            //     filename: 'details.html', // 重命名
            //     // chunks: ["details"]  // 用于指定这个html引入哪个js文件,对应入口中的js
            // }),
            new CopyWebpackPlugin([{ // 复制public中的文件到 dist目录下 已有的文件不会进行复制
                from: './public', 
                to: "./"
            }]),
            new MiniCssExtractPlugin({ // 使用mini-css-extract-plugin插件单独抽离css
                filename: '[name]-[hash:5].css',
                ignoreOrder: false, // Enable to remove warnings about conflicting order
                chunkFilename: "common.[hash:5].css" // 公共代码分包出去的文件名
            }),  
            new webpack.HotModuleReplacementPlugin({}), // 使用热更新插件
            new webpack.DllReferencePlugin({ // 使用资源清单
                manifest: require("./dll/jquery.manifest.json")
            }),
            new webpack.DllReferencePlugin({
                manifest: require("./dll/lodash.manifest.json")
            })
        ],
        module:{
            rules:[ 
                {
                    test: /\.(png|jpg|gif)$/, //处理图片
                    use:[
                        {
                            loader: "./my-loader/img-loader.js", // 自定义处理图片的loader
                            options:{
                                name: "img-[contenthash].[ext]", // 图片名称 contenthash文件hash
                                limt: 3000 //文件大小限制 大于3000就是图片否则就是base64
                            }
                        },
                        // {
                        //     loader: "file-loader", // 处理文件输出文件并获取文件url
                        //     options:{
                        //         name: "[name][hash:5].[ext]" // 配置输出的文件名
                        //     }
                        // },
                        // {
                        //     loader: "url-loader", // 处理文件成base64
                        //     options:{
                        //         limit: 10*1024, // 文件的大小限制，10*1024以内的就作为base64处理否则就使用file-loader
                        //         name: "[name][hash:5].[ext]" // 配置file-loader的文件名
                        //     }
                        // }
                    ]
                },
                {
                    test: /\.(c|pc)ss$/,  // 处理css
                    // use:['./my-loader/css-loader.js'],
                    use:["style-loader", //通过Css-loader把css转成js字符串,再通过style-loader把js放在html中
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true
                            }
                        },'postcss-loader' 
                    ]
                },
                {
                    test: /\.less$/, 
                    use:[
                        // "style-loader", //使用了MiniCssExtractPlugin就不使用style-loader
                        {
                            loader: MiniCssExtractPlugin.loader, // 使用MiniCssExtractPlugin.loader将css单独抽离为一个文件
                            options: {
                              esModule: true,
                            },
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true
                            }
                        }
                        ,"less-loader"] // 配置less-loader把less转成css,再通过Css-loader把css转成js字符串,再通过style-loader把js放在html中
                },
                {
                    test: /index\.js$/, // 找到匹配的文件
                    use:[ // 把匹配的文件中的内容发给下面的加载器进行处理 可以是字符串或者对象
                        {
                            loader: './my-loader/js-loader.js', // 指定loader文件 可以通过?name=val传递参数
                            options:{ // 给loader传递参数
                                val: '变量'
                            }
                        }
                    ]
                },
                {
                    test: /jquery\.js$/, // 找到匹配的文件 对于jquery进行缓存
                    use:[ // 把匹配的文件中的内容发给下面的加载器进行处理 可以是字符串或者对象
                        {
                            loader: 'cache-loader', // 使用cache-loader进行缓存
                            options:{
                                cacheDirectory: "./dist/cache" // 指定缓存到的目录
                            }
                        },
                        {
                            loader: './my-loader/js-loader.js', // 指定loader文件 可以通过?name=val传递参数
                            options:{ // 给loader传递参数
                                val: '变量'
                            }
                        }
                    ]
                },
                {
                    test: /\.js$/, // 找到匹配的文件
                    use:[ // 经过多个loader进行处理 从数组的最后往前开始匹配
                        {
                            loader: './my-loader/js-loader.js', // 指定loader文件 
                            options:{ // 给loader传递参数
                                val: '变量'
                            }
                        },
                        {
                            loader: './my-loader/js-loader2.js?val=常量', // 指定loader文件 可以通过?name=val传递参数
                        },
                        {
                            loader: "babel-loader",  // 配置babel-loader
                            // options: {  // 这里配置之后就不需要在创建.babelrc
                            //     presets: [
                            //         [
                            //             "@babel/preset-env",
                            //             {
                            //                 "useBuiltIns": 'usage',
                            //                 "targets": {
                            //                     "chrome": "58",
                            //                     "ie": "11"
                            //                 }
                            //             }
                            //         ]
                            //     ]
                            // }
                        }
                    ],
                    exclude: /node_modules|jquery/, // 去除node_modules文件的解析，打包阶段性能优化的一点,去除jquery是因为上面专门对jquery进行了处理
                }
            ]
        },
        devServer:{ // 开发环境的本地服务
            port: 8089,  // 指定端口号
            index: "home.html", // 指定启动服务之后url的默认显示文件
            proxy: {  // 设置代理
                "/api": { // 包含此字符串的要代理的地址 正则
                  target: "http://localhost:3000", // 目标url
                  pathRewrite: {"^/api" : ""},
                  changeOrigin: true    // 设置请求头中传递过来的host,默认false为当前请求的路径，否则就是target
                }
            },
            open: true, // 启动后自动在浏览器中打开
            // openPage: "",  // 指定打开的文件
            hot: true  // 开启热更新
        }
    }
}