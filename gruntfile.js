module.exports = function(grunt){

    // 任务配置,存放插件的配置信息
    // 注:Contrib-jshint——javascript语法错误检查
    // 注:Contrib-watch——实时监控文件变化、调用相应的任务重新执行
    // 注:Contrib-clean——清空文件、文件夹
    // 注:Contrib-uglify——压缩javascript代码
    // 注:Contrib-concat——合并多个文件的代码到一个文件中
    grunt.initConfig({

        // 'pkg:grunt.file.readJSON("package.json")'表示将'package.json'文件中的内容读取进来当成一个常量存储,
        // 方便在后面通过'<%= ... %>'的格式进行调用

        // watch插件的配置信息(真正实现自动化的插件)
        watch:{
            jade:{
                // 注:files表示要监听哪些文件的变化
                // 监听所要改变的视图文件的目录地址
                files:['views/**'],
                options:{
                    // 当文件发生改动会重新启动这个服务
                    livereload:true
                }
            },
            js:{
                // 监听本地和页面有关的js文件的改动
                files:['public/js/**','models/**/*.js','schema/**/*.js'],
                // tasks表示文件一旦变化要立即执行哪些插件功能
                // 注:表示上面路径中的js文件发生变化以后,要执行立即执行语法检查插件'jshint'里的功能
                // tasks:['jshint'],
                options:{
                    // 当文件发生改动会重新启动这个服务
                    livereload:true
                }
            }
        },

        // nodemon插件的配置信息
        nodemon:{
              dev:{
                script:'app.js',
                options:{
                    // 当前的入口文件
                    file:'app.js',
                    args:[],
                    ignoredFiles:['README.md','node_modules/**','.DS_Store'],
                    watchedExtensions:['js'],
                    // 需要监听的目录
                    watchedFolders:['app','config'],
                    debug:true,
                    // 当有特别大的文件需要编译的时候等待多少毫秒之后再重启服务
                    delayTime:1,
                    env:{
                        PORT:3000
                    },
                    cwd:__dirname
                }
            }
        },

        // mochaTest插件的配置信息
        mochaTest:{
            options:{
                reporter:'spec'
            },
            // 指定要测试的目录为test目录下所有的test文件
            src:['test/**/*.js']
        },

        // concurrent插件的配置信息
        concurrent:{
            // 通过tasks传入两个任务'nodemon'和'watch',说明可以执行这两个任务
            tasks:['nodemon','watch'],
            options:{
                logConcurrentOutput:true
            }
        }
    })

    // 注:'grunt.loadNpmTasks'用来告诉grunt我们将使用什么插件
    // 只要有文件发生变化,就会重新执行在其中注册好的任务
    grunt.loadNpmTasks('grunt-contrib-watch');
    // 用来实时监听的,这里实时监听入口文件app.js,当app.js发生变化会重启文件
    grunt.loadNpmTasks('grunt-nodemon');
    // 可以用来跑多个阻塞的任务,比如watch和nodemon
    grunt.loadNpmTasks('grunt-concurrent');
    // 加载'mocha-test'模块
    //grunt.loadNpmTasks('grunt-mocha-test');

    // 防止因为大小写的错误导致中断了grunt的服务
    grunt.option('force',true);

    // 注册默认的任务告诉grunt当我们在终端输入grunt的时候需要做些什么(注意顺序)
    // 注:'grunt.registerTask'表示在grunt命令执行时,要不要立即执行concurrent插件,这里正好需要所以我们写上,否则不写
    grunt.registerTask('default',['concurrent']);
    // 注册任务,任务的名字叫'test',第二个参数是要调用任务的名字
    // eg:grunt.registerTask('test',['mochaTest']);
    // 配置grunt命令启动的时候,先执行A插件的任务再执行B插件的任务
    // eg:grunt.registerTask('default',['A','B']);


    // Task、Target、Options
    // Task(任务):grunt把代码压缩、目录清除、创建目录等都当成是一个个Task,一般写在'initConfig'对象中的键名(在通过grunt执行Task的时候可以在后面以两个横线的方式传参,这个参数应该会被赋值入每个Task的options中,比如'grunt Task --xxx')
    // 注:'grunt task:abc:def:ghi'的格式会在这个task的函数下的this对象上增加一个flags属性,其值为'this.flags{abc:true,def:true,ghi:true}',这样执行的时候会这样去取值'this.flags.abc、this.flags.def、this.flags.ghi',如果取出来的值是true则直接使用,否则会去options中取'options.abc'的值,如果为true则直接使用,否则会用abc默认的值
    // loadNpmTask:用来让grunt加载某个任务

    // 每个任务Task都会包含自己的Target和Options:在每个Task对象中除了Options属性本身之外的其余属性都是
    // Target属性,而Options属性则是Task之下options属性对应的值的或Task之下的每个Target下的options属性对应的值,(注意的是options在子对象下只对子对象起作用)
    // 默认情况下grunt会挨个运行Task下的各个Target(比如仅仅输入'grunt Task'),如果你想运行某个特定的Target则需要在命令行输入形如'grunt Task:Target'的格式

    // registerTask:在多个Task同时运行的时候,用来组合这多个Task的顺序和流程,第一个参数为这个组合起来的Task的代号(运行的时候直接'grunt 代号'即可,如果仅仅写一个'grunt'则默认执行代号为'default'的),第二个参数如果是函数则需要在函数里通过'grunt.task.run'来
    // 指定要运行的一个个Task,如果第二个参数是数组则直接表示要挨个运行的Task(注意第一个参数所代表的代号仍然可以继续被用来组合成更深层次的)

    // 运行'npm init'来生成项目所需的'package.json'文件,如果是一个已经存在package的Node项目可以忽略这一步

    // 如果想在安装的同时更新'package.json'中的'devDependencies'则需要跟上'--save-dev'的指令,如果更新'dependencies'则需要跟上'--save'的指令
}