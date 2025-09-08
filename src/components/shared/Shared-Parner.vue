<template>
  <div class="service-partners">
    <div class="container">
      <div class="service-title" v-if="title">
        <h1>{{ title }}</h1>
      </div>

      <div class="logo-grid" role="list">
        <!-- 載入狀態 -->
        <div v-if="loading" class="loading-state">
          <p>載入中...</p>
        </div>

        <!-- 顯示合作夥伴圖片 -->
        <div
            v-else
            v-for="partner in partnerPhotos"
            :key="partner.id"
            class="logo-item"
            role="listitem"
        >
          <img
              :src="partner.photo"
              :alt="partner.name"
              loading="lazy"
              @error="handleImageError"
          />
        </div>

        <!-- 如果沒有資料時的備用顯示 -->
        <div v-if="!loading && partnerPhotos.length === 0" class="no-data">
          <p>暫無合作夥伴資料</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {officialPartnerApi} from "@/api/modules/officialPartner.js";

const props = defineProps({
  title: { type: String, default: "合作夥伴" },
  count: { type: Number, default: 20 },
  src: { type: String, default: "" },
  altBase: { type: String, default: "partner" },
});

const imgSrc = computed(() =>
  props.src && props.src.length
    ? props.src
    : new URL("@/assets/images/logo-only.png", import.meta.url).href
);

const loading = ref(false);
const partnerPhotos = ref([]);
async function getOfficialPartnerPhotos() {
  loading.value = true;
  try {
    const response = await officialPartnerApi.getOfficialPartnerPhotos();
    if (response.code === 0) {
      partnerPhotos.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取創辦人數據失敗:', error);
  } finally {
    loading.value = false;
  }
}

// 組件掛載時獲取數據
onMounted(async () => {
  await getOfficialPartnerPhotos();
});

// 圖片載入錯誤處理
function handleImageError(event) {
  console.warn('圖片載入失敗:', event.target.src);
  // 可以設置預設圖片
  event.target.src = imgSrc.value;
}
</script>

<style lang="scss" scoped>
.service {
  &-partners {
    padding: 4rem 0;
    min-height: 60vh;
    .container {
      gap: 50px;
      display: grid;
    }
  }
  &-title {
    text-align: center;
    letter-spacing: 0.1em;
    h1 {
      font-weight: 700;
      font-size: 36px;
      line-height: 43px;
      @media (max-width: 767px) {
        font-size: 28px;
      }
    }
  }
}

.logo {
  &-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0;
    align-items: center;

    @media (min-width: 768px) {
      grid-template-columns: repeat(10, 1fr);
      gap: 20px;
    }
  }
  &-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    img {
      width: 100%;
      height: auto;
      max-height: 60px;
      object-fit: contain;
    }
  }
}
</style>
