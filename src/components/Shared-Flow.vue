<template>
  <section class="flow">
    <template v-for="(sec, sIdx) in sections" :key="sec.key ?? sIdx">
      <div
        v-if="sec.label"
        class="section-bar"
        :class="sec.variant"
        v-text="sec.label"
      />

      <ul class="flow-steps">
        <li
          v-for="(step, i) in sec.steps"
          :key="step.num ?? i"
          class="flow-step"
          :class="{ active: isActive(sec.key ?? sIdx, i) }"
        >
          <button class="badge" @click="setActive(sec.key ?? sIdx, i)">
            {{ displayNum(step, sec, i) }}
          </button>

          <button class="box" @click="setActive(sec.key ?? sIdx, i)">
            {{ step.title }}
          </button>

          <div
            class="desc"
            v-if="isActive(sec.key ?? sIdx, i) && step.desc"
            v-html="step.desc"
          />
        </li>
      </ul>
    </template>
  </section>
</template>

<script setup>
const props = defineProps({
  sections: {
    type: Array,
    required: true,
  },
  active: {
    type: Object,
    default: () => ({ lane: 0, idx: 0 }),
  },
});
const emit = defineEmits(["update:active"]);

const isActive = (lane, idx) =>
  props.active?.lane === lane && props.active?.idx === idx;

const setActive = (lane, idx) => {
  emit("update:active", { lane, idx });
};

const displayNum = (step, sec, i) => {
  if (typeof step.num === "number") return step.num;
  const startAt = Number(sec.startAt ?? 0);
  return startAt + i + 1;
};
</script>

<style scoped lang="scss">
.flow {
  text-align: center;
  padding: 70px 0 50px;
  @media (max-width: 576px) {
    padding: 40px 0 60px;
  }
}

.section-bar {
  margin: 3rem auto;
  font-weight: 800;
  letter-spacing: 0.1em;
  border-radius: 20px;
  width: 100%;
  height: 60px;
  align-items: center;
  display: grid;
  font-weight: 700;
  font-size: 28px;
  line-height: 34px;
  text-align: center;
  letter-spacing: 0.1em;
  &.success {
    background: #ffcc66;
    color: #373a36;
  }
  &.fail {
    background: #373a36;
    color: #fff;
  }
}

.flow-steps {
  display: flex;
  gap: 28px;
  align-items: start;
  justify-content: center;
  margin: 0;
  padding: 0;
  list-style: none;
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 24px;
    flex-flow: column;
    align-items: center;
  }
  &.fail {
    grid-template-columns: repeat(2, minmax(200px, 1fr));
    justify-content: center;
  }

  &.cols-1 {
    grid-template-columns: 1fr;
  }
  &.cols-2 {
    display: flex;
    @media (max-width: 576px) {
      display: flex;
      flex-flow: column;
      align-items: center;
    }
  }
  &.cols-3 {
    grid-template-columns: repeat(3, 1fr);
    @media (max-width: 992px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  &.cols-4 {
    grid-template-columns: repeat(4, 1fr);
    @media (max-width: 992px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 576px) {
      display: flex;
      flex-flow: column;
      align-items: center;
    }
  }
}

.flow-step {
  position: relative;
  display: flex;
  flex-flow: column;
  align-items: center;
  max-width: 250px;
  width: 100%;

  .badge {
    position: absolute;
    left: 50%;
    top: -15px;
    transform: translateX(-50%);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #3a3c3b;
    color: #fff;
    font-weight: 800;
    font-size: 30px;
    z-index: 2;
    border: none;
    padding: 0;
  }

  .box {
    position: relative;
    background: #3a3c3b;
    color: #fff;
    padding: 30px 0 20px;
    width: 100%;
    border: none;
    font-weight: 700;
    font-size: 24px;
    line-height: 29px;
    letter-spacing: 0.1em;

    cursor: pointer;

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
