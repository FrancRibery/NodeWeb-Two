// 分别拿到对应的控制器(控制器是负责模型和视图交互的功能)
// 加载'index.js'中通过'exports'暴露出来的'index'函数
var Index = require('../app/controllers/index.js');
var User = require('../app/controllers/user.js');
var Movie = require('../app/controllers/movie.js');
var Comment = require('../app/controllers/comment.js');
var Category = require('../app/controllers/category.js');

// 抛出模块
module.exports = function(app){
  // 预处理中间件
  app.use(function(req,res,next){
    // 拿到之前在singin中保存在session对象中的user对象
    var _user = req.session.user;
    // 注:app.locals对象是一个javascript对象,它的属性就是程序本地的变量。一旦设定,app.locals的各属性值将贯穿程序的整个生命周期
    // 在app.locals这个对象字面量中定义的键值对,是可以直接在后面各个路由中所渲染的jade模板中使用的
    app.locals.user = _user;
    next();
  })

  // INDEX
  // index page
  app.get('/',Index.index);



  // USER
  // signup
  // 注:用户对服务器端路径'user/signup'发起POST请求,所以这里当用户在'header.jade'下
  // 向表单'user/signup'通过POST提交数据的时候触发回调函数
  app.post('/user/signup',User.signup);

  // signin 用户登录
  // 注:用户通过'header.jade'下的'登录'按钮对'/user/signin'发起POST请求时,在这里
  // 被截获从而触发对应的回调函数
  app.post('/user/signin',User.signin);

  // 当捕获到路由里输入'localhost:3000/signin'的时候,这里将执行'User.showSignin'方法给浏览器渲染出登录界面
  app.get('/signin',User.showSignin);
  app.get('/signup',User.showSignup);

  // logout 用户退出登录
  app.get('/logout',User.logout);

  // userlist page 用户列表页
  // 注:如果用户想访问列表页,首先要必须登录(signinRequired),其次要管理员权限(adminRequired)
  app.get('/admin/user/list',User.signinRequired,User.adminRequired,User.list);



  // MOVIE
  // detail page
  app.get('/movie/:id',Movie.detail);

  // admin page
  // 注:凡是和管理员admin有关的都要添加权限
  app.get('/admin/movie/new',User.signinRequired,User.adminRequired,Movie.new);

  // admin update movie 在后台更新时需要将页面转到详情页且同时详情页里必须包含已存在的数据
  app.get('/admin/movie/update/:id',User.signinRequired,User.adminRequired,Movie.update);

  // admin post movie 拿到用户从录入页表单POST过来的数据
  // 用户提交数据的表单的action就是定位到'/admin/movie/new',从而触发这个路由
  // 注:这里增加一个存储海报的中间件函数
  app.post('/admin/movie/new',User.signinRequired,User.adminRequired,Movie.savePoster,Movie.save);

  // list page
  app.get('/admin/movie/list',User.signinRequired,User.adminRequired,Movie.list);

  // list delete movie 在列表页中进行删除操作的时候所触发
  // Express中实例对象的delete方法接收客户端提交的DELETE请求并返回服务器端响应结果
  app.delete('/admin/movie/list',User.signinRequired,User.adminRequired,Movie.del);



  // COMMENT
  app.post('/user/comment',User.signinRequired,Comment.save);


  // CATEGORY
  // new category 后台录入页
  app.get('/admin/category/new',User.signinRequired,User.adminRequired,Category.new);
  // save category 保存页
  app.post('/admin/category',User.signinRequired,User.adminRequired,Category.save);
  // list category 分类列表页
  app.get('/admin/category/list',User.signinRequired,User.adminRequired,Category.list);



  // RESULTS 查询
  app.get('/results',Index.search)
  
};
