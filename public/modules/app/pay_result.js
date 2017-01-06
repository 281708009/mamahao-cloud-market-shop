// 支付成功结果页
define(function (require, exports, module) {
    var page = {
        config: {
            params: M.url.params(),
            // ajax向node请求的url;
            api: {
                'guessYouLike':'/api/goods_guessYouLike',
                'getRecommendList':'/api/cart/getRecommendList',
                'getCommentList':'/api/getTobeCommentList',
                'commentGoodsTemplate':'/api/commentGoodsTemplate'  // /V1/inspect/comment/commentGoodsTemplate.htm
            }
        },
        init: function () {
            page.bindEvents($('#app'));
        },
        bindEvents:function(container){
            var self = this;

            //懒加载
            M.lazyLoad.init({
                container: $('.u-goods-list')
            });

            // 提交评价
            container.on('click', '.js-review-submit', self.submitComment);
            container.on('click', '.js-star li', function () {
                var star = $(this).text();
                $(this).closest('ol').prev().attr('class', 'star star-' + star).data('star', star);
            });

            // 上传图片
            container.on('change', '.js-oss-file', function (e) {
                var file = e.target.files[0];
                $file = $(this);
                var formData = new FormData();
                formData.append('file', file);

                M.ajax({
                    type: 'post',
                    url: '/oss/uploadImage',
                    cache: false,
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (res) {
                        if (res.success) {
                            $file.closest('li').before('<li><div class="item"><img src="' + res.url + '" alt="" data-filename="' + res.name + '"><del></del></div></li>');
                            $file.val('');
                            if ($('.file li .item').length >= 5) {
                                $file.closest('li').hide();
                            }
                        }
                    }
                });
            });
        },
        // 提交评价
        submitComment:function(){
            var self = page, $app = $('#app'), API = self.config.api;
            var data = {
                    serveStar: +$('#serveStar').data('star'),
                    deliverySpeedStar : +$('#deliverySpeedStar').data('star')
                };
            if(data.serveStar == 0) return alert('服务态度评价不能为空');
            if(data.deliverySpeedStar == 0) return alert('配送速度评价不能为空');
            var jsonArrays = [];
            $app.find('.js-item').each(function (i, o) {
                var $item = $(this), pics = [];
                var json = $item.data();
                json.star = +$item.find('.star').data('star');
                json.content = $item.find('.js-review-ctn').val();
                if (json.content === '') {
                    alert('商品评价内容为空');
                    return false;
                }
                if (json.content.length > 140) {
                    alert('字数超出最大限制');
                    return false;
                }

                $item.find('.file li .item').each(function () {
                    pics.push($(this).find('img').data('filename'));
                });
                pics.length && (json.pics = pics.toString());
                jsonArrays.push(json);
            });
            if (jsonArrays.length === 0) {
                return;
            } else {
                data.jsonArrays = JSON.stringify(jsonArrays);
            }
            //return console.log('提交评价请求参数------>', data);
            M.ajax({
                url: API['commentGoodsTemplate'],
                data: {data: JSON.stringify(data)},
                success: function (res) {
                    // 跳转到评价成功结果页
                    //location.href = '/center#/order/result/' + data.orderNo + '/' + data.templateId + '/' + res.mbeanGet;
                    //location.href = '/center#/order/result/' + res.mbeanGet;
                    $app.html(res.template);
                }
            });
        }
    };
    page.init();
});