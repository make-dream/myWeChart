// pages/refund/refund.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var webUrl = getApp().globalData.webUrl;
    var header = getApp().globalData.header;
    that.setData({
      title: options.id,
      refundNo: options.refundNo
    })
    var id = that.data.title;
    var authToken = wx.getStorageSync('authToken');
    wx.request({
      url: webUrl + '/transaction/orderDetail',
      method: 'POST',
      data: {
        payOrderId: that.data.title,
        refundNo: that.data.refundNo
      },
      header: header,
      success: function (data) {
        that.setData({
          list: data.data.data
        })
      }
    })
  }
})