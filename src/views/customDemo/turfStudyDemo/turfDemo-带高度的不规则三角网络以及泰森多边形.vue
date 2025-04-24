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
  // 生成随机点集，范围由 bbox 定义，此处为 50为西经度，30为南纬度，70为东经度，50为北纬度
  var points = turf.randomPoint(30, { bbox: [50, 30, 70, 50] });
  console.log("points: ", points);

  // add a random property to each point between 0 and 9
  for (var i = 0; i < points.features.length; i++) {
    points.features[i].properties.z = ~~(Math.random() * 100000);
  }
  //生成 不规则三角网 ，z属性为高度值，此处仅携带至GeoJsonData中，需要后续手动赋值
  var tin = turf.tin(points, "z");
  console.log("tin1: ", tin);

  // 手动赋值tin的每个三角形的三个顶点的高度值
  tin.features.forEach((feature) => {
    feature.geometry.coordinates[0].forEach((coordinate, index) => {
      switch (index) {
        case 0: //一共4个点确定一个三角形，由于第一个和最后一个为相同数据，会进行浅拷贝，所以只需要case 0即可，不需要case 3
          coordinate.push(feature.properties.a);
          return;
        case 1:
          coordinate.push(feature.properties.b);
          return;
        case 2:
          coordinate.push(feature.properties.c);
          return;
        default:
          return;
      }
    });
  });

  // 手动赋值顶点的高度值
  points.features.forEach((feature) => {
    feature.geometry.coordinates.push(feature.properties.z);
  });
  console.log("tin2: ", tin);

  // Cesium.GeoJsonDataSource.load(points).then((dataSource) => {
  //   viewer.dataSources.add(dataSource, {
  //     // clampToGround: true, // 贴地模式
  //   });
  //   // viewer.zoomTo(dataSource);
  //   viewer.camera.setView({
  //     destination: Cesium.Cartesian3.fromDegrees(50, 30, 970000),
  //     orientation: {
  //       heading: Cesium.Math.toRadians(0),
  //       pitch: Cesium.Math.toRadians(-90),
  //       roll: 0,
  //     },
  //   });
  // });

  // Cesium.GeoJsonDataSource.load(tin).then((dataSource) => {
  //   viewer.dataSources.add(dataSource, {
  //     // clampToGround: true, // 贴地模式
  //   });
  // });

  //生成泰森多边形,需要规定bbox范围，否则会超出地图边界
  var voronoi = turf.voronoi(points, { bbox: [50, 30, 70, 50] });
  console.log("voronoi: ", voronoi);

  Cesium.GeoJsonDataSource.load(voronoi).then((dataSource) => {
    viewer.dataSources.add(dataSource);
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
