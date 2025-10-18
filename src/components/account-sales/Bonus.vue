<template>
  <div class="fs-24">獎金明細</div>

  <div class="bonus-page">
    <!-- 年份選擇 -->
    <div class="year-select">
      <button @click="prevYear">
        <img src="@/assets/icon/left-arrow.png" alt="上一年" />
      </button>
      <span>{{ year }}年度</span>
      <button @click="nextYear">
        <img src="@/assets/icon/right-arrow.png" alt="下一年" />
      </button>
    </div>
    <div class="d-flex justify-content-center">
      <hr />
    </div>

    <!-- 月份選擇 -->
    <div class="month-tabs">
      <button
          v-for="m in months"
          :key="m.value"
          :class="{ active: m.value === activeMonth }"
          @click="selectMonth(m.value)"
      >
        {{ m.label }}
      </button>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-state">
      <p>載入中...</p>
    </div>

    <!-- 資料顯示 -->
    <div v-else>
      <!-- 共創者和創業者業績 -->
      <div class="cards-grid">
        <SharedSalesCard title="共創者">
          <div>業績金額：{{ formatAmount(performanceData.coreFounderTotalAmount) }} 元</div>
          <div>獎金金額：{{ formatAmount(bonusSummary.coreFounderBonus) }} 元</div>
        </SharedSalesCard>

        <SharedSalesCard title="創業者">
          <div>業績金額：{{ formatAmount(performanceData.founderTotalAmount) }} 元</div>
          <div>獎金金額：{{ formatAmount(bonusSummary.founderBonus) }} 元</div>
        </SharedSalesCard>
      </div>

      <!-- 其他獎金 -->
      <SharedSalesCard title="其他獎金">
        <div v-if="otherBonusList.length > 0">
          <div v-for="bonus in otherBonusList" :key="bonus.id" class="bonus-item">
            {{ bonus.caption }}：{{ formatAmount(bonus.amount) }} 元
          </div>
        </div>
        <div v-else class="empty-state">
          本月無其他獎金
        </div>
      </SharedSalesCard>

      <!-- 月度金額 -->
      <SharedSalesCard title="月度金額" strong>
        <div>應付所得：{{ formatAmount(monthBonusTotal.totalAmount) }} 元</div>
        <div>稅金：{{ formatAmount(monthBonusTotal.totalTax) }} 元</div>
        <div>二代健保：{{ formatAmount(monthBonusTotal.totalHealthInsurance) }} 元</div>
        <div class="highlight">給付淨額：{{ formatAmount(monthBonusTotal.totalNetAmount) }} 元</div>
      </SharedSalesCard>

      <!-- 年度金額 -->
      <SharedSalesCard title="年度金額" strong>
        <div>應付所得：{{ formatAmount(yearBonusTotal.totalAmount) }} 元</div>
        <div>稅金：{{ formatAmount(yearBonusTotal.totalTax) }} 元</div>
        <div>二代健保：{{ formatAmount(yearBonusTotal.totalHealthInsurance) }} 元</div>
        <div class="highlight">給付淨額：{{ formatAmount(yearBonusTotal.totalNetAmount) }} 元</div>
      </SharedSalesCard>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from "vue";
import SharedSalesCard from "@/components/shared/Shared-Sales-Card.vue";
import { useAuth } from "@/composables/useAuth.js";
import { salesBonusApi } from "@/api/modules/salesBonus.js";

const { isLoggedIn, currentSales } = useAuth();

// 狀態管理
const year = ref(new Date().getFullYear());
const activeMonth = ref(new Date().getMonth() + 1);
const loading = ref(false);

// 資料狀態
const salesBonusData = ref({
  performanceData: {
    founderTotalAmount: 0,
    coreFounderTotalAmount: 0,
    totalPerformance: 0
  },
  otherBonusList: [],
  monthBonusTotal: {
    totalAmount: 0,
    totalTax: 0,
    totalHealthInsurance: 0,
    totalNetAmount: 0
  },
  yearBonusTotal: {
    totalAmount: 0,
    totalTax: 0,
    totalHealthInsurance: 0,
    totalNetAmount: 0
  },
  bonusSummary: {
    founderBonus: 0,
    coreFounderBonus: 0,
    otherBonus: 0,
    totalBonus: 0
  }
});

// 計算屬性：解構資料
const performanceData = computed(() => salesBonusData.value.performanceData);
const otherBonusList = computed(() => salesBonusData.value.otherBonusList);
const monthBonusTotal = computed(() => salesBonusData.value.monthBonusTotal);
const yearBonusTotal = computed(() => salesBonusData.value.yearBonusTotal);
const bonusSummary = computed(() => salesBonusData.value.bonusSummary || {
  founderBonus: 0,
  coreFounderBonus: 0,
  otherBonus: 0,
  totalBonus: 0
});
const months = [
  { label: "一月", value: 1 },
  { label: "二月", value: 2 },
  { label: "三月", value: 3 },
  { label: "四月", value: 4 },
  { label: "五月", value: 5 },
  { label: "六月", value: 6 },
  { label: "七月", value: 7 },
  { label: "八月", value: 8 },
  { label: "九月", value: 9 },
  { label: "十月", value: 10 },
  { label: "十一月", value: 11 },
  { label: "十二月", value: 12 },
];

