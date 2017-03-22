var mongoose = require('mongoose');
var CategorySchema = require('../schemas/category.js');

// 生成Movie模型,第一个参数是模型的名字
// 创建数据集Movie并得到数据模板Movie
// 注:其实相当于在数据库中以MovieSchema规则创建了表单movies(如果没有第三个参数,则以第一个参数名加上s得到)
var Category = mongoose.model('Category',CategorySchema);

// 导出构造函数
module.exports = Category;