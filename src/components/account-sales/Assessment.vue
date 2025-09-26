<template>
  <div class="fs-24">考核</div>

  <div class="w-100">
    <div class="cards-grid">
      <SharedSalesCard title="我的績效">
        <div>當前職級：【副理】</div>
        <div>本月業績： 400 萬</div>
        <div>個人業績：累計 2000 萬</div>
        <div>團隊人力：共 3 人</div>
        <div>（主任 2 位、高專 1 位）</div>
      </SharedSalesCard>

      <SharedSalesCard title="團績考核">
        <div>團隊業績： 800萬</div>
        <div>一季需達標月數： 2個月</div>
        <div>已達成： 400 萬｜2個月</div>
      </SharedSalesCard>
    </div>
    <SharedSalesCard title="★晉升目標" strong :cols="2">
      <div>目標職級：【經理】</div>
      <div>個人業績：月業績 ?00 / ?00 萬</div>
      <div>團隊人力： 2 / 4 人（ 含自己 ）</div>
      <div>團隊業績：月業績 200 / 800 萬</div>
    </SharedSalesCard>
  </div>

  <div class="fs-24 mt-5">業務制度</div>

  <div class="system-rules">
    <div
      v-for="(role, index) in roles"
      :key="role.title"
      class="rule-card"
      :class="`rule-card-${index}`"
    >
      <div class="rule-title">{{ role.title }}</div>
      <div class="rule-body" v-if="role.details">
        <div v-for="(line, i) in role.details" :key="i" class="rule-line">
          {{ line }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SharedSalesCard from "@/components/shared/Shared-Sales-Card.vue";

const roles = [
  {
    title: "普專【月薪+5%】",
  },
  {
    title: "高專【創業者+35%；共創者+40%】",
    details: ["晉升門檻：個人業績累計 300 萬"],
  },
  {
    title: "主任【創業者+40%；共創者+45%】",
    details: ["晉升門檻：個人業績累計 1800 萬"],
  },
  {
    title: "副理【創業者+45%；共創者+50%】",
    details: ["➡可授權人力編制", "➡晉升門檻：團隊第 3 位（主任）成為副理"],
  },
  {
    title: "經理【創業者+50%；共創者+55%】",
    details: [
      "➡高專門檻：4 位（含自己）",
      "➡團隊月業績累計 800 萬，三季累計達 2 個月 未達標降階",
      "➡晉升門檻：團隊第 2 位（副理）成為經理",
    ],
  },
  {
    title: "總監【創業者+55%；共創者+60%】",
    details: [
      "➡團隊人力：10 位",
      "➡團積考核：需保持至 少 2 位[經理] ， 團隊中[經理] 降階則連帶調降。",
      "➡晉升門檻：由主管團隊評估， 須有維持水平能力 。預計以領導團績每月2000萬 維持一季為標準。",
    ],
  },
  {
    title: "店長【創業者+60%；共創者+65%】",
    details: [
      "➡直營店店長",
      "➡額外獎金：",
      "1.輔導獎金：各階級差%",
      "2.每月店業績達標， 盈利分潤10%起",
    ],
  },
];
</script>

<style scoped lang="scss">
.rule-card {
  &-0 {
    background: linear-gradient(
      90deg,
      rgba(255, 204, 153, 0.1) 0%,
      rgba(255, 102, 52, 0.1) 100%
    );
  }
  &-1 {
    background: linear-gradient(
      90deg,
      rgba(255, 204, 153, 0.2) 0%,
      rgba(255, 102, 52, 0.2) 100%
    );
  }
  &-2 {
    background: linear-gradient(
      90deg,
      rgba(255, 204, 153, 0.2) 0%,
      rgba(255, 102, 52, 0.2) 100%
    );
  }
  &-3 {
    background: linear-gradient(
      90deg,
      rgba(255, 204, 153, 0.4) 0%,
      rgba(255, 102, 52, 0.4) 100%
    );
  }
  &-4 {
    background: linear-gradient(
      90deg,
      rgba(255, 204, 153, 0.4) 0%,
      rgba(255, 102, 52, 0.4) 100%
    );
  }
  &-5 {
    background: linear-gradient(
      90deg,
      rgba(255, 204, 153, 0.4) 0%,
      rgba(255, 102, 52, 0.4) 100%
    );
  }
  &-6 {
    background: linear-gradient(
      90deg,
      rgba(255, 204, 153, 0.7) 32.69%,
      rgba(255, 134, 95, 0.7) 100%
    );
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }
}
.system-rules {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 16px;
  width: 100%;
}

.rule-card {
  border-bottom: 1px solid #ff6634;
}

.rule-title {
  font-weight: 600;
  padding: 10px 20px 5px 20px;
  font-size: 15px;
  color: #ff6634;
}

.rule-body {
  padding: 5px 20px 10px 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #555;
}

.rule-line + .rule-line {
  margin-top: 6px;
}
</style>
