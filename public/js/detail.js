// 点击评论回复进行相关回复的功能
$(function(){
    // 当有评论按钮被点击时
    $('.comment').click(function(e){
        // 先拿到被点击的按钮的DOM
        var target = $(this);
        // 取到两个data属性的值
        var toId = target.data('tid');
        var commentId = target.data('cid');

        // 判断input隐藏域是否已经存在
        if($('#toId').length>0){
          $('#toId').val(toId);
        }else{
          // 动态插入隐藏域
          // 注:将所点击的头像的tid(主评论发布者的ID值)和cid(主评论的ID值)制成隐藏域存入到表单中去
          $('<input>').attr({
            type:'hidden',
            id:'toId',
            name:'comment[tid]',
            value:toId
          }).appendTo('#commentForm');
        }

        // 判断input隐藏域是否已经存在
        if($('#commentId').length>0){
          $('#commentId').val(commentId);
        }else{
          // 动态插入隐藏域
          // 注:将所点击的头像的tid(主评论发布者的ID值)和cid(主评论的ID值)制成隐藏域存入到表单中去
          $('<input>').attr({
            type:'hidden',
            id:'commentId',
            name:'comment[cid]',
            value:commentId
          }).appendTo('#commentForm');
        }
     })
})