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
  </div>
</template>

<script setup>
import RainEffect from "@/utils/cesiumCtrl/rain.js";
import FogEffect from "@/utils/cesiumCtrl/fog.js";
import InitModelUtils from "@/utils/customUtils/initModel.js";
import * as Cesium from "cesium";

import { onMounted, onUnmounted, reactive } from "vue";

const { viewer } = window;

let state = reactive({
  weatherValue: "",
  modelValue: "",
  sceneValue: "",
});

let instance; //天气实例对象
let model; //模型实例对象

onUnmounted(() => {
  instance.destroy();
});
onMounted(() => {
  //   instance.show(false);
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
    label: "光源分析",
  },
];

const initWeather = (type) => {
  if (instance) instance.destroy();
  switch (type) {
    case "Rain":
      instance = new RainEffect(viewer, {
        tiltAngle: -0.2, //倾斜角度
        rainSize: 1.0, // 雨大小
        rainSpeed: 120.0, // 雨速
      });
      break;
    case "Fog":
      instance = new FogEffect(viewer, {
        visibility: 0.2,
        color: new Cesium.Color(0.8, 0.8, 0.8, 0.3),
      });
      break;
    default:
      instance.destroy();
      break;
  }
};

const initModel = (type) => {
  switch (type) {
    case "buildArea":
      model = new InitModelUtils({ viewer, url: "/models/buildArea.json" });
      model.init();
      model.zoomTo();
      model.customShader();
      model.openShadows();
      break;
    default:
      model.destroy();
      break;
  }
};

const initScene = (type) => {
  switch (type) {
    case "lightAnalysis":

      break;
    default:
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
