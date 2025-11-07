<template>
  <Swiper />
  <div class="advantages">
    <div class="advantages-content container">
      <div class="row">
        <div class="col-md-6 col-12">
          <img
            class="advantages-pic"
            src="@/assets/images/advantages-img.jpg"
          />
        </div>
        <div class="col-md-6 col-12 col-content">
          <div>
            <h2>星橋優勢</h2>
            <p>
              Lorem ipsum is placeholder text commonly used in the graphic,
              print, and publishing industries for previewingLorem ipsum is
              placeholder text commonly used in the graphic, print, and
              publishing industries for previewing
            </p>
          </div>
        </div>
        <div class="col-12 text">
          <p>
            Lorem ipsum is placeholder text commonly used in the graphic, print,
            and publishing industries for previewingLorem ipsum is placeholder
            text commonly used in the graphic, print, and publishing industries
            for previewing
          </p>
          <img
            src="@/assets/images/service-card.png"
            class="w-100 mobile-none"
          />
          <img
            src="@/assets/images/service-card-mobile.png"
            class="w-100 desktop-none"
          />
        </div>
      </div>
    </div>
    <img class="advantages-bc" src="@/assets/images/brand-bc.png" />
    <img class="advantages-star" src="@/assets/images/star1.png" />
  </div>

  <div class="solution">
    <img src="@/assets/images/brand-content.png" />
    <div class="container">
      <Tabs />
    </div>
  </div>

  <div class="qa-process">
    <div class="qa-content">
      <div class="container">
        <div class="row">
          <div class="col-md-5">
            <img src="@/assets/images/brand.png" class="w-100" />
          </div>
          <div class="col-md-7">
            <SharedAccordion :items="accordionItems" />
          </div>
        </div>
      </div>
    </div>

    <div class="process">
      <div class="container">
        <h1>合作流程</h1>
        <SharedFlow :sections="sections" v-model:active="active" />
      </div>
    </div>
  </div>

  <div class="form">
    <div class="container">
      <h1>填寫表單</h1>
      <form class="apply-form" @submit.prevent="onSubmit">
        <!-- 方案選擇 -->
        <SharedCheckline
          v-model="plan"
          label="選擇方案"
          :options="[
            { key: 'basic', text: '一般一年', withInput: false },
            { key: 'vip', text: 'VIP一年', withInput: false },
            { key: 'supervip', text: '超級VIP一年', withInput: false },
          ]"
          :single="true"
          inline
        />

        <!-- 營業類型 -->
        <SharedSelect
          v-model="form.type"
          label="營業類型"
          :options="[{ text: '123', value: '1' }]"
        />

        <!-- 品牌名稱 -->
        <SharedInput
          id="brandName"
          label="品牌名稱"
          v-model="form.brand"
          placeholder="請輸入品牌名稱"
        />

        <!-- 預算 -->
        <SharedInput
          id="budget"
          label="創業預算 (萬)"
          v-model="form.budget"
          type="number"
          placeholder="請輸入預算"
        />

        <!-- 聯絡姓名 -->
        <SharedInput
          id="contactName"
          label="聯絡姓名*"
          v-model="form.name"
          placeholder="請輸入聯絡姓名"
          :error="errors.name"
        />

        <!-- 聯絡電話 -->
        <SharedInput
          id="phone"
          label="連絡電話"
          v-model="form.phone"
          placeholder="請輸入電話號碼"
        />

        <!-- 電子信箱 -->
        <SharedInput
          id="email"
          label="電子信箱"
          type="email"
          v-model="form.email"
          placeholder="example@email.com"
        />

        <!-- 總部地區 -->
        <SharedSelect
          id="region"
          label="總部地區"
          v-model="form.region"
          :options="[
            { text: '台北市', value: 'taipei' },
            { text: '新北市', value: 'newTaipei' },
            { text: '台中市', value: 'taichung' },
            { text: '高雄市', value: 'kaohsiung' },
          ]"
        />

        <!-- 聯絡時間 -->
        <SharedCheckline
          v-model="contactTime"
          label="聯絡時間"
          :options="[
            { key: 'morning1', text: '08:00-10:00', withInput: false },
            { key: 'morning2', text: '10:00-12:00', withInput: false },
            { key: 'noon', text: '12:00-13:00', withInput: false },
            { key: 'afternoon1', text: '13:00-14:00', withInput: false },
            { key: 'afternoon2', text: '14:00-16:00', withInput: false },
            { key: 'evening1', text: '16:00-18:00', withInput: false },
            { key: 'evening2', text: '18:00-20:00', withInput: false },
            { key: 'anytime', text: '任何時間皆可', withInput: false },
          ]"
          inline
        />

        <!-- 同意條款 -->
        <div class="agree-row">
          <label>
            <input type="checkbox" v-model="agree" /> 我已閱讀並同意
            <RouterLink to="/terms/platform" class="highlight" @click.stop>
              平台合約
            </RouterLink>
            、
            <RouterLink to="" class="highlight" @click.stop>
              免責聲明
            </RouterLink>
            、
            <RouterLink to="/terms/service" class="highlight" @click.stop>
              服務條款
            </RouterLink>
            及
            <RouterLink to="/privacy" class="highlight" @click.stop>
              隱私權政策
            </RouterLink>
            等所載內容及其意義，茲同意該等條款規定，並願遵守網站現今、嗣後規範的各種規則。
          </label>
        </div>

        <button type="submit" class="btn-submit">付費刊登</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Swiper from "./Swiper.vue";
