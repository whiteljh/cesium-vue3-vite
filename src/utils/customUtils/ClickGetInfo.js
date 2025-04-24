import * as Cesium from "cesium";
import * as Vue from "vue";
// console.log('WindowVm: ', WindowVm);

export default class ClickGetInfo {
  divAttributeObj;
  currentFeature;
  static modelColor = Cesium.Color.fromBytes(104, 205, 254);
  constructor({ viewer }) {
    this.viewer = viewer;
    // 监听点击事件，拾取坐标
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    this.handler.setInputAction((e) => {
      const clickPosition = viewer.scene.camera.pickEllipsoid(e.position);
      console.log("Cartesian世界坐标", clickPosition);
      if (Cesium.defined(clickPosition)) {
        var cartographic = Cesium.Cartographic.fromCartesian(clickPosition);

        const feature = viewer.scene.pick(e.position); //NOTE:拾取场景中的对象,只有Cesium.Entity或者Cesium.Primitive对象可以被拾取？

        console.log("当前元素", feature);
        this.createCustomDiv({ cartographic, feature });

        if (feature) {
          if (this.currentFeature) {
            this.currentFeature.color = ClickGetInfo.modelColor;
          }
          // NOTE：此处只能更改高亮颜色
          feature.color = Cesium.Color.fromCssColorString("#FF000066");
          this.currentFeature = feature;
          console.log("feature2: ", feature);

          //   //NOTE:尝试修改整个模型的颜色
          //   feature.tileset.style = new Cesium.Cesium3DTileStyle({
          //     color: "color('#00ff00')",
          //   });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  getCameraInfo() {
    // 获取 相机姿态信息
    const head = this.viewer.scene.camera.heading;
    const pitch = this.viewer.scene.camera.pitch;
    const roll = this.viewer.scene.camera.roll;
    const info = { head: head, pitch: pitch, roll: roll };
    // 获取位置 wgs84的地心坐标系，x,y坐标值以弧度来表示
    const position = this.viewer.scene.camera.positionCartographic; //positionCartographic为弧度坐标
    // 弧度转经纬度
    const longitude = Cesium.Math.toDegrees(position.longitude).toFixed(6);
    const latitude = Cesium.Math.toDegrees(position.latitude).toFixed(6);
    const height = position.height;
    const cameraInfo = {
      lng: longitude,
      lat: latitude,
      h: height,
      mat: info,
      "cartesian3Position-世界坐标（笛卡尔坐标）":
        this.viewer.scene.camera.position,
      "positionCartographic-弧度坐标": position,
    };
    console.log("相机信息: ", cameraInfo);

    return cameraInfo;
  }

  createCustomDiv({ cartographic, feature = {} }) {
    this.container = document.querySelector("#container");
    // //移除上一div元素
    if (this.customElementDiv) {
      this.removeDiv();
    }
    this.divAttributeObj = {
      id: Math.random(10000),
      position: cartographic,
    };
    //创建div盒子
    const div = document.createElement("div");

    //设置class为tooltipDiv
    div.className = "tooltipDiv";
    //设置id为divAttributeObj.id
    div.id = this.divAttributeObj.id;
    //设置内部内容为经纬度
    div.innerHTML = `
      <div class="tooltipDiv-content">经度：${Cesium.Math.toDegrees(
        cartographic.longitude
      ).toFixed(2)}<br>纬度：${Cesium.Math.toDegrees(
      cartographic.latitude
    ).toFixed(2)}<br>
      实体信息：${feature.featureId ? "id " + feature.featureId : "无"}</div>
      `;

    //加入到页面
    this.container.appendChild(div);
    this.listenViewDiv();
  }
  postRender() {
    if (this.divAttributeObj) {
      let worldCoordinate = Cesium.Cartesian3.fromRadians(
        this.divAttributeObj.position.longitude,
        this.divAttributeObj.position.latitude,
        this.divAttributeObj.position.height
      );
      var screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        this.viewer.scene,
        worldCoordinate
      ); //新版本已经废弃了Cesium.SceneTransforms.wgs84ToWindowCoordinates方法，可以使用以下方式代替：Cesium.SceneTransforms.worldToWindowCoordinates

      this.customElementDiv = document.getElementById(this.divAttributeObj.id);
      if (screenPosition) {
        console.log("screenPosition: ", screenPosition);
        this.customElementDiv.style.left = screenPosition.x + "px";
        this.customElementDiv.style.top = screenPosition.y + "px";
      }
    }
  }
  listenViewDiv() {
    this.viewer.scene.postRender.addEventListener(this.postRender, this);
  }
  removeDiv() {
    this.container.removeChild(this.customElementDiv);
    this.viewer.scene.postRender.removeEventListener(this.postRender, this);
    this.divAttributeObj = null;
    this.customElementDiv = null;
  }
  remove(){
    this.removeDiv();
    this.handler.destroy();
  }
}
