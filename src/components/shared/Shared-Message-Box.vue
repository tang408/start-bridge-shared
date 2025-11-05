<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isVisible" class="sa-backdrop" @click.self="handleClose">
        <transition name="slide">
          <div class="sa-modal">
            <header class="sa-header">
              <p>{{ title }}</p>
              <button class="sa-close-btn" @click="handleClose">×</button>
            </header>
            <section class="sa-body">
              <p>{{ content }}</p>
            </section>
            <footer class="sa-footer">
              <button class="sa-confirm-btn" @click="handleClose">確定</button>
            </footer>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
// 1. 定義 Props 來接收外部傳入的狀態
const props = defineProps<{
  isVisible: boolean;
  title: string;
  content: string;
}>();

// 2. 定義 Emit 事件，通知外部服務它被關閉了
const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close'); // 發出關閉事件
};
</script>

<style scoped>
/* 應該改為 */
.sa-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: start;
  z-index: 1000;
}

.sa-modal {
  margin-top: 24px;
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.sa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  border-bottom: 1px solid #eee;
  background-color: #ff6634;
  color: white
}
.sa-header p {
  padding-left: 10px;
  margin: 0;
  font-weight: bold;
  font-size: 18px;
}

.sa-body {
  padding: 20px 15px;
}

.sa-body p {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.sa-footer {
  padding: 8px 15px;
  text-align: right;
  border-top: 1px solid #eee;
}

.sa-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.sa-confirm-btn {
  background-color: #ff6634;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}


.sa-close-btn:hover {
  opacity: 0.7;
}

/* 添加過渡效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s;
}
.slide-enter-from {
  transform: translateY(-50px);
}
.slide-leave-to {
  transform: translateY(50px);
}
</style>
