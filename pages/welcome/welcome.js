// pages/welcome/welcome.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    welcomeTip:''  
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({ welcomeTip: app.globalData.welcomeTip });  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.getSysUserInfo(); 
    app.doWechatLogin();  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  
  /**
   * 获得当前用户信息 Token有效性检查
   */
  getSysUserInfo: function () {
    // console.log('已运行 getSysUserInfo');    
    var webUrl = app.globalData.webUrl;
    var authToken = wx.getStorageSync('authToken');
    if (authToken) {
      wx.request({
        url: webUrl + '/user/getUserInfo',
        method: 'POST',
        header: { 'Content-Type': 'application/x-www-form-urlencoded', 'authToken': authToken },
        success: function (data) {
          var respCode = data.statusCode;
          var userData = data.data.data;
          if (200 == respCode && userData != null) {
            app.globalData.sysUserInfo = userData;
          }else{
            app.doWechatLogin();
          }

          if (app.globalData.sysUserInfo) {
            // console.info(app.globalData.sysUserInfo.roleId);
            app.successForward(app.globalData.sysUserInfo.roleIds);
          }
        },
        fail: function () {
          console.log('与服务通信失败 ' + webUrl);
          app.globalData.welcomeTip = '与服务通信失败 ' + webUrl;
        },
        complete: function () {
        }
      })
    }
  }
})