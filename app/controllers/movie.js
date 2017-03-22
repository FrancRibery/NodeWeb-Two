  // 负责存放和电影有关的逻辑代码

  // 加载mongoDB数据模型集,方便从模型中查找数据
  var mongoose = require('mongoose');
  var Movie = require('../models/movie.js');
  var Comment = require('../models/comment.js');
  var Category = require('../models/category.js');
  // 加载函数库
  var _ = require('underscore');
  // 加载系统用于读取文件的模块
  var fs = require('fs');
  // 加载路径模块
  var path = require('path');

  // detail page
  exports.detail = function(req,res){
    // 获取路由'/movie/:id'里面的id的具体值
    // 'request.params'是通过post和get传过来值的集合
    var id = req.params.id;

    // 增加表示访问次数的pv的逻辑代码
    Movie.update({_id:id},{$inc:{pv:1}},function(err){
      if(err) console.log(err);
    });

    // 调用静态方法 
    Movie.findById(id,function(err,movie){

      Comment
        // 从评论区中根据id的值去找哪些评论是和当前找到的电影匹配的,从而拿到当前电影下的评论comment
        .find({movie:id})
        // 对每个评论数据执行populate方法,找到每个评论的from字段,再根据from的ref值到users表里面去查字段name的值(查询的依据就是from的ObjectId值)返回
        // 注:经过这一步之后所查询到的第二个参数'comments'里面的'from'属性就变成:'{_id:xxxxxx,name:'该条评论发布者的具体名字'}'
        // 注:在定义Schema的时候指定某一个字段是引用另外的一个Schema,当获取document的时候就可以通过pupolate方法让mongo通过schemaid找到关联的文档,然后用这个关联文档的内容替换掉原来引用字段的内容(让被引用的文档显得像一个内嵌文档)
        // path:用空格分隔的引用字段的名称、select:指定查询结果document中要具备的字段、match:指定附加的查询条件、model:指定关联字段的model,如果没有指定就会使用Schema的ref、options:指定其他的附加的诸如排序和数量限制等查询条件
        .populate('from','name')
        // 根据'reply.from'和'reply.to'的id值去查找对应的name的值,让评论区可以显示出相互评论的用户名
        // 注:这一步后rely变成'[{from:{_id:xxxx,name:xxx}},to:{_id:xxxx,name:xxx},content:'用户回复的内容',_id:'xxxx'}]'
        .populate('reply.from reply.to','name')
        // 所以这里的第二个参数'comments'对象就具有了'content/from/to/meta'等属性了
        .exec(function(err,comments){
          // render是express框架中用来根据接收到的不同路由渲染不同视图文件的函数
          res.render('detail',{
            title:'imooc 详情页',
            movie:movie,
            comments:comments
          });
        });
     });
  };

  // admin page
  exports.new = function(req,res){
    Category.find({},function(err,categories){
        res.render('admin',{
          title:'imooc 后台录入页',
          movie:{},
          categories:categories
      });
    })
  };

  // 在后台更新时需要将页面转到详情页且同时详情页里必须包含已存在的数据
  exports.update = function(req,res){
    // 'request.params'是通过post和get传过来值的集合,先获取传过来的电影id值
    var id = req.params.id;

    if(id){
      // 如果id存在则通过模型拿到电影数据,然后用拿到的数据借助render方法渲染admin页面
      Movie.findById(id,function(err,movie){
        Category.find({},function(err,categories){
          // 拿到数据后渲染表单,也就是后台录入页,从而展现给用户
          res.render('admin',{
              title:'imooc 后台更新页',
              movie:movie,
              categories:categories
          })
        })
      })  
    };
  }

  // 因为fs模块是异步的,我们这里必须保证严格的等待图片上传完成后再往下运行的顺序,所以增加一个中间件来实现
  exports.savePoster = function(req,res,next){
    // 存储海报的逻辑代码

    // 根据表单中上传文件的框的name值拿到上传的文件
    var posterData = req.files.uploadPoster;
    // 拿到上传文件的路径
    var filePath = posterData.path;
    // 拿到上传文件原始的名字,用来后面判断上传的文件是否存在
    var originalFilename = posterData.originalFilename;

    // originalFilename存在说明已经有图片传过来了
    if(originalFilename){
      // 读取,并拿到具体的海报的数据data
      fs.readFile(filePath,function(err,data){
        // 声明一个时间戳,用来命名新图片
        var timestamp = Date.now();
        // 拿到上传文件的类型
        var type = posterData.type.split('/')[1];
        var poster = timestamp + '.' + type;
        // 使用'path.join'生成一个服务器中存储文件的地址
        // 注:'__dirname'是当前的文件movie.js所在的目录
        // 注:因为要存到'public'文件夹下的'upload'文件夹中,这里'movies.js'和其差了两层,所以先用两个'../'回到'public'同层目录'app'上
        var newPath = path.join(__dirname,'../../','/public/upload/' + poster);

        // 写入这个新生成的文件
        fs.writeFile(newPath,data,function(err){
          // 把写入成功后的poster挂载到req上面
          req.poster = poster;
          // 执行下一个中间件
          next();
        });
      });
    }
    else{
      // 假设并没有文件上传,则不做任何处理直接进入next
      next();
    }
  }

  // 通过用户提交数据的表单的action是'/admin/movie/new'从而触发这个路由,拿到用户从录入页表单POST过来的数据
  exports.save = function(req,res){
    // 从表单post过来的数据可能是新的也可能是更新过的,所以根据看能否拿到电影id来判断用户是更新还是新建
    var id = req.body.movie._id;
    // 获取用户在录入页输入的数据
    var movieObj = req.body.movie;
    var _movie;

    // 判断req上有没有在'savePoster'方法中挂载poster
    if(req.poster){
      // 如果存在说明在上一个流程中已经存好了一个新的海报地址,那就重写movieObj中原有地址
      movieObj.poster = req.poster;
    }

    // 如果id有值则说明电影之前已经被存入数据库,这里需要更新操作
    // 注:因为电影新建'Movie.new'和电影更新'Movie.update'方法都会进入到'admin.jade',而'admin.jade'里的表单
    // 提交又都会触发'Movie.save'方法,所以这里要根据用户输入的内容里是否存在id来判断是更新还是新建
    if(id){
        // 调用mongoose的API根据id来查询电影
        Movie.findById(id,function(err,movie){
            if(err){
                console.log(err);
            }

            // 调用underscore里的extend方法用新的用户输入的数据movieObj覆盖原来的旧的数据movie
            _movie = _.extend(movie,movieObj);
            // 将更新之后的对象进行保存
            // 注:第二个参数是save后的movie对象
            _movie.save(function(err,movie){
                if(err){
                    console.log(err);
                }
                // 将页面重定向到更新后的电影详情页中
                res.redirect('/movie/' + movie._id);
            })
        })
    }else{
      // 如果id不存在则说明是一部新电影,则调用模型构造函数构造一个Entity变量
      _movie = new Movie(movieObj);

      // 取出用户在'admin.jade'页面中选中的电影分类项的值(每个分类的value的值都不同)
      var categoryId = movieObj.category;
      var categoryName = movieObj.categoryName;

      // 将新创建的模型进行保存并重定向
      // 注:第二个参数movie就是保存进数据库的那个电影对象本身
      _movie.save(function(err,movie){
        if(err){
            console.log(err);
        }

        if(categoryId){
          // 找到当前的这个分类
          Category.findById(categoryId,function(err,category){
            // 将当前存入数据库的电影对象的id值存入当前分类的movies键中,开启关联关系
            category.movies.push(movie._id);

            // 存储
            category.save(function(err,category){
              res.redirect('/movie/' + movie._id);
            });
            // 至此,当我们去movies表中去查询某个电影的时候,从其对象里categroy的值就能确定其属于哪个电影分类
            // 然后,当我们去categories表中查询的时候,某个分类下的movies键名下面的键值就对应着存入数据库的某个电影
          });
        }else if(categoryName){
            // 如果没有找到categoryId的值,说明用户并未选择分类
            // 那么我们就将用户在电影分类一栏中填写的分类new成一个新的电影分类存入数据库中
            var category = new Category({
              name:categoryName,
              movies:[movie._id]
            })

            // 保存
            category.save(function(err,category){
              // 这里执行这一步的话,数据库中movies表下的对象中缺少category字段
              movie.category = category._id;
              movie.save(function(err,movie){
                res.redirect('/movie/'+movie._id);
              });
            })
        }

      });
    }
  }

  // list page
  exports.list = function(req,res){
    // 查询所有的电影后将其渲染到'list.jade'页面中
    Movie.find({})
      .populate('category','name')
      .exec(function(err, movies) {
        if (err) {
          console.log(err)
        }

        console.log(movies);
        res.render('list', {
          title: 'imooc 列表页',
          movies: movies
        })
      })
  };

  // 在列表页中进行删除操作的时候所触发
  // Express中实例对象的delete方法接收客户端提交的DELETE请求并返回服务器端响应结果
  exports.del = function(req,res){
    // 这里采用query获取id的值,因为id的值是通过路由里'?'后面追加值的方式传递的
    var id = req.query.id;

    if(id){
        // 调用模型的remove方法来删除,第一个参数是要删除的条件
        Movie.remove({_id:id},function(err,movie){
            if(err){
                console.log(err);
            }else{
                // 给客户端返回一段json数据
                // 数值是1,正好对应$.ajax里的done方法
                // 注:res.json([body])用来发送一个json的响应,这个方法和将一个对象或者一个数组作为参数传递给res.send()方法的效果相同
                res.json({success:1})
            }
        });
    }
  }
