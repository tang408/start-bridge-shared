<template>
  <div class="fs-24 ta-center mb-4">系統訊息通知</div>

  <div class="notifications">
    <article v-for="msg in messages" :key="msg.id" class="notify-card">
      <header class="notify-head">
        <span class="status-pill" :class="msg.type">{{ msg.typeLabel }}</span>
      </header>
      <p class="notify-body">{{ msg.text }}</p>
    </article>
  </div>
</template>

<script setup>
import { ref } from "vue";

const messages = ref([
  {
    id: 1,
    type: "new",
    typeLabel: "創業者",
    text: "Duis aute irure dolor in reprehenderit in?",
  },
  {
    id: 2,
    type: "new",
    typeLabel: "創業者",
    text: "Duis aute irure dolor in reprehenderit in?",
  },
]);
</script>

<style scoped lang="scss">
.notifications {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.notify-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  padding: 14px 16px;
}

.notify-head {
  margin-bottom: 8px;
}

.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  &.new {
    background: #ffcc41;
    color: #fff;
  }
}

.notify-body {
  font-size: 15px;
  color: #333;
}
</style>
