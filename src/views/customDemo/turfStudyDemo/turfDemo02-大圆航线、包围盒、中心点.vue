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
  // 创建线段,计算线段固定距离沿线的点
  var line = turf.lineString([
    [-83, 30],
    [-84, 36],
    [-78, 41],
  ]);

  var along = turf.along(line, 300, {
    properties: { name: "along" },
    units: "kilometers",
  });
  console.log("along: ", along);

  //创建方位角，point1点于point2点的方位角度，此角度为参考轴为正北方向，正北方向表示同一个经度，不同维度，
  //下方经度相同时，方位角为0
  var point1 = turf.point([78, 20]);
  var point2 = turf.point([-88, 20]);

  var bearing = turf.bearing(point1, point2);
  var greatCircle = turf.greatCircle(point1, point2);
  var midpoint = turf.midpoint(point1, point2);
  console.log("bearing: ", bearing);

  //创建中心点
  var features = turf.points([
    [-97.522259, 35.4691],
    [-97.502754, 35.463455],
    [-97.508269, 35.463245],
  ]);
  console.log("features: ", features);

  var center = turf.center(features);
  //创建质心
  var polygon = turf.polygon([
    [
      [-81, 41],
      [-88, 36],
      [-84, 31],
      [-80, 33],
      [-77, 39],
      [-81, 41],
    ],
  ]);

  var polygonCenter = turf.centerOfMass(polygon);

  //创建多个面的质心
  var polygonMultiple = turf.polygon([
    [
      [-81, 41],
      [-88, 36],
      [-84, 31],
      [-80, 33],
      [-77, 39],
      [-81, 41],
    ],
    [
      [-81.9, 41],
      [-88.9, 36],
      [-84.9, 31],
      [-80.9, 33],
      [-77.9, 39],
      [-81.9, 41],
    ],
  ]);
  var centerMultiple = turf.centerOfMass(polygonMultiple);

  //计算包围盒
  var bbox = turf.bbox(polygonMultiple);
  console.log("bbox: ", bbox);
  var bboxPolygon = turf.bboxPolygon(bbox);
  console.log("bboxPolygon: ", bboxPolygon);

  var collection = turf.featureCollection([
    // line,
    // along,
    // point1,
    // point2,
    // center
    // polygonCenter,
    // polygon,

    // polygonMultiple,
    // centerMultiple,
    // bboxPolygon,

    greatCircle,
    midpoint
  ]); // 创建集合

  // 创建整个合集包围盒
  var features2 = turf.featureCollection([
    turf.point([-75.343, 39.984], { name: "Location A" }),
    turf.point([-75.833, 39.284], { name: "Location B" }),
    turf.point([-75.534, 39.123], { name: "Location C" }),
  ]);

  var collection2 = turf.featureCollection([
    turf.point([-75.343, 39.984], { name: "Location A" }),
    turf.point([-75.833, 39.284], { name: "Location B" }),
    turf.point([-75.534, 39.123], { name: "Location C" }),
    turf.envelope(features2),
  ]);

  Cesium.GeoJsonDataSource.load(collection).then((dataSource) => {
    viewer.dataSources.add(dataSource, {
      clampToGround: true, // 贴地模式
    });
    // viewer.zoomTo(dataSource);
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(83, 20, 970000),
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
