<!--
 * @Descripttion: 
 * @Author: 笙痞
 * @Date: 2023-01-04 11:07:05
 * @LastEditors: brown 897411954@qq.com
 * @LastEditTime: 2025-03-29 20:00:24
-->
<template>
  <div class="container">
    <!-- <el-button type="primary" @click="start">开始</el-button>
    <el-button type="primary" @click="hide">停止</el-button> -->
    <el-select
      @change="initWeather"
      v-model="state.weatherValue"
      placeholder="天气"
      style="width: 100px"
      clearable
    >
      <el-option
        v-for="item in weatherOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-select
      @change="initModel"
      v-model="state.modelValue"
      placeholder="白膜"
      style="width: 100px"
      clearable
    >
      <el-option
        v-for="item in modelOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-select
      @change="initScene"
      v-model="state.sceneValue"
      placeholder="场景"
      style="width: 100px"
      clearable
    >
      <el-option
        v-for="item in sceneOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-select
      @change="initSpecialization"
      v-model="state.specializationValue"
      placeholder="业务"
      style="width: 100px"
      clearable
    >
      <el-option
        v-for="item in specializationOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script setup>
import RainEffect from "@/utils/cesiumCtrl/rain.js";
import FogEffect from "@/utils/cesiumCtrl/fog.js";
import InitModelUtils from "@/utils/customUtils/initModel.js";
import InitSceneUtils from "@/utils/customUtils/InitSceneUtils.js";
import EchartsFlyLineUtils from "@/utils/customUtils/EchartsFlyLineUtils.js";
import { flightSeries1, flightSeries2 } from "@/assets/echartsSeries.js";
import * as Cesium from "cesium";

import { onMounted, onUnmounted, reactive } from "vue";

const { viewer } = window;

let state = reactive({
  weatherValue: "",
  modelValue: "",
  sceneValue: "",
  specializationValue: "",
});

let weatherInstance; //天气实例对象
let modelInstance; //模型实例对象
let sceneInstance; //场景实例对象
let specializationInstance; //业务实例对象

onUnmounted(() => {
  // weatherInstance.destroy();
});
onMounted(() => {
  //   weatherInstance.show(false);
});

const weatherOptions = [
  {
    value: "Rain",
    label: "下雨",
  },
  {
    value: "Fog",
    label: "起雾",
  },
];
const modelOptions = [
  {
    value: "buildArea",
    label: "渐变建筑区域",
  },
];
const sceneOptions = [
  {
    value: "lightAnalysis",
    label: "光源分析-增加阴影",
  },
];
const specializationOptions = [
  {
    value: "focusEcharts_FlyLine",
    label: "聚焦-echarts飞线",
  },
  {
    value: "focusEcharts_FlightLine",
    label: "聚焦-echarts飞机航线",
  },
  {
    value: "baseMap_darkMap",
    label: "底图-切换暗黑模式",
  },
];

const initWeather = (type) => {
  if (weatherInstance) weatherInstance.destroy();
  switch (type) {
    case "Rain":
      weatherInstance = new RainEffect(viewer, {
        tiltAngle: -0.2, //倾斜角度
        rainSize: 1.0, // 雨大小
        rainSpeed: 120.0, // 雨速
      });
      break;
    case "Fog":
      weatherInstance = new FogEffect(viewer, {
        visibility: 0.2,
        color: new Cesium.Color(0.8, 0.8, 0.8, 0.3),
      });
      break;
    default:
      weatherInstance.destroy();
      break;
  }
};

const initModel = (type) => {
  switch (type) {
    case "buildArea":
      modelInstance = new InitModelUtils({
        viewer,
        url: "/models/buildArea.json",
      });
      modelInstance.init();
      modelInstance.zoomTo();
      modelInstance.customShader();
      break;
    default:
      modelInstance.destroy();
      break;
  }
};

const initScene = (type) => {
  switch (type) {
    case "lightAnalysis":
      sceneInstance = new InitSceneUtils({ viewer });
      sceneInstance.addShadow();
      break;
    default:
      sceneInstance.destroy();
      break;
  }
};

const initSpecialization = (type) => {
  if (specializationInstance) specializationInstance.remove();
  switch (type) {
    case "focusEcharts_FlyLine":
      specializationInstance = EchartsFlyLineUtils(flightSeries1);
      break;
    case "focusEcharts_FlightLine":
      specializationInstance = EchartsFlyLineUtils(flightSeries2);
      break;
    default:
      specializationInstance.remove;
      break;
  }
};
</script>

<style lang="less" scoped>
.container {
  position: absolute;
  z-index: 100;
}
</style>
