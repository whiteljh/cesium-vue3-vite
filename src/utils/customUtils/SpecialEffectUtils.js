import * as Cesium from "cesium";
const { __viewer } = window;

/*
    动态墙材质
    color 颜色
    duration 持续时间 毫秒
    trailImage 贴图地址
*/
function DynamicWallMaterialProperty(options) {
  this._definitionChanged = new Cesium.Event();
  this._color = undefined;
  this._colorSubscription = undefined;
  this.color = options.color || Cesium.Color.BLUE;
  this.duration = options.duration || 1000;
  this.trailImage = options.trailImage;
  this._time = new Date().getTime();
}

/**
 * 带方向的墙体
 * @param {*} options.get:true/false
 * @param {*} options.count:数量
 * @param {*} options.freely:vertical/standard
 * @param {*} options.direction:+/-
 */
function _getDirectionWallShader(options) {
  if (options && options.get) {
    var materail =
      "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
      {\n\
          czm_material material = czm_getDefaultMaterial(materialInput);\n\
          vec2 st = materialInput.st;";
    if (options.freely == "vertical") {
      //（由下到上）
      materail +=
        "vec4 colorImage = texture(image, vec2(fract(st.s), fract(float(" +
        options.count +
        ")*st.t" +
        options.direction +
        " time)));\n ";
    } else {
      //（逆时针）
      materail +=
        "vec4 colorImage = texture(image, vec2(fract(float(" +
        options.count +
        ")*st.s " +
        options.direction +
        " time), fract(st.t)));\n ";
    }
    //泛光
    materail +=
      "vec4 fragColor;\n\
          fragColor.rgb = (colorImage.rgb+color.rgb) / 1.0;\n\
          fragColor = czm_gammaCorrect(fragColor);\n\
          material.diffuse = colorImage.rgb;\n\
          material.alpha = colorImage.a;\n\
          material.emission = fragColor.rgb;\n\
          return material;\n\
      }";
    return materail;
  }
}

Object.defineProperties(DynamicWallMaterialProperty.prototype, {
  isConstant: {
    get: function () {
      return false;
    },
  },
  definitionChanged: {
    get: function () {
      return this._definitionChanged;
    },
  },
  color: Cesium.createPropertyDescriptor("color"),
});

var MaterialType = "wallType" + parseInt(Math.random() * 1000);
DynamicWallMaterialProperty.prototype.getType = function (time) {
  return MaterialType;
};

DynamicWallMaterialProperty.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }
  result.color = Cesium.Property.getValueOrClonedDefault(
    this._color,
    time,
    Cesium.Color.WHITE,
    result.color
  );
  result.image = this.trailImage;
  if (this.duration) {
    result.time =
      ((new Date().getTime() - this._time) % this.duration) / this.duration;
  }
  __viewer.scene.requestRender();
  return result;
};

DynamicWallMaterialProperty.prototype.equals = function (other) {
  return (
    this === other ||
    (other instanceof DynamicWallMaterialProperty &&
      Cesium.Property.equals(this._color, other._color))
  );
};

Cesium.Material._materialCache.addMaterial(MaterialType, {
  fabric: {
    type: MaterialType,
    uniforms: {
      color: new Cesium.Color(1.0, 0.0, 0.0, 0.1),
      image: Cesium.Material.DefaultImageId,
      time: -20,
    },
    source: _getDirectionWallShader({
      get: true,
      count: 3.0,
      freely: "vertical",
      direction: "-",
    }),
  },
  translucent: function (material) {
    return true;
  },
});
// Cesium.DynamicWallMaterialProperty = DynamicWallMaterialProperty;

// 球形轨迹遮罩

