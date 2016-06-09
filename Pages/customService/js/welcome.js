$(function () {
    var firstUrl = '';
    /*初始化菜单*/
    initMenu();
    /*设置用户名*/
    initUsername();
    /*隐藏模块*/
//    hideModular();
    /*监听退出登录*/
    listenLogout();
    /*监听菜单缩放*/
    listenMenu();

	$('#firstModular').on('click', '.nav-list > li', function(e, type){
		var $this = $(this);
		var idx = $this.index();
        if(editPass() === 'false'){
            return;
        }
        $('#firstModular > .nav-list > li > a').removeClass('active');
        $('.sidebar-two li a.active').removeClass('active');
        $this.find('> a').addClass('active');
        if(!type && $this.find('> a').attr('href') === window.location.hash){
            listenUrl();
        }
	});

	$('.sidebar-two').on('click', 'li', function(e, type){
		var $this = $(this);
		var idx = $this.index();
       if(editPass() === 'false'){
           return;
       }
        $('.sidebar-two li a').removeClass('active');
        $this.find('a').addClass('active');
        if(!type && $this.find('a').attr('href') === window.location.hash){
            listenUrl();
        }
	});

	listenUrl();
    placeholder_IE10();
    resizeWindow();
});

$(window).
off('hashchange').
on('hashchange', function(e){
    listenUrl();
});

function initUsername(){
    var name = window.localStorage.getItem("CUSTOM_PERMISSION_USERNICKNAME");
    if(name){
        $('#user-info').html(name).attr('title', name);
        $('.ace-nav').show();
    }else{
        window.location.href = myConfig.logOutUrl;
    }
}

function hideModular(){
    var power = window.localStorage.getItem("CUSTOM_PERMISSION_USEPOWER");
    if (power != '超级管理员' && power != '客服管理员') {
        $('.nav a[href="#user/admin"]').parent().remove();
    }
    if (power != '客服管理员') {
        $('.nav a[href="#user/Qmanage"]').parent().remove();
    }

    if (power == '超级管理员') {
        $('.sidebar-one').hide();
        $('.nav a[href="#user/myFireware"]').parent().remove();
        $('.nav a[href="#user/myQlist"]').parent().remove();
        $('.sidebar-one').toggleClass('menu-min');
        $('#main-content').css('margin-left', '-50px');
        $('#main-content').css('width', '103%');
        $('.main-content').css('overflow-x', 'hidden');
    }else{
        $('.sidebar-one').show();
    }
	if(power=="客户"){
        $('.nav a[href="#question/myQlist"]').parent().remove();
        $('.nav a[href="#question/Qmanage"]').parent().remove();
	}else{
        $('.nav a[href="#question/myQlist2"]').parent().remove();
	}
}

/*退出登录*/
function listenLogout(){
    $('#logOut').click(function(){
        var url = '/Customer/home/user/logout';
        if( confirm('确定要退出吗') ){
            $.ajax({
                url : myConfig.webUrl + url,
                type : 'post',
                success: function(data){
                    window.localStorage.CUSTOM_PERMISSION_USERNICKNAME = "";
                    window.localStorage.CUSTOM_PERMISSION_USEPOWER = "";
                    window.localStorage.CUSTOM_PERMISSION_USERNAME = "";
                    window.location.href = myConfig.logOutUrl;
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    ajaxError(XMLHttpRequest, textStatus, errorThrown);
                }
            });
        }
    });
}