import Tabs from "./Tabs.vue";
import SharedAccordion from "@/components/shared/Shared-Accordion.vue";
import SharedFlow from "@/components/shared/Shared-Flow.vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedSelect from "@/components/shared/Shared-Select.vue";
import SharedCheckline from "@/components/shared/Shared-Checkline.vue";

const plan = ref({});
const contactTime = ref({});
const agree = ref(false);
const form = ref({
  type: "",
  brand: "",
  budget: "",
  name: "",
  phone: "",
  email: "",
  region: "",
});

const errors = ref({
  name: "",
});

function onSubmit() {
  errors.value.name = "";

  if (!form.value.name) {
    errors.value.name = "請輸入聯絡姓名";
  }

  if (errors.value.name) {
    return;
  }

  if (!agree.value) {
    alert("請勾選同意條款");
    return;
  }

  alert("表單已送出！");
}
const accordionItems = [
  {
    title: "Blishing industries for previewing layouts and visual mockups?",
    content:
      "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
  {
    title: "Blishing industries for previewing layouts and visual mockups?",
    content:
      "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
  {
    title: "Blishing industries for previewing layouts and visual mockups?",
    content:
      "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
  {
    title: "Blishing industries for previewing layouts and visual mockups?",
    content:
      "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
  {
    title: "Blishing industries for previewing layouts and visual mockups?",
    content:
      "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
];

const active = ref({ lane: "brand", idx: 0 });
const sections = [
  {
    key: "brand",
    cols: 4,
    startAt: 0,
    steps: [
      { title: "流程", desc: "填寫資料<br/>提交審核文件" },
      { title: "流程", desc: "填寫資料<br/>提交審核文件" },
      { title: "流程", desc: "填寫資料<br/>提交審核文件" },
      { title: "流程", desc: "填寫資料<br/>提交審核文件" },
    ],
  },
];
</script>

<style lang="scss" scoped>
.advantages {
  height: 145vh;
  position: relative;
  @media (max-width: 576px) {
    height: 125vh;
    margin-bottom: 70px;
  }
  @media (min-width: 1024px) and (max-width: 1366px) {
    height: 170vh;
  }
  &-content {
    position: absolute;
    top: 7%;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;

    @media (max-width: 576px) {
      top: 50%;
      transform: translate(-50%, -50%);
      padding: 30px;
    }
  }
  &-bc {
    width: 98%;
    height: 152vh;
    @media (max-width: 576px) {
      height: 140vh;
      object-fit: cover;
      object-position: center;
      width: 100%;
    }
    @media (min-width: 1024px) and (max-width: 1366px) {
      height: 170vh;
    }
  }
  &-star {
    position: absolute;
    z-index: 3;
    top: 400px;
    left: 100px;
    @media (max-width: 576px) {
      top: 133px;
      left: 8px;
      width: 50px;
    }
  }

  &-pic {
    height: 585px;
    width: 450px;
    object-fit: cover;
    border-radius: 30px;
    transform: rotate(355.5deg);
    @media (max-width: 576px) {
      height: 210px;
      width: 100%;
    }
  }

  .col-md-6.col-content {
    position: relative;
    @media (max-width: 576px) {
      margin-top: 1.5rem;
      position: revert;
    }
    div {
      position: absolute;
      top: 58%;
      width: 406px;
      @media (max-width: 576px) {
        position: revert;
        width: 100%;
      }
      h2 {
        margin-bottom: 2rem;
      }
    }
  }

  .col-12.text {
    @media (max-width: 576px) {
      gap: 20px;
      display: grid;
    }
    p {
      margin: 6rem 0 3rem 0;
      width: 44%;
      @media (max-width: 576px) {
        width: 100%;
        margin: 0;
      }
    }
  }
}

.solution {
  position: relative;
  @media (max-width: 576px) {
    padding: 0 25px;
  }
  img {
    position: absolute;
    top: -200px;
    right: 0;
    z-index: -1;
    @media (max-width: 576px) {
      width: 170px;
    }
  }
}

.qa-process {
  background-image: url(./../../assets/images/brand-bc-3.png);
  background-repeat: no-repeat;
  background-position: right;
  background-size: cover;
  background-size: 100% auto;
}

.qa-content {
  padding: 100px 0;
  @media (max-width: 576px) {
    padding: 50px 30px 80px 30px;
  }
  .col-md-5,
  .col-md-7 {
    padding: 0;
  }
}

.process,
.form {
  text-align: center;
  @media (max-width: 576px) {
    padding: 0 30px;
  }
}

.form {
  padding: 100px 0;
  background-image: url(./../../assets/images/brand-bc-4.png);
  background-repeat: no-repeat;
  background-position: left;
  background-size: cover;
  min-height: 100vh;
  text-align: center;

  .apply-form {
    margin: 50px auto;
    padding: 70px;
    border-radius: 30px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    text-align: left;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(5px);
    color: #555555;
    .agree-row {
      font-size: 14px;
      line-height: 22px;
      color: #666;
      input {
        margin-right: 5px;
      }
      .highlight {
        color: #ff6634;
        font-weight: 600;
        text-decoration: none;
      }
    }

    .btn-submit {
      margin-top: 10px;
      background-color: #ff6634;
      color: #fff;
      font-size: 18px;
      border: none;
      border-radius: 8px;
      padding: 12px 0;
      cursor: pointer;
      transition: 0.2s;
      &:hover {
        background-color: #ff4400;
      }
    }
  }

  .form-group {
    text-align: left;

    label {
      font-weight: 500;
      font-size: 15px;
      line-height: 22px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
    }

    input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      &.is-invalid {
        border-color: #db3838;
      }
    }
  }
}
</style>
