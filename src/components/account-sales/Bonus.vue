<template>
  <div class="fs-24">獎金明細</div>

  <div class="bonus-page">
    <div class="year-select">
      <button @click="prevYear">
        <img src="@/assets/icon/left-arrow.png" />
      </button>
      <span>{{ year }}年度</span>
      <button @click="nextYear">
        <img src="@/assets/icon/right-arrow.png" />
      </button>
    </div>
    <div class="d-flex justify-content-center">
      <hr />
    </div>

    <div class="month-tabs">
      <button
        v-for="m in months"
        :key="m.value"
        :class="{ active: m.value === activeMonth }"
        @click="activeMonth = m.value"
      >
        {{ m.label }}
      </button>
    </div>

    <div class="cards-grid">
      <SharedSalesCard title="共創者">
        <div>獎金金額：</div>
        <div>獎金金數：</div>
      </SharedSalesCard>

      <SharedSalesCard title="創業者">
        <div>獎金金額：</div>
        <div>獎金金數：</div>
      </SharedSalesCard>
    </div>

    <SharedSalesCard title="其他獎金">
      <div>獎金名目A：</div>

      <div>獎金名目B：</div>
    </SharedSalesCard>

    <SharedSalesCard title="月度金額" strong>
      <div>應付薪酬：</div>
      <div>獎金：</div>
      <div>二代健保：</div>
      <div>給付總額：</div>
    </SharedSalesCard>

    <SharedSalesCard title="年度金額" strong>
      <div>應付薪酬：</div>
      <div>獎金：</div>
      <div>二代健保：</div>
      <div>給付總額：</div>
    </SharedSalesCard>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SharedSalesCard from "@/components/shared/Shared-Sales-Card.vue";

const year = ref(2025);
const activeMonth = ref(1);

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

const prevYear = () => (year.value -= 1);
const nextYear = () => (year.value += 1);
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
      @media (max-width: 576px) {
        padding: 6px;
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

  hr {
    width: 80%;
  }
}
</style>
