const app = getApp();
Page({
  data: {
    ColorList: [
      "../../images/RecycleableWaste.jpg",
      "../../images/HazardouAwaste.jpg",
      "../../images/HouseholdfoodWaste.jpg",
      "../../images/ResidualWaste.png",
    ]
  },
  goSearch: function () {
    wx.navigateTo({
      url: '/pages/ai/search',
    })
  },
  onClick:function(e){
    console.log(JSON.stringify(e))
    var index = e.currentTarget.dataset.index
    var indexClick= index + 1;
    wx.navigateTo({
      url: '/pages/ai/filter/filter?type=' + indexClick,
    })
  }
})