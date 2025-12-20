<template>
  <div class="about-block">
    <div class="container">
      <div class="d-flex-block row">
        <div class="col-md-6 col-12">
          <h4 class="color-1 lh-24">
            {{ aboutMes[0]?.title }}
          </h4>
          <span class="lh-24 ql-editor p-0" v-html="aboutMes[0]?.content"></span>
          <img src="@/assets/images/about-sign.png" height="38"/>
        </div>
        <div class="pic-content-1 col-md-6 col-12">
          <img src="@/assets/images/star1.png" class="icon-1"/>
          <img src="@/assets/images/about-color-bc-1.png" class="w-100"/>
          <img :src="aboutMes[0]?.photo || 'src/assets/images/about-pic1.png'" class="pic-1"/>
        </div>
      </div>
    </div>
  </div>
  <div class="about-block">
    <img src="@/assets/images/shape-2.png" class="icon-3"/>

    <div class="container">
      <div class="d-flex-block row">
        <div class="pic-content-1 col-md-6 col-12">
          <img src="@/assets/images/shape.png" class="shape"/>
          <img src="@/assets/images/star1.png" class="icon-2"/>
          <div class="about-pic-2">
            <img src="@/assets/images/about-color-bc-2.png" class="w-100"/>
            <img :src="aboutMes[1]?.photo || 'src/assets/images/about-pic2.png'" class="pic-2"/>
          </div>
        </div>
        <div class="col-md-6 col-12 block-text">
          <h4 class="color-1 lh-24">
            {{ aboutMes[1]?.title }}
          </h4>
          <span class="lh-24 ql-editor p-0" v-html="aboutMes[1]?.content"></span>
          <button>啟動／參與</button>
        </div>
      </div>
    </div>
  </div>
  <div class="about-stars">
    <div class="container">
      <div class="stars d-flex-block">
        <img src="@/assets/images/logo-1.png"/>

        <div
            class="star-box"
            v-for="(item, idx) in stars"
            :key="item.key"
            :class="{ active: idx === activeIdx }"
            @click="setActive(idx)"
        >
          <span class="letter">{{ item.letter }}</span>
          <p>
            {{ item.title }}<br/>
            {{ item.subtitle }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <div class="about-edge">
    <img src="@/assets/images/about-bc1.png" class="about-edge-bc w-100"/>
    <div class="container">
      <div class="row">
        <div class="col-md-3">
          <h2>星橋優勢</h2>
        </div>
        <div class="col-md-9">
          <section class="features">
            <div class="features-inner">
              <div
                  v-for="(feature, index) in advantages"
                  :key="feature.id"
                  class="col-4 card"
                  :class="getCardClass(index)"
              >
                <img :src="feature.photo" :alt="feature.title" />
                <h3 class="card-title">{{ feature.title }}</h3>
                <p class="card-text ql-editor p-0" v-html="feature.description"></p>
              </div>
            </div>

            <div class="bottom-text ql-editor p-0" v-html="aboutMeText">
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
<!--  <div class="about-founder">-->
<!--    <h2 class="title">創辦人</h2>-->
<!--    <div class="container">-->
<!--      <div v-if="loading" class="text-center py-4">-->
<!--        <div class="spinner-border text-light" role="status">-->
<!--          <span class="visually-hidden">Loading...</span>-->
<!--        </div>-->
<!--      </div>-->
<!--      <template v-else>-->
<!--        <Swiper-->
<!--            class="founder-swiper"-->
<!--            :modules="[Navigation]"-->
<!--            :slides-per-view="1"-->
<!--            :space-between="24"-->
<!--            :loop="false"-->
<!--            :breakpoints="{-->
<!--            640: { slidesPerView: 2, spaceBetween: 24 },-->
<!--            992: { slidesPerView: 3, spaceBetween: 28 },-->
<!--            1200: { slidesPerView: 4, spaceBetween: 32 },-->
<!--          }"-->
<!--            :navigation="{ nextEl: '.founder-next', prevEl: '.founder-prev' }"-->
<!--        >-->
<!--          <SwiperSlide v-for="founder in founders" :key="founder.id">-->
<!--            <div class="card-people">-->
<!--              <img class="avatar" :src="founder.photo" :alt="founder.name"/>-->
<!--              <h3 class="name">{{ founder.name }}</h3>-->
<!--              <span class="desc">{{ founder.info }}</span>-->
<!--            </div>-->
<!--          </SwiperSlide>-->

