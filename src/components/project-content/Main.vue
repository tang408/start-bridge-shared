<template>
  <div class="project-content">
    <div class="container">
      <SharedProjectContent
          :photo="brandData?.photo"
          :description="brandData?.description"
      />
      <Swiper
        :images="brandImages || []"
      />
      <Tabs
        :brand-data="brandData"
        :plan-data="planData"
      />
      <div class="">
        <h1 class="mb-4 text-center">媒體介紹</h1>
        <div class="media-section-card row">
          <div class="col-md-4" v-for="(card, index) in cards" :key="index">
            <img :src="card.img" class="media-section-card-image w-100 mb-2" />
            <div>{{ card.title }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="project-footer">
    <span>
      Lorem ipsum is placeholder text commonly used in the graphic, print, and
      publishing industries for previewing
    </span>
    <img src="@/assets/images/project-bottom.png" class="project-content-img" />
  </div>
</template>

<script setup>
import SharedProjectContent from "@/components/shared/Shared-project-content.vue";
import Swiper from "./Project-Swiper.vue";
import Tabs from "./Tabs.vue";
import {onMounted, ref} from "vue";
import {useAuth} from "@/composables/useAuth.js";
import {useRoute, useRouter} from "vue-router";
import {planApi as PlanApi} from "@/api/modules/plan.js";
import {officialPartnerApi} from "@/api/modules/officialPartner.js";

// 必須先聲明 route 和 router
const route = useRoute();
const {isLoggedIn, currentUser} = useAuth();

const cards = [
  {
    img: new URL("@/assets/images/media-1.png", import.meta.url).href,
    title: "顏太煮奶茶 x 面白大丈夫｜夢幻連動!!笑料滿滿的面白放送",
  },
  {
    img: new URL("@/assets/images/media-2.png", import.meta.url).href,
    title: "咀嚼控的最愛｜爆料系平價手搖✨「顏太煮奶茶」",
  },
  {
    img: new URL("@/assets/images/media-3.png", import.meta.url).href,
    title: "盛情款待的手搖時光｜台中奶茶霸主🧋「顏太煮奶茶」",
  },
];

const emit = defineEmits(['data-loaded']);
const planData = ref();
const brandData = ref();
const brandImages = ref([])
async function getPlan() {
  const formData = {
    userId: isLoggedIn.value ? currentUser.value : "",
    planId: Number(route.params.id)
  }
  const response = await PlanApi.getPlan(formData);
  if (response.code === 0) {
    planData.value = response.data;

    await getOfficialPartner();
  }
}

async function getOfficialPartner() {

  const formData = {
    officialPartnerId: planData.value.brand
  }
  const response = await officialPartnerApi.getOfficialPartner(formData)
  if (response.code === 0) {
    brandData.value = response.data;
    emit('data-loaded', response.data);

// 將 JSON 字串轉換成陣列
    if (response.data.brandImage) {
      try {
        brandImages.value = JSON.parse(response.data.brandImage);
      } catch (error) {
        console.error('解析 brandImage 失敗:', error);
        brandImages.value = [];
      }
    } else {
      brandImages.value = [];
    }
  }
}

onMounted(() => {
  getPlan();
});

</script>

<style lang="scss" scoped>
.project {
  &-content {
    background: url("@/assets/images/project-bc.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100%;
    position: relative;
    @media (max-width: 576px) {
      padding: 0 21px;
      background-size: cover;
    }
    &-img {
      margin: -50px 0;
      width: 100%;
      @media (max-width: 576px) {
        margin: 0;
        height: 30vh;
        object-fit: contain;
      }
    }
  }
  &-bc {
    &-img {
      position: absolute;
      left: 0;
      top: 10%;
      z-index: 0;
      height: 40vh;
    }
  }
  &-footer {
    position: relative;
    @media (max-width: 576px) {
      height: 25vh;
    }

    span {
      position: absolute;
      bottom: 35%;
      right: 10%;
      width: 400px;
      font-weight: 400;
      font-size: 16px;
      line-height: 26px;
      color: #ffffff;
      @media (max-width: 576px) {
        bottom: 15px;
        right: 0;
        padding: 0 25px;
        width: 100%;
      }
    }
  }
}

.media-section-card {
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  letter-spacing: 2px;
  @media (max-width: 576px) {
    gap: 15px;
  }
  &-image {
    border-radius: 20px;
  }
}
</style>
