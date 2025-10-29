<template>
  <div class="tabs">
    <div class="container">
      <div class="tab">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'startup' }"
          @click="setTab('startup')"
        >
          <img :src="activeTab === 'startup' ? iconActive : icon" />
          【啟動】創業
        </button>

        <button
          class="tab-btn"
          :class="{ active: activeTab === 'coCreate' }"
          @click="setTab('coCreate')"
        >
          <img :src="activeTab === 'coCreate' ? iconActive : icon" />
          【參與】共創
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'startup'" class="row">
          <div class="d-flex-block align-items-center">
            <div class="col-md-6 p-5">
              <img src="@/assets/images/star-img.png" class="w-100" />
            </div>
            <div class="col-md-6 tab-content-md">
              <h4>讓每一個夢想背後，都有力量同行</h4>
              <span class="lh-36">
                我們為創業者提供展現理想的舞台，<br />
                也為願意支持的參與者打造透明可信的參與機制。
              </span>
              <img src="@/assets/images/about-sign.png" height="38" />
            </div>
          </div>
          <div class="tab-content-text">
            <h1>創業者流程</h1>
            <SharedFlow
              :sections="sectionsStartup"
              v-model:active="activeStartup"
            />
          </div>
        </div>
        <div v-else class="row">
          <div class="d-flex-block align-items-center">
            <div class="col-md-6">
              <img src="@/assets/images/process-step2.png" class="w-100" />
            </div>
            <div class="col-md-6 tab-content-md">
              <h4>創業的門檻，不該是一道厚重的牆</h4>
              <span class="lh-36">
                在星橋，一杯咖啡的金額，也能種下一顆參與的種子。<br />
                你熟悉的那間早餐店，也許明天起你就是它的共有人。
              </span>
              <img src="@/assets/images/about-sign.png" height="38" />
            </div>
          </div>
          <div class="tab-content-text">
            <h1>創業夥伴流程</h1>
            <SharedFlow
              :sections="sectionsCoCreate"
              v-model:active="activeCoCreate"
            />
          </div>
        </div>
      </div>

      <div class="mt-5 text-center">
        <button class="register-btn" @click="goToRegister">
          <img class="me-3" src="@/assets/icon/btn-icon2.svg" />前往註冊
        </button>
      </div>
    </div>
  </div>
  <div class="qa-content">
    <div class="container qa-content-img">
      <img src="@/assets/images/qa-img.png" />
      <h1>Q&A</h1>
      <SharedAccordion />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import SharedFlow from "@/components/shared/Shared-Flow.vue";
import icon from "@/assets/icon/btn-icon2.svg";
import iconActive from "@/assets/icon/btn-icon.svg";
import SharedAccordion from "@/components/shared/Shared-Accordion.vue";
import {useAuth} from "@/composables/useAuth.js";
const route = useRoute();
const router = useRouter();
const { isLoggedIn, currentSales } = useAuth();

const activeTab = ref("startup");
const syncFromRoute = () => {
  const q = route.query.tab;
  activeTab.value = q === "coCreate" ? "coCreate" : "startup";
};

const setTab = (tab) => {
  activeTab.value = tab;
  router.replace({ path: route.path, query: { ...route.query, tab } });
};

onMounted(syncFromRoute);

watch(
  () => route.query.tab,
  () => syncFromRoute()
);

const goToRegister = () => {
  if (isLoggedIn.value) {
    alert("您已完成註冊。");
  } else{
    router.push("/entSignUp");
  }
};

const activeStartup = ref({ lane: "init", idx: 0 });
const activeCoCreate = ref({ lane: "init", idx: 0 });

const sectionsStartup = [
  {
    key: "init",
    cols: 4,
    steps: [
      { num: 1, title: "註冊會員", desc: "串聯社群、Email<br/>一鍵輕鬆登入" },
      {
        num: 2,
        title: "申請創業",
        desc: "填寫個人資訊、<br/>創業計劃書",
      },
      { num: 3, title: "平台審核", desc: "提交身分驗證文件" },
      {
        num: 4,
        title: "簽約立案",
        desc: "支付意向金<br/>簽署線上合約<br/>等待專案媒合進度",
      },
    ],
  },
  {
    key: "success",
    label: "案件成立",
    variant: "success",
    cols: 4,
    steps: [
      { num: 5, title: "媒合雙方", desc: "線上或線下簽約" },
      {
        num: 6,
        title: "前置準備",
        desc: "以自備款成立籌備戶驗資<br/>公司成立並轉為正式戶<br/>申請增資並確認資金到位",
      },
      { num: 7, title: "品牌加盟", desc: "進入品牌方加盟流程" },
      { num: 8, title: "開業結案", desc: "每日回報營業數據" },
    ],
  },
  {
    key: "fail",
    label: "案件不成立",
    variant: "fail",
    cols: 2,
    steps: [
      { num: 5, title: "退還意向金", desc: "" },
      { num: 6, title: "結案", desc: "" },
    ],
  },
];

