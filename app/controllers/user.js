  // 负责存放和用户有关的逻辑代码
  var User = require('../models/user.js');

  // showSignup
  exports.showSignup = function(req,res){
    res.render('signup',{
           title:'注册页面'
        });
  }

  exports.showSignin = function(req,res){
    res.render('signin',{
           title:'登录页面'
        });
  }
  
  // 注:用户对服务器端路径'user/signup'发起POST请求,所以这里当用户在'header.jade'下
  // 向表单'user/signup'通过POST提交数据的时候触发回调函数
  exports.signup = function(req,res){
    // 根据提交方式的不同,有三种方式来获取userid的值:
    // 第一种:假设是"app.post('/user/signup/:userid',cb)",那这里就用
    // 形如'req.params.userid'来获取路由里面的userid的值

    // 第二种:假设是"app.post('/user/signup/1111?userid=1112',cb)",那这里就用
    // 形如'req.query.userid'来获取路由里面的userid的值

    // 第三种:假设是表单提交或者jQuery里的ajax异步提交的userid值,那这里就用
    // 形如'req.body.userid'来获取userid的值

    // 获取表单里面的数据
    // 注:这里的'_user'是一个对象,因为中间件'body-parser'将POST的'modal-body'里的内容初始化为一个对象赋值给了它
    // 注:'req.bod.user'获取的是jade中'<input name="user[name]" type="text">'和'<input name="user[pwd]" type"password">'的值
    var _user = req.body.user;

    // 判断用户输入的名称'_user.name'是否已经被注册过,防止重复注册
    User.findOne({name:_user.name},function(err,user){
        if(err) console.log(err);

        // 如果查询到user已经存在
        if(user){
            // 则直接根据路由重定向到登录页面
            return res.redirect('/signin');
        }else{
            // 如果没有被注册过再来生成新的用户

            // 直接生成用户的数据模型(利用模型文件返回的构造函数直接传参来生成,让user对象中包含User模块中指定的数据项)
            var user = new User(_user);

            // 基于Entity对象的操作,save方法用来增加一条数据
            user.save(function(err,user){
              if(err) console.log(err);
       
              // 重定向
              res.redirect('/');
            })
        }
    })
    
  }

  // 用户登录
  // 注:用户通过'header.jade'下的'登录'按钮对'/user/signin'发起POST请求时,在这里
  // 被截获从而触发对应的回调函数
  exports.signin = function(req,res){
    // 拿到表单提交过来的user,已经被中间件转换成对象类型
    var _user = req.body.user;
    // 获取用户在表单中填写的用户名和密码
    var name = _user.name;
    var password = _user.password;

    // 在users表单中通过name值进行查询
    User.findOne({name:name},function(err,user){
        if(err) console.log(err);

        // 如果用户不存在
        if(!user){
            // 则直接根据路由重定向到注册页面
            return res.redirect('/signup')
        };

        // 使用根据name值在users表中查询到的user对象来对比密码是否正确,
        // 如果用户确实存在则开始比较用户的密码
        // 注:comparePassword函数是user的实例方法,在Schema里面添加
        user.comparePassword(password,function(err,isMatch){
            if(err) console.log(err);

            // 如果是匹配的,即密码是正确的
            if(isMatch){
                // 保存用户登录的状态(session就是服务器和客户端之间对话的一种状态)
                // 注:如果密码匹配则将当前查找到的user对象存入request对象的session属性中(添加session模块后则req对象就具备session属性了)
                // 方便我们在别的页面中调用'req.session.user'查看这个保存的user对象
                req.session.user = user;
                return res.redirect('/');
            }else{
                // 如果密码不匹配重定向到当前的页面
                res.redirect('/signin');
            }
        })
    })
  }

  // logout 用户退出登录
  exports.logout = function(req,res){
    // 删除掉之前singin方法中保存在session中的user信息
    // 注:实际中'app.use'中将session中的user赋值给locals的user,所以session删除user则locals中的user自然为空,就不再需要
    // 写'delete app.locals.user'
    delete req.session.user;

    res.redirect('/');
  }

  // 用户列表页
  exports.list = function(req,res){
    // 调用fetch方法将数据库中所有的用户资料全部查出并排序返回
    User.fetch(function(err,users){
        if(err){
            console.log(err);
        }

        // render是express框架中用来根据接收到的不同路由渲染不同视图文件的函数
        // 注:这里说明要渲染的页面是'userlist.jade'和要传入该页面的参数(参数的具体使用请参见相应的页面)
        res.render('userlist',{
           title:'imooc 用户列表页',
           users:users
        });
    })
  }

  // 登录中间件
  // 注:参数next表示当当前的流程走完之后,用来走向下一个流程的
  exports.signinRequired = function(req,res,next){
    // 在之前的登录方法中如果用户输入的密码和用户名都正确,那就将从服务器查询到的匹配对象存入session中,方便以后需要的时候调用
    var user = req.session.user;

    if(!user){
      // 如果此时还未登录,则重定向到登录界面
      return res.redirect('/signin');
    }

    // 因为能走到这里说明用户已经是登录的了,所以进入下一个中间件进行权限的验证
    next();
  }

  // 管理员中间件
  exports.adminRequired = function(req,res,next){
    // 能走到这里说明已经是登录状态了
    var user = req.session.user;

    if(user.role <= 10){
      // 如果权限值小于10,则直接重定向到登录界面
      return res.redirect('/signin');
    }

    // 如果权限值大于10,则直接进入到下个中间件里去展示用户列表页
    next();
  }