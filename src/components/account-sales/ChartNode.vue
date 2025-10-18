<template>
  <div class="node-wrapper">
    <div
        class="node"
        :class="[
        'level-' + node.rank,
        { 'has-children': hasChildren },
      ]"
        @click="toggle"
    >
      <div>推薦碼 {{ node.referralCode }}</div>
      <div>姓名 {{ node.name }}</div>
      <div>職級 {{ node.rank }}</div>
      <div> {{ childrenCount }}人</div>
    </div>

    <!-- 所有節點的子節點都需要展開/收合 -->
    <transition name="fade">
      <div v-show="isOpen && hasChildren" class="children">
        <ChartNode
            v-for="child in node.children"
            :key="child.salesId"
            :node="child"
            :is-root="false"
            :force-close-key="closeKey"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  node: {type: Object, required: true},
  isRoot: {type: Boolean, default: false},
  forceCloseKey: {type: Number, default: 0},
});

const isOpen = ref(false);

const toggle = () => {
  // 只有有子節點才能切換
  if (hasChildren.value) {
    if (isOpen.value) {
      closeKey.value++;
    }
    isOpen.value = !isOpen.value;
  }
};

const hasChildren = computed(
    () => props.node.children && props.node.children.length > 0
);

const childrenCount = computed(() => {
  return props.node.children ? props.node.children.length : 0;
});

const closeKey = ref(props.forceCloseKey);

watch(
    () => props.forceCloseKey,
    (newVal) => {
      isOpen.value = false;
      closeKey.value = newVal;
    }
);
</script>

<style scoped lang="scss">
.node-wrapper {
  text-align: center;
  gap: 10px;
  display: flex;
  flex-flow: column;
  align-items: center;
}

.node {
  display: inline-block;
  background: linear-gradient(180deg, #ffe0cc, #ffd2b3);
  padding: 10px 15px;
  cursor: pointer;
  width: 120px;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: #555555;

  @media (max-width: 768px) {
    display: block;
    width: 100%;
  }
}

.node.has-children {
  border-bottom: 2px solid #ff6634;
  padding-bottom: 8px;
}

.children {
  display: flex;
  gap: 10px;
  flex-flow: row;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.level {
  &-1 {
    background: #fff;
  }

  &-2 {
    background: #f8f0ec;
  }

  &-3 {
    background: #ffece4;
  }

  &-4 {
    background: #ffdbcd;
  }

  &-5 {
    background: #ffdbcd;
  }

  &-6 {
    background: #ffbfa6;
  }
}
</style>
