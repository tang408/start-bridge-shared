<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isVisible" class="sa-backdrop" @click.self="handleCancel">
        <transition name="slide">
          <div class="sa-modal">
            <header class="sa-header">
              <p>{{ title }}</p>
              <button class="sa-close-btn" @click="handleCancel">×</button>
            </header>
            <section class="sa-body">
              <p>{{ content }}</p>
            </section>
            <footer class="sa-footer">
              <!-- 根據 type 顯示不同按鈕 -->
              <template v-if="type === 'confirm'">
                <button class="sa-cancel-btn" @click="handleCancel">取消</button>
                <button class="sa-confirm-btn" @click="handleConfirm">確定</button>
              </template>
              <template v-else-if="type === 'favorite'">
                <button class="sa-favorite-btn" @click="handleFavorite">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  收藏
                </button>
                <button class="sa-push-btn" @click="handlePush">前往完善</button>
              </template>
              <template v-else>
                <button class="sa-confirm-btn" @click="handleConfirm">確定</button>
              </template>
            </footer>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isVisible: boolean;
  title: string;
  content: string;
  type?: 'alert' | 'confirm' | 'favorite';
}>();

const emit = defineEmits(['close', 'cancel', 'favorite', 'push']);

const handleConfirm = () => {
  emit('close');
};

const handleCancel = () => {
  emit('cancel');
};

const handleFavorite = () => {
  emit('favorite');
};

const handlePush = () => {
  emit('push');
};
</script>

<style scoped>
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
  color: white;
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
  line-height: 1.6;
}

.sa-footer {
  padding: 8px 15px;
  text-align: right;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.sa-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
}

.sa-close-btn:hover {
  opacity: 0.7;
}

.sa-cancel-btn {
  background-color: #f5f5f5;
  color: #666;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.sa-cancel-btn:hover {
  background-color: #e0e0e0;
}

.sa-confirm-btn {
  background-color: #ff6634;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.sa-confirm-btn:hover {
  background-color: #ff4814;
}

/* ✅ 收藏按鈕樣式 */
.sa-favorite-btn {
  background-color: #fff;
  color: #ff6634;
  border: 1px solid #ff6634;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sa-favorite-btn:hover {
  background-color: #ff6634;
  color: white;
}

.sa-favorite-btn svg {
  transition: fill 0.3s;
}

.sa-favorite-btn:hover svg {
  fill: white;
}

/* ✅ 前往按鈕樣式 */
.sa-push-btn {
  background-color: #ff6634;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.sa-push-btn:hover {
  background-color: #ff4814;
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
