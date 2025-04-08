import * as Cesium from "cesium";
//火焰特效，//NOTE：如何让火焰在摄像机移动一段距离后消失？解答：
// 粒子系统在Cesium中是通过Cesium.ParticleSystem类实现的。如果你想让火焰特效在一定距离后消失，你可以通过调整粒子的生命周期（life time）或者发射速率（emission rate）来实现这一效果。（并没有乱用）

// 一种简单的方法是设置一个较小的最大生命值（maximum particle life），这样粒子就会更快地消散。例如：

// particleSystem = new Cesium.ParticleSystem({
//     image: 'path/to/your/fire-particle.png',
//     maximumParticleLife: 1.0, // 设置粒子的最大寿命为1秒，这样它们会很快消失
//     emissionRate: 5,
//     startColor: new Cesium.Color(1.0, 0.5, 0.0, 1.0),
//     endColor: new Cesium.Color(0.0, 0.0, 0.0, 0.0)
// });

// 另外一种方法是动态控制粒子的发射率。当摄像机移动到一定距离时，可以减少或停止粒子的发射。这可以通过监听摄像机的位置变化并相应地更新发射率来实现。
// 例如，你可以在摄像机的位置更新事件中设置：

// Cesium.Camera.DEFAULT_VIEW_FACTOR = 1000; // 设置摄像机距离物体的默认视图因子为1000米
// var camera = viewer.scene.camera;
// camera.changed.addEventListener(function() {
//     if (Cesium.Cartesian3.distance(camera.positionWC, someObjectPosition) > 1000) {
//         particleSystem.emissionRate = 0; // 当摄像机远离物体超过1000米时停止发射粒子
//     } else {
//         particleSystem.emissionRate = 5; // 在一定范围内恢复粒子的正常发射率
//     }
// });

// 注意：上面的代码示例使用了Cesium的旧版本API。如果你使用的是较新的版本（如1.69或更高），你可能需要使用不同的方法来访问和修改摄像机的属性。以下是一个适用于最新版本的例子：

// const scene = viewer.scene;
// const camera = scene.camera;
// let lastDistance = Infinity;

// function updateParticle

export default class FireEffect {
  constructor(viewer) {
    this.viewer = viewer;
    this.camera = viewer.scene.camera;
    this.viewModel = {
      // emissionRate: 5,
      // gravity: 0.0, //设置重力参数
      // minimumParticleLife: 1,
      // maximumParticleLife: 6,
      // minimumSpeed: 1.0, //粒子发射的最小速度
      // maximumSpeed: 4.0, //粒子发射的最大速度
      // startScale: 0.0,
      // endScale: 10.0,
      // particleSize: 25.0,

      // startScale: 3,
      // endScale: 1.5,
      // minimumParticleLife: 1.5,
      // maximumParticleLife: 1.8,
      // minimumSpeed: 7,
      // maximumSpeed: 9,
      // particleSize: 2,
      // emissionRate: 200,

      startScale: 1, // 应用于粒子生命开始时的图像的初始比例。
      endScale: 4,
      // minimumParticleLife: 1,
      maximumParticleLife: 1, // 设置粒子生命可能持续时间的最大边界(以秒为单位)，在此范围内，将随机选择粒子的实际生命。
      minimumSpeed: 1,
      maximumSpeed: 8, // 设置以米/每秒为单位的粒子的实际速度将被随机选择的最大边界。
      particleSize: 20,
      emissionRate: 5,
    };
    this.emitterModelMatrix = new Cesium.Matrix4();
    this.translation = new Cesium.Cartesian3();
    this.rotation = new Cesium.Quaternion();
    this.hpr = new Cesium.HeadingPitchRoll();
    this.trs = new Cesium.TranslationRotationScale();
    this.scene = this.viewer.scene;
    this.particleSystem = "";
    this.entity = this.viewer.entities.add({
      //选择粒子放置的坐标
      position: Cesium.Cartesian3.fromDegrees(120.36, 36.09),
    });
    console.log("this.entity.position: ", this.entity.position);

    this.init();
  }

