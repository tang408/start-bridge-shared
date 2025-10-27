<template>
  <ul class="nav nav-tabs justify-content-center" id="myTab" role="tablist">
    <li
        class="nav-item"
        role="presentation"
        v-for="(item, index) in options"
        :key="index"
    >
      <button
          class="nav-link"
          :class="{ active: activeTab === index }"
          :id="`tab-${index}`"
          data-bs-toggle="tab"
          :data-bs-target="`#pane-${index}`"
          type="button"
          role="tab"
          :aria-controls="`pane-${index}`"
          :aria-selected="activeTab === index"
          @click="activeTab = index"
      >
        <img
            :src="activeTab === index ? activeIcon : inactiveIcon"
            alt=""
            class="tab-icon"
        />
        {{ item.name }}
      </button>
    </li>
  </ul>

  <div class="tab-content" id="myTabContent">
    <div
        v-for="(item, index) in options"
        :key="'pane-' + index"
        class="tab-pane fade"
        :class="{ 'show active': activeTab === index }"
        :id="`pane-${index}`"
        role="tabpanel"
        :aria-labelledby="`tab-${index}`"
    >
      <div class="tab-card">
        <div class="tab-card-content">
          <h5 class="title">{{ item.title }}</h5>
          <p v-html="item.content"></p>
        </div>
        <div class="tab-card-image" v-if="item.photo">
          <img :src="item.photo" :alt="item.name" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {optionApi} from "@/api/modules/option.js";

const activeTab = ref(0);
const activeIcon = new URL("@/assets/icon/btn-icon.svg", import.meta.url).href;
const inactiveIcon = new URL("@/assets/icon/btn-icon2.svg", import.meta.url)
    .href;

const plans = ref([
  {
    name: "方案A",
    title: "Lorem ipsum is placeholder",
    content:
        "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
  {
    name: "方案B",
    title: "Lorem ipsum is placeholder",
    content:
        "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
  {
    name: "方案C",
    title: "Lorem ipsum is placeholder",
    content:
        "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
]);
const options = ref([]);
const loading = ref(false);
async function getOptions() {
  loading.value = true;
  try {
    const response = await optionApi.getOptions();
    if (response.code === 0) {
      options.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取數據失敗:', error);
  } finally {
    loading.value = false;
  }
}

// 組件掛載時獲取數據
onMounted(async () => {
  await getOptions();
});

</script>

<style scoped lang="scss">
.nav-tabs {
  border: none;
  gap: 2rem;
  @media (max-width: 576px) {
    gap: 0.2rem;
  }
  .nav-link.active {
    color: #000000;
    background-color: #ffc919;
  }

  .nav-link {
    font-weight: 500;
    font-size: 22px;
    line-height: 26px;
    height: 70px;
    display: flex;
    align-items: center;
    letter-spacing: 2px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    padding: 10px 20px;
    gap: 8px;
    border-radius: 50px;
    border: none;
    width: 250px;
    justify-content: center;
    color: #ffffff;
    background-color: #262626;
    @media (max-width: 576px) {
      width: auto;
      height: 40px;
      font-size: 16px;
      padding: 5px 15px;
    }
  }
}

.tab-card {
  background: #d9d9d94d;
  box-shadow: 5px 5px 20px rgba(55, 58, 54, 0.5);
  border-radius: 50px;
  padding: 2rem;
  color: #333;
  height: 562px;
  display: flex;
  flex-flow: row;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }

  .title {
    color: #ff5722;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  &-content {
    width: 600px;
    padding: 30px;
    flex-shrink: 0;
    @media (max-width: 576px) {
      width: 100%;
      padding: 0;
    }
  }

  &-image {
    flex-shrink: 0;
    max-width: 400px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
      max-width: 100%;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 20px;
      object-fit: cover;
    }
  }
}

.tab-content {
  padding: 40px 0;
}
</style>