/*监听url变化*/
function listenUrl(){
    var hash = window.location.hash;
    var url = hash.replace(/#/, "views/");
    var module = hash && hash.split('#')[1].split('/')[0];      //当前要显示的模块

    var $obj = null;

    if(editPass() === 'false' && url !== 'views/user/personal'){
        $obj = $('#firstModular a').filter('[href="#user/personal"]');     //匹配需要点击的菜单
    }else{
        $obj = $('#firstModular a').filter('[href="'+ hash +'"]');     //匹配需要点击的菜单
    }
    if(!$obj.length){
        if (firstUrl === '') {
            alert('用户无节点权限！');
        }
    	$obj = $('#firstModular a').filter('[href="#' + firstUrl + '"]');
        $obj.trigger('click', true);
        showLoading();
        $('#main-content').css('visibility', 'hidden');
        $('#main-content').load('views/' + firstUrl + '.html?_=' + Date.now(), function(data, status){
            var h = $(window).height() - 50;
            $('.main-content').css('height', h);
            loadScript(url);
        });
        document.location.hash='#'+firstUrl;
        return;
    }

    if($obj.length === 0){
        window.location.href = myConfig.logOutUrl;
    }else{
    	$obj.trigger('click', true);
        refreshModule($obj.attr('href').replace(/#/, "views/"));     //读取当前模块信息并显示
    }
}

/*获取数据显示模块内容*/
function refreshModule(url){
    showLoading();
    $('#main-content').css('visibility', 'hidden');
    $('#main-content').load(url + '.html?_=' + Date.now(), function(data, status){
        var h = $(window).height() - 50;
        $('.main-content').css('height', h);
        loadScript(url);
    });
}

function loadScript(url){
    $.getScript(url + '.js', function(){
        hideLoading();
        $('#main-content').css('visibility', 'visible');
    });
}

function resizeWindow(){
    $(window).on('resize', function(){
        var h = $(window).height() - 50;
        $('.main-content').css('height', h);
    });
}

function listenMenu(){
    $('#sidebar-collapse > i').on('click', function(){
        var $this = $(this);
        $('.sidebar-one').toggleClass('menu-min');
        if($this.hasClass('fa-angle-double-left')){
            $this.get(0).className = 'fa fa-angle-double-right';
        }else{
            $this.get(0).className = 'fa fa-angle-double-left';
        }
    });
}

function editPass(){
    return window.localStorage.getItem("CUSTOM_PERMISSION_MOFIDYPASSWROK");
}

function initMenu() {
    JqGet('/Customer/Home/Menu/getMenu?uid='+window.localStorage.getItem("CUSTOM_PERMISSION_ID"), function(data) {
        var headSumStr = '';
        firstUrl = data.retval[0].name;
        for (var i = 0,j = 0; i < data.retval.length; i++) {
            if (data.retval[i].position === 'left') {
                var leftStr = '<li><a href="#' + data.retval[i].name + '" class="dropdown-toggle app"><i class="menu-icon fa ' + data.retval[i].icon + '"></i><span class="menu-text">' + data.retval[i].title + '</span></a></li>';
                $('#firstModular').children('ul[class=nav-list]').append(leftStr);
            }
            if (data.retval[i].position === 'head') {
                if (j === 0) {
                    var headLeft = '<li style="display: none;"><a href="#" class="dropdown-toggle user"><i class="menu-icon fa fa-user"></i>用户中心</a><div class="sidebar-two"><ul class="nav-list"></ul></div></li>';
                    $('#firstModular').children('ul[class=nav-list]').append(headLeft);
                    var head = '<li><a href="#' + data.retval[i].name + '" class="dropdown-toggle"><i class="menu-icon fa ' + data.retval[i].icon + '"></i>' + data.retval[i].title + '</a></li>';
                    $('#firstModular .nav-list .nav-list').append(head);
                    headSumStr += '<li><a href="#' + data.retval[i].name + '" class="dropdown-toggle"><i class="menu-icon fa ' + data.retval[i].icon + '"></i>&nbsp;' + data.retval[i].title + '</a></li>';
                    j++;
                }else{
                    var head = '<li><a href="#' + data.retval[i].name + '" class="dropdown-toggle"><i class="menu-icon fa ' + data.retval[i].icon + '"></i>' + data.retval[i].title + '</a></li>';
                    $('#firstModular .nav-list .nav-list').append(head);
                    headSumStr += '<li><a href="#' + data.retval[i].name + '" class="dropdown-toggle"><i class="menu-icon fa ' + data.retval[i].icon + '"></i>&nbsp;' + data.retval[i].title + '</a></li>';
                }
            }
        }
        $('.pull-right ul ul').prepend(headSumStr);
    });
}