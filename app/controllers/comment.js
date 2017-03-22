  // 负责存放和用户评论有关的逻辑代码

  // 加载mongoDB数据模型集
  var Comment = require('../models/comment.js');

  // comment
  exports.save = function(req,res){
    // 获取用户在HTML中输入的所有字段和值(因为有中间件bodyParser获取客户端发送的请求中的body中的内容)
    // 注:这里要获取的数据来自用户在评论区HTML代码中所输入的值
    // 注:HTML字段可能是形如'comment[name]/comment[value]/comment[id]'的格式,所以是'req.body.comment'
    var _comment = req.body.comment;
    // 表示'detail.jade'页面中'#commentForm'表单里name为comment的字段组成的数组中键名是'movie'的文本框对应的value值
    var movieId = _comment.movie;

    // 如果用户'#commentForm'表单提交过来的内容中包含隐藏域'input-cid',说明用户点击了头像评论按钮,则要进行回复处理而不是评论处理
    if(_comment.cid){
      // 根据cid(主评论的ID值)查找这条主评论的内容,且拿到这个主评论comment
      Comment.findById(_comment.cid,function(err,comment){
        // 根据Schema来实例化创建具体回复的内容对象,方便后面追加到服务器等
        var reply = {
          // 因为登陆后的用户进行的不论是评论还是回复,from都应该来自当前登陆的用户
          from:_comment.from,
          // 因为tid是子评论的发布者,而这条信息又是针对发布者的回复
          // 注:第一次有子评论的时候tid的值是主评论发布者的id值('#{item.from._id}'),所以说第一条子评论的from是当前登陆用户,to是主评论者的id值
          // 注:第二次有子评论的时候tid的值是第一条子评论的发布者id值('#{reply.from._id}'),所以说第二条子评论的from是当前登陆用户,to是第一条子评论的发布者的id值
          to:_comment.tid,
          // 回复的内容
          content:_comment.content
        }

        // 向当前查找到的comment内追加
        comment.reply.push(reply);
        // 在新增一条评论内容之后进行保存
        comment.save(function(err,comment){
          if(err) console.log(err);

          // 导向具体的电影页面
          res.redirect('/movie/'+movieId);
        });
      })
    }else{
      // 否则如果没有cid的存在,则认为是简单的评论
      // 调用模型构造函数,传入用户输入的值来构造一个Entity变量
      var comment = new Comment(_comment);

      // 进行保存并重定向
      // 注:这里的第二个参数comment是保存后的commment对象
      comment.save(function(err,comment){
          if(err){
              console.log(err);
          }
          res.redirect('/movie/' + movieId)
      })
    }
  }
