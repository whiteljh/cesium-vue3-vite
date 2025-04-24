<!--
 * @Descripttion: 
 * @Author: 笙痞
 * @Date: 2023-01-04 11:07:05
 * @LastEditors: brown 897411954@qq.com
 * @LastEditTime: 2025-03-29 20:00:24
-->
<template>
  <div class="container" id="container"></div>
</template>

<script setup>
import * as Cesium from "cesium";
import * as turf from "@turf/turf";

import { onMounted, onUnmounted, reactive } from "vue";

const { viewer } = window;

let state = reactive({});

onMounted(() => {
  initTurf();
});

const initTurf = () => {
  var point = turf.point([75,40], { name: "点" });
  console.log("point: ", point); //point数据类型为GeoJSON Feature<Point>
  const polyline = turf.lineString(
    [
      [108, 34],
      [109, 35],
      [110, 36],
      [111, 37],
      [112, 38],
      [113, 39],
      [114, 40],
      [115, 41],
      [116, 42],
      [117, 43],
      [118, 44],
      [119, 45],
      [120, 46],
    ],
    { name: "线段" }
  );
  const polygon = turf.polygon(
    [
      [
        [68, 34],
        [69, 35],
        [60, 36],
        [61, 37],
        [62, 38],
        [63, 39],
        [64, 40],
        [65, 41],
        [66, 42],
        [67, 43],
        [68, 44],
        [69, 45],
        [68, 34],
      ],
    ],
    { name: "多边形" }
  );
  // 绘制圆形区域
  var center = [75.343, 39.984];
  var radius = 500;
  var options = { steps: 10, units: "kilometers", properties: { foo: "bar" } };
  var circle = turf.circle(center, radius, options);

  //绘制椭圆区域
  var center = [75, 40];
  var xSemiAxis = 500;
  var ySemiAxis = 200;
  var ellipse = turf.ellipse(center, xSemiAxis, ySemiAxis);

  //创建弧线区域
  var center = turf.point([75, 40]);
  var radius = 200;
  var bearing1 = 30; // 起始方位角

  var bearing2 = 90; // TODO:终止方位角？？？,截图并加入xmind
  var arc = turf.lineArc(center, radius, bearing1, bearing2);

  //创建扇形区域
  var center = turf.point([-75, 40]);
  var radius = 500;
  var bearing1 = 25;
  var bearing2 = 45;

  var sector = turf.sector(center, radius, bearing1, bearing2);

  var collection = turf.featureCollection([
    point,
    polyline,
    polygon,
    // circle,
    // ellipse,
    arc,
    // sector,
  ]);

  Cesium.GeoJsonDataSource.load(collection).then((dataSource) => {
    viewer.dataSources.add(dataSource, {
      clampToGround: true, // 贴地模式
    });
    // viewer.zoomTo(dataSource);
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(75,40, 970000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
    });
  });
};
</script>

<style lang="less">
.container {
  position: absolute;
  z-index: 100;
  .tooltipDiv {
    height: 100px;
    width: 120px;
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    left: 0;
    right: 0;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .tooltipDiv-content {
      width: 100%;
      color: white;
    }
  }
}
</style>