const sectionsCoCreate = [
  {
    key: "init",
    cols: 4,
    steps: [
      { title: "註冊會員", desc: "串聯社群、Email<br/>一鍵輕鬆登入" },
      { title: "申請參與", desc: "選取有興趣的<br/>創業專案參與" },
      { title: "平台審核", desc: "提交身分驗證文件" },
      {
        title: "簽約立案",
        desc: "支付意向金<br/>簽署線上合約<br/>等待專案媒合進度",
      },
    ],
  },
  {
    key: "success",
    label: "案件成立",
    variant: "success",
    cols: 4,
    startAt: 4,
    steps: [
      {
        title: "媒合雙方",
        desc: "線上或線下簽約<br/>*第二自然人<br/>由專員主動連繫、<br/>告知準備文件",
      },
      { title: "投入參與資源", desc: "" },
      {
        title: "加盟進度跟進",
        desc: "等候開業前置程序<br/>*自主關注或連繫專員",
      },
      { title: "開業結案", desc: "定期查看營運數據" },
    ],
  },
  {
    key: "fail",
    label: "案件不成立",
    variant: "fail",
    cols: 2,
    steps: [
      { num: 5, title: "退還意向金", desc: "" },
      { num: 6, title: "結案", desc: "" },
    ],
  },
];
</script>

<style lang="scss" scoped>
.container {
  padding: 30px 0 150px 0;
  @media (max-width: 576px) {
    padding: 30px 0;
  }
}
.tabs {
  background: url("@/assets/images/start-bc.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  margin-top: -180px;
  padding-top: 180px;
  .tab {
    gap: 1rem;
    margin-bottom: 3rem;
    display: flex;
    justify-content: center;

    @media (max-width: 767px) {
      flex-flow: column;
      align-items: center;
      padding-top: 2rem;
    }

    button {
      font-weight: 500;
      font-size: 22px;
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
      cursor: pointer;
      transition: all 0.2s ease;

      @media (max-width: 767px) {
        width: 85%;
        font-size: 18px;
        height: 40px;
      }

      &.active {
        transform: scale(1.02);
        color: #000;
        background-color: #ffc919;
      }
    }

    &-btn {
      color: #fff;
      background-color: #262626;
    }

    img {
      width: 17px;
      height: 24px;
    }
  }

  .tab-content {
    padding: 25px;
    background: #d9d9d9b0;
    color: #000;
    box-shadow: -3px 3px 20px rgba(55, 58, 54, 0.3);
    border-radius: 50px;
    @media (max-width: 576px) {
      margin: 30px;
    }
    .col-md-6 {
      padding: 25px;
      h4 {
        color: #ff6634;
      }
      span {
        color: #555555;
      }
    }
    &-md.col-md-6 {
      gap: 10px;
      display: grid;
      @media (max-width: 576px) {
        display: block;
        padding: 0px;
      }
      img {
        @media (max-width: 576px) {
          width: 100%;
        }
      }
    }

    &-text {
      text-align: center;
      h1 {
        margin: 1.5rem 0;
      }
    }
  }
}

.register-btn {
  background-color: $btn-orange;
  color: $white;
  border: none;
  border-radius: 50px;
  width: 400px;
  height: 70px;
  font-weight: $fw-500;
  font-size: $fs-22;
  line-height: $lh-26;
  letter-spacing: $ls-2;
}

.qa-content {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
    url("@/assets/images/start-qa.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  padding: 0 30px;
  &-img {
    position: relative;
    img {
      position: absolute;
      top: 10%;
      left: -18%;
      @media (max-width: 576px) {
        left: -50%;
      }
    }
  }
  .container {
    padding: 100px 0 150px 0;
    @media (max-width: 576px) {
      padding: 100px 0;
    }
    h1 {
      padding: 0 0 3rem 0;
      text-align: center;
      color: #fff;
    }
  }
}
</style>
