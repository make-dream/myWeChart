//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        message: '获取验证码',
        phone:'',
        num: 60,
        flag: false,
        errorMessage:'',
        status:true,
        focus:false,
        alertMessage:'账号验证成功'
    },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
    //事件处理函数
    bindViewTap: function() {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    //得到用户信息
    onLoad: function () {
        var that=this;
        //获取用户信息
      var data = app.globalData.personInfo;
            //更新数据
      that.setData({
        avatarUrl: data.avatarUrl,
        city: data.city,
        country: data.country ,
        gender: data.gender ,
        language: data.language ,
        province: data.province ,
        nickName: data.nickName
      })
    },
    //获取手机号
    getPhone:function(e){
        this.setData({
            phone: e.detail.value
        })
    },
    //获取验证码
    getValidate:function(e){
        this.setData({
            verifyCode: e.detail.value
        })
    },
    //发送手机验证码
    getcode: function () {
        var that = this;
        var num = that.data.num;
        var phoneNumber = that.data.phone;
        var reg = /^1[3|4|5|7|8|9]\d{9}$/;
        if (!phoneNumber) {
            that.setData({
                errorMessage: "请输入手机号码"
            });
            return false;
        } else if (reg.test(phoneNumber) == false && phoneNumber){
            that.setData({
                errorMessage: "请输入正确的手机号码"
            });
            return false;
        } else if (reg.test(phoneNumber) == true && phoneNumber){
            var num = that.data.num;
            var authToken = wx.getStorageSync('authToken');
            var webUrl = getApp().globalData.webUrl;
            if(num ==0 || num ==60){
                that.timeout();
                wx.request({
                    url: webUrl+"/public/auth/getVerifyCode",
                    method: 'POST',
                    data: {
                        phoneNumber: phoneNumber
                    },
                    header: getApp().globalData.header,
                    success: res => {
                        if(res.data.code == 1){
                            that.setData({
                                errorMessage: res.data.message,
                            });
                        }else{
                            that.setData({
                                errorMessage: '',
                            });
                        }
                    }
                })
            }

        }
    },
    //倒计时
    timeout:function(){
        var that=this;
        var num = that.data.num;
        if (num === 0) {
            that.setData({
                message: "重发",
                num: 60,
                status: true
            });
            clearTimeout(that.timeout);

        } else {
            num--;
            that.setData({
                message: '重发(' + num + 's)',
                num: num,
                status: false
            })
            setTimeout(function () {
                that.timeout();
            }, 1000);
        }
    },
    //input焦点事件
    listenerInput:function(){
        this.setData({
            foucs:true,
            errorMessage:''
        })
    },

    //绑定用户操作
    toList:function(){
        var that = this;
        var phoneNumber = that.data.phone;
        var reg = /^1[3|4|5|7|8|9]\d{9}$/;
        var verifyCode = that.data.verifyCode;
        if (!phoneNumber) {
            that.setData({
                errorMessage: "请输入手机号码"
            });
            return false;
        } else if (reg.test(phoneNumber) == false && phoneNumber) {
            that.setData({
                errorMessage: "请输入正确的手机号码"
            });
            return false;
        } else if (!verifyCode) {
            that.setData({
                errorMessage: "请输入验证码"
            });
            return false;
        } else if (reg.test(phoneNumber) == true && phoneNumber && verifyCode) {
            var authToken = wx.getStorageSync('authToken');
            var js_code = wx.getStorageSync('code');
            var webUrl = getApp().globalData.webUrl;
            wx.request({
                url: webUrl+"/public/auth/WXBindUser",
                method: 'POST',
                data: {
                    avatarUrl: that.data.avatarUrl ,
                    city: that.data.city ,
                    county: that.data.county ,
                    gender: that.data.gender ,
                    jsCode: js_code ,
                    language: that.data.language ,
                    nickName: that.data.nickName ,
                    phoneNumber: phoneNumber ,
                    province: that.data.province ,
                    verifyCode: verifyCode
                },
                header: getApp().globalData.header,
                success: res => {
                    var data=res.data;
                    var respCode = data.code;
                    if (respCode == 0) {
                        that.setData({
                            alertMessage: '账号验证成功',
                            flag: true
                        });
                    } else if (respCode==-1000){
                        that.setData({
                            alertMessage: '操作超时，请重新进行账号绑定操作！',
                            errorMessage: data.message,
                            flag: true
                        });
                    }else{
                        that.setData({
                            errorMessage: data.message
                        });
                    }
                }
            })
        }
    },
    //隐藏modal
    hidemodal:function(){
        this.setData({
            flag: true
        });
    },
    /**
     * 弹出框蒙层截断touchmove事件
     */
    preventTouchMove: function () {
    },
    confirm: function () {
        this.setData({
            flag: false
        })
        app.doWechatLogin();
    }
})
