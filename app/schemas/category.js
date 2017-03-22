var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

// 创建数据模型,包括含有什么数据及数据的类型
var CategorySchema = new Schema({
    // 所划分的分类的名称,这样拿到分类的名称就能再根据movies拿到该分类下所有的电影
    name:String,
    // 存放电影的ObjectId,可能有上百部上千部,通过ref关联模型Movie
    // 这里设计成双向关联是因为
    // 一:movie里有category,提交表单movie时需要知道this movie是属于哪一个category的
    // 二:category里有movie,是首页需要,一个category里有多少movie,可以展现出来
    movies:[{type:ObjectId,ref:'Movie'}],
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
CategorySchema.pre('save',function(next){
    // 判断数据是否是新加入的
    if(this.isNew) this.meta.createAt = this.meta.updateAt = Date.now();
    else this.updateAt = Date.now();

    next();
});

// 添加mongoose的静态方法,静态方法在Model层就能使用
CategorySchema.statics = {
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
module.exports = CategorySchema