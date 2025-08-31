<template>
  <div class="project-content">
    <div class="container">
      <div class="row pt-5 pb-5 g-4">
        <div class="col-md-4">
          <img src="@/assets/images/project-content-img-1.png" class="w-100" />
        </div>

        <div class="col-md-8 introduction">
          <h1>顏太煮奶茶</h1>
          <p>
            於2022年創立「顏太煮奶茶」，從古穿越至今，打造獨家特色厚奶茶系列飲品，菜單料多實在增加更多豐富選項。<br />

            【一杯顏太煮 生活不會苦】。
            為持續提升市場競爭力，不斷地研發新品與尋找高品質原物料，從中累積的務實經驗，以成熟技術打造特色連鎖奶茶店，拓展業務從加盟業務到開店技術指導，用不斷累積的know-how，造就全方位品牌力。
          </p>
          <div class="content row">
            <div class="col-md-6" v-for="(it, i) in detailItems" :key="i">
              <div class="row g-2 align-items-start w-100">
                <div class="col-md-4">{{ it.label }}</div>
                <div class="col-md-8">
                  <template v-if="it.type === 'link'">
                    <a
                      :href="it.value"
                      target="_blank"
                      rel="noopener noreferrer"
                      >{{ it.value }}</a
                    >
                  </template>
                  <template v-else>
                    {{ it.value }}
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="swiper-pic">
        <div class="container">
          <div class="row">
            <div class="col-md-4">
              <img src="/src/assets/images/success1.jpg" class="w-100" />
            </div>
            <div class="col-md-4">
              <img src="/src/assets/images/success2.jpg" class="w-100" />
            </div>
            <div class="col-md-4">
              <img src="/src/assets/images/success3.jpg" class="w-100" />
            </div>
          </div>
        </div>
      </div>
      <Tabs />
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
import { ref } from "vue";
import Tabs from "./Tabs.vue";

const detailItems = ref([
  { label: "領域別", value: "飲料店業" },
  { label: "公司成立狀態", value: "已設立 (2022-06-15)" },
  { label: "資本額", value: "1000萬元" },
  { label: "公司網址", type: "link", value: "https://www.super-milk-tea.com/" },
  { label: "加盟費用", value: "300萬元" },
  {
    label: "FB粉絲團",
    type: "link",
    value: "https://www.facebook.com/super.milk.tea2022",
  },
  { label: "合作特約優惠", value: "200萬元" },
]);
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
      padding: 0 30px;
      background-size: cover;
    }
    .container {
      padding: 0 !important;
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

.col-md-8.introduction {
  color: #373a36;
  padding-left: 3rem;
  align-content: center;
  gap: 30px;
  display: flex;
  flex-flow: column;
  @media (max-width: 576px) {
    padding-left: 0;
    padding-right: 0;
  }
  h1 {
    line-height: 43px;
    letter-spacing: 0.1em;
  }
  p {
    font-weight: 400;
    font-size: 16px;
    line-height: 28px;
    color: #555555;
  }
}

.content.row {
  .col-md-6 {
    display: flex;
    overflow-wrap: break-word;
    align-items: center;
    .col-md-4 {
      font-weight: 600;
      font-size: 16px;
      line-height: 28px;
      color: #373a36;
    }
    .col-md-8 {
      a {
        color: #555555;
        text-decoration: none;
      }
    }
  }
}

.swiper-pic {
  margin-bottom: 3rem;
  .container {
    .col-md-4 {
      @media (max-width: 576px) {
        padding: 10px;
      }
      img {
        width: 100%;
        border-radius: 30px;
      }
    }
  }
}
</style>
