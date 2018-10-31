//app.js
App({
    /**
     * 全局数据
     */
    globalData: {
        userInfo: null,
        sysUserInfo:null,//本系统用户信息
        webUrl: 'http://127.0.0.1:8080/wechatapi',
        welcomeTip: '用户认证中...',
        header: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie':'', 'xCsrfToken':''}
    },

    /**
     * 启动时运行
     */
    onLaunch:function(){

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
    },

    /**
     * 通过微信进行登录
     * （当Token过期时也通过此方法进行重新登录）
     */
    doWechatLogin:function(){
        console.log('已运行 doWechatLogin');
        var that = this;
        //调用微信登录接口获得登录口令码
        wx.login({
            success: function (data) {
                if (data.code) {
                  var code = data.code;
                  that.getUserInfo(code);
                }

            },
            fail: function (data) {
                console.log(data)
            }
        })
    },

    /**
     * 从微信获得最新的用户信息
     * （绑定用户时调用）
     */
  getUserInfo: function (code) {
        var that = this;
        wx.getUserInfo({
            success: function (res) {
                that.globalData.personInfo = res.userInfo
                typeof cb == "function" && cb(that.globalData.personInfo);
                wx.setStorageSync('code', code);
                wx.request({
                  url: that.globalData.webUrl + '/public/auth/login',
                  data: {
                    js_code: code
                  },
                  header: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  method: 'POST',
                  success: function (res) {
                    var data = res.data;
                    if (data.code == 400) {
                      that.globalData.header.Cookie = 'JSESSIONID=' + data.data.sessionId;
                      that.globalData.header.xCsrfToken = data.data.csrfToken;
                      wx.setStorageSync('authToken', data.data.authToken);
                      wx.redirectTo({
                        url: '/pages/login/login'
                      })
                    } else if (data.code == 0) {
                      that.globalData.header.Cookie = 'JSESSIONID=' + data.data.sessionId;
                      that.globalData.header.xCsrfToken = data.data.csrfToken;
                      wx.setStorageSync('authToken', data.data.authToken);
                      that.successForward();

                    }
                  }
                })
            },
            fail:function(data){
              console.log('未授权');
              wx.showModal({
                title: '警告',
                content: '尚未进行授权，请点击确定跳转到授权页面进行授权。',
                success: function (res) {
                  if (res.confirm) {
                    console.log('跳转授权页面');
                    wx.redirectTo({
                      url: '../accredit/accredit'
                    })
                  }else{
                    that.doWechatLogin();
                  }
                }
              })
            }
        })
    },

    /**
     * 登录后页面跳转 集中处理
     * （根据不同的角色权限进行跳转）
     */
    successForward:function(){
      var that=this;
      wx.request({
        url: that.globalData.webUrl + '/user/info',
        method: 'POST',
        header: that.globalData.header,
        success: function (data) {
          var data = data.data.data;
          that.globalData.sysUserInfo = data;
          var permissions = data.permissions.length;
          wx.setStorageSync('admin', permissions==3?true:false);
          if (permissions==3) {
            wx.redirectTo({
              url: '/pages/charts/charts'
            })
          } else {
            wx.redirectTo({
              url: '/pages/list/list'
            })
          }
        }
      })
    }


})