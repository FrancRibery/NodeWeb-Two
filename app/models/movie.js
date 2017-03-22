// 引入模块和文档Schema
var mongoose = require('mongoose');
var MovieSchema = require('../schemas/movie.js');

// 发布一个Movie模型,第一个参数是模型的名字,在静态方法和实例方法中都会用到
// 注:其实相当于在数据库中以MovieSchema规则创建了表单movies(如果没有第三个参数,则以第一个参数名加上s得到)
var Movie = mongoose.model('Movie',MovieSchema);

// 导出构造函数
module.exports = Movie;