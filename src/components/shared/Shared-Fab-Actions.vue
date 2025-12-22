<template>
  <div
    class="fab-actions"
    :class="size"
    :style="{
      top: top !== null ? top + 'px' : 'auto',
      bottom: bottom !== null ? bottom + 'px' : 'auto',
      left: left !== null ? left + 'px' : 'auto',
      right: right !== null ? right + 'px' : 'auto',
    }"
  >
    <!-- 收藏 -->
    <button
      class="circle-btn favorite"
      :aria-pressed="favorite ? 'true' : 'false'"
      :title="favorite ? favoriteTitleOn : favoriteTitleOff"
      @click.stop="$emit('favorite-toggle', !favorite)"
      :style="{ width: circleSize + 'px', height: circleSize + 'px' }"
    >
      <span
        class="icon"
        :style="{
          inlineSize: iconSize + 'px',
          blockSize: iconSize + 'px',
        }"
        :class="iconType === 'star' ? 'icon-star' : 'icon-heart'"
      />
    </button>

    <!-- 垃圾桶 -->
    <button
      v-if="showTrash"
      class="circle-btn trash"
      :title="removeTitle"
      @click="onRemove"
    >
      <span class="icon icon-trash" />
    </button>

    <!-- 跳轉 -->
    <button
        v-if="showPush"
        class="circle-btn push"
        :title="removeTitle"
        @click="onPush"
    >
      <span class="icon icon-eye" />
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  favorite: { type: Boolean, default: false },
  confirmOnRemove: { type: Boolean, default: true },
  confirmText: { type: String, default: "確定要將此項目丟到垃圾桶嗎？" },
  favoriteTitleOn: { type: String, default: "取消收藏" },
  favoriteTitleOff: { type: String, default: "加入收藏" },
  removeTitle: { type: String, default: "丟到垃圾桶" },
  size: { type: String, default: "md" },
  iconType: { type: String, default: "star" },
  showTrash: { type: Boolean, default: true },
  showPush: { type: Boolean, default: false },
  top: { type: Number, default: null },
  right: { type: Number, default: 16 },
  bottom: { type: Number, default: null },
  left: { type: Number, default: null },
  iconSize: { type: Number, default: 30 },
  circleSize: { type: Number, default: 56 },
});
const emit = defineEmits(["favorite-toggle", "remove", "push"]);

function onRemove() {
  if (!props.confirmOnRemove || confirm(props.confirmText)) emit("remove");
}

function onPush() {
  emit("push");
}
</script>

<style scoped lang="scss">
.fab-actions {
  position: absolute;
  display: flex;
  gap: 12px;
}
.fab-actions.sm .circle-btn {
  inline-size: 44px;
  block-size: 44px;
}
.fab-actions.md .circle-btn {
  inline-size: 56px;
  block-size: 56px;
}
.fab-actions.lg .circle-btn {
  inline-size: 64px;
  block-size: 64px;
}

.circle-btn {
  border-radius: 50%;
  border: 0;
  background: #dfdfdf;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.08s ease, filter 0.15s ease;

  &:active {
    transform: translateY(1px) scale(0.98);
  }
  &:hover {
    filter: brightness(0.98);
  }

  &.favorite[aria-pressed="true"] {
    background: #ffc919;
  }
  &.trash {
    background: #dfdfdf;
  }

  .icon {
    inline-size: 30px;
    block-size: 30px;
    background: #fff;
    mask-position: center;
    mask-size: contain;
    mask-repeat: no-repeat;
  }
  .icon-star {
    mask-image: url("@/assets/icon/back-star.png");
  }
  .icon-trash {
    mask-image: url("@/assets/icon/back-trash.png");
  }
  .icon-heart {
    mask-image: url("@/assets/icon/back-heart.png");
  }
  .icon-eye {
    mask-image: url("@/assets/icon/eye.png");
  }
}

@media (max-width: 767px) {
  .fab-actions {
    gap: 8px;
    // Mobile styles removed to allow props to control size
  }
}
</style>
