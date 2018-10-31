//my.js
const app = getApp()
var time = null;
Page({
  data: {
    flag: false,
    admin: false,  //权限
    scroll: false,
    num: 0,
    userImg: '',
    userName: ''
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
  onLoad: function () {
    var that = this;
    that.setData({
      admin: wx.getStorageSync('admin')
    })
    var webUrl = getApp().globalData.webUrl;
    var sysUserInfo = app.globalData.sysUserInfo;
    var header = getApp().globalData.header;
    if (sysUserInfo) {
      //归属地过长
      var hallName = sysUserInfo.resource;
      if (hallName.length > 15) {
        that.setData({
          scroll: true
        })
        var num = that.data.num;
        time = setInterval(function () {
          console.log(num)
          if (num < -500) {
            num = 50;
            that.setData({
              num: 50
            })
          } else {
            num--;
            that.setData({
              num: num
            })
          }
        }, 50);
      }
      that.setData(sysUserInfo);
      that.setData({
        userImg: sysUserInfo.avatarUrl,
        realName: sysUserInfo.name,
        hallName: hallName,
        phone: sysUserInfo.mobile,
        jobNum: sysUserInfo.jobNum
      });
    } else {
      wx.request({
        url: webUrl + '/user/info',
        method: 'POST',
        header: header,
        success: function (data) {
          var data = data.data.data;
          console.log(data)
          that.setData({
            userImg: data.avatarUrl,
            realName: data.name,
            phone: data.mobile,
            jobNum: data.jobNum,
            hallName: data.resource
          });
          app.globalData.sysUserInfo = data;
        }
      })
    }
  },
  tolist: function () {
    wx.redirectTo({
      url: '../list/list'
    })
  },
  toChart: function () {
    wx.redirectTo({
      url: '../charts/charts'
    })
  },
  logout: function () {
    this.setData({
      flag: true
    });
  },
  //隐藏modal
  hidemodal: function () {
    this.setData({
      flag: false
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
  },
  cancel: function () {
    this.setData({
      flag: false
    })
  },
  onUnload: function () {
    clearInterval(time);
  }
})
