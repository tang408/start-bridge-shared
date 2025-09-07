<template>
  <Banner text="顏太煮奶茶(品牌內頁)" :image="bannerImg" />

  <Main :preview-mode="isPreviewMode" :partner-id="currentId"></Main>
</template>

<script setup>
import Banner from "@/components/Shared-Banner.vue";
import Main from "@/components/Cooperative-content/Main.vue";
import bannerImg from "@/assets/images/banner-brand.jpg";
import {computed} from "vue";
import {useRoute, useRouter} from "vue-router";

// 必須先聲明 route 和 router
const route = useRoute();
const router = useRouter();

const props = defineProps({
  id: { type: [String, Number], required: true },
});

// 檢查是否為預覽模式
const isPreviewMode = computed(() => {
  console.log('Route Query:', route.query.preview)
  return route.query.preview === 'true';
});

// 獲取當前 ID（來自路由參數或查詢參數）
const currentId = computed(() => {
  if (route.query.preview === 'true') {
    return route.query.id;
  }
  return route.params.id || props.id;
});

// 關閉預覽
const closePreview = () => {
  if (window.opener) {
    // 如果是在新窗口中打開的，關閉窗口
    window.close();
  } else {
    // 否則返回上一頁或首頁
    router.go(-1);
  }
};


</script>


<style scoped>
.preview-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.preview-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.preview-label {
  font-weight: bold;
  font-size: 16px;
}

.preview-id {
  background: rgba(255,255,255,0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
}

.close-preview-btn {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-preview-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-1px);
}
</style>
