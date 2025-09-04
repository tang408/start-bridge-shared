<template>
  <div class="service">
    <div class="service-btn">
      <button class="service-btn-yellow">
        <img src="@/assets/icon/btn-icon.svg" />【啟動】創業
      </button>
      <button class="service-btn-black">
        <img src="@/assets/icon/btn-icon2.svg" />【參與】共創
      </button>
    </div>
    <div class="container pb-05">
      <div class="service-title">
        <h1>全方位創業媒合服務</h1>
        <span>星橋為您繫起，步步實踐成功的橋樑</span>
      </div>
      <div class="service-card">
        <img src="@/assets/images/service-card.png" class="w-100 mobile-none" />
        <img
          src="@/assets/images/service-card-mobile.png"
          class="w-100 desktop-none"
        />
      </div>
      <div>
        <Icon :icons="Icons" />
      </div>
    </div>
  </div>
  <div class="service-progress">
    <img
      src="@/assets/images/shape1.svg"
      class="service-progress-shape1 mobile-none"
    />
    <img
      src="@/assets/images/shape1-mobile.svg"
      class="service-progress-shape1 desktop-none"
    />
    <img
      src="@/assets/images/shape2.svg"
      class="service-progress-shape2 mobile-none"
    />
    <div class="container p-0">
      <SharedSwiper
        :cards="progressCards"
        prevElClass="progress-prev-1"
        nextElClass="progress-next-1"
      />
    </div>
  </div>
  <div class="service-project">
    <div class="container p-0">
      <SharedSwiper
        :cards="progressCards"
        prevElClass="progress-prev-2"
        nextElClass="progress-next-2"
      />
      <button class="service-project-btn mt-5" @click="goMoreProjects">
        更多專案
      </button>
    </div>
  </div>
  <div class="service-process">
    <div class="container">
      <div class="service-title">
        <h1>服務流程</h1>
        <span>星橋撐腰，雙向安心，輕鬆啟程</span>
      </div>
      <div class="process">
        <div class="process-step">
          <div class="process-step-tracker">
            <div
              class="process-step-tracker-item"
              v-for="(step, index) in processSteps"
              :key="index"
              :class="{ active: index === activeIndex }"
              @click="setActive(index)"
            >
              {{ index + 1 }}
            </div>
          </div>
        </div>

        <div class="process-cards desktop-block mobile-none">
          <div
            class="process-cards-item"
            v-for="(step, index) in processCardSteps"
            :key="index"
            :class="{ active: index === activeIndex }"
          >
            <img :src="step.img" class="process-image" />
            <div class="btn-tooltip-wrapper">
              <div class="process-btn">{{ step.title }}</div>
              <div class="process-tooltip">{{ step.desc }}</div>
            </div>
          </div>
        </div>

        <div class="mobile-block desktop-none">
          <Swiper
            ref="swiperRef"
            :slides-per-view="1"
            @slideChange="onSlideChange"
          >
            <SwiperSlide v-for="(step, index) in processCardSteps" :key="index">
              <img :src="step.img" class="mobile-image w-100" />
              <div class="btn-tooltip-wrapper">
                <div class="process-btn">{{ step.title }}</div>
                <div class="process-tooltip">{{ step.desc }}</div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  </div>

  <SharedParner :count="30" />

  <div class="service-item">
    <img
      src="@/assets/images/service-item-banner.jpg"
      class="mobile-none service-item-img"
    />
    <img
      src="@/assets/images/service-item-banner-mobile.jpg"
      class="desktop-none service-item-img"
    />
    <div class="service-item-card">
      <span>
        星橋創業媒合平台 一個專注連鎖加盟媒合的平台，也是
        一群陪你從創業起步，到把夢想開成 一家店的專業團隊。
      </span>
      <button>
        <img src="@/assets/icon/btn-icon2.svg" />
        啟動／參與
      </button>
    </div>
  </div>
</template>

