const app = getApp()
var that;
Page({
  data: {
    showModal: false,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')

  },
  bindGetUserInfo: function (res) {
    let that = this;
    const encryptedData = res.detail.encryptedData;
    const iv = res.detail.iv;

    if (encryptedData && iv) {
      console.log("授权成功跳转欢迎页");
      wx.navigateBack({
        delta: 1
      })

    } else {
      console.log("授权失败");
      wx.showToast({
        title: '授权失败',
        icon: 'none',
        duration: 2000
      })

    }
  }
})