// 年份切換
const prevYear = () => {
  year.value -= 1;
};

const nextYear = () => {
  year.value += 1;
};

// 月份選擇
const selectMonth = (month) => {
  activeMonth.value = month;
};

// 獲取獎金資料
async function getAllSalesBonusBySales() {
  if (!isLoggedIn.value || !currentSales.value) {
    console.warn('用戶未登入或無業務 ID');
    return;
  }

  loading.value = true;

  try {
    const formData = {
      salesId: currentSales.value,
      year: year.value,
      month: activeMonth.value,
    };

    console.log('發送請求:', formData);

    const response = await salesBonusApi.getAllSalesBonusBySales(formData);

    if (response.code === 0) {
      salesBonusData.value = response.data;
      console.log('獎金資料:', salesBonusData.value);
    } else {
      // 重置為空資料
      salesBonusData.value = {
        performanceData: {
          founderTotalAmount: 0,
          coreFounderTotalAmount: 0,
          totalPerformance: 0
        },
        otherBonusList: [],
        monthBonusTotal: {
          totalAmount: 0,
          totalTax: 0,
          totalHealthInsurance: 0,
          totalNetAmount: 0
        },
        yearBonusTotal: {
          totalAmount: 0,
          totalTax: 0,
          totalHealthInsurance: 0,
          totalNetAmount: 0
        }
      };
      alert(response.message || '獎金資料取得失敗');
    }
  } catch (error) {
    console.error('獲取獎金資料失敗:', error);
    alert('獎金資料取得失敗，請稍後再試');
  } finally {
    loading.value = false;
  }
}

// 格式化金額（加上千分位）
const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '0';
  return amount.toLocaleString('zh-TW');
};

// 計算共創者獎金（從 otherBonusList 中篩選）
const calculateCoreBonus = () => {
  const coreBonus = otherBonusList.value
      .filter(bonus => bonus.caption && bonus.caption.includes('共創'))
      .reduce((sum, bonus) => sum + bonus.amount, 0);
  return formatAmount(coreBonus);
};

// 計算創業者獎金（從 otherBonusList 中篩選）
const calculateFounderBonus = () => {
  const founderBonus = otherBonusList.value
      .filter(bonus => bonus.caption && (bonus.caption.includes('創業') || bonus.caption.includes('創辦')))
      .reduce((sum, bonus) => sum + bonus.amount, 0);
  return formatAmount(founderBonus);
};

// 監聽年份變化，重新獲取資料
watch(year, () => {
  console.log('年份改變:', year.value);
  getAllSalesBonusBySales();
});

// 監聽月份變化，重新獲取資料
watch(activeMonth, () => {
  console.log('月份改變:', activeMonth.value);
  getAllSalesBonusBySales();
});

// 初始化
onMounted(() => {
  if (isLoggedIn.value) {
    getAllSalesBonusBySales();
  }
});
</script>

<style scoped lang="scss">
.bonus-page {
  width: 85%;
  @media (max-width: 576px) {
    width: 100%;
  }

  .year-select {
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    @media (max-width: 576px) {
      margin: 0;
    }

    span {
      color: $text-dark;
      font-weight: $fw-600;
      font-size: 22px;
      line-height: 32px;
    }

    button {
      border: none;
      background: none;
      font-size: 20px;
      cursor: pointer;
      color: #333;

      img {
        width: 24px;
        height: 24px;
      }
    }
  }

  .month-tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    max-width: 400px;
    margin: 0 auto 70px;
    @media (max-width: 576px) {
      gap: 0;
      margin: 0 auto 50px;
    }

    button {
      padding: 6px 12px;
      border: none;
      border-radius: 20px;
      background: transparent;
      cursor: pointer;
      font-weight: $fw-400;
      font-size: $fs-16;
      line-height: $lh-19;
      color: $text-dark;
      height: 39px;
      transition: all 0.3s ease;
      @media (max-width: 576px) {
        padding: 6px;
      }

      &:hover {
        background: rgba(255, 106, 61, 0.1);
      }

      &.active {
        background: #ff6a3d;
        color: #fff;
        height: 39px;
        align-items: center;
      }
    }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .loading-state {
    text-align: center;
    padding: 40px;
    color: #666;
  }

  .bonus-item {
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .empty-state {
    color: #999;
    text-align: center;
    padding: 20px 0;
  }

  .highlight {
    font-weight: 600;
    color: #ff6a3d;
    font-size: 18px;
    margin-top: 8px;
  }

  hr {
    width: 80%;
  }
}
</style>
