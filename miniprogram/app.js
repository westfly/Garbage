//app.js
const WXAPI = require('wxapi/main')
const CONFIG = require('config.js')
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function(res) {
      console.log(res.hasUpdate)
      if (res.hasUpdate) {
        updateManager.onUpdateReady(function() {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function(res) {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
    updateManager.onUpdateFailed(function() {
      // 新版本下载失败
    })
    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        if (networkType === 'none') {
          that.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    });
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange(function(res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000,
          complete: function() {
            that.goStartIndexPage()
          }
        })
      } else {
        that.globalData.isConnected = true
        wx.hideToast()
      }
    });
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      console.log("add loging");
      wx.login({
        success: function (res) {
          console.log("add loging", res);
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              console.log("getUserInfo loging", res);
              typeof cb == "function" && cb(that.globalData.userInfo)
            },
            fail: function (res) {
              console.log('获取用户信息失败')
              console.log(res)
            }
          })
        }
      })
    }
  },
  goLoginPageTimeOut: function() {
    if (this.navigateToLogin){
      return
    }
    wx.removeStorageSync('token')
    this.navigateToLogin = true
    setTimeout(function() {
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
    }, 1000)
  },
  goStartIndexPage: function() {
    setTimeout(function() {
      wx.redirectTo({
        url: "/pages/start/start"
      })
    }, 1000)
  },  
  onShow (e) {
    console.log('app.js --- onShow')    
    this.globalData.launchOption = e
    // 保存邀请人
    if (e && e.query && e.query.inviter_id) {
      wx.setStorageSync('referrer', e.query.inviter_id)
      if (e.shareTicket) {
        // 通过分享链接进来
        wx.getShareInfo({
          shareTicket: e.shareTicket,
          success: res => {
            // console.error(res)
            // console.error({
            //   referrer: e.query.inviter_id,
            //   encryptedData: res.encryptedData,
            //   iv: res.iv
            // })
            WXAPI.shareGroupGetScore(
              e.query.inviter_id,
              res.encryptedData,
              res.iv
            )
          }
        })
      }
    }
    this.navigateToLogin = false
    this.checkLoginStatus()
  },
  checkLoginStatus(){ // 检测登录状态
    const _this = this
    const token = wx.getStorageSync('token');
    if (!token) {
      _this.goLoginPageTimeOut()
      return
    }
    WXAPI.checkToken(token).then(function (res) {
      if (res.code != 0) {
        wx.removeStorageSync('token')
        _this.goLoginPageTimeOut()
        return
      }
    })
    wx.checkSession({
      fail() {
        _this.goLoginPageTimeOut()
        return
      }
    })
    // 已经处于登录状态，检测是否强制需要手机号码
    if (CONFIG.requireBindMobile) {
      WXAPI.userDetail(token).then(function (res) {
        if (res.code == 0) {
          if (!res.data.base.mobile) {
            wx.navigateTo({
              url: "/pages/authorize/bindmobile"
            })
          }
        }
      })
    }    
  },
  globalData: {                
    isConnected: true,
    launchOption: undefined,
    vipLevel: 0
  }
})