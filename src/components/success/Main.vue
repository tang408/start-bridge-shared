<template>
  <Swiper />
  <SharedNews
    :items="items"
    :page-size="16"
    :show-filter="false"
    @card-click="openDetail"
    @favorite-change="onFavoriteChange"
  />
  <div class="qa-content">
    <div class="qa-content-text">
      <h3>對專案有疑問?</h3>
      <span class="lh-26">
        創業路上，從品牌選擇、資金評估到市場定位，難免會有許多不確定性。我們擁有豐富的媒合與輔導經驗，承諾為您解答所有專案相關疑問，助您精準跨出創業第一步！
      </span>
      <button @click="goToQA">創業者QA</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import {onMounted, ref} from "vue";
import Swiper from "./Swiper.vue";
import SharedNews from "@/components/shared/Shared-News.vue";
import img1 from "@/assets/images/news-1.png";
import img2 from "@/assets/images/news-2.png";
import img3 from "@/assets/images/news-3.png";
import img4 from "@/assets/images/news-4.png";
import {successPlanApi} from "@/api/modules/successPlan.js";

const router = useRouter();
const sampleImages = [img1, img2, img3, img4];
const items = ref(
  Array.from({ length: 80 }).map((_, i) => ({
    id: i + 1,
    title: `最新消息最新消息標題最新消息標題標題最新消息標題`,
    cover: sampleImages[i % 4],
  }))
);

async function getSuccessPlanPhotos() {
  const response = await successPlanApi.getSuccessPlanPhotos()
  if (response.code === 0) {
    items.value = response.data.map((item) => ({
      id: item.id,
      title: item.name,
      cover: item.photo,
    }))
  } else {
    console.error("Failed to fetch success plan photos:", response.message)
}
}

onMounted(() => {
  getSuccessPlanPhotos()
})

function openDetail(card) {
  router.push({ name: "SuccessDetail", params: { id: card.id } });
}

function onFavoriteChange({ id, value }) {
  const target = items.value.find((i) => i.id === id);
  if (target) target.favorite = value;
}

const goToQA = () => {
  router.push({ path: "/activity", hash: "#qa" });
};
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
