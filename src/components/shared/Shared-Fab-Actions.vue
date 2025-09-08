<template>
  <div class="fab-actions" :class="size">
    <!-- 收藏 -->
    <button
      class="circle-btn favorite"
      :aria-pressed="favorite ? 'true' : 'false'"
      :title="favorite ? favoriteTitleOn : favoriteTitleOff"
      @click="$emit('favorite-toggle', !favorite)"
    >
      <span class="icon icon-star" />
    </button>

    <!-- 垃圾桶 -->
    <button class="circle-btn trash" :title="removeTitle" @click="onRemove">
      <span class="icon icon-trash" />
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
});
const emit = defineEmits(["favorite-toggle", "remove"]);

function onRemove() {
  if (!props.confirmOnRemove || confirm(props.confirmText)) emit("remove");
}
</script>

<style scoped lang="scss">
.fab-actions {
  position: absolute;
  right: 16px;
  bottom: 16px;
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
}
</style>