class TrackMatte {
  constructor(val) {
    this.viewer = val.viewer;
    this.id = val.id;
    this.shortwaveRange = val.shortwaveRange;
    (this.longitude = val.position[0]),
      (this.latitude = val.position[1]),
      (this.position = Cesium.Cartesian3.fromDegrees(
        val.position[0],
        val.position[1]
      ));
    this.heading = 0;
    this.positionArr = this.calcPoints(
      val.position[0],
      val.position[1],
      val.shortwaveRange,
      0
    ); //储存脏数据
    this.addEntities();
  }
  addEntities() {
    let entity = this.viewer.entities.add({
      id: this.id,
      position: this.position,
      wall: {
        positions: new Cesium.CallbackProperty(() => {
          return Cesium.Cartesian3.fromDegreesArrayHeights(this.positionArr);
        }, false),
        material: new Cesium.Color(1, 0, 0, 0.5),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0.0,
          10.5e6
        ),
      },
      ellipsoid: {
        radii: new Cesium.Cartesian3(
          this.shortwaveRange,
          this.shortwaveRange,
          this.shortwaveRange
        ),
        maximumCone: Cesium.Math.toRadians(90),
        material: new DynamicWallMaterialProperty({
          trailImage: "/images/fire.png",
          color: Cesium.Color.CYAN,
          duration: 1500,
        }),
        outline: true,
        outlineColor: new Cesium.Color.fromCssColorString("#00dcff82"),
        outlineWidth: 1,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0.0,
          10.5e6
        ),
      },
    });
    this.addPostRender();
  }
  addPostRender() {
    this.viewer.clock.onTick.addEventListener(() => {
      this.heading += 10.0; //可调节转动速度
      this.positionArr = this.calcPoints(
        this.longitude,
        this.latitude,
        this.shortwaveRange,
        this.heading
      );
    });
  }
  calcPoints(x1, y1, radius, heading) {
    var m = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(x1, y1)
    );
    var rx = radius * Math.cos((heading * Math.PI) / 180.0);
    var ry = radius * Math.sin((heading * Math.PI) / 180.0);
    var translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
    var d = Cesium.Matrix4.multiplyByPoint(
      m,
      translation,
      new Cesium.Cartesian3()
    );
    var c = Cesium.Cartographic.fromCartesian(d);
    var x2 = Cesium.Math.toDegrees(c.longitude);
    var y2 = Cesium.Math.toDegrees(c.latitude);
    return this.computeCirclularFlight(x1, y1, x2, y2, 0, 90);
  }
  computeCirclularFlight(x1, y1, x2, y2, fx, angle) {
    let positionArr = [];
    positionArr.push(x1);
    positionArr.push(y1);
    positionArr.push(0);
    var radius = Cesium.Cartesian3.distance(
      Cesium.Cartesian3.fromDegrees(x1, y1),
      Cesium.Cartesian3.fromDegrees(x2, y2)
    );
    for (let i = fx; i <= fx + angle; i++) {
      let h = radius * Math.sin((i * Math.PI) / 180.0);
      let r = Math.cos((i * Math.PI) / 180.0);
      let x = (x2 - x1) * r + x1;
      let y = (y2 - y1) * r + y1;
      positionArr.push(x);
      positionArr.push(y);
      positionArr.push(h);
    }
    return positionArr;
  }
  reorientate() {
    this.viewer.camera.flyTo({
      // 从以度为单位的经度和纬度值返回笛卡尔3位置。
      destination: Cesium.Cartesian3.fromDegrees(
        this.longitude,
        this.latitude,
        30000
      ),
      orientation: {
        // heading：默认方向为正北，正角度为向东旋转，即水平旋转，也叫偏航角。
        // pitch：默认角度为-90，即朝向地面，正角度在平面之上，负角度为平面下，即上下旋转，也叫俯仰角。
        // roll：默认旋转角度为0，左右旋转，正角度向右，负角度向左，也叫翻滚角
        // heading: Cesium.Math.toRadians(0.0), // 正东，默认北
        // pitch: Cesium.Math.toRadians(0),
        // roll: 0.0, // 左右
      },
      duration: 1, // 飞行时间（s）
    });
  }
  destroy() {
    this.viewer.entities.removeById(this.id);
  }
}

class SquareWall {
  //墙体
  static data = [
    [105.0185546875, 30.66235300961486],
    [104.01589393615723, 30.65652022496456],
    [104.029541015625, 30.65053940942565],
    [104.0397548675537, 30.65777541087788],
    [104.03829574584961, 30.66604446357028],
    [104.0255069732666, 30.667963963897005],
    [104.0185546875, 30.66235300961486],
  ];
  //环绕赤道和极点的墙体
  static data2 = [
    [179.99999999999997, -89.99999999999997],
    [178, 88.99999999999997],
    [0, 0],
    [0, -89.99999999999997],
  ];
  constructor({ viewer }) {
    this.viewer = viewer;
  }
  init() {
    const data = SquareWall.data2;
    let coor = Array.prototype.concat.apply([], data);
    console.log("coor: ", coor);
    this.datasouce = this.map_common_addDatasouce("wall");
    this.datasouce.entities.add({
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArray(coor),
        maximumHeights: new Array(data.length).fill(500000),
        minimunHeights: new Array(data.length).fill(0),

        // -----------静止-------
        // material: new Cesium.ImageMaterialProperty({
        //   transparent: true,//设置透明
        //   image: "./fence-wall-2.png",
        //   repeat: new Cesium.Cartesian2(1.0, 1),
        // }),

        // 动态
        material: new DynamicWallMaterialProperty({
          trailImage: "/images/wall.png",
          color: Cesium.Color.CYAN,
          duration: 1500,
        }),
      },
    });
    this.viewer.zoomTo(this.datasouce);
  }
  map_common_addDatasouce(datasouceName) {
    let datasouce = this.viewer.dataSources._dataSources.find((t) => {
      return t && t.name == datasouceName;
    });
    if (!datasouce) {
      datasouce = new Cesium.CustomDataSource(datasouceName);
      this.viewer.dataSources.add(datasouce);
    }
    return datasouce;
  }
  destroy() {
    this.viewer.dataSources.remove(this.datasouce);
  }
}

export { TrackMatte, SquareWall };
