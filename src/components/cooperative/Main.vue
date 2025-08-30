<template>
  <Swiper />
  <SharedNews
    :items="items"
    :page-size="16"
    :categories="industryTypes"
    :with-all-tab="true"
    @card-click="openDetail"
  />
  <div class="qa-content">
    <div class="qa-content-text">
      <h3>對專案有疑問?</h3>
      <span class="lh-26">
        Lorem ipsum is placeholder text commonly used in the graphic, print, and
        publishing industries for previewing
      </span>
      <button>創業者QA</button>
    </div>
  </div>
</template>

<script setup>
import Swiper from "./Swiper.vue";
import SharedNews from "./../Shared-News.vue";
import img1 from "@/assets/images/news-1.png";
import img2 from "@/assets/images/news-2.png";
import img3 from "@/assets/images/news-3.png";
import img4 from "@/assets/images/news-4.png";
import {aboutMeApi as aboutMeApiApi} from "@/api/modules/aboutMe.js";
import {onMounted, ref} from "vue";
import {industryTypeApi} from "@/api/modules/industryType.js";

const cat = ["餐飲", "生活服務", "商人項目", "海外貿易"];
const sampleImages = [img1, img2, img3, img4];

const items = Array.from({ length: 80 }).map((_, i) => ({
  id: i + 1,
  title: `最新消息最新消息標題最新消息標題標題最新消息標題`,
  cover: sampleImages[i % 4],
  category: cat[i % cat.length],
}));

function openDetail(card) {}

const loading = ref(false);
const industryTypes = ref([]);
async function getIndustryTypes() {
  loading.value = true;
  try {
    const response = await industryTypeApi.getIndustryTypes();
    if (response.code === 0) {
      industryTypes.value = response.data.map(item => item.name);
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取關於我們內容失敗:', error);
  } finally {
    loading.value = false;
  }
}



// 組件掛載時獲取數據
onMounted(async () => {
  await Promise.all([
    getIndustryTypes()
  ]);
});

</script>

<style lang="scss" scoped>
.qa-content {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
    url("@/assets/images/brand-bc-5.png");
  height: 550px;
  position: relative;
  &-text {
    width: 446px;
    padding: 40px;
    gap: 20px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 30px;
    justify-content: center;
    display: flex;
    flex-flow: column;
    align-items: center;
    position: absolute;
    top: 150px;
    left: 200px;
    @media (max-width: 576px) {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 340px;
    }

    h3 {
      text-align: center;
      color: #373a36;
      font-weight: 600;
    }
    span {
      letter-spacing: 0.1em;
      color: #373a36;
    }
    button {
      padding: 10px 20px;
      background: #262626;
      border-radius: 50px;
      color: #fff;
      width: 250px;
      gap: 8px;
      display: flex;
      justify-content: center;
      border: none;
      letter-spacing: 2px;
      margin-top: 0.7rem;
    }
  }
}
</style>
