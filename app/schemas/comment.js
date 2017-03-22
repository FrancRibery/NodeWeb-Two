// 设置用户评论功能数据的Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// mongoose.Schema.Types.ObjectId是用来声明一个对象ID类型(ObjectId)的值(由24位Hash字符串组成)的方法,再将得到的值用来声明Schema(var ObjectId=mongoose.Schema.Types.ObjectId;new Schema({driver:ObjectId}))
// 注1:MongoDB中存储的文档必须有一个"_id"键,这个键的值可以是任何类型的,默认是个ObjectId对象。在一个集合里面,每个文档都有唯一的"_id"值来确保集合里面每个文档都能被唯一标识
// 注2:每个Schema都会默认配置ObjectId属性,属性名是'_id',属性值一般是类似'ObjectId("52ffc33cd85242f436000001")'的格式
var ObjectId = Schema.Types.ObjectId;

// 创建数据模型,包括含有什么数据及数据的类型
var CommentSchema = new mongoose.Schema({
    // 注:这里将'movie和from和to'字段的类型值都设置为'ObjectId'类型(由24位Hash字符串组成),这样设置也是为了方便实现关联文档的查询 
    // 当前要存的电影是哪一部电影
    // 注:这里'ref'表示关联另一个模型'Movie'(注意:被关联的model的type必须是ObjectId、Number、String和Buffer才有效)
    movie:{type:ObjectId,ref:'Movie'},
    // 存放针对当前住评论的N个子评论对象组成的数组
    reply:[{
        // 子评论来自谁,关联'User'模型
        from:{type:ObjectId,ref:'User'},
        // 子评论是给谁的,关联'User'模型
        to:{type:ObjectId,ref:'User'},
        // 子评论的内容
        content:String
    }],
    // 评论来自谁
    from:{type:ObjectId,ref:'User'},
    // 给谁评论
    to:{type:ObjectId,ref:'User'},
    // 具体评论的内容
    content:String,
    meta:{
        createAt:{
            type:Date,
            default:Date.now()
        },
        updateAt:{
            type:Date,
            default:Date.now()
        }
    }
})

// 在每次模型实例调用'save'的时候都会来调用这个'pre-save'方法
// 定义中间件,是指在储存该数据前我们需要做什么
CommentSchema.pre('save',function(next){
    // 判断数据是否是新加入的
    if(this.isNew) this.meta.createAt = this.meta.updateAt = Date.now();
    else this.updateAt = Date.now();

    next();
});

// 添加mongoose的静态方法,静态方法在Model层就能使用
CommentSchema.statics = {
    fetch:function(cb){
        // 'find'后得到的Query对象自身的操作(比如find\sort\select\..)查询所有的数据
        // exec是node里面的一个异步方法,是指将执行的结果传入回调函数
        return this.find({}).sort('meta.updateAt').exec(cb);
    },
    findById:function(id,cb){
        // 查询指定ID数据,这里的_id是mongodb会自动生成
        return this.findOne({_id:id}).exec(cb); 
    }
}

// 导出
module.exports = CommentSchema