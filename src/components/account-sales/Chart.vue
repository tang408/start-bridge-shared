<template>
  <div class="fs-24 title">組織圖</div>

  <div class="chart">
    <div class="chart-top">
      <div>推薦碼</div>
      <div>姓名</div>
      <div>職級 8人</div>
    </div>

    <div class="chart-root mt-2">
      <ChartNode
        v-for="(node, i) in treeData"
        :key="i"
        :node="node"
        :is-root="true"
      />
    </div>
  </div>
  <button type="button" class="btn-orange w-100" @click="exportPic">
    匯出組織圖
  </button>
</template>

<script setup>
import ChartNode from "./ChartNode.vue";

const treeData = [
  {
    name: "張三",
    person: "1",
    children: [
      { name: "王小明", person: "4" },
      {
        name: "李四",
        person: "6",
        children: [
          { name: "林小美", person: "6" },
          { name: "周大勇", person: "1" },
        ],
      },
    ],
  },
  {
    name: "陳大安",
    person: "2",
    children: [
      { name: "林小美", person: "3" },
      { name: "周大勇", person: "4" },
    ],
  },
  {
    name: "陳大安",
    person: "2",
    children: [
      { name: "林小美", person: "3" },
      { name: "周大勇", person: "4" },
    ],
  },
  {
    name: "陳大安",
    person: "2",
    children: [
      { name: "林小美", person: "3" },
      { name: "周大勇", person: "4" },
    ],
  },
  {
    name: "陳大安",
    person: "2",
    children: [
      { name: "林小美", person: "3" },
      { name: "周大勇", person: "4" },
    ],
  },
  {
    name: "陳大安",
    person: "2",
    children: [
      { name: "林小美", person: "3" },
      { name: "周大勇", person: "4" },
    ],
  },
  {
    name: "陳大安",
    person: "2",
    children: [
      { name: "林小美", person: "3" },
      { name: "周大勇", person: "4" },
    ],
  },
  {
    name: "陳大安",
    person: "2",
    children: [
      { name: "林小美", person: "3" },
      { name: "周大勇", person: "4" },
    ],
  },
];

function exportPic() {}
</script>

<style scoped lang="scss">
.chart {
  text-align: center;
  width: 100%;
  height: 100%;
}

.title {
  margin-bottom: 20px;
}

.chart-top {
  height: 83px;
  background: linear-gradient(
    360deg,
    rgba(255, 204, 153, 0.7) 32.69%,
    rgba(255, 154, 111, 0.7) 100%
  );
  border: 1px solid #dfdfdf;
  display: flex;
  flex-flow: column;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #555555;
  justify-content: center;
}

.chart-root {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.btn-orange {
  border: none;
  border-radius: $br-8;
  height: 40px;
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
  background: $btn-orange;
  color: $white;
}
</style>
