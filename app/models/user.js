var mongoose = require('mongoose');
var UserSchema = require('../schemas/user.js');

// 生成User模型
// 注:其实相当于在数据库中以UserSchema规则创建了表单users(如果没有第三个参数,则以第一个参数名加上s得到)
var User = mongoose.model('User',UserSchema);

// 导出构造函数
module.exports = User;