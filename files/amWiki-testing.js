/**
 * amWiki-testing
 * by Tevin
 *
 * 简单发送ajax测试工具
 * 仅当页面存在“请求地址”、“请求类型”、“请求参数”三个h3标题时触发
 */
var createTesting = function () {

    var request = {};
    //抓取请求地址
    var $urlAnchor = $('[name="请求地址"]');
    if ($urlAnchor.length == 0) {
        return;
    } else {
        request.url = $urlAnchor.parent().next().text().replace(/^\s+|\s+$/g, '');
        if (request.url.indexOf('/') == 0) {
            request.url = 'http://' + location.host + request.url;
        } else {
            request.url = 'http://' + location.host + '/' + request.url;
        }
    }
    //抓取请求类型
    var $metAnchor = $('[name="请求类型"]');
    if ($metAnchor.length == 0) {
        return;
    } else {
        request.method = $metAnchor.parent().next().text().replace(/^\s+|\s+$/g, '').toUpperCase();
        if (request.method != 'POST' && request.method != 'GET') {
            request.method = 'POST';
        }
    }
    //抓取请求参数
    var $parAnchor = $('[name="请求参数"]');
    if ($parAnchor.length == 0) {
        return;
    } else {
        if ($parAnchor.parent().next('table').length == 0) {
            request.param = null;
        } else {
            request.param = [];
            $parAnchor.parent().next('table').find('tbody').find('tr').each(function (i, element) {
                var $tds = $(this).find('td');
                request.param[i] = {
                    keyName: $tds.eq(0).text().replace(/^\s+|\s+$/g, ''),
                    valueType: $tds.eq(1).text().replace(/^\s+|\s+$/g, ''),
                    required: $tds.eq(2).text().replace(/^\s+|\s+$/g, ''),
                    describe: $tds.eq(3).text().replace(/^\s+|\s+$/g, ''),
                    default: $tds.eq(4).text().replace(/^\s+|\s+$/g, '')
                };
                if (request.param[i].required == '是' || request.param[i].required == 'yes' || request.param[i].required == 'true') {
                    request.param[i].required = 'required';
                } else {
                    request.param[i].required = '';
                }
                if (request.param[i].default == '-' || request.param[i].default == '无' || request.param[i].default == 'Null') {
                    request.param[i].default = '';
                }
            });
        }
    }

    //显示隐藏面板
    var $testingShow = $('<div class="testing-show">[<span>测试接口</span>]</div>');
    $('#main').append($testingShow);
    var $testingBox = $('#testingBox');
    var $view = $('#view');
    $testingBox.css('min-height', $view.height());
    $testingShow.on('click', function () {
        if ($testingShow.hasClass('on')) {
            $testingShow.removeClass('on').find('span').text('测试接口');
            $testingBox.hide();
            $view.show();
        } else {
            $testingShow.addClass('on').find('span').text('关闭测试');
            $testingBox.show();
            $view.hide();
        }
    });

    //面板基本
    var $testingParam = $('#testingParam');
    $('#testingBtnReset').on('click', function () {
        $testingParam.find('.testing-param-val').val('');
    });

    //填充参数列表数据
    $('#testingSendUrl').val(request.url);
    $('#testingSendType').find('option[value="' + request.method + '"]').prop('selected', true);
    var template = $('#templateFormList').text();
    if (request.param) {
        for (var i = 0; i < request.param.length; i++) {
            $testingParam.append(template.replace('{{describe}}', request.param[i].describe)
                .replace('{{keyName}}', request.param[i].keyName)
                .replace('{{default}}', request.param[i].default)
                .replace('{{valueType}}', request.param[i].valueType)
                .replace('{{required}}', request.param[i].required));
        }
    } else {
        $testingParam.append('<li>无</li>');
    }
    $('#testingBtnAdd').on('click', function () {
        $testingParam.append(template.replace('{{describe}}', '新增参数')
            .replace('{{keyName}}', '')
            .replace('{{default}}', '')
            .replace('{{valueType}}', 'any-type')
            .replace('{{required}}', ''));
    });

    //提交请求
    var $frame = $('#testingResponse');
    $('#testingBtnSend').on('click', function () {
        var param = null;
        if ($testingParam.find('input').length > 0) {
            param = {};
            $testingParam.find('li').each(function () {
                param[$(this).find('.testing-param-key').val()] = $(this).find('.testing-param-val').val();
            });
        }
        if (gParams.length > 0) {
            for (var i = 0; i < gParams.length; i++) {
                param[gParams[i].keyName] = gParams[i].value;
            }
        }
        $frame[0].contentWindow.location.reload();
        $.ajax({
            type: $('#testingSendType').val(),
            url: $('#testingSendUrl').val(),
            data: param,
            dataType: 'text',
            success: function (data) {
                var $frameBody = $($frame[0].contentWindow.document).find('body');
                $frameBody[0].innerHTML = data;
                setTimeout(function () {
                    $frame.height($frameBody.height());
                }, 100);
            },
            error: function (err) {
                var $frameBody = $($frame[0].contentWindow.document).find('body');
                $frameBody[0].innerHTML = err.responseText;
                setTimeout(function () {
                    $frame.height($frameBody.height());
                }, 100);
            }
        });
    });

    //全局参数
    var gParams = [];
    var gParamTmpl = $('#templateGlobalParam').text();
    var $testingGlobalParam = $('#testingGlobalParam');
    var $testingGlobal = $('#testingGlobal');
    $('#testingBtnGParam').on('click', function () {
        $testingGlobalParam.html('');
        gParams = JSON.parse(localStorage['amWikiGlobalParam'] || '[]');
        if (gParams.length == 0) {
            $testingGlobalParam.append('<li data-type="empty">无</li>');
        } else {
            for (var p = 0; p < gParams.length; p++) {
                $testingGlobalParam.append(gParamTmpl.replace('{{describe}}', gParams[p].describe)
                    .replace('{{keyName}}', gParams[p].keyName)
                    .replace('{{value}}', gParams[p].value));
            }
        }
        $testingGlobal.show();
    });
    $testingGlobal.find('.close').on('click', function () {
        $testingGlobal.hide();
    });
    $testingGlobal.find('.add').on('click', function () {
        $testingGlobalParam.find('[data-type="empty"]').remove();
        $testingGlobalParam.append(gParamTmpl.replace('{{describe}}', '')
            .replace('{{keyName}}', '')
            .replace('{{value}}', ''));
    });
    $testingGlobal.find('.save').on('click', function () {
        gParams.length = 0;
        $testingGlobalParam.find('li').each(function (i, elment) {
            var $inputs = $(this).find('input');
            if ($inputs.eq(1).val()) {
                gParams.push({
                    describe: $inputs.eq(0).val(),
                    keyName: $inputs.eq(1).val(),
                    value: $inputs.eq(2).val()
                });
            }
        });
        localStorage['amWikiGlobalParam'] = JSON.stringify(gParams);
        $testingGlobal.hide();
    });
    $testingGlobalParam.on('click', 'i', function () {
        $(this).parent().remove();
        if ($testingGlobalParam.find('li').length == 0) {
            $testingGlobalParam.append('<li data-type="empty">无</li>');
        }
    });


};