  init() {
    const _this = this;
    this.viewer.clock.shouldAnimate = true;
    this.viewer.scene.globe.depthTestAgainstTerrain = false;
    // this.viewer.trackedEntity = this.entity;
    const minimum = 10,
      maximum = 20;
    var particleSystem = this.scene.primitives.add(
      new Cesium.ParticleSystem({
        // image: "/images/fire-particle.png", //生成所需粒子的图片路径
        // image: "/images/fire.png", //生成所需粒子的图片路径
        // //粒子在生命周期开始时的颜色
        // // startColor: new Cesium.Color(1, 1, 1, 1),
        // // //粒子在生命周期结束时的颜色
        // // endColor: new Cesium.Color(0.5, 0, 0, 0),
        // //粒子在生命周期开始时初始比例
        // startScale: _this.viewModel.startScale,
        // //粒子在生命周期结束时比例
        // endScale: _this.viewModel.endScale,
        // //粒子发射的最小速度
        // minimumParticleLife: 1,
        // //粒子发射的最大速度
        // maximumParticleLife: 1,
        // //粒子质量的最小界限
        // minimumSpeed: 5,
        // //粒子质量的最大界限
        // maximumSpeed: 5,
        // //以像素为单位缩放粒子图像尺寸
        // imageSize: new Cesium.Cartesian2(
        //   _this.viewModel.particleSize,
        //   _this.viewModel.particleSize
        // ),
        // //每秒发射的粒子数
        // emissionRate: _this.viewModel.emissionRate,
        // //粒子系统发射粒子的时间（秒）
        // lifetime: 16.0,
        // //粒子系统是否应该在完成时循环其爆发
        // loop: true,
        // // //设置粒子的大小是否以米或像素为单位
        // sizeInMeters: true,
        // modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(120.36, 36.09)),
        // emitterModelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(120.36, 36.09)),

        // v2版本
        // 系统的粒子发射器
        emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(45.0)), //BoxEmitter 盒形发射器，ConeEmitter 锥形发射器，SphereEmitter 球形发射器，CircleEmitter圆形发射器

        image: "/images/fire.png",
        startColor: Cesium.Color.RED,
        endColor: Cesium.Color.YELLOW,
        startScale: 1.0,
        endScale: 3.0,
        particleLife: 1.5,
        // minimumSpeed: 1.0,
        // maximumSpeed: 10.0,
        speed: 10.0,
        //粒子系统发射粒子的时间（秒）
        // lifetime: 16.0,
        // minimumParticleLife: 1.0,
        // maximumParticleLife: 5.0,
        // minimumMass: 1.0,
        // maximumMass: 10.0,
        emissionRate: 20.0,
        imageSize: new Cesium.Cartesian2(25, 25),
        bursts: [
          new Cesium.ParticleBurst({ time: 0.0, minimum, maximum }),
          new Cesium.ParticleBurst({ time: 0.1, minimum, maximum }),
          new Cesium.ParticleBurst({ time: 0.2, minimum, maximum }),
          new Cesium.ParticleBurst({ time: 0.3, minimum, maximum }),
          new Cesium.ParticleBurst({ time: 0.4, minimum, maximum }),
          new Cesium.ParticleBurst({ time: 0.5, minimum, maximum }),
          new Cesium.ParticleBurst({ time: 0.6, minimum, maximum }),
          new Cesium.ParticleBurst({ time: 0.7, minimum, maximum }),
          new Cesium.ParticleBurst({ time: 0.8, minimum, maximum }),
          new Cesium.ParticleBurst({ time: 0.9, minimum, maximum }),
        ],
      })
    );
    this.particleSystem = particleSystem;
    this.preUpdateEvent();
    //NOTE：添加相机监听事件，火焰随相机距离变化而变化
    this.cameraChangedCallback = this.cameraChanged.bind(this);
    this.camera.changed.addEventListener(this.cameraChangedCallback);
    //也可以使用 帧(渲染)监听代替相机监听事件
    // this.viewer.scene.postRender.addEventListener(() => {});
  }

  cameraChanged() {
    const distance = Cesium.Cartesian3.distance(
      this.camera.positionWC,
      this.entity.position._value
    );
    console.log("distance: ", distance);

    if (distance > 1000) {
      this.particleSystem.emissionRate = 0;
    } else {
      this.particleSystem.emissionRate = 5;
    }
  }

  //场景渲染事件
  preUpdateEvent() {
    let _this = this;
    this.viewer.scene.preUpdate.addEventListener(function (scene, time) {
      //发射器地理位置
      _this.particleSystem.modelMatrix = _this.computeModelMatrix(
        _this.entity,
        time
      );
      //发射器局部位置
      _this.particleSystem.emitterModelMatrix =
        _this.computeEmitterModelMatrix();
      // 将发射器旋转
      if (_this.viewModel.spin) {
        _this.viewModel.heading += 1.0;
        _this.viewModel.pitch += 1.0;
        _this.viewModel.roll += 1.0;
      }
    });
  }

  computeModelMatrix(entity, time) {
    return entity.computeModelMatrix(time, new Cesium.Matrix4()); //计算模型矩阵，返回一个Cesium.Matrix4对象。该对象的左上角是实体在世界坐标系中的位置，右上角是其旋转，右下角是其缩放比例。
  }

  computeEmitterModelMatrix() {
    this.hpr = Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0, this.hpr);
    this.trs.translation = Cesium.Cartesian3.fromElements(
      -4.0,
      0.0,
      1.4,
      this.translation
    );
    this.trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(
      this.hpr,
      this.rotation
    );

    return Cesium.Matrix4.fromTranslationRotationScale(
      this.trs,
      this.emitterModelMatrix
    );
  }

  removeEvent() {
    this.viewer.scene.preUpdate.removeEventListener(this.preUpdateEvent, this);

    this.emitterModelMatrix = undefined;
    this.translation = undefined;
    this.rotation = undefined;
    this.hpr = undefined;
    this.trs = undefined;
  }

  //移除粒子特效
  remove() {
    () => {
      return this.removeEvent();
    }; //清除事件
    this.viewer.scene.primitives.remove(this.particleSystem); //删除粒子对象
    this.viewer.entities.remove(this.entity); //删除entity
    this.camera.changed.removeEventListener(this.cameraChangedCallback);//清除相机监听火焰距离事件
  }
}
