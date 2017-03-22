var mongoose = require('mongoose');
// 专门为数据存储设置的加密算法模块
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;

// 创建数据模型,包括含有什么数据及数据的类型
// 通过'mongoose.Schema'这个接口定义用户的文档结构和数据类型
var UserSchema = new mongoose.Schema({
    name:{
        type:String,
        // 值是唯一的
        unique:true
    },
    password:String,
    // 0:normal user  一般用户
    // 1:verified user  通过邮箱激活的用户
    // 2:professional user  高级用户
    // 注:如果中途增加role字段,那么schema以前的数据都会新增这个字段,他给他们都默认是0,如果没有那个default:0就是空了你可以命令行输入看一下以前注册都是有role:0
    role:{
        type:Number,
        default:0
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

// 在每次模型实例调用'save'的时候都会来调用这个'pre-save'方法
// 定义中间件,是指在储存该数据前我们需要做什么
UserSchema.pre('save',function(next){
    // 表示user变量存储的是当前的用户对象,因为使用闭包会改变this
    var user = this;

    // 判断数据是否是新加入的
    if(this.isNew) this.meta.createAt = this.meta.updateAt = Date.now();
    else this.updateAt = Date.now();

    // 先随机生成一个盐,然后将数据和盐进行混合加密生成最终的结果
    // 第一个参数是加盐的强弱度,也让攻击者破解时所要付出的代价的多少
    bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt){
        // 第二个参数是生成的盐

        // 如果有错误则将其带入到下一个流程里面去
        if(err) return next(err);

        // 可以传入三个参数:
        // 第一个是用户的明文密码'user.password'
        // 第二个是生成的盐
        // 第三个是回调方法
        bcrypt.hash(user.password,salt,function(err,hash){
            // 在这个回调里就可以拿到通过'bcrypt.hash'加盐后的密码
            if(err) return next(err);
            // 将加密后的密码存入
            user.password = hash;
            // 进入下一步
            next();
        });
    })
});

// 添加实例方法
UserSchema.methods = {
    // 第一个参数是用户提交过来的密码
    comparePassword:function(_password,cb){
        // 进行密码的比对
        // 注:因为在数据库中查询到的实例是一个对象,所以通过this取到当前对象的password属性来对比
        bcrypt.compare(_password,this.password,function(err,isMatch){
            if(err) console.log(err);

            // 如果没有错误则将err设置成null
            cb(null,isMatch);
        });
    }
}

// 添加mongoose的静态方法,静态方法在Model层就能使用
UserSchema.statics = {
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
module.exports = UserSchema