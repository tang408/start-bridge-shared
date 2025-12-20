<template>
  <section class="flow">
    <ul class="flow-steps">
      <li
        v-for="(s, i) in steps"
        :key="i"
        class="flow-step"
        :class="{ active: i === active }"
      >
        <span class="badge">{{ i + 1 }}</span>

        <button class="box" @click="setActive(i)">
          {{ s.title }}
        </button>

        <div class="desc ql-editor p-0" v-if="i === active && s.desc" v-html="s.desc"></div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref } from "vue";

const steps = ref([
  { title: "流程", desc: "填寫資料<br>提交審核文件" },
  { title: "流程", desc: "填寫資料<br>提交審核文件" },
  { title: "流程", desc: "填寫資料<br>提交審核文件" },
  { title: "流程", desc: "填寫資料<br>提交審核文件" },
]);

const active = ref(0);
const setActive = (index) => {
  active.value = index;
};
</script>

<style scoped lang="scss">
.flow {
  text-align: center;
  padding: 70px 0 100px 0;
  @media (max-width: 576px) {
    padding: 70px 0 0;
  }

  .flow-title {
    font-weight: 700;
    margin: 0 0 20px;
  }
}

.flow-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
  align-items: start;
  margin: 0;
  padding: 0;
  list-style: none;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

.flow-step {
  position: relative;

  .badge {
    position: absolute;
    left: 50%;
    top: -25px;
    transform: translateX(-50%);
    line-height: 36px;
    border-radius: 50%;
    background: #3a3c3b;
    color: #fff;
    font-weight: 800;
    font-size: 36px;
    z-index: 2;
  }

  .box {
    background: #3a3c3b;
    color: #fff;
    padding: 40px 0 21px;
    border: none;
    width: 100%;
    font-weight: 700;
    font-size: 24px;
    line-height: 29px;
    cursor: pointer;
    letter-spacing: 0.1em;
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
    padding: 20px;
    letter-spacing: 0.1em;
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
        top: 90px;
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
