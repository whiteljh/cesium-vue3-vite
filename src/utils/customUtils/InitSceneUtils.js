import * as Cesium from "cesium";

export default class InitSceneUtils {
  constructor({ viewer }) {
    this.viewer = viewer;
    // this.initScene();
  }

  addShadow() {
    // 初始化场景
    this.viewer.shadows = true; //是否显示场景阴影
    this.viewer.scene.globe.enableLighting = true; //是否开启光照
    // this.viewer.timeline = true; //是否显示时间线
    //NOTE：增加时间线-在Cesium.Viewer中，timeline属性确实是一个只读属性，用于获取与视图器关联的时间线小部件。如果用户想要自定义时间线，应该通过其他方式实现，而不是直接赋值给viewer.timeline
    // const timelineContainer = document.getElementById("customTimeLine");
    // if (timelineContainer) {
    //   const timeline = new Cesium.Timeline(
    //     timelineContainer,
    //     this.viewer.clock
    //   );
    //   console.log("timeline: ", timeline);

    //   // 可以根据需要进一步配置 timeline，例如设置时间范围等
    // }
  }

  fixLight() {
    // 固定太阳光源位置
    this.viewer.scene.light = new Cesium.DirectionalLight({
      direction: new Cesium.Cartesian3(-0.5, -0.5, -1.0), // 光源方向
      intensity: 2.0, // 光照强度
    });
  }

  destroy() {
    
  }

}
