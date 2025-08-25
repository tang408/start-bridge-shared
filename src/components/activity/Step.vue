<template>
  <section class="flow">
    <ul class="flow-steps cols-4">
      <li
        v-for="(s, i) in initSteps"
        :key="s.num"
        class="flow-step"
        :class="{ active: active.lane === 'init' && i === active.idx }"
      >
        <span class="badge">{{ s.num }}</span>
        <button class="box" @click="setActive('init', i)">{{ s.title }}</button>
        <div
          class="desc"
          v-if="active.lane === 'init' && i === active.idx && s.desc"
          v-html="s.desc"
        />
      </li>
    </ul>

    <div class="section-bar success">案件成立</div>

    <ul class="flow-steps cols-4">
      <li
        v-for="(s, i) in successSteps"
        :key="s.num"
        class="flow-step"
        :class="{ active: active.lane === 'success' && i === active.idx }"
      >
        <span class="badge">{{ s.num }}</span>
        <button class="box" @click="setActive('success', i)">
          {{ s.title }}
        </button>
        <div
          class="desc"
          v-if="active.lane === 'success' && i === active.idx && s.desc"
          v-html="s.desc"
        />
      </li>
    </ul>

    <div class="section-bar fail">案件不成立</div>

    <ul class="flow-steps cols-2">
      <li
        v-for="(s, i) in failSteps"
        :key="s.num"
        class="flow-step"
        :class="{ active: active.lane === 'fail' && i === active.idx }"
      >
        <span class="badge">{{ s.num }}</span>
        <button class="box" @click="setActive('fail', i)">{{ s.title }}</button>
        <div
          class="desc"
          v-if="active.lane === 'fail' && i === active.idx && s.desc"
          v-html="s.desc"
        />
      </li>
    </ul>
  </section>
</template>

<script setup>
import { reactive } from "vue";

const initSteps = [
  { num: 1, title: "線上註冊", desc: "填寫資料<br>提交審核文件" },
  { num: 2, title: "申請創業", desc: "填寫加盟申請表單(自備款、預算…)" },
  { num: 3, title: "平台審核", desc: "進入資格初審流程" },
  { num: 4, title: "簽約立案", desc: "支付意向金<br>簽署線上合約" },
];

const successSteps = [
  { num: 5, title: "媒合夥方", desc: "填資料<br>提交相關文件" },
  { num: 6, title: "申請創業", desc: "以媒合結果與審查進度為準" },
  { num: 7, title: "平台審核", desc: "進入最終方案加速核定" },
  { num: 8, title: "簽約立案", desc: "每日回報媒合與簽約進度" },
];

const failSteps = [
  { num: 5, title: "退還意象金", desc: "款項原路退回(工作天內)" },
  { num: 6, title: "結案", desc: "流程結束，有需要可再次申請" },
];

const active = reactive({ lane: "init", idx: 0 });
function setActive(lane, idx) {
  active.lane = lane;
  active.idx = idx;
}
</script>

<style scoped lang="scss">
.flow {
  text-align: center;
  padding: 70px 0 100px;
  @media (max-width: 576px) {
    padding: 40px 0 60px;
  }
}

.section-bar {
  margin: 22px auto;
  padding: 10px 18px;
  font-weight: 800;
  letter-spacing: 0.1em;
  border-radius: 10px;
  display: inline-block;
  &.success {
    background: #ffb54a;
    color: #222;
  }
  &.fail {
    background: #2b2b2b;
    color: #fff;
  }
}

/* grid 尺寸控制（方便上面三段用不同欄數） */
.flow-steps {
  display: grid;
  gap: 28px;
  align-items: start;
  margin: 0;
  padding: 0;
  list-style: none;
  &.cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }
  &.cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 992px) {
    &.cols-4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.flow-step {
  position: relative;
  .badge {
    position: absolute;
    left: 50%;
    top: -25px;
    transform: translateX(-50%);
    width: 36px;
    height: 36px;
    line-height: 36px;
    border-radius: 50%;
    background: #3a3c3b;
    color: #fff;
    font-weight: 800;
    font-size: 20px;
    z-index: 2;
  }
  .box {
    position: relative;
    background: #3a3c3b;
    color: #fff;
    padding: 40px 0 21px;
    width: 100%;
    border: none;
    font-weight: 700;
    font-size: 20px;
    line-height: 1.3;
    letter-spacing: 0.1em;
    cursor: pointer;
    border-radius: 8px;
    &::before {
      content: "";
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 16px;
      background: inherit;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      z-index: 1;
    }
  }
  .desc {
    margin-top: 10px;
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
    color: #000;
    padding: 16px 10px 0;
    letter-spacing: 0.06em;
  }
  &.active {
    .badge {
      background: #ff6634;
    }
    .box {
      background: #ff6634;
      &::after {
        content: "";
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 10px 10px 0 10px;
        border-style: solid;
        border-color: #ff6634 transparent transparent transparent;
      }
    }
  }
}
</style>
