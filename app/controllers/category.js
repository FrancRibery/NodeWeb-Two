  // 负责存放和电影分类有关的逻辑代码

  // 加载mongoDB数据模型集,方便从模型中查找数据
  var Movie = require('../models/movie.js');
  var Comment = require('../models/comment.js');
  var Category = require('../models/category.js');
  // 加载函数库
  var _ = require('underscore');

  // admin page
  exports.new = function(req,res){
    res.render('category_admin',{
        title:'imooc 后台分类录入页',
        category:{}
    });
  };

  // 拿到用户从录入页表单POST过来的数据
  // 用户提交数据的表单的action就是定位到'/admin/movie/new',从而触发这个路由
  exports.save = function(req,res){
    // 从表单post过来的数据可能是新的也可能是更新过的
    var _category = req.body.category;

    var category = new Category(_category);

    // 进行保存并重定向
    category.save(function(err,category){
        if(err){
            console.log(err);
        }

        // 重定向到分类列表的后台页面,显得更加一目了然
        res.redirect('/admin/category/list')
    })
  }

  // categorylist page
  exports.list = function(req,res){
    // 调用fetch方法将所有的数据全部查出并排序返回
    Category.fetch(function(err,categories){
        if(err){
            console.log(err);
        }

        // render是express框架中用来根据接收到的不同路由渲染不同视图文件的函数
        res.render('categorylist',{
           title:'imooc 分类列表页',
           categories:categories
        });
    })
  };