<script setup>
import Icon from "./Icon.vue";
import SharedSwiper from "./Swiper.vue";
import SharedParner from "@/components/Shared-Parner.vue";
import { ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import SwiperCore from "swiper";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

SwiperCore.use([Pagination]);

const activeIndex = ref(0);
const swiperRef = ref();

const Icons = [
  {
    img: new URL("@/assets/images/service-icon1.svg", import.meta.url).href,
    title: "創業不迷航",
    description: "從評估到加盟，專員陪跑解決焦慮。",
  },
  {
    img: new URL("@/assets/images/service-icon2.svg", import.meta.url).href,
    title: "嚴選連鎖品牌",
    description: "嚴選優質成熟品牌，複製成功模式。",
  },
  {
    img: new URL("@/assets/images/service-icon3.svg", import.meta.url).href,
    title: "雲端資料庫",
    description: "即時瀏覽品牌資訊、串接全台人脈網絡。",
  },
  {
    img: new URL("@/assets/images/service-icon4.svg", import.meta.url).href,
    title: "低門檻參與",
    description: "告別盲目投入，小額滾出大收益。",
  },
  {
    img: new URL("@/assets/images/service-icon5.svg", import.meta.url).href,
    title: "實戰進修輔導",
    description: "輔導課程、專業講座、業師培訓一應俱全。",
  },
];

const progressCards = [
  {
    id: 1,
    img: new URL("@/assets/images/card-box.png", import.meta.url).href,
    // tags: ["預購商品", "支援配送"],
    title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
    progress: 88,
    price: "99天",
    supporters: "9999 人瀏覽",
    to: { name: "ProjectDetail", params: { id: 1 } },
  },
  {
    id: 2,
    img: new URL("@/assets/images/card-box.png", import.meta.url).href,
    // tags: ["預購商品", "支援配送"],
    title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
    progress: 72,
    price: "99天",
    supporters: "9999 人瀏覽",
    to: { name: "ProjectDetail", params: { id: 2 } },
  },
  {
    id: 3,
    img: new URL("@/assets/images/card-box.png", import.meta.url).href,
    // tags: ["預購商品", "支援配送"],
    title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
    progress: 55,
    price: "99天",
    supporters: "9999 人瀏覽",
    to: { name: "ProjectDetail", params: { id: 3 } },
  },
  {
    id: 4,
    img: new URL("@/assets/images/card-box.png", import.meta.url).href,
    // tags: ["預購商品", "支援配送"],
    title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
    progress: 91,
    price: "99天",
    supporters: "9999 人瀏覽",
    to: { name: "ProjectDetail", params: { id: 4 } },
  },
  {
    id: 5,
    img: new URL("@/assets/images/card-box.png", import.meta.url).href,
    // tags: ["預購商品", "支援配送"],
    title: "專案名稱專案名稱區域專案名稱專案名稱區域專案名稱",
    progress: 64,
    price: "99天",
    supporters: "9999 人瀏覽",
    to: { name: "ProjectDetail", params: { id: 5 } },
  },
];

const processCardSteps = [
  {
    img: new URL("@/assets/images/process-step1.png", import.meta.url).href,
    title: "線上註冊",
    desc: "對焦創業意向及需求，\n提交申請，啟動媒合。",
  },
  {
    img: new URL("@/assets/images/process-step2.png", import.meta.url).href,
    title: "門店諮詢",
    desc: "預約到訪實體店，\n專業顧問解析專屬方案。",
  },
  {
    img: new URL("@/assets/images/process-step3.png", import.meta.url).href,
    title: "專員對接",
    desc: "化身陪跑夥伴從旁支援，\n主動挖掘合作方，溝通協調。",
  },
  {
    img: new URL("@/assets/images/process-step4.png", import.meta.url).href,
    title: "合作支持",
    desc: "簽訂法律協議，保障權益。\n提供持續跟進與輔導服務。",
  },
];

const processSteps = [1, 2, 3, 4];

function setActive(index) {
  activeIndex.value = index;
  if (swiperRef.value?.swiper) {
    swiperRef.value.swiper.slideTo(index);
  }
}

function onSlideChange(swiper) {
  activeIndex.value = swiper.activeIndex;
}
</script>

<style lang="scss" scoped>
.service {
  background-image: url("@/assets/images/service.png");
  background-repeat: no-repeat;
  background-size: 100%;
  padding: 2rem 0;
  text-align: center;
  @media (max-width: 767px) {
    padding: 0;
  }
  &-btn {
    gap: 1rem;
    margin-bottom: 3rem;
    display: flex;
    justify-content: center;
    @media (max-width: 767px) {
      display: flex;
      flex-flow: column;
      align-items: center;
      padding-top: 2rem;
    }
    button {
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
      width: 400px;
      justify-content: center;
      @media (max-width: 767px) {
        width: 85%;
        font-size: 18px;
        height: 40px;
      }
    }
    &-yellow {
      color: #000000;
      background-color: #ffc919;
    }

    &-black {
      color: #ffffff;
      background-color: #262626;
    }

    img {
      width: 17px;
      height: 24px;
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
    span {
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;
    }
  }

  &-card {
    margin-top: 3rem;
    @media (max-width: 767px) {
      margin-top: 1rem;
    }
  }

  &-progress {
    background-color: #ffcc66;
    position: relative;
    padding: 4rem 0;
    @media (max-width: 767px) {
      padding: 6rem 0;
    }
    &-shape1 {
      position: absolute;
      left: 0;
      top: -170px;
      @media (max-width: 767px) {
        position: absolute;
        left: 50%;
        top: -140px;
        translate: -50%;
      }
    }
    &-shape2 {
      position: absolute;
      right: 0;
      bottom: -20%;
    }
  }
}

.service-project {
  padding: 4rem 0;
  background-image: url("@/assets/images/service-project.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  text-align: center;
  &-btn {
    padding: 10px 24px;
    font-size: 16px;
    color: #fff;
    cursor: pointer;
    font-weight: bold;
    background: linear-gradient(0deg, #262626, #262626),
      linear-gradient(126.86deg, #665f51 -8.87%, #b86a54 112.15%);
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    border-radius: 50px;
    border: none;
    width: 35%;
    @media (max-width: 767px) {
      width: 251px;
      margin-top: 2rem !important;
    }
    &:hover {
      background: #000000;
    }
  }
}

.service-process {
  padding: 4rem 0;
  background: linear-gradient(
    90deg,
    rgba(236, 236, 236, 0.5) 0%,
    rgba(213, 213, 213, 1) 100%
  );

  .process-cards {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin-top: 3rem;

    .process-cards-item {
      width: 22%;
      text-align: center;
      position: relative;
      display: flex;
      flex-flow: column;
      align-items: center;

      .process-image {
        width: 320px;
      }
    }
  }
  .process-step {
    width: 100%;
    display: flex;
    justify-content: center;
    order: 2;
    @media (max-width: 767px) {
      order: 1;
    }
    &-tracker {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      margin-top: 2rem;
      padding: 0;
      width: 80%;
      @media (max-width: 767px) {
        width: 45%;
      }

      &::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 2px;
        background-color: #46494a;
        transform: translateY(-50%);
        z-index: 0;
      }

      &-item {
        position: relative;
        z-index: 1;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid #46494a;
        color: #46494a;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 14px;
        background: #e7e7e7;
        cursor: pointer;
        transition: background 0.3s, color 0.3s;
      }

      &-item.active {
        background-color: #46494a;
        color: #fff;
        border-color: #46494a;
      }
    }
  }
}

.service-partners {
  padding: 4rem 0;
  min-height: 45vh;
  &-content {
    .service-partners-content {
      &-one,
      &-two {
        display: flex;
        @media (max-width: 767px) {
          display: block;
        }
      }
    }
  }
}

.service-item {
  position: relative;

  &-img {
    height: 600px;
    width: 100%;
    object-fit: cover;
    @media (max-width: 767px) {
      height: 368px;
    }
  }

  &-card {
    width: 430px;
    position: absolute;
    bottom: 120px;
    right: 280px;
    display: inline-flex;
    flex-flow: column;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 30px;
    padding: 40px;
    gap: 25px;

    @media (max-width: 767px) {
      position: revert;
      width: 100%;
      padding: 40px 27px;
    }

    span {
      color: #373a36;
      font-weight: 500;
      font-size: 16px;
      line-height: 28px;
      text-align: start;
      @media (max-width: 767px) {
        text-align: center;
      }
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

      @media (max-width: 767px) {
        width: 100%;
      }
    }
  }
}

.btn-tooltip-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  &:hover .process-tooltip {
    opacity: 1;
    visibility: visible;

    &::after {
      opacity: 1;
    }
  }
  &:active .process-tooltip {
    @media (max-width: 767px) {
      opacity: 1;
      visibility: visible;
    }

    &::after {
      @media (max-width: 767px) {
        opacity: 1;
      }
    }
  }
}
.process {
  @media (min-width: 768px) {
    display: flex;
    flex-flow: column;
  }
  &-btn {
    background-color: #333;
    color: #fff;
    padding: 10px 20px;
    border-radius: 50px;
    font-weight: bold;
    cursor: pointer;
    display: inline-block;
    width: 200px;
    font-size: 24px;
    z-index: 1;
    text-align: center;
    @media (max-width: 767px) {
      font-size: 20px;
      padding: 7px 20px;
    }
  }
  &-tooltip {
    margin-top: -1rem;
    padding: 30px 8px 20px 8px;
    width: 250px;
    border-radius: 20px;
    position: relative;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease;
    min-height: 60px;
    border: 2px solid;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    text-align: center;
    letter-spacing: 0.1em;
    color: #000000;
    white-space: pre-line;
    @media (max-width: 767px) {
      opacity: 1;
      visibility: revert;
    }
  }
}

.process-cards-item.active .btn-tooltip-wrapper .process-tooltip {
  opacity: 1;
  visibility: visible;
}
</style>
