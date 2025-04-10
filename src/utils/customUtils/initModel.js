import * as Cesium from "cesium";

export default class InitModel {
  constructor({ url, viewer }) {
    this.url = url;
    this.viewer = viewer;
    console.log("this.viewer: ", this.viewer);
    this.init();
  }
  init() {
    this.tileset = new Cesium.Cesium3DTileset({
      url: this.url,
      shadows: Cesium.ShadowMode.ENABLED,
    });
    const that = this;
    this.tileset.readyPromise
      .then(function (tileset) {
        console.log("tileset: ", tileset);
        console.log("that.tileset: ", that.tileset); //和上方tileset输出一样
        that.viewer.scene.primitives.add(tileset);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  zoomTo() {
    this.viewer.zoomTo(this.tileset);
  }
  customShader() {
    let customShader = new Cesium.CustomShader({
      //片元着色器
      fragmentShaderText: `
                void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
                    vec3 positionMC = fsInput.attributes.positionMC;
                    material.diffuse = vec3(0.0, 1.0-positionMC.y*0.005, 1.0-positionMC.y*0.0015);

                    float _baseHeight = 18.0; // 物体的基础高度，需要修改成一个合适的建筑基础高度
                    float _heightRange = 60.0; // 高亮的范围(_baseHeight ~ _baseHeight + _heightRange) 默认是 0-60米
                    float _glowRange = 120.0; // 光环的移动范围(高度)

                    float vtxf_height = fsInput.attributes.positionMC.y - _baseHeight;
                    float vtxf_a11 = fract(czm_frameNumber / 360.0) * 3.14159265 * 2.0; //此处括号内分母为移动速度
                    float vtxf_a12 = vtxf_height / _heightRange + sin(vtxf_a11) * 0.1;
                    material.diffuse *= vec3(vtxf_a12, vtxf_a12, vtxf_a12);

                    float vtxf_a13 = fract(czm_frameNumber / 360.0); //此处括号内分母为移动速度，数值越大，速度越慢
                    float vtxf_h = clamp(vtxf_height / _glowRange, 0.0, 1.0);
                    vtxf_a13 = abs(vtxf_a13 - 0.5) * 2.0;
                    float vtxf_diff = step(0.01, abs(vtxf_h - vtxf_a13)); // 0.1 为高亮光条的范围（粗细）
                    material.diffuse += material.diffuse * (1.0 - vtxf_diff);
                }`,
    });
    this.tileset.customShader = customShader;
  }

  destroy() {
    if (!this.viewer || !this.tileset) return;
    this.viewer.scene.primitives.remove(this.tileset);
    this.tileset = null;
  }
}
