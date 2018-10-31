// pages/list/list.js
var util = require('../../utils/util.js');  
let animationShowHeight = -500;  
var webUrl = getApp().globalData.webUrl;
var header = getApp().globalData.header;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    start:'',
    end:'',
    animationData: "",
    showModalStatus: false,
    _num: 1,
    _type:1,
    search:'',
    orderList: [], //订单列表
    cursor:1,
    isHideLoadMore:true,
    load:false,
    admin:false,    //权限
    nomore:true
  },
  onLoad:function(url,timer){
    this.setData({
      admin:wx.getStorageSync('admin')
    })
      var data = {};
      var b = (JSON.stringify(url) == "{}");
      if(b){
          url= '/transaction/pay';
      }
      var time = util.formatTime(new Date());
    //判断开始时间
    //获取当前的日期
    var year = time.split('-')[0];
    var day = time.split('-')[2]; 
    //获取当前的月份
    var month = time.split('-')[1];
    if (month - 3 == 0) {
      month = 12;
      year = year - 1;
    } else if (month - 3 > 0) {
      month = month - 3;
    } else {
      month = month - 3 + 12;
      year = year - 1;
    }
    this.setData({
      datestart: time,
      end: time,
      nomore: true,
      start:year+'-'+month+'-'+ '01'
    });
    if (!timer){
      timer=time;
    }
    var that=this;
    var authToken = wx.getStorageSync('authToken');
    var cursor = parseInt(that.data.cursor);
    that.setData({
      load: true,
      isHideLoadMore:false
    })
    wx.request({
      url: webUrl +url,
      method:'POST',
      data: {
        targetDate: timer,
        pageNum: cursor,
        pageSize: 10
      },
      header: header, 
      success:function(data){
        if(data.data.code == 1){
          that.setData({
            code: data.data.code,
            error: data.data.message,
          })
        }else{
          if (cursor==1){
            if (data.data.data.list.length>1){
              that.setData({
                orderList: data.data.data.list,
                cursor: cursor + 1,
                nomore: true
              })
            }else{
              that.setData({
                nomore: false
              })
            }
          }else{
            var list = that.data.orderList;
            var list2 = data.data.data.list;
            if (list2.length == 0){
              that.setData({
                nomore: false,
                cursor: -1
              })
            }else{
              list = list.concat(list2);
              that.setData({
                orderList: list,
                cursor: data.data.data.pageNum+1
              })
            }
            
          }
        }
      },
      complete:function(){
        that.setData({
          load: false,
          isHideLoadMore: true
        })
        wx.hideNavigationBarLoading(); //完成停止加载
        wx.stopPullDownRefresh();
        that.setData({
          position: 'fixed'
        })
      }
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    if (that.data.nomore == true){
      wx.showNavigationBarLoading(); //在标题栏中显示加载
      that.setData({
        cursor: 1,
        isHideLoadMore: true,
        nomore: true
      })
      var time = that.data.nowDay;
      if(that.data.load==false){
        that.setData({
          position:'static'
        })
        if (that.data._type == 1) {
          that.onLoad('/transaction/pay', time);
        } else {
          that.onLoad('/transaction/refund', time);
        }
        that.setData({
          datestart: time,
          nowDay: time
        })
        
      }
    }else{
      wx.stopPullDownRefresh();
    }
    
  },
  //上拉加载
  onReachBottom:function(e){
    var that=this;
    if (that.data.nomore == true){
      if(that.data.load==false){
        that.setData({
          isHideLoadMore: false
        })
        var cursor = that.data.cursor;
        var time = that.data.nowDay;
        if (cursor == '-1') {
          that.setData({
            nomore: false,
            isHideLoadMore: true,
          })
        } else {
          if (that.data._type == 1) {
            that.onLoad('/transaction/pay', time);
          } else {
            this.onLoad('/transaction/refund', time);
          }
          that.setData({
            datestart: time
          })
        }
      }
    }
  },
  //查询支付||退款
  menuClick:function(e){
    if (e.target.dataset.num==this.data._type){
      return false;
    }else{
      this.setData({
        cursor: 1,
        orderList: []
      })
      var time = this.data.nowDay ? this.data.nowDay : this.data.datestart;
      if (e.target.dataset.num == 1) {
        this.onLoad('/transaction/pay', time);
      } else {
        this.onLoad('/transaction/refund',time);
      }
      this.setData({
        _type: e.target.dataset.num,
        datestart:time
      })
    }
  },
  // 点击日期组件确定事件 
   bindDateChange: function (e) {
      var that=this;
      if (that.data.load == false){
       var time = e.detail.value;
       that.setData({
         nomore: true,
         cursor: 1,
         orderList: []
       });
       if (that.data._type == 1) {
         that.onLoad('/transaction/pay', time);
       } else {
         that.onLoad('/transaction/refund', time);
       }
       that.setData({
         datestart: time,
         nowDay: time
       })
      }
      
   },
  move:function(e){
    var p = e.currentTarget.id;
    var status = e.currentTarget.dataset.status;
    var refundNo = e.currentTarget.dataset.id;
    //根据状态跳转页面
    if (status =='支付成功'){
      wx.navigateTo({ url: '/pages/view/view?id=' + p }) ;
    }else{
      wx.navigateTo({ url: '/pages/refund/refund?id=' + p + '&refundNo=' + refundNo}) 
    }
    
  },
  tomy:function(){
    wx.redirectTo({
      url: '../my/my'
    })
  },
  toChart: function () {
    wx.redirectTo({
      url: '../charts/charts'
    })
  },
  tofind:function(){
    wx.navigateTo({
      url: '../find/find'
    })
  },
  //前一天
  prev:function(){
    if (this.data.load == false){
      this.setData({
        nomore: true,
        cursor: 1,
        orderList: []
      })
      var time;
      //获取现在的日期
      var daystart = this.data.nowDay ? this.data.nowDay : this.data.datestart;

      daystart = daystart.split('-');
      var data1 = [1, 3, 5, 7, 8, 10, 12];
      var data2 = [4, 6, 9, 11];
      var day = parseInt(daystart[2]);
      var month = parseInt(daystart[1]);
      var year = parseInt(daystart[0]);

      if (day == 1) {
        if (month == 1) {
          month = 12;
          day = 31
          year = year - 1;
        } else {
          month = month - 1;
          if (data1.indexOf(month) >= 0) {
            day = 31;
          } else if (data2.indexOf(month) >= 0) {
            day = 30;
          } else {
            if (year % 4 == 0) {
              day == 29;
            } else {
              day == 28;
            }
          }
        }
      } else {
        day = day - 1;
      }

      var today = day;
      var month1 = month;
      month = month.toString();
      day = day.toString();
      if (day.length == 1) {
        today = '0' + today;
      }
      if (month.length == 1) {
        month1 = '0' + month1;
      }
      time = year + '-' + month1 + '-' + today;
      var that = this;
      that.setData({
        nowDay: time,
        datestart: time
      })
      if (that.data._type == 1) {
        that.onLoad('/transaction/pay', time);
      } else {
        that.onLoad('/transaction/refund', time);
      }
      that.setData({
        datestart: time
      })
    }
    
  },
  next:function(){
    if(this.data.load==false){
      this.setData({
        nomore: true,
        cursor: 1,
        orderList: []
      })
      //获取当天的日期
      var time = util.formatTime(new Date());
      var day1 = time.split('-')[2];
      var time1 = Date.parse(new Date(time.replace(/-/g, "/")));
      //console.log('1970到现在的毫秒数' + time1);
      //获取现在的日期
      var daystart = this.data.nowDay ? this.data.nowDay : this.data.datestart;
      var daystart1 = Date.parse(new Date(daystart.replace(/-/g, "/")));
      //console.log('1970到选择时间的毫秒数' + daystart1);
      var day2 = daystart.split('-')[2];
      var data1 = [1, 3, 5, 7, 8, 10, 12];
      var data2 = [4, 6, 9, 11];
      if (time1 - daystart1 > 0) {
        daystart = daystart.split('-');
        var day = parseInt(daystart[2]);
        var month = parseInt(daystart[1]);
        var year = parseInt(daystart[0]);
        if (data1.indexOf(month) >= 0) {

          if (month == 12) {
            if (day == 31) {
              day = 1;
              month = 1;
              year = year + 1;
            } else {
              day = parseInt(daystart[2]) + 1;
            }
          } else {
            if (day == 31) {
              day = 1;
              month = month + 1;
            } else {
              day = parseInt(daystart[2]) + 1;
            }
          }

        } else if (data2.indexOf(month) >= 0) {
          if (day == 30) {
            day = 1;
            month = month + 1;
          } else {
            day = parseInt(daystart[2]) + 1;
          }
        } else if (month == 2) {
          if (year % 4 == 0) {
            if (day == 29) {
              day = 1;
              month = month + 1;
            } else {
              day = parseInt(daystart[2]) + 1;
            }
          } else {
            if (day == 28) {
              day = 1;
              month = month + 1;
            } else {
              day = parseInt(daystart[2]) + 1;
            }
          }
        }

        var today = day;
        var month1 = month;
        month = month.toString();
        day = day.toString();
        if (day.length == 1) {
          today = '0' + today;
        }
        if (month.length == 1) {
          month1 = '0' + month1;
        }
        if (today != 0) {
          daystart = year + '-' + month1 + '-' + today;
          var that = this;
          that.setData({
            nowDay: daystart
          })
          if (that.data._type == 1) {
            that.onLoad('/transaction/pay', daystart);
          } else {
            that.onLoad('/transaction/refund', daystart);
          }
          that.setData({
            datestart: daystart
          })
        } else {
          return false;
        }
      } else {
        return false;

      }
    }
    
  }
})