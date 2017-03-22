  // 负责存放和首页进行交互的逻辑代码
  var Movie = require('../models/movie.js');
  var Category = require('../models/category.js');

  exports.index = function(req,res){

    Category
      .find({})
      // 填充category的movies字段,并限制为5条
      .populate({path:'movies',options:{limit:5}})
      .exec(function(err,categories){    
        // 实现首页的查询逻辑(因为是静态方法所以可以直接调用,movies是通过find查找到的对象)
        // 查询到数据库中所有的数据并按照更新时间进行排序,最后执行传入的回调函数
        if(err){
            console.log(err);
        }
        // render是express框架中用来根据接收到的不同路由渲染不同视图文件的函数
        // 第二个参数对象是传入页面中用来修改页面中变量的
        res.render('index',{
           title:'imooc 首页',
           categories:categories
        });
      })
  }


  // search page  
  exports.search = function(req,res){
    // 获取在'index.jade'中点击的分类名称后,href中传递过来的代表是哪一个分类的id和代表页面的分页
    var catId = req.query.cat;
    var q = req.query.q;
    var page = parseInt(req.query.p,10)||0;
    var count = 2;
    // 表示从数据库中的哪一个索引位置开始查询,一页显示2条数据,如果要查询第3个电影则从第'1*2'个索引处开始查
    var index = page * count;

    // 因为分类和搜索都会触发search函数,所以这里要进行一个判断到底是什么操作
    if(catId){
      Category
        // 先拿到指定的分类,再对分类下的电影执行populate,并限制它每次查询的条数和从哪一条数据开始查
        .find({_id:catId})
        // 填充category的movies字段,并限制为5条,并且跳到skip指定的索引处开始查询
        .populate({path:'movies',select:'title poster'})
        // 查询到的'categories'就是当前的分类
        .exec(function(err,categories){    
          // 实现首页的查询逻辑(因为是静态方法所以可以直接调用,movies是通过find查找到的对象)
          // 查询到数据库中所有的数据并按照更新时间进行排序,最后执行传入的回调函数
          if(err){
              console.log(err);
          }
          // render是express框架中用来根据接收到的不同路由渲染不同视图文件的函数
          // 第二个参数对象是传入页面中用来修改页面中变量的
          // 注:渲染查询结果页面
          var category = categories[0] || {};

          // 通过find和populate拿到当前分类下的所有电影数据和当前的这个电影分类名称categories
          var movies = category.movies || [];
          // 从分类下的所有电影中根据具体显示的哪一页取出所要显示的具体电影(比如第一页取到第一个和第二个电影,第二页取到第三个和第四个电影,以此类推)
          var results = movies.slice(index,index+count);

          res.render('results',{
             title:'imooc 结果列表页面',
             // 'category.name'保存的应该是category数据库中name索引下的表示分类名称的值
             keyword:category.name,
             // 当前页数变量(因为url中'p=0'代表的是第一页,所以这里要加上1)
             currentPage:(page+1),
             // 分类下的电影一共有多少页
             totalPage:Math.ceil(movies.length/count),
             query:'cat='+catId,
             movies:results
          });
        })
    }
    else{
      // 没有catId,则判断为来自搜索框提交过来的按钮,则要查找和电影名字相同的电影
      Movie
        .find({title:new RegExp(q+'.*','i')})
        .exec(function(err,movies){
          if(err){
              console.log(err);
          }

          // 从分类下的所有电影中根据具体显示的哪一页取出所要显示的具体电影(取出要第一个参数是从哪个数据开始取,截止到哪个数据,比如第一页就取出第一个和第二个电影,以此类推)
          var results = movies.slice(index,index+count);

          res.render('results',{
             title:'imooc 结果列表页面',
             // q就是用户输入的要进行搜索的电影名字
             keyword:q,
             // 当前页数变量(因为url中'p=0'代表的是第一页,所以这里要加上1)
             currentPage:(page+1),
             // 分类下的电影一共有多少页
             totalPage:Math.ceil(movies.length/count),
             // 作用是给高亮之外的别的页面的页码增加跳转所需的参数的
             query:'q='+q,
             movies:results
          });
        });
    }
  }