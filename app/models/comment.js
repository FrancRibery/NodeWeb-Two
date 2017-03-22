// 将Schema模式下的comment.js发布到数据库中生成Model
var mongoose = require('mongoose');
var CommentSchema = require('../schemas/comment.js');

// 发布Comment模型,第一个参数是模型的名字
// 创建数据集Comment并得到数据模板Comment
// 注:其实相当于在数据库中以CommentSchema规则创建了表单comments(如果没有第三个参数,则以第一个参数名加上s得到)
var Comment = mongoose.model('Comment',CommentSchema);

// 导出构造函数
module.exports = Comment;