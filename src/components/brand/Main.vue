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
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Swiper from "./Swiper.vue";
import Tabs from "./Tabs.vue";
import SharedAccordion from "@/components/shared/Shared-Accordion.vue";
import SharedFlow from "@/components/shared/Shared-Flow.vue";

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
  background-size: 100% 100%;
  min-height: 100vh;
}
</style>
