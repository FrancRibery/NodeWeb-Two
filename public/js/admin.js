// 删除数据
$(function(){
    // 当有删除按钮被点击时
    $('.del').click(function(e){
        // 找到是哪个按钮被点击
        var target = $(e.target);
        // 取到对应按钮的id值
        var id = target.data('id');
        // 取到数据在列表页里面的哪一行
        var tr = $('.item-id-'+id);

        $.ajax({
            // 提交请求的类型
            type:'DELETE',
            // 请求提交的地址,从而触发node中对应的路由执行'Movie.del'方法
            url:'/admin/movie/list?id='+id
        }).done(function(results){
            // 删除后希望服务器返回一个表示已经删除成功的状态码
            if(results.success === 1){
                // 如果服务器端删除成功,那就判断列表页是不是有这一行
                if(tr.length > 0){
                    // 如果列表页有这一行则直接进行删除
                    tr.remove();
                }
            }
        });
    })


    $('#douban').blur(function(){
        var douban = $(this);
        var id =douban.val();

        if(id){
          $.ajax({
            url:'https://api.douban.com/v2/movie/subject/' + id,
            cache:true,
            type:'get',
            dataType:'jsonp',
            // 跨域
            crossDomain:true,
            // jsonp用来回传的参数的名称
            jsonp:'callback',
            success:function(data){
                // data参数就豆瓣返回的我们所需要的电影相关的数据
                $('#inputTitle').val(data.title);
                $('#inputDoctor').val(data.directors[0].name);
                $('#inputCountry').val(data.countries[0]);
                $('#inputPoster').val(data.images.large);
                $('#inputYear').val(data.year);
                $('#inputSummary').val(data.summary);
            }
          })
        }

    })
})