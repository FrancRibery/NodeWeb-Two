// 引入mongoose模块
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

// 创建数据模型,包括含有什么数据及数据的类型
var MovieSchema = new Schema({
    doctor:String,
    title:String,
    language:String,
    country:String,
    summary:String,
    flash:String,
    poster:String,
    year:Number,
    pv:{
        type:Number,
        default:0
    },
    // 这里设计成双向关联是因为
    // 一:movie里有category,提交表单movie时需要知道this movie是属于哪一个category的
    // 二:category里有movie,是首页需要,一个category里有多少movie,可以展现出来
    category:{
        type:ObjectId,
        // 通过ref关联Category-Schema
        ref:'Category'
    },
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

// 在每次模型实例调用'save'方法的时候都会来执行这个回调函数
MovieSchema.pre('save',function(next){
    // 判断数据是否是新加入的,将创建时间和更新时间设置为当前时间
    if(this.isNew) this.meta.createAt = this.meta.updateAt = Date.now();
    else this.updateAt = Date.now();

    next();
});

// 添加mongoose的静态方法,静态方法在Model层就能使用
MovieSchema.statics = {
    fetch:function(cb){
        // 调用mongoose的'find'后得到的是一个Query对象,其自身的操作(比如find\sort\select\..)用来对数据进行操作
        // exec是node里面的一个异步方法,可以等前面的查询完成后将查询的结果传入回调函数来异步执行
        return this.find({}).sort('meta.updateAt').exec(cb);
    },
    findById:function(id,cb){
        // 查询指定ID数据,这里的_id是mongoose的Schema会自动生成
        return this.findOne({_id:id}).exec(cb); 
    }
}

// 导出
module.exports = MovieSchema