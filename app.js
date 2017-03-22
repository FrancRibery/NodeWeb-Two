// express node应用搭建模块
var express = require('express');
//var serveStatic = require('serve-static');

// 加载表单序列化模块
var bodyParser = require('body-parser');

// 如果要使用cookie,需要显式包含这个模块
// 注:express中Session的解析是依赖于cookieParser的,要先从cookie中读取加密的'connect.id',再
// 通过cookieParser解析成对应的sessionid,再保存到'request.session'对象中
var cookieParser = require('cookie-parser');
// 如果要使用session,需要单独包含这个模块
var session = require('express-session');

// 加载mongoose模块
var mongoose = require('mongoose');
// 引入mongoStore模块,方便在app.use(session)的时候进行配置
var mongoStore = require('connect-mongo')(session);

// 端口设置
// 'process.env.PORT'是指Node环境中默认的端口
var port = process.env.PORT || 3000;

// 加载路径处理模块
var path = require('path');
var morgan = require('morgan');
var app = express();

// 连接本地数据库,将数据库的名称叫成'imooc'
mongoose.connect('mongodb://localhost/imooc');

// 设置视图路径,即模板文件夹
app.set('views','./app/views/pages');

// 设置模板引擎为jade,是设置express.js所使用的render engine
app.set('view engine','jade');

// 保证session的正常运作
// 注:作用为首先从cookie中读取加密的connect.sid,再通过cookieParser解析成对应的sessionid,将这个sessionid保存到'req.sessionid'中,所以必须在session模块前加载
app.use(cookieParser());
// 注:作用为首先从store中读取当前的session数据
app.use(session({
    // 借助Cookie和Session测试我们在别的页面登录后,然后在跳转到的另一个页里还能不能获取在前一个页面中保存在'req.session.user'里的那个含有用户信息的user对象
    // 注1:Session(会话)一般用来跟踪用户从而确定用户的身份(一个用户有一个会话,另一个用户则是另一个会话,二者是独立的)
    // 注2:又因为经常使用的HTTP是一种无状态的协议,每次交互都要新建链接,说明服务器没有办法从链接上跟踪会话,所以引入
    // Cookie(在客户端记录信息确定用户身份)+Session(在服务器端记录信息确定用户身份)来弥补这种不足
    // 注3:在session之前,HTTP会将Cookie带到服务器端,服务器通过辨识Cookie来确定用户
    // 注4:当服务器要为客户端请求创建Session的时候,首先会检查客户端请求cookie中是否包含session的标识(也就是sessionid),如果存在
    // 说明之前已经为这个客户端创建过Session那直接找出来(可以理解成cookie里保存的sessionid是session的索引)放在cookie里返回给客户端,反之生成一个新的Session即可
    // 注5:客户端通过Cookie来保存服务器端生成的Sessionid,方便下次交互中的使用
    // 注6:session持久化有保存在内存中(重启进程就会消失)、cookie中(直接解析就能获得)、redis(将session数据保存在数据库中,程序先通过cookie查找到sessionid,进而找到数据库中session对象)、mongoDB

    // 配置项:session中的数据经过加密后默认保存在一个cookie中
    // name:设置cookie中保存sessionid的字段名称,默认为connect.sid
    // secret:用来防止篡改cookie,值就是cookie的名字
    secret:'imooc',
    // store:通过一个mongoStore的实例将会话信息存储到数据库中,避免丢失,然后通过'req.session'获取当前用户的会话对象
    store:new mongoStore({
        // 本地数据库地址
        url:'mongodb://localhost/imooc',
        // 将session保存到数据库中的集合名称
        collection:'sessions'
    })
}));
app.use(require('connect-multiparty')());

// 在Express程序中使用express.static中间件,为程序托管位于程序目录的public目录下的静态资源,所以当请求样式和脚本的时候去'public'下面去查找
// 注:express.static(root,[options])是Express中唯一的内建中间件,负责托管Express应用内的静态资源,参数root为静态资源的所在的根目录
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));

// 加载时间处理模块
app.locals.moment = require('moment');

// 监听端口
app.listen(port);

console.log('imooc started on port ' + port);

// 通过get-env拿到环境变量
if('development' === app.get('env')){
    // 如果env是开发环境

    // 这样设置可以将错误信息打印出来
    app.set('showStackError',true);

    // 通过中间件来展现请求的类型、路径、状态
    app.use(morgan(':method :url :status'));
    // 将本身混乱的网页源代码格式化,增加可读性
    app.locals.pretty = true;
    // 将数据库的调试开关打开
    mongoose.set('debug',true);
}

// './'代表当前文件所在位置下的config文件夹下的routes.js文件
// 注:因为require引用的'module.exports'是个函数,所以这里将express对象app传入
// 注:'app.js入口页----routes.js包含各个控制器的页面----Movie/User/Index具体控制器页面'
require('./config/routes.js')(app);
