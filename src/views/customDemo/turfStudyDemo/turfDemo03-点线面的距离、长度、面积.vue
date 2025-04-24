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

onMounted(() => {
  initTurf();
});

const initTurf = () => {
  var line = turf.lineString([
    [-83, 30],
    [-84, 36],
    [-78, 41],
  ]);
  var point1 = turf.point([78, 20]);
  var point2 = turf.point([-88, 20]);
  var polygon = turf.polygon([
    [
      [-89, 30],
      [-89, 36],
      [-79, 41],
      [-89, 30],
    ],
  ]);

  //计算点与点之间的距离
  var distance = turf.distance(point1, point2, {
    units: "kilometers",
  });
  console.log("两点之间的距离：", distance); // 返回单位为千米

  //计算折线的长度，单位千米
  var length = turf.length(line, { units: "kilometers" });
  console.log("折线长度：", length); // 返回单位为千米

  //计算多边形的面积，单位只能为米，且不支持多个面
  var area = turf.area(polygon, { units: "kilometers" });
  console.log("多边形面积：", area); // 返回单位为米

  //点到线段的距离
  var pointToLineDistance = turf.pointToLineDistance(point2, line, {
    units: "kilometers",
  });
  console.log("点到线段的距离：", pointToLineDistance); // 返回单位为千米

  var collection = turf.featureCollection([point1, point2, line, polygon]); // 创建集合

  Cesium.GeoJsonDataSource.load(collection).then((dataSource) => {
    viewer.dataSources.add(dataSource, {
      clampToGround: true, // 贴地模式
    });
    // viewer.zoomTo(dataSource);
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(-89, 30, 970000),
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
