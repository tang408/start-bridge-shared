<template>
  <div class="fs-24 title">組織圖</div>

  <!-- 用 ref 包住要匯出的區域 -->
  <div ref="chartContainer" class="chart">
    <!-- 最上層:顯示 root 自己 -->
    <div v-if="rootNode" class="chart-top">
      <div>推薦碼 {{ rootNode.referralCode }}</div>
      <div>姓名 {{ rootNode.name }}</div>
      <div>職級 {{ rootNode.rank }}</div>
      <div> {{ totalMembers }}人</div>
    </div>

    <!-- 第二層開始:顯示 root 的 children -->
    <div v-if="rootNode && rootNode.children && rootNode.children.length > 0" class="chart-root mt-2">
      <ChartNode
          v-for="child in rootNode.children"
          :key="child.salesId"
          :node="child"
          :is-root="false"
      />
    </div>
  </div>

  <button type="button" class="btn-orange w-100" @click="exportPic" :disabled="exporting">
    {{ exporting ? '匯出中...' : '匯出組織圖' }}
  </button>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import html2canvas from 'html2canvas';
import ChartNode from "./ChartNode.vue";
import { useAuth } from "@/composables/useAuth.js";
import { salesApi } from "@/api/modules/sales.js";
import { salesLevelApi as saleslevelApi } from "@/api/modules/salesLevel.js";
import {NewAlert} from "@/composables/useAlert.js";

const { isLoggedIn, currentSales } = useAuth();

const salesStructure = ref({});

// 從 response.data.root 取得根節點
const rootNode = computed(() => {
  return salesStructure.value?.root || null;
});

async function getStructure() {
  const formData = {
    salesId: currentSales.value
  }
  const response = await salesApi.getStructure(formData);
  salesStructure.value = response.data;
  // 把 rank 替換成 對應的 salesLevel的 id 取得 name

  if (salesLevelData.value) {
    updateRanks(salesStructure.value.root);
  }
}

function updateRanks(node) {
  const level = salesLevelData.value.find(level => level.id === node.rank);
  if (level) {
    node.rank = level.name;
  }
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => updateRanks(child));
  }
}

// 計算總人數（遞迴）
const totalMembers = computed(() => {
  if (!rootNode.value) return 0;
  return countMembers(rootNode.value);
});

const salesLevelData = ref();

async function getSalesLevel() {
  const response = await saleslevelApi.getSalesLevel();
  salesLevelData.value = response.data;
}

onMounted(async () => {
  if (isLoggedIn.value) {
    await getSalesLevel();
    await getStructure();
  }
});

function countMembers(node) {
  let count = 1; // 計算自己
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      count += countMembers(child);
    });
  }
  return count;
}

// 匯出相關
const chartContainer = ref(null);
const exporting = ref(false);

async function exportPic() {
  if (!chartContainer.value) {
    await NewAlert.show("注意！", "找不到組織圖區域，無法匯出。");
    return;
  }

  if (!rootNode.value) {
    await NewAlert.show("注意！", "組織圖資料不存在，無法匯出。");
    return;
  }

  exporting.value = true;

  try {
    const canvas = await html2canvas(chartContainer.value, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `組織圖_${rootNode.value.name}_${new Date().getTime()}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await NewAlert.show("成功！", "組織圖已成功匯出。");
  } catch (error) {
    console.error('匯出失敗:', error);
    await NewAlert.show("注意！", error + " ,匯出組織圖失敗，請洽客服人員。");
  } finally {
    exporting.value = false;
  }
}
</script>

<style scoped lang="scss">
.chart {
  text-align: center;
  width: 100%;
  height: 100%;
  background: #ffffff;
  padding: 20px;
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
  transition: opacity 0.3s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
