<template>
  <div class="service-partners">
    <div class="container">
      <div class="service-title" v-if="title">
        <h1>{{ title }}</h1>
      </div>

      <div class="logo-grid" :class="gridSizeClass" role="list">
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

// 根據數量計算 grid 的 class
const gridSizeClass = computed(() => {
  const count = partnerPhotos.value.length;
  if (count <= 8) {
    return 'grid-large';
  } else if (count <= 20) {
    return 'grid-medium';
  }
  return 'grid-small';
});

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
    @media (max-width: 767px) {
      margin-top: 100px !important;
    }
    .container {
      gap: 50px;
      display: grid;
    }
  }
  &-title {
    text-align: center;
    letter-spacing: 0.1em;
    z-index: 10;
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
    gap: 20px;
    align-items: center;

    // 8個以內 - 較大
    &.grid-large {
      grid-template-columns: repeat(2, 1fr);

      @media (min-width: 768px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 30px;
      }

      .logo-item img {
        max-height: 100px;

        @media (min-width: 768px) {
          max-height: 120px;
        }
      }
    }

    // 8-20個 - 中等
    &.grid-medium {
      grid-template-columns: repeat(3, 1fr);

      @media (min-width: 768px) {
        grid-template-columns: repeat(6, 1fr);
        gap: 25px;
      }

      .logo-item img {
        max-height: 80px;

        @media (min-width: 768px) {
          max-height: 90px;
        }
      }
    }

    // 20個以上 - 較小（原本的尺寸）
    &.grid-small {
      grid-template-columns: repeat(5, 1fr);
      gap: 0;

      @media (min-width: 768px) {
        grid-template-columns: repeat(10, 1fr);
        gap: 20px;
      }

      .logo-item img {
        max-height: 60px;
      }
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
      object-fit: contain;
      transition: transform 0.3s ease;
    }
  }
}

.loading-state,
.no-data {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;

  p {
    font-size: 1.1rem;
    color: #666;
  }
}
</style>