<!--          <div v-if="founders.length > 4" class="swiper-button-prev founder-prev"></div>-->
<!--          <div v-if="founders.length > 4" class="swiper-button-next founder-next"></div>-->
<!--        </Swiper>-->
<!--        <img src="@/assets/images/star2.png" class="bc-shape"/>-->
<!--      </template>-->
<!--    </div>-->
<!--  </div>-->

  <SharedParner :count="30" class="mt-5"/>
</template>

<script setup>
import {ref, onMounted} from "vue";
import SharedParner from "@/components/shared/Shared-Parner.vue";
import {officialFounderApi} from "@/api/modules/officialFounder.js";
import {Swiper, SwiperSlide} from "swiper/vue";
import {Navigation} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {aboutMeApi as aboutMeApiApi, aboutMeApi} from "@/api/modules/aboutMe.js";

const stars = ref([
  {key: "sincerity", letter: "S", title: "Sincerity", subtitle: "真誠透明"},
  {key: "teamwork", letter: "T", title: "Teamwork", subtitle: "參與共創"},
  {
    key: "accountab",
    letter: "A",
    title: "Accountability",
    subtitle: "風險共擔",
  },
  {
    key: "reliability",
    letter: "R",
    title: "Reliability",
    subtitle: "專業支持",
  },
  {
    key: "sustain",
    letter: "S",
    title: "Sustainability",
    subtitle: "永續成長",
  },
]);

const activeIdx = ref(0);
const founders = ref([]);
const aboutMes = ref([]);
const aboutMeText = ref('');
const advantages = ref([]);
const loading = ref(false);


