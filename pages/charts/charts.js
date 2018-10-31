// pages/charts/charts.js
var Charts = require('../../utils/wxcharts.js');
var lineChart = null;
var startPos = null;
var webUrl = getApp().globalData.webUrl;
var header = getApp().globalData.header;
Page({
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
  /**
   * 页面的初始数据
   */
  data: {
    flag: true,
    tab: 1,
    name: '',  //省市
    details: {}, //每日详情
    orderAmountSum: 0, //总支付金额
    orderNumSum: 0,  //总支付订单
    status:true,
    dateChoose:'',
    x: [],  //x轴坐标
    yAxisNum: [],  //订单数y坐标
    yAxisAmount: []   //订单金额y坐标
  },
  touchHandler: function (e) {
    lineChart.scrollStart(e);
  },
  moveHandler: function (e) {
    lineChart.scroll(e);
  },
  touchEndHandler: function (e) {
    var that = this;
    var date = ''; //存放点击的日期
    lineChart.scrollEnd(e);
    lineChart.showToolTip(e, {
      format: function (item, category) {
        date = category;
        var num;
        item.data ? num = item.data:num=0;
        return category + ' ' + item.name + ':' + num + '笔'
      }
    });
    var index = lineChart.getCurrentDataIndex(e);  //日期索引
    var tab = that.data.tab;
    date = that.data.x[index];
    if(date){
      var todayList = that.data.details[date];
      var name=that.data.name;
      that.setData({
      dateChoose: date
    })
      if (tab == 1) {
        if (todayList){
          todayList.sort(function (x, y) {
            return parseInt(x.orderNum) - parseInt(y.orderNum)
          })
          todayList = todayList.reverse();
        }
        var newList = that.newList(todayList);
        that.setData({
          title: date + name+'支付订单量',
          list: newList
        })
      } else {
        if (todayList){
          todayList.sort(function (x, y) {
            return parseInt(x.orderAmount) - parseInt(y.orderAmount)
          })
          todayList = todayList.reverse();
        }
        var newList = that.newList(todayList);
        that.setData({
          title: date + name+'支付金额',
          list: newList
        })
      }
    }
    

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (type) {
    var webUrl = getApp().globalData.webUrl;
    var authToken = wx.getStorageSync('authToken');
    var that = this;
    that.setData({
      windowWidth: wx.getSystemInfoSync().windowWidth
    })
    if (typeof type == 'object') {
      type = 'line';
    }
    wx.request({
      url: webUrl + '/business-analysis/statistics?sortByNum=true',
      method: 'POST',
      header: header,
      success: function (data) {
        if(data.data.code==0){
          var data = data.data.data;
          var details = data.details;                                //当月营业厅详情
          var x = data.xAxis;                                               //x轴坐标
          var todayList = details[x[x.length - 1]];                            //昨天数据详情
          if (type == 'line') {
            var yAxisNum = data.yAxisNum;
            var yAxisAmount = data.yAxisAmount;
            var dayNum = yAxisNum[yAxisNum.length - 1] == 0 ? 0 : that.splitNum(yAxisNum[yAxisNum.length - 1]); //昨日订单数
            var dayTotal = yAxisAmount[yAxisAmount.length - 1] == 0 ? '0.00' : that.splitNum((yAxisAmount[yAxisAmount.length - 1]).toFixed(2)); //昨日金额
            var orderNumSum = data.orderNumSum==0?0: that.splitNum(data.orderNumSum);                  //当月订单数
            var orderAmountSum = data.orderAmountSum == 0 ? '0.00': that.splitNum(data.orderAmountSum.toFixed(2));
            var newList = that.newList(todayList);
            that.setData({
              x: x,
              yAxisNum: yAxisNum,
              yAxisAmount: yAxisAmount,
              details: details,
              list: newList,
              dateChoose: x[x.length - 1],
              dayTotal: dayTotal,
              name: data.name,
              title: x[x.length - 1] + data.name+ '支付订单量',
              dayNum: dayNum,
              orderNumSum: orderNumSum,
              orderAmountSum: orderAmountSum
            })
            var y = data.yAxisNum;
            that.draw(x, y, type, 0);
          }
        }
      }
    })
  },
  newList:function(object){
    var that=this;
    var newList = [];
    if (object) {
      object.map(function (i) {
        var obj = {};
        obj.name = i.name;
        if (i.orderNum){
          obj.orderNum =  that.splitNum(i.orderNum) ;
        }else{
          obj.orderNum =  0;
        }
        obj.numPerCent = i.numPerCent;
        if (i.orderAmount){
          obj.orderAmount = that.splitNum(i.orderAmount) ;
        }else{
          obj.orderAmount =  0;
        }
        
        obj.amountPercent = i.amountPercent;
        newList.push(obj);
      })
      that.setData({
        status: false
      })
    } else {
      that.setData({
        status: true
      })
    }   
    return newList;
  },
  //列表切换
  tab: function (e) {
    var that = this;
    var index = that.data.tab;
    var _num = e.target.dataset.num;
    if (index == _num) {
      return false;
    } else {
      var x = that.data.x;
      var date = x[x.length - 1];  //今天的日期
      var name=that.data.name;
      var todayList = that.data.details[date];
      if (_num == 1) {
        if (todayList){
          todayList.sort(function (x, y) {
            return parseInt(x.orderNum) - parseInt(y.orderNum)
          })
          todayList = todayList.reverse();
        }
        var newList = that.newList(todayList);
        var y = that.data.yAxisNum;
        that.setData({
          list: newList,
          title: date + name+'支付订单量'
        })
        that.draw(x, y, 'line', 0);
      } else {
        if (todayList){
          todayList.sort(function (x, y) {
            return parseInt(x.orderAmount) - parseInt(y.orderAmount)
          })
          todayList = todayList.reverse();
        }
        var newList = that.newList(todayList);
        var y = that.data.yAxisAmount;
        that.setData({
          list: newList,
          title: date + name+'支付金额'
        })
        that.draw(x, y, 'column', 2);

      }
      that.setData({
        tab: _num,
        dateChoose: date
      })
    }
  },
  //绘制图形
  draw: function (x, y, type, num) {
    var that = this;
    lineChart = new Charts({
      canvasId: 'stock1',
      type: type,
      categories: x,
      series: [{
        name: '订单成交量',
        data: y,
        format: function (val) {
          return that.splitNum(val);
        },

        color: '#0598ff'
      }],
      legend: false, //隐藏下方描述
      background: 'white',
      width: that.data.windowWidth,
      height: 252,
      dataPointShape: true,
      enableScroll: true,
      dataLabel: true,
      yAxis: {
        title: '成交金额 (万元)',
        disabled: true,  //隐藏y轴
        format: function (val) {
          return that.splitNum(val);
        },
        min: 0
      },
      xAxis: {
        disableGrid: true    //x轴取消网格
      },
      extra: {
        lineStyle: 'curve', // (仅对line, area图表有效) 可选值：curve曲线，straight直线 (默认)
        column: {
          width: 20,
        }
      }
    });
  },
  //分割金额
  splitNum: function (str) {
    if (!str) {
      return "";
    }
    var tab=this.data.tab;
    if(tab==2){
      str = str.toFixed(2);
    }
    var strArr = (str + "").split("").reverse().join("").replace(/(\d{3})/g, "$1,").split("").reverse();
    strArr[0] == "," && (strArr[0] = "");
    return strArr.join("");
  },
  tomy: function () {
    wx.redirectTo({
      url: '../my/my'
    })
  },
  tolist: function () {
    wx.redirectTo({
      url: '../list/list'
    })
  }
})