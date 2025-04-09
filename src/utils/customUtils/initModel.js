import * as Cesium from "cesium";

export default class InitModel {
  constructor({ url, viewer }) {
    this.url = url;
    this.viewer = viewer;
    console.log('this.viewer: ', this.viewer);

    this.init();
  }
  init() {
    this.tileset = new Cesium.Cesium3DTileset({
      url: this.url,
    });
    const that=this
    this.tileset.readyPromise
      .then(function (tileset) {
        console.log('tileset: ', tileset);
        that.viewer.scene.primitives.add(tileset);
        that.viewer.zoomTo(tileset);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  zoomTo() {
    // this.viewer.zoomTo(this.tileset);
  }
}
