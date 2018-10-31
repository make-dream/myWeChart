  // pages/find/find.js
  var util = require('../../utils/util.js');
  Page({

    /**
     * 页面的初始数据
     */
    data: {
      _num: 1,
      _way: 1,
      paylist: {},
      list: {},
      flag:true,
      len:1,
      message:'暂无数据',
      hidden:true,
      status:'查询',
      phoneFlag:false,
      end:false,
      phone:''
    },
    onPullDownRefresh: function () {
      wx.stopPullDownRefresh();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var time = util.formatTime(new Date());

        //判断开始时间
        //获取当前的日期
        var day=time.split('-')[2];
        //获取当前的月份
        var month = time.split('-')[1];
        var year = time.split('-')[0];
        this.setData({
            //设置开始时间
          datestart: time,
            //设置结束时间
          dateend: time,
            //设置结束时间的开始时间
          datastart1:time,
            //设置结束时间范围
          end: time,
            //设置开始时间范围
          start: year+'-'+month+'-'+ '01'
        });
    },
    //支付方式点击切换
    clickNum:function(e){
        this.setData({
            _num: e.target.dataset.num,
            flag: true
        })
    },
    //交易类型点击切换
    clickWay: function (e) {
      this.setData({
        _way: e.target.dataset.way,
        flag: true
      })
    },
    //获取手机号
    getPhone: function (e) {
      var val = e.detail.value;
      var reg = /^[0-9]*$/;
      if (val) {
        if (reg.test(val)) {
          this.setData({
            len: 1,
            message: '',
            phone: e.detail.value,
            flag: true,
            phoneFlag:true
          })
        } else {
          this.setData({
            len: 0,
            phone: e.detail.value,
            message: '请输入正确的手机号',
            phoneFlag: false
          })
        }
        var phoneFlag = this.data.phoneFlag;
        if (phoneFlag == true) {
          this.setData({
            cancel: true
          })
        } else {
          this.setData({
            cancel: false
          })
        }
      } else {
        var eng = this.data.eng;
        if (eng==true){
          this.setData({
            len: 1,
            message: '',
            phone: '',
            phoneFlag: true
          })
        }else{
          this.setData({
            cancel: false,
            phone: '',
            message: '请输入正确格式的订单号'
          })
        }
       
      }
    },
    //获取订单号
    getOrder: function (e) {
      var regNum = /^[0-9a-zA-Z]*$/g;
      var val = e.detail.value;
      var rsNum = regNum.test(e.detail.value);
      if (val) {
        if (rsNum) {
          this.setData({
            len: 1,
            order: e.detail.value,
            flag: true,
            message: '',
            eng: true
          })
        } else {
          this.setData({
            len: 0,
            order: e.detail.value,
            message: '请输入正确格式的订单号',
            eng:false
          })
        }
        var phoneFlag=this.data.phoneFlag;
        var phone=this.data.phone;
        var eng=this.data.eng;
        if (phoneFlag == true && phone){
          this.setData({
            cancel: true
          })
        }else{
          if (eng == true) {
            this.setData({
              cancel: true
            })
          } else {
            this.setData({
              cancel: false
            })
          }
        }
      } else {
        this.setData({
          len: 1,
          message: '',
          order:'',
          eng: true
        })
      }
    },
    //查看详情
    move: function (e) {
      var p = e.currentTarget.id;
      var status = e.currentTarget.dataset.status;
      var refundNo = e.currentTarget.dataset.id;
      //根据状态跳转页面
      if (status == '支付成功') {
        wx.navigateTo({ url: '/pages/view/view?id=' + p });
      } else {
        wx.navigateTo({ url: '/pages/refund/refund?id=' + p + '&refundNo=' + refundNo }) 
      }

    },
    //监听开始时间
    bindDateChange1:function(e){
      var that = this;
      that.setData({
        datestart: e.detail.value,
        datastart1: e.detail.value,
        flag: true
      });
    },
    //监听结束时间
    bindDateChange2: function (e) {
      var that = this;
      that.setData({
        dateend: e.detail.value,
        flag: true
      });
    },
    //提示框
    confirm:function(){
      this.setData({
        hidden: true
      })
    },
    //精确查询
    search:function(){
      var that=this;
      var cancel=that.data.cancel;
        that.setData({
          flag: true,
          len: 1
        })
        var start = that.data.datestart;
        var end = that.data.end;
        var paytype = that.data._num;
        if (paytype == 1) {
          paytype = 'wechatpay';
        } else if (paytype == 2) {
          paytype = 'alipay';
        } else {
          paytype = 'cmpay';
        }
        var paystatus = that.data._way;
        if (paystatus == 1) {
          paystatus = 'pay';
        } else {
          paystatus = 'refund';
        }
        var phone = that.data.phone;
        var order = that.data.order;
        var data = {};
        if (phone) {
          data.mobile = phone;
        }
        if (order) {
          data.tradeNo = order;
        }
        var authToken = wx.getStorageSync('authToken');
        var webUrl = getApp().globalData.webUrl;
        var header = getApp().globalData.header;
        if (phone || order) {
          if (cancel == true) { 
            that.setData({
              status: '查询中...'
            })
            wx.request({
              url: webUrl + '/transaction/order',
              method: 'POST',
              data: data,
              header: header,
              success: function (data) {
                that.setData({
                  status: '查询'
                })
                var eng = that.data.eng;
                if (eng == false) {
                  that.setData({
                    len: 0,
                    message: '无相关记录'
                  })
                } else {
                  if (data.data == '') {
                    that.setData({
                      len: 0,
                      message: '无相关记录'
                    })
                  } else {
                    if (data.data.code == 1) {
                      that.setData({
                        message: 'data.data.data.message',
                        len: 0
                      })
                    } else {
                      if (data.data.data.length > 0) {
                        that.setData({
                          list: data.data.data,
                          flag: false
                        })
                      } else {
                        that.setData({
                          len: 0,
                          message: '无相关记录'
                        })
                      }
                    }
                  }
                }
              }
            })
          }
          
        } else {
          that.setData({
            hidden: false
          })
        }
    }
  })