// 獲取創辦人數據
async function getOfficialFounders() {
  loading.value = true;
  try {
    const response = await officialFounderApi.getOfficialFounders();
    if (response.code === 0) {
      founders.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取創辦人數據失敗:', error);
  } finally {
    loading.value = false;
  }
}

// 關於我們的內容
async function getAboutMes() {
  loading.value = true;
  try {
    const response = await aboutMeApi.getAboutMes();
    if (response.code === 0) {
      aboutMes.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取關於我們內容失敗:', error);
  } finally {
    loading.value = false;
  }
}

async function getAboutMeText() {
  loading.value = true;
  try {
    const response = await aboutMeApi.getAboutMeText();
    if (response.code === 0) {
      aboutMeText.value = response.data.content;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取關於我們文字內容失敗:', error);
  } finally {
    loading.value = false;
  }

}

// 根據索引返回對應的 card class
function getCardClass(index) {
  const classes = ['card-yellow', 'card-orange', 'card-black'];
  return classes[index % 3]; // 循環使用三種顏色
}

async function getAdvantages() {
  loading.value = true;
  try {
    const response = await advantagesApi.getAdvantages();
    if (response.code === 0) {
      advantages.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取優勢內容失敗:', error);
  } finally {
    loading.value = false;
  }
}

// 組件掛載時獲取數據
onMounted(async () => {
  await Promise.all([
    getOfficialFounders(),
    getAboutMes(),
    getAboutMeText(),
    getAdvantages()
  ]);
});

function setActive(idx) {
  activeIdx.value = idx;
}

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import people1 from "@/assets/images/people-1.png";
import people2 from "@/assets/images/people-2.png";
import {advantagesApi} from "@/api/modules/advantages.js";

const people = [
  {
    name: "創辦人",
    avatar: people1,
    desc: "Lorem er magna aliqua. Ut enim ad minim am, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
  {
    name: "創辦人",
    avatar: people2,
    desc: "Lorem er magna aliqua. Ut enim ad minim am, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
  {
    name: "創辦人",
    avatar: people1,
    desc: "Lorem er magna aliqua. Ut enim ad minim am, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
  {
    name: "創辦人",
    avatar: people2,
    desc: "Lorem er magna aliqua. Ut enim ad minim am, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
];
</script>

<style lang="scss" scoped>
.about-block {
  position: relative;

  .d-flex-block {
    padding: 60px 0 190px;
    min-height: 510px;
    @media (max-width: 576px) {
      padding: 0;
    }
  }

  .pic-content-1 {
    position: relative;

    img {
      position: absolute;
      bottom: 50%;
      transform: translate(-50%, 50%);
      left: 43%;
      @media (max-width: 576px) {
        left: 50%;
      }
    }
  }

  .col-md-6 {
    align-content: center;
    display: grid;
    padding: 0 20px 0 0;
    gap: 10px;
    @media (max-width: 576px) {
      padding: 0;
      min-height: 375px;
    }

    &.block-text {
      position: relative;
      @media (max-width: 576px) {
        display: flex;
        flex-flow: column;
        align-items: center;
      }

      button {
        margin-top: 1rem;
      }
    }
  }

  .icon {
    &-1 {
      left: -2% !important;
      top: 15% !important;
    }

    &-2 {
      left: -12% !important;
      top: auto !important;
      bottom: -25% !important;
      transform: translate(0%, 0%) !important;
    }

    &-3 {
      position: absolute;
      top: -30%;
      right: -10%;
      @media (max-width: 576px) {
        top: 0;
        right: -30%;
        width: 50%;
      }
    }
  }

  .shape {
    top: -10% !important;
    left: -20% !important;
  }

  .about-pic-2 {
    width: 600px;
    height: 500px;
    position: relative;
    @media (max-width: 576px) {
      width: 100%;
      height: 100%;
    }
  }

  .pic {
    &-1 {
      width: 82%;
      border-radius: 50px;
      left: 54% !important;
    }

    &-2 {
      bottom: 63% !important;
      left: 33% !important;
      width: 73%;
      border-radius: 50px;
      @media (max-width: 576px) {
        left: 40% !important;
      }
    }
  }

  button {
    color: #ffffff;
    font-weight: 500;
    font-size: 20px;
    line-height: 24px;
    height: 50px;
    display: flex;
    align-items: center;
    letter-spacing: 2px;
    background: #262626;
    padding: 10px 20px;
    gap: 8px;
    border-radius: 50px;
    border: none;
    width: 250px;
    justify-content: center;
    @media (max-width: 767px) {
      width: 85%;
      font-size: 18px;
      height: 40px;
    }
  }
}

.about-stars {
  .stars {
    position: relative;
    display: flex;
    gap: 16px;
    justify-content: center;
    align-items: flex-end;
    @media (max-width: 767px) {
      flex-wrap: wrap;
      align-items: stretch;
    }

    img {
      padding-right: 1rem;
      @media (max-width: 767px) {
        padding: 1rem 0;
      }
    }

    .star-box {
      position: relative;
      flex: 1 1 0;
      height: 190px;
      width: 167px;
      text-align: center;
      align-content: center;
      border-radius: 30px;
      background: rgba(237, 237, 237, 0.8);
      box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.15),
      inset 8px 8px 4px rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(5px);
      cursor: pointer;
      transition: transform 0.28s ease, box-shadow 0.28s ease,
      z-index 0.28s ease, background 0.28s ease;
      z-index: 1;
      @media (max-width: 767px) {
        flex: 0 0 calc(50% - 8px);
        width: 120px;
        height: auto;
      }
      .letter {
        display: block;
        font-weight: 700;
        font-size: 80px;
        line-height: 100px;
        margin-bottom: 8px;
        color: #373a36;
        @media (max-width: 767px) {
          font-size: 60px;
          line-height: 80px;
        }
      }

      p {
        font-weight: 700;
        font-size: 18px;
        line-height: 24px;
        text-align: center;
        letter-spacing: 0.02em;
        color: #373a36;
        @media (max-width: 767px) {
          font-weight: 700;
          font-size: 13px;
          line-height: 19px;
          letter-spacing: 0.01em;
        }
      }
    }

    .star-box.pos-0 {
      transform: translateY(12px) rotate(-1deg);
      z-index: 2;
    }

    .star-box.pos-1 {
      transform: translateY(-8px) rotate(0.4deg);
      z-index: 3;
    }

    .star-box.pos-2 {
      transform: translateY(-18px) rotate(-0.6deg);
      z-index: 4;
    }

    .star-box.pos-3 {
      transform: translateY(-6px) rotate(0.3deg);
      z-index: 3;
    }

    .star-box.pos-4 {
      transform: translateY(6px) rotate(-0.8deg);
      z-index: 2;
    }

    .star-box:hover,
    .star-box.active {
      background: linear-gradient(325.61deg, #ff6634 48.16%, #ff9966 92.68%);
      box-shadow: 4px 16px 8px rgba(0, 0, 0, 0.1),
      inset 4px 4px 10px rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(5px);
      border-radius: 30px;
      color: #fff;
      transform: translateY(-28px) scale(1.04) !important;
      z-index: 7;

      .letter,
      p {
        color: #fff;
      }
    }

    @media (max-width: 767px) {
      .stars {
        gap: 10px;
      }
      .star-box {
        padding: 16px;
      }
      .star-box.pos-0 {
        transform: translateY(6px) rotate(-1deg);
      }
      .star-box.pos-1 {
        transform: translateY(-4px) rotate(0.4deg);
      }
      .star-box.pos-2 {
        transform: translateY(-10px) rotate(-0.6deg);
      }
      .star-box.pos-3 {
        transform: translateY(-3px) rotate(0.3deg);
      }
      .star-box.pos-4 {
        transform: translateY(4px) rotate(-0.8deg);
      }
      .star-box:hover {
        transform: translateY(-12px) scale(1.01);
      }
      .star-box.active {
        transform: translateY(-16px) scale(1.02) !important;
      }
    }
  }
}

.about-edge {
  min-height: 150vh;
  display: flex;
  align-items: center;
  margin-top: -60px;
  margin-bottom: -230px;
  position: relative;
  z-index: 0;
  @media (max-width: 576px) {
    margin-top: 0;
    margin-bottom: 0;
    padding: 100px 0;
  }

  &-bc {
    position: absolute;
    top: 0;
    bottom: 0;
    @media (max-width: 576px) {
      height: 240vh;
      object-fit: cover;
    }
  }

  .col-md-3 h2 {
    z-index: 2;
    position: relative;
    @media (max-width: 576px) {
      margin-bottom: 1.5rem;
    }
  }

  .col-md-3,
  .col-md-9 {
    align-content: center;
    text-align: center;
  }

  .features {
    position: relative;
  }

  .features::before,
  .features::after {
    content: "";
    position: absolute;
    inset: auto auto -25% -20%;
    width: 70%;
    height: 70%;
    background: radial-gradient(
            ellipse at top left,
            rgba(255, 122, 72, 0.25),
            transparent 60%
    );
    filter: blur(30px);
    transform: rotate(-8deg);
  }

  .features::after {
    inset: auto -25% -35% auto;
    background: radial-gradient(
            ellipse at top right,
            rgba(255, 180, 0, 0.22),
            transparent 60%
    );
    transform: rotate(8deg);
  }

  .features-inner {
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));

    .card:nth-child(2) {
      transform: translateY(10%);
      @media (max-width: 576px) {
        transform: translateY(0);
      }
    }
  }

  .card {
    border: none;
    color: #fff;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    gap: 12px;
    width: 246px;
    height: 291px;
    border-radius: 24px;
    transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px rgba(255, 255, 255, 0.08);
    @media (max-width: 576px) {
      width: 100%;
      height: 100%;
    }

    img {
      width: 80px;
      height: 80px;
    }

    &-yellow {
      background: #ffcc66;
      box-shadow: 4px 4px 8px rgba(106, 76, 47, 0.2),
      inset 8px 8px 4px rgba(255, 255, 255, 0.1);
      border-radius: 30px;
    }

    &-orange {
      background: #ff6634;
      box-shadow: 4px 4px 8px rgba(106, 76, 47, 0.2),
      inset 8px 8px 4px rgba(255, 255, 255, 0.1);
      border-radius: 30px;
    }

    &-black {
      background: #373a36;
      box-shadow: 4px 4px 8px rgba(106, 76, 47, 0.2),
      inset 8px 8px 4px rgba(255, 255, 255, 0.1);
      border-radius: 30px;
    }
  }

  .card-title {
    margin: 2px 0 0;
  }

  .card-text {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    @media (max-width: 576px) {
      font-size: 11px;
      line-height: 19px;
    }
  }

  .features-desc {
    max-width: 1080px;
    margin: 28px auto 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.9;
    padding: 0 8px;
    text-align: justify;
  }

  /* RWD */
  @media (max-width: 992px) {
    .features-inner {
      grid-template-columns: 1fr 1fr;
    }
  }
  @media (max-width: 576px) {
    .features-inner {
      justify-content: center;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 16px;
    }
    .card {
      padding: 20px 15px;
    }
    .card-title {
      font-size: 14px !important;
    }
    .card-icon {
      width: 52px;
      height: 52px;
    }
  }

  .bottom-text {
    font-weight: 400;
    font-size: 16px;
    line-height: 36px;
    color: #555555;
    text-align: start;
    margin-top: 5rem;
    @media (max-width: 576px) {
      margin-top: 2rem;
    }
  }
}

.about-founder {
  background-image: url("@/assets/images/about-bc2.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  min-height: 80vh;
  align-content: center;
  position: relative;
  z-index: -1;
  @media (max-width: 576px) {
    min-height: 100vh;
  }

  .container {
    position: relative;
  }

  .bc-shape {
    position: absolute;
    bottom: -5%;
    right: -10%;
  }

  .title {
    margin: 0 0 72px;
    text-align: center;
    font-size: 22px;
    letter-spacing: 0.14em;
    font-weight: 800;
  }

  .founder-swiper {
    width: 100%;
    padding: 20px 10px;
    @media (max-width: 576px) {
      padding: 0;
    }
  }

  .swiper-slide {
    height: auto;
    @media (max-width: 576px) {
      padding: 8px 56px;
    }
  }

  .card-people {
    text-align: center;
    color: #373838;
  }

  .avatar {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 255px;
    object-fit: cover;
    border-radius: 18px;
    margin: -8px auto 6px;
  }

  .name {
    font-weight: 700;
    margin: 6px 0 8px;
  }

  .desc {
    font-size: 14px;
    line-height: 1.6;
    color: var(--muted);
    padding: 0 10px;
  }

  /* 自訂箭頭 */
  .swiper-button-next,
  .swiper-button-prev {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #ff6a3d;
    box-shadow: 0 6px 14px rgba(255, 106, 61, 0.35);
  }

  .swiper-button-next::after,
  .swiper-button-prev::after {
    font-size: 18px;
    color: #fff;
    font-weight: 700;
  }

  .swiper-button-prev {
    left: 12px;
  }

  .swiper-button-next {
    right: 12px;
  }
}

.about-block {
  padding: 30px;
}

.about-stars,
.about-edge .container {
  padding: 0 30px;
}
</style>
